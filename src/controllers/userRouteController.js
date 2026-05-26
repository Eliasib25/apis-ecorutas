const Route = require('../models/Route');

const userRouteController = {
  getUserRoute: async (req, res) => {
    try {
      const authUser = req.user || {};
      const identificationtype = authUser.identificationtype;
      const identification = authUser.identification;

      if (!identificationtype || !identification) {
        return res.status(401).json({
          success: false,
          message: 'Token inválido'
        });
      }

      const route = await Route.findByUser(identificationtype, identification);
      if (!route) {
        return res.status(404).json({
          success: false,
          message: 'Usuario sin ruta asociada'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Ruta obtenida correctamente',
        data: {
          route: route
        }
      });
    } catch (error) {
      console.error('Error en getUserRoute:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = userRouteController;
