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

    // Handle cards endpoints with mock data
    if (segments[0] === 'cards') {
      console.log('Creating mock cards response for testing');

      // Handle GET /cards
      if (method === 'GET' && segments.length === 1) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify([
            {
              id: 1,
              title: 'My Digital Card',
              uniqueUrl: 'test-card',
              links: [
                { id: 1, title: 'Website', url: 'https://example.com', icon: 'globe' },
                { id: 2, title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' }
              ],
              theme: { primary: '#3B82F6', background: '#0F172A' }
            }
          ])
        };
      }

      // Handle other cards requests
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: 'Mock cards endpoint response',
          path: path,
          method: method
        })
      };
    }

    // For other API endpoints, return a mock response
    console.log('Creating mock API response for testing');
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Mock API endpoint response',
        path: path,
        method: method
      })
    };

    // Uncomment this section when ready to forward to the real API
    /*
    // Forward the request to the actual API
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
        timeout: 10000 // 10 second timeout
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
      console.error('API response status:', apiError.response?.status);
      console.error('API response data:', JSON.stringify(apiError.response?.data));

      return {
        statusCode: apiError.response?.status || 500,
        headers,
        body: JSON.stringify({
          message: apiError.response?.data?.message || 'API request failed',
          error: apiError.message,
          details: apiError.response?.data
        })
      };
    }
    */
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
