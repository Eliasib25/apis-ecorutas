const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Truck = require('../models/Truck');

describe('Modelo Truck - HU10, HU13, HU21, HU22, HU23', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU10 - Verificar camion ====================

  describe('HU10 - Verificar camion para ruta', () => {

    test('HU10-03: Verificar camion existe', async () => {
      const mockTruck = {
        identification: 1,
        plate: 'ABC-123',
        capacityKg: 10000,
        conditionTruck: 'disponible',
      };

      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.findById(1);

      expect(result).toEqual(mockTruck);
      expect(result.plate).toBe('ABC-123');
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM truck WHERE identification = ? LIMIT 1',
        [1]
      );
    });

    test('HU10-04: Camion inexistente', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await Truck.findById(999);

      expect(result).toBeNull();
    });
  });

  // ==================== HU13 - Cambiar camion ====================

  describe('HU13 - Cambiar camion de ruta', () => {

    test('HU13-02: Cambiar condicion a asignado', async () => {
      const mockTruck = {
        identification: 2,
        plate: 'DEF-456',
        capacityKg: 8000,
        conditionTruck: 'asignado',
      };

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.update(2, { conditionTruck: 'asignado' });

      expect(result.conditionTruck).toBe('asignado');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    test('HU13-03: Liberar camion (asignado a disponible)', async () => {
      const mockTruck = {
        identification: 1,
        plate: 'ABC-123',
        capacityKg: 10000,
        conditionTruck: 'disponible',
      };

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.update(1, { conditionTruck: 'disponible' });

      expect(result.conditionTruck).toBe('disponible');
    });
  });

  // ==================== HU21 - Registrar camion ====================

  describe('HU21 - Crear camion', () => {

    test('HU21-01: Crear camion exitosamente', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 3 }, []]);

      const result = await Truck.create({
        plate: 'GHI-789',
        capacityKg: 12000,
        conditionTruck: 'disponible',
      });

      expect(result.identification).toBe(3);
      expect(result.plate).toBe('GHI-789');
      expect(result.capacityKg).toBe(12000);
      expect(result.conditionTruck).toBe('disponible');
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO truck');
      expect(params).toContain('GHI-789');
    });

    test('HU21-02: Condicion por defecto', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 4 }, []]);

      const result = await Truck.create({
        plate: 'DEF-000',
        capacityKg: 5000,
      });

      expect(result.conditionTruck).toBe('disponible');
    });

    test('HU21-03: Verificar en BD', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 5 }, []]);

      const created = await Truck.create({
        plate: 'GHI-789',
        capacityKg: 12000,
        conditionTruck: 'disponible',
      });

      const mockTruck = {
        identification: 5,
        plate: 'GHI-789',
        capacityKg: 12000,
        conditionTruck: 'disponible',
      };
      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const found = await Truck.findById(created.identification);

      expect(found.plate).toBe('GHI-789');
    });

    test('HU21-04: Capacidad negativa', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 6 }, []]);

      const result = await Truck.create({
        plate: 'BAD-001',
        capacityKg: -100,
        conditionTruck: 'disponible',
      });

      expect(result.capacityKg).toBe(-100);
    });
  });

  // ==================== HU22 - Listar camiones ====================

  describe('HU22 - Listar camiones', () => {

    test('HU22-01: Obtener todos los camiones', async () => {
      const mockTrucks = [
        { identification: 1, plate: 'ABC-123', capacityKg: 10000, conditionTruck: 'disponible' },
        { identification: 2, plate: 'DEF-456', capacityKg: 8000, conditionTruck: 'asignado' },
        { identification: 3, plate: 'GHI-789', capacityKg: 12000, conditionTruck: 'disponible' },
      ];

      mockQuery.mockResolvedValueOnce([mockTrucks, []]);

      const result = await Truck.findAll();

      expect(result).toHaveLength(3);
      expect(result[0].plate).toBe('ABC-123');
      expect(result[1].plate).toBe('DEF-456');
      expect(result[2].plate).toBe('GHI-789');
      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM truck');
    });

    test('HU22-02: Sin camiones en BD', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await Truck.findAll();

      expect(result).toHaveLength(0);
    });
  });

  // ==================== HU23 - Actualizar camion ====================

  describe('HU23 - Actualizar camion', () => {

    test('HU23-01: Actualizar placa y capacidad', async () => {
      const mockTruck = {
        identification: 1,
        plate: 'NEW-111',
        capacityKg: 15000,
        conditionTruck: 'disponible',
      };

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.update(1, { plate: 'NEW-111', capacityKg: 15000 });

      expect(result.plate).toBe('NEW-111');
      expect(result.capacityKg).toBe(15000);
    });

    test('HU23-02: Actualizar condicion', async () => {
      const mockTruck = {
        identification: 1,
        plate: 'ABC-123',
        capacityKg: 10000,
        conditionTruck: 'En mantenimiento',
      };

      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.update(1, { conditionTruck: 'En mantenimiento' });

      expect(result.conditionTruck).toBe('En mantenimiento');
    });

    test('HU23-03: Camion inexistente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await Truck.update(999, { plate: 'X' });

      expect(result).toBeNull();
    });

    test('HU23-04: Sin campos para actualizar', async () => {
      const mockTruck = {
        identification: 1,
        plate: 'ABC-123',
        capacityKg: 10000,
        conditionTruck: 'disponible',
      };

      mockQuery.mockResolvedValueOnce([[mockTruck], []]);

      const result = await Truck.update(1, {});

      expect(result).toEqual(mockTruck);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });
});
