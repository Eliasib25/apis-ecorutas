const { getConnection } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {

  // Buscar usuario por email o username
  static async findByEmail(email) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM citizen WHERE email = ? LIMIT 1',
        [email]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByIdentification(identificationtype, identification) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM citizen WHERE identificationtype = ? AND identification = ? LIMIT 1',
        [identificationtype, identification]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByUserName(userName) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM citizen WHERE userName = ? LIMIT 1',
        [userName]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findById(id) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM citizen WHERE id = ? LIMIT 1',
        [id]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  static async findByIdentification(identificationtype, identification) {
    const connection = await getConnection();
    try {
      const [rows] = await connection.query(
        'SELECT * FROM citizen WHERE identificationtype = ? AND identification = ? LIMIT 1',
        [identificationtype, identification]
      );
      return rows.length > 0 ? rows[0] : null;
    } finally {
      connection.release();
    }
  }

  // Crear nuevo usuario
  static async create(userData) {
    const connection = await getConnection();
    try {
      // Hashear la contraseña
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      const [result] = await connection.query(
        'INSERT INTO citizen (identificationtype, identification, names, lastnames, email, phone, address, neighborhood, userName, password, routesIdentification) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [userData.identificationtype, userData.identification, userData.names, userData.lastnames, userData.email, userData.phone, userData.address, userData.neighborhood, userData.userName, hashedPassword, userData.routesIdentification]
      );

      return {
        identificationtype: userData.identificationtype,
        identification: userData.identification,
        names: userData.names,
        lastnames: userData.lastnames,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        neighborhood: userData.neighborhood,
        userName: userData.userName,
        routesIdentification: userData.routesIdentification
      };
    } finally {
      connection.release();
    }
  }

  static async updateProfile(identificationtype, identification, updateFields) {
    const connection = await getConnection();
    try {
      const fields = Object.keys(updateFields);
      if (fields.length === 0) {
        return false;
      }

      const setClause = fields.map((field) => `${field} = ?`).join(', ');
      const values = fields.map((field) => updateFields[field]);
      values.push(identificationtype, identification);

      const [result] = await connection.query(
        `UPDATE citizen SET ${setClause} WHERE identificationtype = ? AND identification = ?`,
        values
      );

      return result.affectedRows > 0;
    } finally {
      connection.release();
    }
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async hashPassword(plainPassword) {
    return await bcrypt.hash(plainPassword, 10);
  }

  // Obtener usuario sin incluir contraseña
  static async getUserWithoutPassword(user) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

module.exports = User;
