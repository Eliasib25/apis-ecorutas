const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      identificationtype: user.identificationtype,
      identification: user.identification
    },
    process.env.JWT_SECRET,
    { expiresIn: '30m' }
  );
};

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { userName, password } = req.body;

      // Buscar usuario por userName
      let user = await User.findByUserName(userName);

      // Verificar que el usuario existe
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
        });
      }

      // Verificar la contraseña
      const isPasswordValid = await User.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Usuario o contraseña incorrectos'
        });
      }

      // Generar token JWT
      const token = generateToken(user);

      // Obtener usuario sin la contraseña
      const userWithoutPassword = await User.getUserWithoutPassword(user);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        message: 'Inicio de sesión exitoso',
        data: {
          user: userWithoutPassword,
          token: token
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error en el servidor',
        error: error.message
      });
    }
  },

  // Registrar usuario
};

module.exports = authController;
