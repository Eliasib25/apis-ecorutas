const { getConnection } = require('../config/database');

class Report {
  static async createReport(reportData) {
    const connection = await getConnection();
    try {
      const [result] = await connection.query(
        'INSERT INTO report (type, problem, address, date, citizenidentificationtype, citizenidentification) VALUES (?, ?, ?, ?, ?, ?)',
        [
          reportData.type,
          reportData.problem,
          reportData.address,
          reportData.date,
          reportData.citizenidentificationtype,
          reportData.citizenidentification
        ]
      );

      return {
        identification: result.insertId,
        type: reportData.type,
        problem: reportData.problem,
        address: reportData.address,
        date: reportData.date,
        citizenidentificationtype: reportData.citizenidentificationtype,
        citizenidentification: reportData.citizenidentification
      };
    } finally {
      connection.release();
    }
  }

  static async getAllReports() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          r.identification AS id,
          CONCAT(u.names, ' ', u.lastnames) AS usuario,
          u.email AS correo,
          r.problem AS problema,
          r.address AS direccion,
          r.date AS fecha,
          r.state AS estado
        FROM report r
        INNER JOIN user u ON r.citizenidentificationtype = u.identificationtype AND r.citizenidentification = u.identification
        ORDER BY r.date DESC`
      );
      return rows;
    } finally {
      connection.release();
    }
  }

  static async updateReportState(id, state) {
    const connection = await getConnection();
    try {
      const [result] = await connection.query(
        'UPDATE report SET state = ? WHERE identification = ?',
        [state, id]
      );
      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  static async getReportWithUser(id) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        `SELECT 
          r.identification AS id,
          r.state AS estado,
          u.email AS correo,
          CONCAT(u.names, ' ', u.lastnames) AS usuario
        FROM report r
        INNER JOIN user u ON r.citizenidentificationtype = u.identificationtype AND r.citizenidentification = u.identification
        WHERE r.identification = ?`,
        [id]
      );
      return rows[0] || null;
    } finally {
      connection.release();
    }
  }

}

module.exports = Report;
