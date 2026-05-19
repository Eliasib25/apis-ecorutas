const { getConnection } = require('../config/database');

class Zone {
  static async create(zoneData, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      await conn.query(
        'INSERT INTO zone (identification, name, routeidentification) VALUES (?, ?, ?)',
        [zoneData.identification, zoneData.name, zoneData.routeidentification]
      );

      return zoneData.identification;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  static async findAll() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM zone'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async findRouteIdByZoneName(zoneName) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT routeidentification FROM zone WHERE name = ? LIMIT 1',
        [zoneName]
      );
      return rows.length > 0 ? rows[0].routeidentification : null;
    } finally {
      connection.release();
    }
  }
}

module.exports = Zone;
