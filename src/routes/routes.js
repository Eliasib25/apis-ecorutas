const express = require('express');
const authController = require('../controllers/authController');
const registerController = require('../controllers/registerController');
const updateProfileController = require('../controllers/updateProfileController');
const seedController = require('../controllers/seedController');
const zoneController = require('../controllers/zoneController');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Ruta para login
router.post('/login', authController.login);

// Ruta para registrar usuario
router.post('/register', registerController.register);

// Actualizar perfil (requiere token)
router.patch('/profile', authMiddleware, updateProfileController.updateProfile);

// Seed de datos
router.get('/seed', seedController.seed);

// Listar zonas
router.get('/zones', zoneController.list);

// Reportes
router.post('/reports', authMiddleware, reportController.createReport);
router.get('/reports/types', reportController.getReportTypes);

module.exports = router;
