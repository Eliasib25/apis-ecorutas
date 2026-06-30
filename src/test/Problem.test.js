const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Problem = require('../models/Problem');

describe('Modelo Problem - HU14, HU15', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU14 - Crear tipo problema ====================

  describe('HU14 - Crear tipo problema', () => {

    test('HU14-01: Crear problema exitosamente', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }, []]);

      const result = await Problem.create('Retraso en recoleccion');

      expect(result.identification).toBe(1);
      expect(result.name).toBe('Retraso en recoleccion');
      expect(result.state).toBe('activo');
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO problem');
      expect(params).toContain('Retraso en recoleccion');
      expect(params).toContain('activo');
    });

    test('HU14-02: Verificar state por defecto', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 2 }, []]);

      const result = await Problem.create('Nuevo problema');

      expect(result.state).toBe('activo');
    });

    test('HU14-03: Listar problemas despues de crear', async () => {
      const mockProblems = [
        { identification: 1, name: 'Retraso en recoleccion', state: 'activo' },
        { identification: 2, name: 'Nuevo problema', state: 'activo' },
      ];

      mockQuery.mockResolvedValueOnce([mockProblems, []]);

      const result = await Problem.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Retraso en recoleccion');
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM problem');
    });
  });

  // ==================== HU15 - Editar tipo problema ====================

  describe('HU15 - Editar tipo problema', () => {

    test('HU15-01: Actualizar nombre y estado', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Problem.update(1, 'Nombre Actualizado', 'activo');

      expect(result.identification).toBe(1);
      expect(result.name).toBe('Nombre Actualizado');
      expect(result.state).toBe('activo');
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE problem SET');
      expect(sql).toContain('name = ?');
      expect(sql).toContain('state = ?');
      expect(params).toContain('Nombre Actualizado');
      expect(params).toContain('activo');
      expect(params).toContain(1);
    });

    test('HU15-02: Eliminar problema', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Problem.update(1, 'Problema', 'inactivo');

      expect(result.state).toBe('inactivo');
    });

    test('HU15-03: Verificar problema editado', async () => {
      const mockProblems = [
        { identification: 1, name: 'Nombre Actualizado', state: 'activo' },
      ];

      mockQuery.mockResolvedValueOnce([mockProblems, []]);

      const result = await Problem.findAll();

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Nombre Actualizado');
    });

    test('HU15-04: Flujo completo crear-editar', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 3 }, []]);

      const created = await Problem.create('Original');

      expect(created.identification).toBe(3);
      expect(created.name).toBe('Original');

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const updated = await Problem.update(3, 'Editado', 'activo');

      expect(updated.identification).toBe(3);
      expect(updated.name).toBe('Editado');
    });
  });
});
