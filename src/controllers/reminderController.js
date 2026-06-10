const { sendManualReminder } = require('../services/reminderNotification');

const reminderController = {
  sendManualReminder: async (req, res) => {
    try {
      const { routeId } = req.params;

      if (!routeId || isNaN(parseInt(routeId))) {
        return res.status(400).json({
          success: false,
          message: 'routeId es requerido y debe ser un número'
        });
      }

      const result = await sendManualReminder(parseInt(routeId));

      if (!result.success) {
        return res.status(404).json({
          success: false,
          message: result.message
        });
      }

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          tokensCount: result.tokensCount
        }
      });
    } catch (error) {
      console.error('Error en sendManualReminder:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al enviar la notificación',
        error: error.message
      });
    }
  }
};

module.exports = reminderController;
