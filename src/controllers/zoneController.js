const Zone = require('../models/Zone');

const zoneController = {
  list: async (req, res) => {
    try {
      const zones = await Zone.findAll();

      return res.status(200).json({
        success: true,
        message: 'Zonas obtenidas correctamente',
        data: {
          zones: zones
        }
      });
    } catch (error) {
      console.error('Error en list zones:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = zoneController;
