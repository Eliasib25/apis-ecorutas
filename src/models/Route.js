const { getConnection } = require('../config/database');

class Route {
  static async create(routeData, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      await conn.query(
        'INSERT INTO route (identification, name, frecuency, startTime, isActive) VALUES (?, ?, ?, ?, ?)',
        [routeData.identification, routeData.name, routeData.frecuency, routeData.startTime, routeData.isActive]
      );

      return routeData.identification;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }
}

module.exports = Route;
