const cron = require('node-cron');
const { db, admin } = require('../config/firebase');
const { getConnection } = require('../config/database');
const { getActiveRouteIds } = require('./routeSimulator');

const THRESHOLDS = [
  { meters: 500, title: '🚛 El camión está cerca', body: 'El camión recolector está a 500 metros de tu ubicación' },
  { meters: 250, title: '🚛 El camión se acerca', body: 'El camión recolector está a 250 metros de tu ubicación' },
  { meters: 100, title: '🚛 ¡Prepárate!', body: 'El camión recolector está a 100 metros de tu ubicación' },
  { meters: 20,  title: '🗑️ ¡Saca tu basura!', body: 'El camión recolector ya llegó a tu ubicación' },
];

const notifiedThresholds = new Map();

const RADIUS_EARTH_METERS = 6371000;

const toRadians = (degrees) => degrees * (Math.PI / 180);

const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return RADIUS_EARTH_METERS * c;
};

const getTruckPosition = async (routeId) => {
  try {
    const snapshot = await db.ref(`routes/${routeId}/position`).once('value');
    const pos = snapshot.val();
    if (!pos || typeof pos.lat !== 'number' || typeof pos.lng !== 'number') {
      return null;
    }
    if (pos.timestamp === 0) {
      return null;
    }
    return { lat: pos.lat, lng: pos.lng };
  } catch (error) {
    console.error(`Error leyendo posición de Firebase para ruta ${routeId}:`, error.message);
    return null;
  }
};

const getUsersWithLocationAndToken = async (routeId) => {
  const connection = await getConnection();
  try {
    const [users] = await connection.query(
      `SELECT identificationtype, identification, fcm_token, last_latitude, last_longitude
       FROM citizen
       WHERE routesIdentification = ?
         AND fcm_token IS NOT NULL AND fcm_token != ''
         AND last_latitude IS NOT NULL
         AND last_longitude IS NOT NULL`,
      [routeId]
    );
    return users;
  } finally {
    connection.release();
  }
};

const sendProximityNotification = async (token, title, body) => {
  try {
    await admin.messaging().send({
      token: token,
      notification: { title, body }
    });
    return true;
  } catch (error) {
    console.warn(`Error enviando notificación de proximidad a token ${token.substring(0, 20)}...: ${error.message}`);
    return false;
  }
};

const getThresholdKey = (identificationtype, identification) => {
  return `${identificationtype}_${identification}`;
};

const checkProximity = async () => {
  try {
    const activeRouteIds = getActiveRouteIds();

    if (activeRouteIds.length === 0) {
      return;
    }

    for (const routeId of activeRouteIds) {
      const truckPos = await getTruckPosition(routeId);
      if (!truckPos) continue;

      const users = await getUsersWithLocationAndToken(routeId);
      if (users.length === 0) continue;

      for (const user of users) {
        const distance = haversineDistance(
          truckPos.lat, truckPos.lng,
          user.last_latitude, user.last_longitude
        );

        const userKey = getThresholdKey(user.identificationtype, user.identification);

        if (!notifiedThresholds.has(userKey)) {
          notifiedThresholds.set(userKey, new Set());
        }

        const userNotified = notifiedThresholds.get(userKey);

        for (const threshold of THRESHOLDS) {
          if (distance <= threshold.meters && !userNotified.has(threshold.meters)) {
            const sent = await sendProximityNotification(
              user.fcm_token,
              threshold.title,
              threshold.body
            );

            if (sent) {
              userNotified.add(threshold.meters);
              console.log(
                `📍 Notificación de proximidad: ${user.identificationtype}_${user.identification} ` +
                `está a ${Math.round(distance)}m del camión en ruta ${routeId} → umbral ${threshold.meters}m`
              );
            }
          }
        }

        const thresholdsMet = THRESHOLDS.filter(t => distance <= t.meters).map(t => t.meters);
        const exceededSet = new Set(thresholdsMet);
        for (const notified of userNotified) {
          if (!exceededSet.has(notified)) {
            userNotified.delete(notified);
          }
        }
      }

      for (const [key] of notifiedThresholds) {
        if (!users.some(u => getThresholdKey(u.identificationtype, u.identification) === key)) {
          notifiedThresholds.delete(key);
        }
      }
    }
  } catch (error) {
    console.error('Error en checkProximity:', error);
  }
};

const clearNotifiedThresholds = () => {
  notifiedThresholds.clear();
  console.log('🧹 Map de notificaciones de proximidad limpiado a medianoche');
};

const startProximityChecker = () => {
  try {
    cron.schedule('*/5 * * * * *', checkProximity);

    cron.schedule('0 0 * * *', clearNotifiedThresholds);

    console.log('✓ Servicio de notificaciones de proximidad iniciado (cada 5 segundos)');
    console.log('✓ Limpieza de deduplicación programada a medianoche');
  } catch (error) {
    console.error('Error iniciando proximityChecker:', error);
    throw error;
  }
};

module.exports = {
  startProximityChecker,
  checkProximity,
  clearNotifiedThresholds,
  haversineDistance
};
