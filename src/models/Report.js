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

  static async getReportTypes() {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        "SHOW COLUMNS FROM report LIKE 'type'"
      );

      if (!rows.length || !rows[0].Type) {
        return [];
      }

      const columnType = rows[0].Type;
      const match = columnType.match(/^enum\((.*)\)$/);
      if (!match || !match[1]) {
        return [];
      }

      return match[1]
        .split(',')
        .map((value) => value.trim().replace(/^'/, '').replace(/'$/, ''));
    } finally {
      connection.release();
    }
  }
}

module.exports = Report;
