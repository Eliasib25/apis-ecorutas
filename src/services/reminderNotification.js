const cron = require('node-cron');
const { admin } = require('../config/firebase');
const { getConnection } = require('../config/database');

// Mapeo de números de día a nombres en español abreviados
const dayNames = {
  0: 'dom',
  1: 'lun',
  2: 'mar',
  3: 'mié',
  4: 'jue',
  5: 'vie',
  6: 'sáb'
};

// Mapeo de frecuencia de ruta a días de la semana
const frequencyToDays = {
  'Lun-Mie-Vie': ['lun', 'mié', 'vie'],
  'Mar-Jue-Sab': ['mar', 'jue', 'sáb'],
};

/**
 * Obtiene el día actual en formato abreviado en español
 * @returns {string} Día actual abreviado (ej: "lun", "mar")
 */
const getCurrentDayAbbreviated = () => {
  const today = new Date();
  const dayIndex = today.getDay();
  return dayNames[dayIndex];
};

/**
 * Obtiene todas las rutas activas cuya frecuencia contiene el día actual
 * @returns {Promise<Array>} Array de rutas activas
 */
const getActiveRoutesForToday = async () => {
  const connection = await getConnection();
  try {
    const [routes] = await connection.query(
      'SELECT identification, name, frecuency, startTime FROM route WHERE isActive = ?',
      ['si']
    );

    const currentDay = getCurrentDayAbbreviated();
    
    // Filtrar rutas que tengan el día actual en su frecuencia
    return routes.filter(route => {
      const daysForRoute = frequencyToDays[route.frecuency] || [];
      return daysForRoute.includes(currentDay);
    });
  } finally {
    connection.release();
  }
};

/**
 * Obtiene los tokens FCM de los usuarios asociados a una ruta
 * @param {number} routeId - ID de la ruta
 * @returns {Promise<Array>} Array de tokens FCM válidos
 */
const getFCMTokensForRoute = async (routeId) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.query(
      'SELECT fcm_token FROM citizen WHERE routesIdentification = ? AND fcm_token IS NOT NULL AND fcm_token != ?',
      [routeId, '']
    );

    return users
      .map(user => user.fcm_token)
      .filter(token => token && token.length > 0);
  } finally {
    connection.release();
  }
};

/**
 * Calcula el tiempo de espera en milisegundos hasta 30 minutos antes de la hora de inicio
 * @param {string} startTime - Hora de inicio en formato "HH:MM"
 * @returns {number} Milisegundos hasta la hora de envío (puede ser negativo si ya pasó)
 */
const calculateWaitTime = (startTime) => {
  const [hours, minutes] = startTime.split(':').map(Number);
  
  const now = new Date();
  const scheduleTime = new Date();
  scheduleTime.setHours(hours, minutes, 0, 0);
  
  // Restar 30 minutos
  scheduleTime.setMinutes(scheduleTime.getMinutes() - 30);
  
  const waitTime = scheduleTime.getTime() - now.getTime();
  
  return waitTime;
};

/**
 * Envía notificaciones FCM a múltiples dispositivos
 * @param {Array<string>} tokens - Array de tokens FCM
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 */
const sendNotifications = async (tokens, title, body) => {
  if (!tokens || tokens.length === 0) {
    console.log('No hay tokens para enviar notificaciones');
    return;
  }

  try {
    const message = {
      notification: {
        title: title,
        body: body
      }
    };

    const response = await admin.messaging().sendEachForMulticast({
      tokens: tokens,
      notification: message.notification
    });

    console.log(`✓ Notificaciones enviadas: ${response.successCount} éxito, ${response.failureCount} fallo`);

    // Registrar fallos
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.warn(`  - Token ${idx} falló: ${resp.error.message}`);
        }
      });
    }

    return response;
  } catch (error) {
    console.error('Error al enviar notificaciones:', error.message);
    throw error;
  }
};

/**
 * Agenda una notificación para una ruta específica
 * @param {Object} route - Objeto de ruta con { identification, name, startTime }
 * @param {Array<string>} tokens - Array de tokens FCM para los usuarios
 */
const scheduleNotificationForRoute = async (route, tokens) => {
  if (!tokens || tokens.length === 0) {
    console.log(`No hay usuarios con tokens para la ruta ${route.name}`);
    return;
  }

  const waitTime = calculateWaitTime(route.startTime);

  if (waitTime < 0) {
    console.log(`La hora de envío para la ruta ${route.name} ya pasó hoy (espera: ${waitTime}ms)`);
    return;
  }

  console.log(`⏰ Programando notificación para ${route.name} en ${Math.round(waitTime / 1000)}s`);

  setTimeout(async () => {
    try {
      const title = 'Hoy pasa el camión 🚛';
      const body = 'No olvides sacar tu basura';
      
      console.log(`📢 Enviando notificación para: ${route.name}`);
      await sendNotifications(tokens, title, body);
    } catch (error) {
      console.error(`Error enviando notificación para ${route.name}:`, error);
    }
  }, waitTime);
};

/**
 * Función principal que se ejecuta diariamente a las 05:50 AM
 * Obtiene rutas activas del día y programa el envío de notificaciones
 */
const executeReminderCheck = async () => {
  try {
    const currentDay = getCurrentDayAbbreviated();
    console.log(`\n📅 Verificación de recordatorios - Día: ${currentDay} - ${new Date().toLocaleString()}`);

    const routes = await getActiveRoutesForToday();

    if (routes.length === 0) {
      console.log('No hay rutas activas para hoy');
      return;
    }

    console.log(`Encontradas ${routes.length} rutas activas para hoy`);

    // Para cada ruta activa, obtener tokens y programar notificación
    for (const route of routes) {
      const tokens = await getFCMTokensForRoute(route.identification);
      await scheduleNotificationForRoute(route, tokens);
    }
  } catch (error) {
    console.error('Error en executeReminderCheck:', error);
  }
};

/**
 * Inicia el cronograma de notificaciones de recordatorio
 * Se ejecuta diariamente a las 05:50 AM
 */
const scheduleReminderNotifications = () => {
  try {
    // Cron: minuto hora día mes día_de_semana
    // 50 5 * * * = 05:50 AM todos los días
    const task = cron.schedule('50 5 * * *', executeReminderCheck);
    
    console.log('✓ Servicio de recordatorios programado para 05:50 AM diarios');
    
    return task;
  } catch (error) {
    console.error('Error iniciando scheduleReminderNotifications:', error);
    throw error;
  }
};

/**
 * Función para enviar notificación manual (para demo)
 * @param {number} routeId - ID de la ruta
 * @returns {Promise<Object>} Resultado del envío
 */
const sendManualReminder = async (routeId) => {
  try {
    const connection = await getConnection();
    let route;
    
    try {
      const [routes] = await connection.query(
        'SELECT identification, name FROM route WHERE identification = ? AND isActive = ?',
        [routeId, 'si']
      );
      route = routes[0];
    } finally {
      connection.release();
    }

    if (!route) {
      throw new Error('Ruta no encontrada o no activa');
    }

    const tokens = await getFCMTokensForRoute(routeId);

    if (tokens.length === 0) {
      return {
        success: false,
        message: 'No hay usuarios con tokens para esta ruta'
      };
    }

    const title = 'Hoy pasa el camión 🚛';
    const body = 'No olvides sacar tu basura';
    
    await sendNotifications(tokens, title, body);

    return {
      success: true,
      message: `Notificación enviada a ${tokens.length} usuario(s)`,
      tokensCount: tokens.length
    };
  } catch (error) {
    console.error('Error en sendManualReminder:', error);
    throw error;
  }
};

module.exports = {
  scheduleReminderNotifications,
  sendManualReminder,
  executeReminderCheck
};
