const { getConnection } = require('../config/database');

class Notice {
  static async createNotice({ title, description }) {
    const connection = await getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO notice (title, description, date) VALUES (?, ?, NOW())',
        [title, description]
      );

      return {
        identification: result.insertId,
        title,
        description,
      };
    } finally {
      connection.release();
    }
  }

  static async getAllNotices() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT identification, title, description, date FROM notice ORDER BY date DESC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async updateNotice(id, { title, description }) {
    const connection = await getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE notice SET title = ?, description = ? WHERE identification = ?',
        [title, description, id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }
}

module.exports = Notice;
