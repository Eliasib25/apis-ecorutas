const routeSimulator = require('../services/routeSimulator');

const routeController = {
  startRoute: async (req, res) => {
    try {
      const { id } = req.params;
      await routeSimulator.start(String(id));

      return res.status(200).json({
        success: true,
        message: 'Simulacion iniciada'
      });
    } catch (error) {
      console.error('Error en startRoute:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error en el servidor',
        error: error.message
      });
    }
  },

  stopRoute: async (req, res) => {
    try {
      const { id } = req.params;
      await routeSimulator.stop(String(id));

      return res.status(200).json({
        success: true,
        message: 'Simulacion detenida'
      });
    } catch (error) {
      console.error('Error en stopRoute:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = routeController;
