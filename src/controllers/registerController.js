
const User = require('../models/User');
const Zone = require('../models/Zone');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      identificationtype: user.identificationtype,
      identification: user.identification
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const registerController = {
  register: async (req, res) => {
    try {
      const { identificationtype, identification, names, lastnames, email, phone, address, neighborhood, userName, password } = req.body;

      // Validaciones solo del backend: verificar unicidad en BD
      let user = await User.findByUserName(userName);
      if (user) {
        return res.status(409).json({
          success: false,
          message: 'El nombre de usuario ya existe'
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
        routesIdentification: routeId
      });

      // Generar token
      const token = generateToken(newUser);

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
