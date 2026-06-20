const { getConnection } = require('../config/database');

class Truck {

  static async create(truckData, connection) {
    const shouldRelease = !connection;
    const conn = connection || await getConnection();

    try {
      const [result] = await conn.query(
        'INSERT INTO truck (plate, capacityKg, conditionTruck) VALUES (?, ?, ?)',
        [truckData.plate, truckData.capacityKg, truckData.conditionTruck || 'disponible']
      );

      return result.insertId;
    } finally {
      if (shouldRelease) {
        conn.release();
      }
    }
  }

  static async findById(identification) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM truck WHERE identification = ? LIMIT 1',
        [identification]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

}

module.exports = Truck;
