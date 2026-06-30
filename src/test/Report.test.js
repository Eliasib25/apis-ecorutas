const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Report = require('../models/Report');

describe('Modelo Report - HU09, HU17', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU09 - Reportar problemas ====================

  describe('HU09 - Reportar problemas', () => {

    test('HU09-01: Crear reporte exitoso', async () => {
      const reportData = {
        type: 1,
        problem: 'Basura sin recolectar',
        address: 'Calle 5',
        date: '2026-06-24',
        citizenidentificationtype: 'CC',
        citizenidentification: '1234567890',
      };

      mockQuery.mockResolvedValueOnce([{ insertId: 1 }, []]);

      const result = await Report.createReport(reportData);

      expect(result.identification).toBe(1);
      expect(result.type).toBe(1);
      expect(result.problem).toBe('Basura sin recolectar');
      expect(result.address).toBe('Calle 5');
      expect(result.date).toBe('2026-06-24');
      expect(result.citizenidentificationtype).toBe('CC');
      expect(result.citizenidentification).toBe('1234567890');
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO report');
    });

    test('HU09-02: Verificar campos en BD', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 2 }, []]);

      const result = await Report.createReport({
        type: 1,
        problem: 'Otro problema',
        address: 'Calle 10',
        date: '2026-06-25',
        citizenidentificationtype: 'CC',
        citizenidentification: '1234567890',
      });

      expect(result.identification).toBe(2);
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO report');
    });
  });

  // ==================== HU17 - Ver reportes ====================

  describe('HU17 - Ver reportes', () => {

    test('HU17-01: Obtener reportes con informacion de usuario', async () => {
      const mockReports = [
        {
          id: 1,
          usuario: 'Juan Perez',
          correo: 'juan@test.com',
          problema: 'Basura sin recolectar',
          direccion: 'Calle 5',
          fecha: '2026-06-24T10:00:00',
          estado: 'Pendiente',
        },
        {
          id: 2,
          usuario: 'Maria Lopez',
          correo: 'maria@test.com',
          problema: 'Contenedor danado',
          direccion: 'Carrera 8',
          fecha: '2026-06-23T14:00:00',
          estado: 'Resuelto',
        },
      ];

      mockQuery.mockResolvedValueOnce([mockReports, []]);

      const result = await Report.getAllReports();

      expect(result).toHaveLength(2);
      expect(result[0].usuario).toBe('Juan Perez');
      expect(result[0].correo).toBe('juan@test.com');
      expect(result[0].estado).toBe('Pendiente');
      expect(result[1].usuario).toBe('Maria Lopez');
      expect(result[1].estado).toBe('Resuelto');
      expect(mockQuery).toHaveBeenCalledWith(expect.stringContaining('FROM report r'));
    });

    test('HU17-02: Cambiar estado a resuelto', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Report.updateReportState(1, 'Resuelto');

      expect(result).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE report SET state = ?');
      expect(sql).toContain('WHERE identification = ?');
      expect(params).toContain('Resuelto');
      expect(params).toContain(1);
    });

    test('HU17-03: Reporte inexistente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      const result = await Report.updateReportState(999, 'Resuelto');

      expect(result).toBe(false);
    });

    test('HU09-03: Obtener reporte con usuario', async () => {
      const mockReport = {
        id: 1,
        estado: 'Pendiente',
        correo: 'juan@test.com',
        usuario: 'Juan Perez',
      };

      mockQuery.mockResolvedValueOnce([[mockReport], []]);

      const result = await Report.getReportWithUser(1);

      expect(result).toEqual(mockReport);
      expect(result.correo).toBe('juan@test.com');
      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('WHERE r.identification = ?'),
        [1]
      );
    });
  });
});
