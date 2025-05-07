// Netlify serverless function for user registration
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testConnection, findUserByEmail } = require('./db-simple');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Register request from origin:', origin);
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);
  console.log('Request headers:', JSON.stringify(event.headers));

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request for register');
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST method
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed:', event.httpMethod);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        message: 'Method not allowed'
      })
    };
  }

  try {
    console.log('Handling register request directly with database');

    // Get the request body
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('Register request data:', JSON.stringify(data));
      } catch (error) {
        console.error('Error parsing register request body:', error);
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: 'Invalid request body',
            error: error.message,
            body: event.body
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

    try {
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
        console.error('Database connection failed during registration');
        throw new Error('Database connection failed');
      }
      console.log('Database connected successfully for registration');

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

      console.log('User registered successfully:', data.email);

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
    } catch (registerError) {
      console.error('Register request error:', registerError.message);
      console.error('Register error stack:', registerError.stack);
      console.error('Full register error object:', JSON.stringify(registerError, Object.getOwnPropertyNames(registerError)));

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Registration failed',
          error: registerError.message,
          stack: registerError.stack,
          details: 'Check Netlify function logs for more information'
        })
      };
    }
  } catch (error) {
    console.error('Register function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in register function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
