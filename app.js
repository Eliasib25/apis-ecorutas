require('dotenv').config();
const express = require('express');
const cors = require('cors');
const routes = require('./src/routes/routes');
const { db } = require('./src/config/firebase');
const { scheduleReminderNotifications } = require('./src/services/reminderNotification');
const { startProximityChecker } = require('./src/services/proximityNotification');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://ecorutas-admin.netlify.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', routes);
app.use('/api/', routes);


// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Servidor funcionando correctamente'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`✓ Base de datos: ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  
  // Iniciar servicio de recordatorios
  scheduleReminderNotifications();

  // Iniciar servicio de notificaciones de proximidad
  startProximityChecker();
  
  db.ref('.info/connected').on('value', (snapshot) => {
    if (snapshot.val() === true) {
      console.log('✓ Firebase Realtime Database conectado');
    } else {
      console.warn('⚠ Firebase Realtime Database no reporta conexión');
    }
  }, (error) => {
    console.error('✗ Error conectando a Firebase Realtime Database:', error.message);
  });
});

module.exports = app;
