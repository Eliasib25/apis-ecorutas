const express = require('express');
const authController = require('../controllers/authController');
const registerController = require('../controllers/registerController');
const updateProfileController = require('../controllers/updateProfileController');
const seedController = require('../controllers/seedController');
const zoneController = require('../controllers/zoneController');
const reportController = require('../controllers/reportController');
const problemController = require('../controllers/problemController');
const truckController = require('../controllers/truckController');
const userRouteController = require('../controllers/userRouteController');
const routeController = require('../controllers/routeController');
const routeViewController = require('../controllers/routeViewController');
const userController = require('../controllers/userController');
const reminderController = require('../controllers/reminderController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Ruta para login
router.post('/login', authController.login);

// Ruta para login admin
router.post('/admin/login', authController.adminLogin);

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

// Tipos de problema
router.get('/problems', authMiddleware, problemController.list);
router.post('/problems', authMiddleware, problemController.create);
router.put('/problems/:id', authMiddleware, problemController.update);

// Camiones
router.get('/trucks', authMiddleware, truckController.list);
router.post('/trucks', authMiddleware, truckController.create);
router.patch('/trucks/:id', authMiddleware, truckController.update);

// Ruta del usuario
router.get('/user/route', authMiddleware, userRouteController.getUserRoute);
router.post('/user/fcm-token', authMiddleware, userController.updateFCMToken);

// Simulador de rutas
router.get('/views/routes', routeViewController.renderRoutesView);
router.post('/routes/:id/start', routeController.startRoute);
router.post('/routes/:id/stop', routeController.stopRoute);

// Notificaciones de recordatorio (demo)
router.post('/routes/:routeId/send-reminder', reminderController.sendManualReminder);


module.exports = router;
