const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'sistema_rrhh',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  queueLimit: 0
});

// Verificación de conexión en consola
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a MySQL en XAMPP.');
    connection.release();
  } catch (error) {
    console.error('❌ Error de conexión a XAMPP:', error.message);
  }
})();

module.exports = pool;