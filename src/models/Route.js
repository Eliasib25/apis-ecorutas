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

  static async findByUser(identificationtype, identification) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT r.identification, r.name, r.frecuency, r.startTime, r.isActive FROM citizen c INNER JOIN route r ON r.identification = c.routesIdentification WHERE c.identificationtype = ? AND c.identification = ? LIMIT 1',
        [identificationtype, identification]
      );

      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }
}

module.exports = Route;
