const { getConnection } = require('../config/database');

class Problem {
  static async findAll() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM problem'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async create(name) {
    const connection = await getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO problem (name, state) VALUES (?, ?)',
        [name, 'activo']
      );

      return {
        identification: result.insertId,
        name: name,
        state: 'activo'
      };
    } finally {
      connection.release();
    }
  }

  static async update(id, name, state) {
    const connection = await getConnection();
    try {
      await connection.query(
        'UPDATE problem SET name = ?, state = ? WHERE identification = ?',
        [name, state, id]
      );

      return {
        identification: id,
        name: name,
        state: state
      };
    } finally {
      connection.release();
    }
  }
}

module.exports = Problem;
