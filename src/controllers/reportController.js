const Report = require('../models/Report');
const User = require('../models/User');

const reportController = {
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
