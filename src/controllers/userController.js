const User = require('../models/User');

const userController = {
  updateFCMToken: async (req, res) => {
    try {
      const { fcm_token } = req.body;

      if (!fcm_token || typeof fcm_token !== 'string' || fcm_token.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'El token FCM es requerido y debe ser una cadena válida'
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

      await User.updateProfile(identificationtype, identification, {
        fcm_token: fcm_token.trim()
      });

      return res.status(200).json({
        success: true,
        message: 'Token FCM actualizado correctamente',
        data: {
          fcm_token: fcm_token.trim()
        }
      });
    } catch (error) {
      console.error('Error en updateFCMToken:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = userController;
