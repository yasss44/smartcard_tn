// Simple test function for registration
exports.handler = async (event, context) => {
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

  console.log('Test register function called');
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);
  console.log('Request headers:', JSON.stringify(event.headers));
  
  // Parse request body if present
  let data = null;
  if (event.body) {
    try {
      data = JSON.parse(event.body);
      console.log('Request data:', JSON.stringify(data));
    } catch (error) {
      console.error('Error parsing request body:', error);
    }
  }

  // Return a success response
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Test register function working',
      received: {
        path: event.path,
        method: event.httpMethod,
        data: data
      }
    })
  };
};
