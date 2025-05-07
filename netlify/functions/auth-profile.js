// Dedicated function for /api/auth/profile endpoint
const jwt = require('jsonwebtoken');
const { findUserById } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('auth-profile function called');
  console.log('Event path:', event.path);
  console.log('Event method:', event.httpMethod);
  console.log('Event headers:', JSON.stringify(event.headers));

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

  // Only allow GET method
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        message: 'Method not allowed'
      })
    };
  }

  try {
    // Get authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      console.log('No authorization header provided');
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'No authorization token provided'
        })
      };
    }

    // Extract token from authorization header
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    console.log('Token received, verifying...');

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, 'nfc_business_card_secret_key');
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          message: 'Invalid token'
        })
      };
    }

    console.log('Token verified, finding user with ID:', decoded.id);

    // Find user by ID
    const user = await findUserById(decoded.id);

    // Check if user exists
    if (!user) {
      console.log('User not found with ID:', decoded.id);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: 'User not found'
        })
      };
    }

    console.log('User found, returning profile data');

    // Return user profile
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: {
          id: user.id,
          name: user.full_name,
          email: user.email,
          is_admin: user.is_admin || false
        }
      })
    };
  } catch (error) {
    console.error('Profile error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to get profile',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
