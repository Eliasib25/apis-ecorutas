
const User = require('../models/User');
const Zone = require('../models/Zone');
const jwt = require('jsonwebtoken');



const registerController = {
  register: async (req, res) => {
    try {
      const { identificationtype, identification, names, lastnames, email, phone, address, neighborhood, userName, password, lat, lng } = req.body;

      // Validaciones solo del backend: verificar unicidad en BD
      let user = await User.findByUserName(userName);
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya existe'
        });
      }

      user = await User.findByIdentification(identificationtype, identification);
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe un usuario con el mismo tipo de identificación y número de identificación'
        });
      }

      user = await User.findByEmail(email);
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está registrado'
        });
      }

      const routeId = await Zone.findRouteIdByZoneName(neighborhood);
      if (!routeId) {
        return res.status(404).json({
          success: false,
          message: 'Barrio no encontrado'
        });
      }

      // Crear usuario
      const newUser = await User.create({
        identificationtype,
        identification,
        names,
        lastnames,
        email,
        phone,
        address,
        neighborhood,
        userName,
        password,
        routesIdentification: routeId,
        last_latitude: lat || null,
        last_longitude: lng || null
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: newUser,
          token: token
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  }
};

module.exports = registerController;
