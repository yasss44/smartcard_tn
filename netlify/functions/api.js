// Netlify serverless function for API endpoints
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Request origin:', origin);

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': 'true'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/api', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('Request path:', path);
  console.log('Path segments:', segments);
  console.log('HTTP method:', method);

  try {
    // If this is a root request, return a simple message
    if (segments.length === 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: 'Smart Card Tunisia API is running' })
      };
    }

    // Forward the request to the actual API
    const API_URL = 'https://smart-card.tn/api';
    const url = `${API_URL}${path}`;

    console.log('Forwarding request to:', url);

    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing request body:', error);
      }
    }

    // Get authorization header if it exists
    const authHeader = event.headers.authorization || event.headers.Authorization;
    const requestHeaders = {};
    if (authHeader) {
      requestHeaders.Authorization = authHeader;
    }

    // Make the request to the actual API
    const response = await axios({
      method: method.toLowerCase(),
      url,
      data,
      headers: requestHeaders
    });

    // Return the response
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(response.data)
    };
  } catch (error) {
    console.error('Error processing request:', error);

    // Return the error response
    return {
      statusCode: error.response?.status || 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error processing request',
        error: error.message,
        details: error.response?.data
      })
    };
  }
};
