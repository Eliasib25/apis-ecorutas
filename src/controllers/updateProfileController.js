const User = require('../models/User');
const validator = require('validator');

const updateProfileController = {
  updateProfile: async (req, res) => {
    try {
      const { names, lastnames, phone, email, address, currentPassword, newPassword } = req.body;

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

      const updateFields = {};

      if (names !== undefined) {
        updateFields.names = names;
      }

      if (lastnames !== undefined) {
        updateFields.lastnames = lastnames;
      }

      if (phone !== undefined) {
        if (!validator.isNumeric(String(phone))) {
          return res.status(400).json({
            success: false,
            message: 'Teléfono inválido'
          });
        }
        updateFields.phone = phone;
      }

      if (email !== undefined) {
        if (!validator.isEmail(String(email))) {
          return res.status(400).json({
            success: false,
            message: 'Correo inválido'
          });
        }
        updateFields.email = email;
      }

      if (address !== undefined) {
        updateFields.address = address;
      }

      const wantsPasswordChange = currentPassword !== undefined || newPassword !== undefined;
      if (wantsPasswordChange) {
        if (!currentPassword || !newPassword) {
          return res.status(400).json({
            success: false,
            message: 'Contraseña actual y nueva son obligatorias'
          });
        }

        const isCurrentValid = await User.verifyPassword(currentPassword, user.password);
        if (!isCurrentValid) {
          return res.status(401).json({
            success: false,
            message: 'Contraseña actual incorrecta'
          });
        }

        const isSamePassword = await User.verifyPassword(newPassword, user.password);
        if (isSamePassword) {
          return res.status(400).json({
            success: false,
            message: 'La contraseña nueva no puede ser igual a la actual'
          });
        }

        updateFields.password = await User.hashPassword(newPassword);
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se enviaron campos para actualizar'
        });
      }

      await User.updateProfile(identificationtype, identification, updateFields);
      const updatedUser = await User.findByIdentification(identificationtype, identification);
      const userWithoutPassword = await User.getUserWithoutPassword(updatedUser);

      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: {
          user: userWithoutPassword
        }
      });

    } catch (error) {
      console.error('Error en updateProfile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = updateProfileController;
