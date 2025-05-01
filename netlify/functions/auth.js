// Netlify serverless function for authentication
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
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
    // Forward the request to the actual API
    const API_URL = 'https://smart-card.tn/api/auth';
    const url = `${API_URL}${path}`;
    
    console.log('Forwarding auth request to:', url);
    
    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
      } catch (error) {
        console.error('Error parsing auth request body:', error);
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
    console.error('Error processing auth request:', error);
    
    // Return the error response
    return {
      statusCode: error.response?.status || 500,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Error processing auth request',
        error: error.message,
        details: error.response?.data
      })
    };
  }
};
