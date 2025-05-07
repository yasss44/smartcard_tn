// Dedicated function for /api/auth/login endpoint
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testConnection } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('auth-login function called');
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
        console.log('Login data received:', JSON.stringify({
          email: data.email,
          password: data.password ? '********' : 'not provided'
        }));
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
    if (!data.email || !data.password) {
      console.error('Missing required fields');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: 'Email and password are required'
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

    // Find the user by email
    const { pool } = require('./db-simple');
    const [users] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [data.email]
    );

    // Check if user exists
    if (users.length === 0) {
      console.log('User not found:', data.email);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    const user = users[0];
    console.log('User found, checking password');

    // Check if password is correct
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Invalid credentials'
        })
      };
    }

    console.log('Password matches, generating token');

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      'nfc_business_card_secret_key',
      { expiresIn: '7d' }
    );
    console.log('JWT token generated successfully');

    // Return success response
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        token,
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          is_admin: user.is_admin || false
        },
        message: 'Login successful'
      })
    };
  } catch (error) {
    console.error('Login error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Login failed',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
