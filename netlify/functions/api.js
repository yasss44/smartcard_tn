// Netlify serverless function for API endpoints
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('API request from origin:', origin);
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
    console.log('Handling OPTIONS request for API');
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/api', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('API request path:', path);
  console.log('API path segments:', segments);
  console.log('API HTTP method:', method);

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
    console.log('Forwarding API request to smart-card.tn');
    const API_URL = 'https://smart-card.tn/api';
    const url = `${API_URL}${path}`;

    console.log('Forwarding request to:', url);

    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('API request data:', data);
      } catch (error) {
        console.error('Error parsing request body:', error);
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
      const response = await axios({
        method: method.toLowerCase(),
        url,
        data,
        headers: requestHeaders,
        timeout: 30000 // 30 second timeout
      });

      console.log('API request successful');

      // Return the response
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify(response.data)
      };
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API error code:', apiError.code);
      console.error('API error stack:', apiError.stack);

      if (apiError.response) {
        console.error('API response status:', apiError.response.status);
        console.error('API response headers:', JSON.stringify(apiError.response.headers));
        console.error('API response data:', JSON.stringify(apiError.response.data));
      } else if (apiError.request) {
        console.error('No response received, request details:', apiError.request._currentUrl);
      }

      return {
        statusCode: apiError.response?.status || 500,
        headers,
        body: JSON.stringify({
          message: apiError.response?.data?.message || 'API request failed',
          error: apiError.message,
          code: apiError.code,
          details: apiError.response?.data || 'No response data'
        })
      };
    }
  } catch (error) {
    console.error('API function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in API function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
