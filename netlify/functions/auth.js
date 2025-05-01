// Netlify serverless function for authentication
const axios = require('axios');
const https = require('https');
const jwt = require('jsonwebtoken');
const { User, testConnection } = require('./db');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Auth request from origin:', origin);
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
    console.log('Handling OPTIONS request for auth');
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/auth', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('Auth request path:', path);
  console.log('Auth path segments:', segments);
  console.log('Auth HTTP method:', method);

  try {
    // Forward all auth endpoints to the real API
    console.log('Forwarding auth request to smart-card.tn');
    const API_URL = 'https://smart-card.tn/api/auth';
    const url = `${API_URL}${path}`;

    console.log('Forwarding auth request to:', url);

    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('Auth request data:', data);
      } catch (error) {
        console.error('Error parsing auth request body:', error);
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
    }

    // Get authorization header if it exists
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const requestHeaders = {
      'Content-Type': 'application/json'
    };
    if (authHeader) {
      requestHeaders.Authorization = authHeader;
    }

    // Make the request to the actual API
    try {
      // Special handling for profile endpoint
      if (segments.length > 0 && segments[0] === 'profile') {
        console.log('Getting user profile directly from database');

        try {
          // Check if authorization header exists
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

          // Test database connection
          const isConnected = await testConnection();
          if (!isConnected) {
            throw new Error('Database connection failed');
          }

          console.log('Database connected, finding user with ID:', decoded.id);

          // Find user by ID
          const user = await User.findByPk(decoded.id);

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
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
              }
            })
          };
        } catch (profileError) {
          console.error('Profile request error:', profileError.message);
          console.error('Profile error stack:', profileError.stack);

          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              message: 'Profile request failed',
              error: profileError.message,
              stack: profileError.stack
            })
          };
        }
      } else {
        // Use axios for other endpoints
        const response = await axios({
          method: method.toLowerCase(),
          url,
          data,
          headers: requestHeaders,
          timeout: 30000, // 30 second timeout
          httpsAgent: new https.Agent({
            rejectUnauthorized: false // Bypass SSL certificate verification
          })
        });

        console.log('Auth request successful');

        // Return the response
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify(response.data)
        };
      }
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API error stack:', apiError.stack);
      console.error('Full error object:', JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)));

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Auth request failed',
          error: apiError.message,
          stack: apiError.stack
        })
      };
    }
  } catch (error) {
    console.error('Auth function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in auth function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
