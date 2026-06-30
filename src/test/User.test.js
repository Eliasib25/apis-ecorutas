const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const bcrypt = require('bcryptjs');
jest.mock('bcryptjs');

const User = require('../models/User');

describe('Modelo User - HU01, HU02, HU03, HU20', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU01 - Registro ====================

  describe('HU01 - Registro de usuario', () => {

    test('HU01-01: Crear usuario con datos validos', async () => {
      const userData = {
        identificationtype: 'CC',
        identification: '1234567890',
        names: 'Juan',
        lastnames: 'Perez',
        email: 'juan@test.com',
        phone: '3001234567',
        address: 'Calle 1',
        neighborhood: 'Las Margaritas',
        userName: 'juanp',
        password: 'Test1234*',
        role: 'citizen',
      };

      bcrypt.hash.mockResolvedValue('$2a$10$hashedpassword');
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }, []]);

      const result = await User.create(userData);

      expect(result.identificationtype).toBe('CC');
      expect(result.identification).toBe('1234567890');
      expect(result.names).toBe('Juan');
      expect(result.lastnames).toBe('Perez');
      expect(result.email).toBe('juan@test.com');
      expect(result.phone).toBe('3001234567');
      expect(result.role).toBe('citizen');
      expect(result.userName).toBe('juanp');
      expect(result.routesIdentification).toBeNull();
      expect(bcrypt.hash).toHaveBeenCalledWith('Test1234*', 10);
    });

    test('HU01-02: Buscar usuario existente', async () => {
      const mockUser = {
        identificationtype: 'CC',
        identification: '1234567890',
        names: 'Juan',
        userName: 'juanp',
        password: '$2a$10$hashed',
      };

      mockQuery.mockResolvedValueOnce([[mockUser], []]);

      const result = await User.findByUserName('juanp');

      expect(result).toEqual(mockUser);
      expect(result.userName).toBe('juanp');
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM user WHERE userName = ? LIMIT 1',
        ['juanp']
      );
    });

    test('HU01-03: Buscar usuario inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await User.findByUserName('noexiste');

      expect(result).toBeNull();
    });

    test('HU01-04: Verificar email duplicado', async () => {
      const mockUser = {
        identificationtype: 'CC',
        identification: '1234567890',
        email: 'juan@test.com',
        names: 'Juan',
      };

      mockQuery.mockResolvedValueOnce([[mockUser], []]);

      const result = await User.findByEmail('juan@test.com');

      expect(result).toEqual(mockUser);
      expect(result.email).toBe('juan@test.com');
    });

    test('HU01-05: Verificar identificacion duplicada', async () => {
      const mockUser = {
        identificationtype: 'CC',
        identification: '1234567890',
        names: 'Juan',
      };

      mockQuery.mockResolvedValueOnce([[mockUser], []]);

      const result = await User.findByIdentification('CC', '1234567890');

      expect(result).toEqual(mockUser);
      expect(result.identificationtype).toBe('CC');
      expect(result.identification).toBe('1234567890');
    });
  });

  // ==================== HU02 - Login ciudadano ====================

  describe('HU02 - Login ciudadano', () => {

    test('HU02-01: Login exitoso', async () => {
      const mockUser = {
        identificationtype: 'CC',
        identification: '1234567890',
        userName: 'juanp',
        password: '$2a$10$hashed',
        role: 'citizen',
      };

      mockQuery.mockResolvedValueOnce([[mockUser], []]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const user = await User.findByUserName('juanp');
      const isValid = await User.verifyPassword('Test1234*', user.password);

      expect(user).toEqual(mockUser);
      expect(isValid).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('Test1234*', '$2a$10$hashed');
    });

    test('HU02-02: Contraseña incorrecta', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      const isValid = await User.verifyPassword('WrongPass', '$2a$10$hashed');

      expect(isValid).toBe(false);
    });

    test('HU02-03: Excluir password del resultado', async () => {
      const userWithPassword = {
        identificationtype: 'CC',
        identification: '1234567890',
        names: 'Juan',
        password: '$2a$10$hashed',
      };

      const result = await User.getUserWithoutPassword(userWithPassword);

      expect(result).not.toHaveProperty('password');
      expect(result.names).toBe('Juan');
      expect(result.identification).toBe('1234567890');
    });
  });

  // ==================== HU03 - Editar perfil ====================

  describe('HU03 - Editar perfil', () => {

    test('HU03-01: Actualizar campos exitosamente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await User.updateProfile('CC', '1234567890', {
        names: 'Juan Carlos',
        phone: '3009876543',
      });

      expect(result).toBe(true);
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE user SET');
      expect(sql).toContain('WHERE identificationtype = ? AND identification = ?');
    });

    test('HU03-02: Sin campos para actualizar', async () => {
      const result = await User.updateProfile('CC', '1234567890', {});

      expect(result).toBe(false);
      expect(mockQuery).not.toHaveBeenCalled();
    });

    test('HU03-03: Verificar contrasena actual correcta', async () => {
      bcrypt.compare.mockResolvedValueOnce(true);

      const isValid = await User.verifyPassword('Test1234*', '$2a$10$realhash');

      expect(isValid).toBe(true);
    });

    test('HU03-04: Hashear nueva contrasena', async () => {
      bcrypt.hash.mockResolvedValueOnce('$2a$10$newhash');

      const hash = await User.hashPassword('Nueva1234*');

      expect(hash).toBe('$2a$10$newhash');
      expect(bcrypt.hash).toHaveBeenCalledWith('Nueva1234*', 10);
    });

    test('HU03-05: Actualizar solo password', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await User.updateProfile('CC', '1234567890', {
        password: '$2a$10$nuevohash',
      });

      expect(result).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('password = ?');
      expect(params).toContain('$2a$10$nuevohash');
    });
  });

  // ==================== HU20 - Login admin ====================

  describe('HU20 - Login administrador', () => {

    test('HU20-01: Login admin exitoso', async () => {
      const mockAdmin = {
        identificationtype: 'CC',
        identification: '10001000',
        userName: 'admin',
        password: '$2a$10$adminhash',
        role: 'admin',
      };

      mockQuery.mockResolvedValueOnce([[mockAdmin], []]);
      bcrypt.compare.mockResolvedValueOnce(true);

      const user = await User.findByUserName('admin');
      const isValid = await User.verifyPassword('Admin123*', user.password);

      expect(user.role).toBe('admin');
      expect(isValid).toBe(true);
    });

    test('HU20-02: Verificar rol admin', async () => {
      const mockAdmin = {
        identificationtype: 'CC',
        identification: '10001000',
        userName: 'admin',
        role: 'admin',
      };

      mockQuery.mockResolvedValueOnce([[mockAdmin], []]);

      const user = await User.findByUserName('admin');

      expect(user.role).toBe('admin');
    });

    test('HU20-03: Contraseña admin incorrecta', async () => {
      bcrypt.compare.mockResolvedValueOnce(false);

      const isValid = await User.verifyPassword('WrongPass', '$2a$10$adminhash');

      expect(isValid).toBe(false);
    });

    test('HU20-04: Admin inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await User.findByUserName('noadmin');

      expect(result).toBeNull();
    });
  });
});
