require('dotenv').config();
const mysql = require('mysql2/promise');

// Crear el pool de conexiones a la base de datos
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Función para obtener una conexión del pool
const getConnection = async () => {
  return await pool.getConnection();
};

// Exportar el pool y la función
module.exports = {
  pool,
  getConnection
};
