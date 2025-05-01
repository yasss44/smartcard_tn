// Netlify serverless function for login
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Login request from origin:', origin);
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);
  console.log('Request headers:', JSON.stringify(event.headers));

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

    // Forward the request to the actual API
    console.log('Forwarding login request to smart-card.tn');
    try {
      const response = await axios({
        method: 'post',
        url: 'https://smart-card.tn/api/auth/login',
        data,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });

      console.log('Login successful');

      // Return the response
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(response.data)
      };
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API response status:', apiError.response?.status);
      console.error('API response data:', JSON.stringify(apiError.response?.data));

      return {
        statusCode: apiError.response?.status || 500,
        headers,
        body: JSON.stringify({
          message: apiError.response?.data?.message || 'Login failed',
          error: apiError.message,
          details: apiError.response?.data
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
