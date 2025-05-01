// Netlify serverless function for cards endpoints
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Cards request from origin:', origin);
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
    console.log('Handling OPTIONS request for cards');
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/cards', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('Cards request path:', path);
  console.log('Cards path segments:', segments);
  console.log('Cards HTTP method:', method);

  try {
    // Handle GET /cards - Get all cards for a user
    if (method === 'GET' && segments.length === 0) {
      console.log('Creating mock cards response for testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            title: 'My Digital Card',
            unique_url: 'test-card',
            background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
            created_at: new Date().toISOString(),
            links: [
              { id: 1, title: 'Website', url: 'https://example.com', icon: 'globe' },
              { id: 2, title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' }
            ],
            colors: { primary: '#3B82F6', background: '#0F172A' }
          }
        ])
      };
    }

    // Handle GET /cards/:id - Get a card by ID
    if (method === 'GET' && segments.length === 1) {
      const cardId = segments[0];
      console.log(`Creating mock card response for ID: ${cardId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: parseInt(cardId),
          title: 'My Digital Card',
          unique_url: 'test-card',
          background: 'linear-gradient(to right, #0ea5e9, #2563eb)',
          created_at: new Date().toISOString(),
          links: [
            { id: 1, title: 'Website', url: 'https://example.com', icon: 'globe' },
            { id: 2, title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' }
          ],
          colors: { primary: '#3B82F6', background: '#0F172A' }
        })
      };
    }

    // Handle POST /cards - Create a new card
    if (method === 'POST' && segments.length === 0) {
      let data;
      try {
        data = JSON.parse(event.body);
        console.log('Create card request data:', data);
      } catch (error) {
        console.error('Error parsing create card request body:', error);
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

      console.log('Creating mock new card response');
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: 2,
          title: data.title || 'New Card',
          unique_url: data.unique_url || 'new-card',
          background: data.background || 'linear-gradient(to right, #0ea5e9, #2563eb)',
          created_at: new Date().toISOString(),
          links: data.links || [],
          colors: data.colors || { primary: '#3B82F6', background: '#0F172A' }
        })
      };
    }

    // Handle PUT /cards/:id - Update a card
    if (method === 'PUT' && segments.length === 1) {
      const cardId = segments[0];
      let data;
      try {
        data = JSON.parse(event.body);
        console.log(`Update card request data for ID: ${cardId}`, data);
      } catch (error) {
        console.error('Error parsing update card request body:', error);
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

      console.log(`Creating mock update card response for ID: ${cardId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: parseInt(cardId),
          title: data.title || 'Updated Card',
          unique_url: data.unique_url || 'updated-card',
          background: data.background || 'linear-gradient(to right, #0ea5e9, #2563eb)',
          updated_at: new Date().toISOString(),
          links: data.links || [],
          colors: data.colors || { primary: '#3B82F6', background: '#0F172A' }
        })
      };
    }

    // Handle DELETE /cards/:id - Delete a card
    if (method === 'DELETE' && segments.length === 1) {
      const cardId = segments[0];
      console.log(`Creating mock delete card response for ID: ${cardId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          message: `Card with ID ${cardId} deleted successfully`
        })
      };
    }

    // Handle other cards requests
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Mock cards endpoint response',
        path: path,
        method: method,
        segments: segments
      })
    };
  } catch (error) {
    console.error('Cards function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in cards function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
