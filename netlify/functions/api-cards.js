// Dedicated function for /api/cards endpoint
const jwt = require('jsonwebtoken');
const { testConnection } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('api-cards function called');
  console.log('Event path:', event.path);
  console.log('Event method:', event.httpMethod);
  console.log('Event headers:', JSON.stringify(event.headers));
  console.log('Event body present:', !!event.body);

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

  try {
    // Get authorization header
    const authHeader = event.headers.authorization || event.headers.Authorization;
    if (!authHeader) {
      console.log('No authorization header provided');
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

    console.log('Token received, verifying...');

    // Verify token
    let userId;
    try {
      const decoded = jwt.verify(token, 'nfc_business_card_secret_key');
      userId = decoded.id;
      console.log('Token verified, user ID:', userId);
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
      console.error('Database connection failed');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Database connection failed'
        })
      };
    }
    console.log('Database connected successfully');

    // Get the database pool
    const { pool } = require('./db-simple');

    // Handle GET request - Get all cards for a user
    if (event.httpMethod === 'GET') {
      console.log('Getting all cards for user:', userId);

      try {
        const [cards] = await pool.execute(
          'SELECT * FROM cards WHERE user_id = ?',
          [userId]
        );

        console.log(`Found ${cards.length} cards for user ${userId}`);

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

    // For other methods, return a not implemented response
    return {
      statusCode: 501,
      headers,
      body: JSON.stringify({
        message: 'Method not implemented',
        method: event.httpMethod
      })
    };
  } catch (error) {
    console.error('Cards error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to get cards',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
