const Notice = require('../models/Notice');

const noticeController = {
  createNotice: async (req, res) => {
    try {
      const { title, description } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El título es requerido',
        });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La descripción es requerida',
        });
      }

      const notice = await Notice.createNotice({
        title: title.trim(),
        description: description.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Aviso creado correctamente',
        data: {
          notice,
        },
      });
    } catch (error) {
      console.error('Error en createNotice:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message,
      });
    }
  },

  getAllNotices: async (req, res) => {
    try {
      const notices = await Notice.getAllNotices();

      const mapped = notices.map((n) => ({
        id: String(n.identification),
        titulo: n.title,
        descripcion: n.description,
        fechaCreacion: n.date,
      }));

      return res.status(200).json({
        success: true,
        message: 'Avisos obtenidos correctamente',
        data: {
          notices: mapped,
        },
      });
    } catch (error) {
      console.error('Error en getAllNotices:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message,
      });
    }
  },

  updateNotice: async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'El título es requerido',
        });
      }

      if (!description || description.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'La descripción es requerida',
        });
      }

      const updated = await Notice.updateNotice(id, {
        title: title.trim(),
        description: description.trim(),
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Aviso no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Aviso actualizado correctamente',
      });
    } catch (error) {
      console.error('Error en updateNotice:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message,
      });
    }
  },
};

module.exports = noticeController;
