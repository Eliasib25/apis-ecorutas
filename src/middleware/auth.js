const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    // Obtener el token del header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // El token viene en formato "Bearer token"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    // Verificar y decodificar el token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'tu_clave_secreta_super_segura_cambiar_en_produccion'
    );

    // Agregar el usuario al request
    req.user = decoded;
    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: error.message
    });
  }
};

const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({
        success: false,
        message: `Acceso denegado. Se requiere rol de ${role}`
      });
    }
    next();
  };
};

module.exports = authMiddleware;
module.exports.requireRole = requireRole;
