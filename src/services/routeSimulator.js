const { db } = require('../config/firebase');

const timers = new Map();
const states = new Map();

const normalizeWaypoints = (rawWaypoints) => {
  if (!rawWaypoints) return [];

  const toNumber = (value) => {
    const num = typeof value === 'number' ? value : parseFloat(value);
    return Number.isFinite(num) ? num : null;
  };

  const clean = (point) => {
    const lat = toNumber(point.lat);
    const lng = toNumber(point.lng ?? point.lon);
    if (lat === null || lng === null) return null;
    return {
      seq: parseInt(point.seq, 10) || 0,
      lat,
      lng
    };
  };

  if (Array.isArray(rawWaypoints)) {
    return rawWaypoints
      .map(clean)
      .filter(Boolean)
      .sort((a, b) => a.seq - b.seq);
  }

  return Object.values(rawWaypoints)
    .map(clean)
    .filter(Boolean)
    .sort((a, b) => a.seq - b.seq);
};

const writePosition = async (routeId, point, timestamp) => {
  await db.ref(`routes/${routeId}/position`).set({
    lat: point.lat,
    lng: point.lng,
    timestamp: timestamp
  });
};

const start = async (routeId) => {
  if (!routeId) {
    throw new Error('Id de ruta inválido');
  }

  if (timers.has(routeId)) {
    clearInterval(timers.get(routeId));
    timers.delete(routeId);
  }

  const snapshot = await db.ref(`routes/${routeId}/waypoints`).once('value');
  const waypoints = normalizeWaypoints(snapshot.val());

  if (!waypoints.length) {
    throw new Error('No hay waypoints para la ruta');
  }

  states.set(routeId, {
    index: 0,
    waypoints: waypoints
  });

  await writePosition(routeId, waypoints[0], Date.now());

  const intervalId = setInterval(async () => {
    const state = states.get(routeId);
    if (!state || !state.waypoints.length) return;

    const nextIndex = (state.index + 1) % state.waypoints.length;
    state.index = nextIndex;
    states.set(routeId, state);

    const nextPoint = state.waypoints[nextIndex];
    try {
      await writePosition(routeId, nextPoint, Date.now());
    } catch (error) {
      console.error('Error actualizando posicion en Firebase:', error);
    }
  }, 1000);

  timers.set(routeId, intervalId);
 
  return true;
};

const stop = async (routeId) => {
  if (!routeId) {
    throw new Error('Id de ruta inválido');
  }

  if (timers.has(routeId)) {
    clearInterval(timers.get(routeId));
    timers.delete(routeId);
  }

  const state = states.get(routeId);
  const lastPoint = state && state.waypoints && state.waypoints.length
    ? state.waypoints[state.index]
    : { lat: 0, lng: 0 };

  await writePosition(routeId, lastPoint, 0);
  states.delete(routeId);

  return true;
};

const getActiveRouteIds = () => {
  return Array.from(timers.keys());
};

module.exports = {
  start,
  stop,
  getActiveRouteIds
};
