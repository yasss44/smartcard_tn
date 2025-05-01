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
