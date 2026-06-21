const Report = require('../models/Report');
const User = require('../models/User');
const { sendReportResponseEmail } = require('../services/emailService');

const VALID_STATES = ['pendiente', 'resuelto'];

const reportController = {
  getAllReports: async (req, res) => {
    try {
      const reports = await Report.getAllReports();

      const mapped = reports.map((r) => ({
        id: String(r.id),
        usuario: r.usuario,
        correo: r.correo,
        problema: r.problema,
        direccion: r.direccion,
        fecha: r.fecha,
        estado: r.estado.toLowerCase(),
      }));

      return res.status(200).json({
        success: true,
        message: 'Reportes obtenidos correctamente',
        data: {
          reports: mapped,
        },
      });
    } catch (error) {
      console.error('Error en getAllReports:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message,
      });
    }
  },

  updateReportState: async (req, res) => {
    try {
      const { id } = req.params;
      const { state, respuesta } = req.body;

      if (!state || !VALID_STATES.includes(state.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Use: pendiente o resuelto',
        });
      }

      const normalizedState = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();

      const updated = await Report.updateReportState(id, normalizedState);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Reporte no encontrado',
        });
      }

      if (normalizedState === 'Resuelto' && respuesta && respuesta.trim()) {
        Report.getReportWithUser(id)
          .then((reportData) => {
            if (reportData && reportData.correo) {
              return sendReportResponseEmail({
                to: reportData.correo,
                userName: reportData.usuario,
                response: respuesta.trim(),
              });
            }
          })
          .catch((emailError) => {
            console.error('Error al enviar correo de respuesta:', emailError);
          });
      }

      return res.status(200).json({
        success: true,
        message: 'Estado del reporte actualizado correctamente',
      });
    } catch (error) {
      console.error('Error en updateReportState:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message,
      });
    }
  },

  createReport: async (req, res) => {
    try {
      const { type, problem, address, date } = req.body;

      if (!type || !problem || !address || !date) {
        return res.status(400).json({
          success: false,
          message: 'Campos obligatorios faltantes'
        });
      }

      const authUser = req.user || {};
      const identificationtype = authUser.identificationtype;
      const identification = authUser.identification;

      if (!identificationtype || !identification) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      const user = await User.findByIdentification(identificationtype, identification);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const report = await Report.createReport({
        type,
        problem,
        address,
        date,
        citizenidentificationtype: identificationtype,
        citizenidentification: identification
      });

      return res.status(201).json({
        success: true,
        message: 'Reporte creado correctamente',
        data: {
          report: report
        }
      });
    } catch (error) {
      console.error('Error en createReport:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  getReportTypes: async (req, res) => {
    try {
      const types = await Report.getReportTypes();

      return res.status(200).json({
        success: true,
        message: 'Tipos de reporte obtenidos correctamente',
        data: {
          types: types
        }
      });
    } catch (error) {
      console.error('Error en getReportTypes:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = reportController;
