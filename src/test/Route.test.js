const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Route = require('../models/Route');

describe('Modelo Route - HU06, HU10, HU11, HU12, HU13', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU06 - Calendario recoleccion ====================

  describe('HU06 - Calendario de recoleccion', () => {

    test('HU06-01: Buscar ruta por usuario', async () => {
      const mockRoute = {
        identification: 1,
        name: 'Ruta 1',
        frecuency: 'Lun-Mie-Vie',
        startTime: '08:00 a.m.',
        isActive: 'si',
      };

      mockQuery.mockResolvedValueOnce([[mockRoute], []]);

      const result = await Route.findByUser('CC', '1234567890');

      expect(result).toEqual(mockRoute);
      expect(result.name).toBe('Ruta 1');
      expect(result.frecuency).toBe('Lun-Mie-Vie');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('FROM user c INNER JOIN route r'),
        ['CC', '1234567890']
      );
    });

    test('HU06-02: Usuario sin ruta asociada', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await Route.findByUser('CC', '99999999');

      expect(result).toBeNull();
    });
  });

  // ==================== HU10 - Crear ruta ====================

  describe('HU10 - Crear ruta', () => {

    test('HU10-01: Crear ruta con zonas', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 3 }, []]);
      mockQuery.mockResolvedValueOnce([{ affectedRows: 2 }, []]);

      const result = await Route.createRoute(
        {
          name: 'Ruta Nueva',
          frecuency: 'Lun-Mie-Vie',
          startTime: '07:00 a.m.',
          isActive: 'Si',
          truckIdentification: 1,
        },
        [1, 2]
      );

      expect(result).toBe(3);
      expect(mockQuery).toHaveBeenCalledTimes(2);

      const [sql1, params1] = mockQuery.mock.calls[0];
      expect(sql1).toContain('INSERT INTO route');
      expect(params1).toContain('Ruta Nueva');

      const [sql2] = mockQuery.mock.calls[1];
      expect(sql2).toContain('UPDATE zone SET routeidentification');
    });

    test('HU10-02: Crear ruta sin zonas', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 4 }, []]);

      const result = await Route.createRoute(
        {
          name: 'Sin Zonas',
          frecuency: 'Mar-Jue-Sab',
          startTime: '06:00',
          isActive: 'Si',
          truckIdentification: 2,
        },
        []
      );

      expect(result).toBe(4);
      expect(mockQuery).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== HU11 - Editar ruta ====================

  describe('HU11 - Editar ruta', () => {

    test('HU11-01: Actualizar frecuencia y hora', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Route.updateRoute(1, {
        frecuency: 'Mar-Jue-Sab',
        startTime: '06:30 a.m.',
      });

      expect(result).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE route SET');
      expect(sql).toContain('frecuency = ?');
      expect(params).toContain('Mar-Jue-Sab');
      expect(params).toContain('06:30 a.m.');
    });

    test('HU11-02: Verificar ruta existe antes de editar', async () => {
      const mockRoute = {
        identification: 1,
        name: 'Ruta 1',
        frecuency: 'Lun-Mie-Vie',
        startTime: '08:00 a.m.',
        isActive: 'si',
        truckIdentification: 1,
      };

      mockQuery.mockResolvedValueOnce([[mockRoute], []]);

      const result = await Route.findById(1);

      expect(result).toEqual(mockRoute);
      expect(result.truckIdentification).toBe(1);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM route WHERE identification = ? LIMIT 1',
        [1]
      );
    });

    test('HU11-03: Actualizar con nuevo camion', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Route.updateRoute(1, { truckIdentification: 2 });

      expect(result).toBe(true);
      const [, params] = mockQuery.mock.calls[0];
      expect(params).toContain(2);
    });

    test('HU11-04: Actualizar zonas', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 2 }, []]);
      mockQuery.mockResolvedValueOnce([{ affectedRows: 2 }, []]);

      const result = await Route.updateRoute(1, {}, [1, 3]);

      expect(result).toBe(true);
      expect(mockQuery).toHaveBeenCalledTimes(2);

      const [sql1] = mockQuery.mock.calls[0];
      expect(sql1).toContain('NULL');

      const [sql2] = mockQuery.mock.calls[1];
      expect(sql2).toContain('routeidentification = ?');
    });
  });

  // ==================== HU12 - Listar rutas ====================

  describe('HU12 - Listar rutas', () => {

    test('HU12-01: Obtener rutas con detalles', async () => {
      const mockRows = [
        {
          identification: 1,
          name: 'Ruta 1',
          frecuency: 'Lun-Mie-Vie',
          startTime: '08:00 a.m.',
          isActive: 'si',
          truckIdentification: 1,
          truckPlate: 'ABC-123',
          zones: 'Las Margaritas, Florencia',
        },
      ];

      mockQuery.mockResolvedValueOnce([mockRows, []]);

      const result = await Route.findAllWithDetails();

      expect(result).toHaveLength(1);
      expect(result[0].truckPlate).toBe('ABC-123');
      expect(result[0].zones).toEqual(['Las Margaritas', 'Florencia']);
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('GROUP_CONCAT'));
    });

    test('HU12-02: Obtener rutas basicas', async () => {
      const mockRoutes = [
        { identification: 1, name: 'Ruta 1', frecuency: 'Lun-Mie-Vie', startTime: '08:00 a.m.', isActive: 'si' },
        { identification: 2, name: 'Ruta 2', frecuency: 'Mar-Jue-Sab', startTime: '06:00 a.m.', isActive: 'si' },
      ];

      mockQuery.mockResolvedValueOnce([mockRoutes, []]);

      const result = await Route.getAllRoutes();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Ruta 1');
      expect(result[1].name).toBe('Ruta 2');
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT identification, name, frecuency, startTime, isActive FROM route'
      );
    });
  });

  // ==================== HU13 - Asignar camion ====================

  describe('HU13 - Asignar camion a ruta', () => {

    test('HU13-01: Asignar camion a ruta', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Route.assignTruck(1, 2);

      expect(result).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE route SET truckIdentification = ?');
      expect(params).toContain(2);
      expect(params).toContain(1);
    });
  });
});
