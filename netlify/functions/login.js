// Netlify serverless function for login
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, testConnection } = require('./db');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Login request from origin:', origin);
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request for login');
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log(`Invalid method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    console.log('Processing login request');

    // Parse request body
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Login request data:', { email: data.email, password: '***' });
    } catch (error) {
      console.error('Error parsing login request body:', error);
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

    // Connect to the database and authenticate the user
    console.log('Authenticating user directly with database');

    try {
      // Test database connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      console.log('Database connected, attempting to find user:', data.email);

      // Find the user by email
      const user = await User.findOne({ where: { email: data.email } });

      // Check if user exists
      if (!user) {
        console.log('User not found:', data.email);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            message: 'Invalid credentials'
          })
        };
      }

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
        'nfc_business_card_secret_key', // JWT secret
        { expiresIn: '7d' }
      );

      console.log('Login successful for user:', user.email);

      // Return the response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            is_admin: user.is_admin
          },
          message: 'Login successful'
        })
      };
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API error stack:', apiError.stack);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Login failed',
          error: apiError.message,
          stack: apiError.stack
        })
      };
    }
  } catch (error) {
    console.error('Login function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in login function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
