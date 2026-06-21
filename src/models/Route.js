const { getConnection } = require('../config/database');

class Route {

  static async findAllWithDetails() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT
          r.identification,
          r.name,
          r.frecuency,
          r.startTime,
          r.isActive,
          r.truckIdentification,
          t.plate AS truckPlate,
          GROUP_CONCAT(z.name ORDER BY z.identification SEPARATOR ', ') AS zones
        FROM route r
        LEFT JOIN truck t ON t.identification = r.truckIdentification
        LEFT JOIN zone z ON z.routeidentification = r.identification
        GROUP BY r.identification, r.name, r.frecuency, r.startTime, r.isActive, r.truckIdentification, t.plate
        ORDER BY r.identification DESC`
      );

      return rows.map(row => ({
        ...row,
        zones: row.zones ? row.zones.split(', ') : [],
      }));
    } finally {
      connection.release();
    }
  }

  static async createRoute(routeData, zoneIds, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      const [result] = await conn.query(
        'INSERT INTO route (name, frecuency, startTime, isActive, truckIdentification) VALUES (?, ?, ?, ?, ?)',
        [
          routeData.name,
          routeData.frecuency,
          routeData.startTime,
          routeData.isActive || '1',
          routeData.truckIdentification || null,
        ]
      );

      const newRouteId = result.insertId;

      if (zoneIds && zoneIds.length > 0) {
        await conn.query(
          'UPDATE zone SET routeidentification = ? WHERE identification IN (?)',
          [newRouteId, zoneIds]
        );
      }

      return newRouteId;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  static async updateRoute(id, routeData, zoneIds, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      const fields = {};
      if (routeData.name !== undefined) fields.name = routeData.name;
      if (routeData.frecuency !== undefined) fields.frecuency = routeData.frecuency;
      if (routeData.startTime !== undefined) fields.startTime = routeData.startTime;
      if (routeData.isActive !== undefined) fields.isActive = routeData.isActive;
      if (routeData.truckIdentification !== undefined) {
        fields.truckIdentification = routeData.truckIdentification || null;
      }

      if (Object.keys(fields).length > 0) {
        const setClause = Object.keys(fields).map(f => `${f} = ?`).join(', ');
        const values = Object.values(fields);
        values.push(id);
        await conn.query(`UPDATE route SET ${setClause} WHERE identification = ?`, values);
      }

      if (zoneIds !== undefined) {
        await conn.query(
          'UPDATE zone SET routeidentification = NULL WHERE routeidentification = ?',
          [id]
        );

        if (zoneIds.length > 0) {
          await conn.query(
            'UPDATE zone SET routeidentification = ? WHERE identification IN (?)',
            [id, zoneIds]
          );
        }
      }

      return true;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  static async findById(id) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM route WHERE identification = ? LIMIT 1',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByUser(identificationtype, identification) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT r.identification, r.name, r.frecuency, r.startTime, r.isActive FROM user c INNER JOIN route r ON r.identification = c.routesIdentification WHERE c.identificationtype = ? AND c.identification = ? LIMIT 1',
        [identificationtype, identification]
      );

      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async assignTruck(routeId, truckId, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      const [result] = await conn.query(
        'UPDATE route SET truckIdentification = ? WHERE identification = ?',
        [truckId, routeId]
      );

      return result.affectedRows > 0;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  static async getAllRoutes() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT identification, name, frecuency, startTime, isActive FROM route'
      );
      return rows;
    } finally {
      connection.release();
    }
  }
}

module.exports = Route;
