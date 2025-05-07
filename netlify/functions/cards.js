// Netlify serverless function for cards endpoints
const jwt = require('jsonwebtoken');
const { testConnection } = require('./db-simple');

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
    // Handle cards requests directly with database
    console.log('Handling cards request directly with database');

    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('Cards request data:', data);
      } catch (error) {
        console.error('Error parsing cards request body:', error);
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

    // Handle cards requests directly with database
    try {
      // Verify the token
      if (!authHeader) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            message: 'No authorization token provided'
          })
        };
      }

      // Extract token from authorization header
      const token = authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : authHeader;

      // Verify token
      let userId;
      try {
        const decoded = jwt.verify(token, 'nfc_business_card_secret_key');
        userId = decoded.id;
      } catch (error) {
        console.error('Token verification failed:', error.message);
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            message: 'Invalid token'
          })
        };
      }

      // Test database connection
      const isConnected = await testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed');
      }

      // Get the database pool
      const { pool } = require('./db-simple');

      // Handle GET /cards - Get all cards for a user
      if (method === 'GET' && segments.length === 0) {
        console.log('Getting all cards for user:', userId);

        try {
          const [cards] = await pool.execute(
            'SELECT * FROM cards WHERE user_id = ?',
            [userId]
          );

          // Process the cards to parse JSON fields
          const processedCards = cards.map(card => ({
            ...card,
            links: card.social_links ? JSON.parse(card.social_links) : [],
            colors: { primary: '#3B82F6', background: '#0F172A' }
          }));

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(processedCards)
          };
        } catch (error) {
          console.error('Error getting cards:', error.message);

          // If the error is about the table not existing, return an empty array
          if (error.message.includes("doesn't exist")) {
            console.log('Cards table does not exist, returning empty array');
            return {
              statusCode: 200,
              headers,
              body: JSON.stringify([])
            };
          }

          throw error;
        }
      }

      // Handle GET /cards/:id - Get a card by ID
      if (method === 'GET' && segments.length === 1) {
        const cardId = segments[0];
        console.log(`Getting card with ID: ${cardId}`);

        try {
          const [cards] = await pool.execute(
            'SELECT * FROM cards WHERE id = ? AND user_id = ?',
            [cardId, userId]
          );

          if (cards.length === 0) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                message: 'Card not found'
              })
            };
          }

          // Process the card to parse JSON fields
          const card = {
            ...cards[0],
            links: cards[0].social_links ? JSON.parse(cards[0].social_links) : [],
            colors: { primary: '#3B82F6', background: '#0F172A' }
          };

          return {
            statusCode: 200,
            headers,
            body: JSON.stringify(card)
          };
        } catch (error) {
          console.error('Error getting card by ID:', error.message);

          // If the error is about the table not existing, return a 404
          if (error.message.includes("doesn't exist")) {
            console.log('Cards table does not exist, returning 404');
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                message: 'Card not found'
              })
            };
          }

          throw error;
        }
      }

      // For other endpoints, return a not implemented response
      return {
        statusCode: 501,
        headers,
        body: JSON.stringify({
          message: 'Endpoint not implemented',
          path: path,
          method: method
        })
      };
    } catch (dbError) {
      console.error('Database error:', dbError.message);
      console.error('Database error stack:', dbError.stack);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Cards request failed',
          error: dbError.message,
          stack: dbError.stack
        })
      };
    }
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
