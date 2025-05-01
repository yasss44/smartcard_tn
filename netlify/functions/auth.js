// Netlify serverless function for authentication
const axios = require('axios');

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
    // Handle profile requests with mock data for testing
    if (segments.length > 0 && segments[0] === 'profile') {
      console.log('Creating mock profile response for testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          user: {
            id: 1,
            name: 'Test User',
            email: 'test@example.com',
            is_admin: false
          },
          message: 'Mock profile successful'
        })
      };
    }

    // Handle register requests with mock data for testing
    if (segments.length > 0 && segments[0] === 'register') {
      // Parse request body
      let data;
      try {
        data = JSON.parse(event.body);
        console.log('Register request data:', { name: data.name, email: data.email, password: '***' });
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

      console.log('Creating mock register response for testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token: 'mock-token-for-testing',
          user: {
            id: 1,
            name: data.name,
            email: data.email,
            is_admin: false
          },
          message: 'Mock registration successful'
        })
      };
    }

    // For other auth endpoints, return a mock response
    console.log('Creating mock auth response for testing');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Mock auth endpoint response',
        path: path,
        method: method
      })
    };

    // Uncomment this section when ready to forward to the real API
    /*
    // Forward the request to the actual API
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
      const response = await axios({
        method: method.toLowerCase(),
        url,
        data,
        headers: requestHeaders,
        timeout: 10000 // 10 second timeout
      });

      console.log('Auth request successful');

      // Return the response
      return {
        statusCode: response.status,
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
          message: apiError.response?.data?.message || 'Auth request failed',
          error: apiError.message,
          details: apiError.response?.data
        })
      };
    }
    */
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
