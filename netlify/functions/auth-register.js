// Dedicated function for /api/auth/register endpoint
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testConnection } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('auth-register function called');
  console.log('Event path:', event.path);
  console.log('Event method:', event.httpMethod);
  console.log('Event headers:', JSON.stringify(event.headers));
  console.log('Event body present:', !!event.body);

  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Get the request body
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('Registration data received:', JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing request body:', error);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: 'Invalid request body',
            error: error.message
          })
        };
      }
    } else {
      console.error('No request body provided');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'No request body provided'
        })
      };
    }

    // Validate required fields
    if (!data.name || !data.email || !data.password) {
      console.error('Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Name, email, and password are required'
        })
      };
    }

    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('Database connection failed');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Database connection failed'
        })
      };
    }
    console.log('Database connected successfully');

    // Check if user already exists
    const { pool } = require('./db-simple');
    const [existingUsers] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [data.email]
    );

    if (existingUsers.length > 0) {
      console.log('User already exists with email:', data.email);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'User with this email already exists'
        })
      };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    console.log('Password hashed successfully');

    // Create new user
    const [result] = await pool.execute(
      'INSERT INTO users (full_name, email, password, is_admin) VALUES (?, ?, ?, ?)',
      [data.name, data.email, hashedPassword, false]
    );

    // Get the new user ID
    const userId = result.insertId;
    console.log('User created with ID:', userId);

    // Generate JWT token
    const token = jwt.sign(
      { id: userId },
      'nfc_business_card_secret_key',
      { expiresIn: '7d' }
    );
    console.log('JWT token generated successfully');

    // Return success response
    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: userId,
          name: data.name,
          email: data.email,
          is_admin: false
        },
        message: 'User registered successfully'
      })
    };
  } catch (error) {
    console.error('Registration error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Registration failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
