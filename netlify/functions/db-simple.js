// Simple database connection for Netlify functions
const mysql = require('mysql2/promise');

// Create a connection pool
const pool = mysql.createPool({
  host: 'nfc-lucifer-nfc-lucifer.b.aivencloud.com',
  port: 12639,
  user: 'avnadmin',
  password: 'AVNS_mxDPO2lgZRVAbKhlnfp',
  database: 'defaultdb',
  ssl: {
    rejectUnauthorized: false
  },
  waitForConnections: true,
  connectionLimit: 2,
  queueLimit: 0
});

// Test the connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

// Find user by email
const findUserByEmail = async (email) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Users WHERE email = ?',
      [email]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

// Find user by ID
const findUserById = async (id) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error('Error finding user by ID:', error);
    throw error;
  }
};

module.exports = {
  pool,
  testConnection,
  findUserByEmail,
  findUserById
};
