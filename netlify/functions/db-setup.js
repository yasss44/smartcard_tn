// Database setup script for Netlify functions
const { pool } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('DB Setup function called');
  
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  try {
    // Create users table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Users table created or already exists');

    // Create cards table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        title VARCHAR(255),
        company VARCHAR(255),
        email VARCHAR(255),
        phone VARCHAR(50),
        website VARCHAR(255),
        bio TEXT,
        profile_image VARCHAR(255),
        unique_url VARCHAR(255) UNIQUE,
        social_links JSON,
        theme VARCHAR(50) DEFAULT 'default',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Cards table created or already exists');

    // Create orders table if it doesn't exist
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        plan_id INT NOT NULL,
        quantity INT DEFAULT 1,
        total_price DECIMAL(10, 2) NOT NULL,
        shipping_price DECIMAL(10, 2) DEFAULT 0,
        status VARCHAR(50) DEFAULT 'pending',
        shipping_address TEXT,
        phone VARCHAR(50),
        card_name VARCHAR(255),
        logo_file VARCHAR(255),
        design_file VARCHAR(255),
        card_created BOOLEAN DEFAULT FALSE,
        card_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Orders table created or already exists');

    // Create an admin user if it doesn't exist
    const [adminUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      ['admin@smartcard.tn']
    );

    if (adminUsers.length === 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await pool.execute(
        'INSERT INTO users (full_name, email, password, is_admin) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@smartcard.tn', hashedPassword, true]
      );
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Database setup completed successfully',
        tables: ['users', 'cards', 'orders']
      })
    };
  } catch (error) {
    console.error('Database setup error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Database setup failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
