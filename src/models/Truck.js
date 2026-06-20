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

      return {
        identification: result.insertId,
        plate: truckData.plate,
        capacityKg: truckData.capacityKg,
        conditionTruck: truckData.conditionTruck || 'disponible'
      };
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
        'SELECT * FROM truck'
      );
      return rows;
    } finally {
      connection.release();
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

  static async update(id, fields) {
    const connection = await getConnection();
    try {
      const allowedFields = ['plate', 'capacityKg', 'conditionTruck'];
      const setClauses = [];
      const values = [];

      for (const field of allowedFields) {
        if (fields[field] !== undefined) {
          setClauses.push(`${field} = ?`);
          values.push(fields[field]);
        }
      }

      if (setClauses.length === 0) {
        return await this.findById(id);
      }

      values.push(id);
      await connection.query(
        `UPDATE truck SET ${setClauses.join(', ')} WHERE identification = ?`,
        values
      );

      return await this.findById(id);
    } finally {
      connection.release();
    }
  }

}

module.exports = Truck;
