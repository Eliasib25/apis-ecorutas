const mockQuery = jest.fn();
const mockRelease = jest.fn();

jest.mock('../config/database', () => ({
  getConnection: jest.fn(() => Promise.resolve({
    query: mockQuery,
    release: mockRelease,
  })),
  pool: {},
}));

const Notice = require('../models/Notice');

describe('Modelo Notice - HU05, HU08, HU18, HU19', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== HU05 - Historial notificaciones ====================

  describe('HU05 - Historial de notificaciones', () => {

    test('HU05-01: Notice.getAllNotices() - Obtener todos los avisos', async () => {
      const mockNotices = [
        { identification: 1, title: 'Aviso 1', description: 'Desc 1', date: '2026-06-24' },
        { identification: 2, title: 'Aviso 2', description: 'Desc 2', date: '2026-06-23' },
      ];

      mockQuery.mockResolvedValueOnce([mockNotices, []]);

      const result = await Notice.getAllNotices();

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Aviso 1');
      expect(result[1].title).toBe('Aviso 2');
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT identification, title, description, date FROM notice ORDER BY date DESC'
      );
    });

    test('HU05-02: Notice.getAllNotices() - Sin avisos en BD', async () => {
      mockQuery.mockResolvedValueOnce([[], []]);

      const result = await Notice.getAllNotices();

      expect(result).toHaveLength(0);
    });
  });

  // ==================== HU08 - Avisos informativos ====================

  describe('HU08 - Avisos informativos', () => {

    test('HU08-01: Notice.getAllNotices() - Obtener avisos informativos', async () => {
      const mockNotices = [
        { identification: 1, title: 'Aviso', description: 'Servicio suspendido', date: '2026-06-24' },
      ];

      mockQuery.mockResolvedValueOnce([mockNotices, []]);

      const result = await Notice.getAllNotices();

      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Servicio suspendido');
    });

    test('HU08-02: Notice.createNotice() - Crear aviso', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 1 }, []]);

      const result = await Notice.createNotice({
        title: 'Aviso importante',
        description: 'Se suspende servicio',
      });

      expect(result.identification).toBe(1);
      expect(result.title).toBe('Aviso importante');
      expect(result.description).toBe('Se suspende servicio');
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('INSERT INTO notice');
      expect(sql).toContain('NOW()');
      expect(params).toContain('Aviso importante');
    });
  });

  // ==================== HU18 - Crear avisos ====================

  describe('HU18 - Crear avisos', () => {

    test('HU18-01: Notice.createNotice() - Crear aviso exitosamente', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 3 }, []]);

      const result = await Notice.createNotice({
        title: 'Aviso nuevo',
        description: 'Descripcion del aviso',
      });

      expect(result.identification).toBe(3);
      expect(result.title).toBe('Aviso nuevo');
      expect(result.description).toBe('Descripcion del aviso');
    });

    test('HU18-02: Notice.createNotice() - Verificar date automatica', async () => {
      mockQuery.mockResolvedValueOnce([{ insertId: 4 }, []]);

      const result = await Notice.createNotice({
        title: 'Test',
        description: 'Test desc',
      });

      expect(result.identification).toBe(4);
      const [sql] = mockQuery.mock.calls[0];
      expect(sql).toContain('NOW()');
    });

    test('HU18-03: Notice.getAllNotices() - Verificar aviso creado', async () => {
      const mockNotices = [
        { identification: 4, title: 'Test', description: 'Test desc', date: '2026-06-24' },
        { identification: 1, title: 'Aviso viejo', description: 'Desc', date: '2026-06-20' },
      ];

      mockQuery.mockResolvedValueOnce([mockNotices, []]);

      const result = await Notice.getAllNotices();

      expect(result[0].identification).toBe(4);
      expect(result[0].title).toBe('Test');
    });
  });

  // ==================== HU19 - Editar avisos ====================

  describe('HU19 - Editar avisos', () => {

    test('HU19-01: Actualizar aviso exitosamente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Notice.updateNotice(1, {
        title: 'Titulo Actualizado',
        description: 'Nueva descripcion',
      });

      expect(result).toBe(true);
      const [sql, params] = mockQuery.mock.calls[0];
      expect(sql).toContain('UPDATE notice SET');
      expect(sql).toContain('title = ?');
      expect(sql).toContain('description = ?');
      expect(params).toContain('Titulo Actualizado');
      expect(params).toContain(1);
    });

    test('HU19-02: Aviso inexistente', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 0 }, []]);

      const result = await Notice.updateNotice(999, {
        title: 'X',
        description: 'Y',
      });

      expect(result).toBe(false);
    });

    test('HU19-03: Actualizar solo titulo', async () => {
      mockQuery.mockResolvedValueOnce([{ affectedRows: 1 }, []]);

      const result = await Notice.updateNotice(1, {
        title: 'Solo titulo',
        description: 'Desc original',
      });

      expect(result).toBe(true);
      const [, params] = mockQuery.mock.calls[0];
      expect(params).toContain('Solo titulo');
      expect(params).toContain('Desc original');
    });

    test('HU19-04: Verificar edicion', async () => {
      const mockNotices = [
        { identification: 1, title: 'Titulo Actualizado', description: 'Nueva descripcion', date: '2026-06-24' },
      ];

      mockQuery.mockResolvedValueOnce([mockNotices, []]);

      const result = await Notice.getAllNotices();

      expect(result[0].title).toBe('Titulo Actualizado');
      expect(result[0].description).toBe('Nueva descripcion');
    });
  });
});
