// Netlify serverless function for API endpoints
exports.handler = async (event, context) => {
  const path = event.path.replace('/.netlify/functions/api', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  // Log request details
  console.log('Request path:', path);
  console.log('Path segments:', segments);
  console.log('HTTP method:', method);

  // Handle different API endpoints
  try {
    // Root API endpoint
    if (segments.length === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Smart Card Tunisia API is running' })
      };
    }

    // Test endpoint
    if (segments[0] === 'test') {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'API test route is working' })
      };
    }

    // Auth endpoints
    if (segments[0] === 'auth') {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Auth API not implemented in Netlify version' })
      };
    }

    // Cards endpoints
    if (segments[0] === 'cards') {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Cards API not implemented in Netlify version' })
      };
    }

    // Upload endpoints
    if (segments[0] === 'upload') {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Upload API not implemented in Netlify version' })
      };
    }

    // Orders endpoints
    if (segments[0] === 'orders') {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Orders API not implemented in Netlify version' })
      };
    }

    // Admin endpoints
    if (segments[0] === 'admin') {
      return {
        statusCode: 503,
        body: JSON.stringify({ message: 'Admin API not implemented in Netlify version' })
      };
    }

    // Fallback for unknown endpoints
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'API endpoint not found' })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal server error', error: error.message })
    };
  }
};
