// Dedicated function for /api/orders endpoint
const jwt = require('jsonwebtoken');
const { testConnection } = require('./db-simple');

exports.handler = async (event, context) => {
  console.log('api-orders function called');
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

    // Handle GET request - Get all orders for a user
    if (event.httpMethod === 'GET') {
      console.log('Getting all orders for user:', userId);

      try {
        const [orders] = await pool.execute(
          'SELECT * FROM orders WHERE user_id = ?',
          [userId]
        );

        console.log(`Found ${orders.length} orders for user ${userId}`);

        // Process the orders
        const processedOrders = orders.map(order => ({
          ...order,
          total_price: parseFloat(order.total_price),
          shipping_price: parseFloat(order.shipping_price || 0)
        }));

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify(processedOrders)
        };
      } catch (error) {
        console.error('Error getting orders:', error.message);

        // If the error is about the table not existing, return an empty array
        if (error.message.includes("doesn't exist")) {
          console.log('Orders table does not exist, returning empty array');
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify([])
          };
        }

        throw error;
      }
    }

    // Handle POST request - Create a new order
    if (event.httpMethod === 'POST') {
      console.log('Creating a new order for user:', userId);

      // Get the request body
      let data = null;
      if (event.body) {
        try {
          data = JSON.parse(event.body);
          console.log('Order data received:', JSON.stringify(data));
        } catch (error) {
          console.error('Error parsing request body:', error);
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({
              message: 'Invalid request body',
              error: error.message
            })
          };
        }
      } else {
        console.error('No request body provided');
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            message: 'No request body provided'
          })
        };
      }

      try {
        // Check if the orders table exists
        try {
          await pool.execute('DESCRIBE orders');
          console.log('Orders table exists');
        } catch (error) {
          if (error.message.includes("doesn't exist")) {
            console.log('Orders table does not exist, creating it');
            await pool.execute(`
              CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                plan_id INT NOT NULL,
                quantity INT DEFAULT 1,
                total_price DECIMAL(10, 2) NOT NULL,
                shipping_price DECIMAL(10, 2) DEFAULT 0,
                status VARCHAR(50) DEFAULT 'pending',
                shipping_address TEXT,
                phone VARCHAR(50),
                card_name VARCHAR(255),
                logo_file VARCHAR(255),
                design_file VARCHAR(255),
                card_created BOOLEAN DEFAULT FALSE,
                card_id INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
              )
            `);
            console.log('Orders table created successfully');
          } else {
            throw error;
          }
        }

        // Insert the order into the database
        const [result] = await pool.execute(
          `INSERT INTO orders (
            user_id, plan_id, quantity, total_price, shipping_price,
            status, shipping_address, phone, card_name, logo_file,
            design_file, card_created
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            data.plan_id,
            data.quantity || 1,
            data.total_price,
            data.shipping_price || 0,
            'pending',
            data.shipping_address || '',
            data.phone || '',
            data.card_name || '',
            data.logo_file || '',
            data.design_file || '',
            false
          ]
        );

        // Get the new order ID
        const orderId = result.insertId;
        console.log('Order created with ID:', orderId);

        // Return the new order
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({
            id: orderId,
            user_id: userId,
            plan_id: data.plan_id,
            quantity: data.quantity || 1,
            total_price: data.total_price,
            shipping_price: data.shipping_price || 0,
            status: 'pending',
            shipping_address: data.shipping_address || '',
            phone: data.phone || '',
            card_name: data.card_name || '',
            logo_file: data.logo_file || '',
            design_file: data.design_file || '',
            card_created: false,
            created_at: new Date().toISOString()
          })
        };
      } catch (error) {
        console.error('Error creating order:', error.message);
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
    console.error('Orders error:', error.message);
    console.error('Error stack:', error.stack);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Failed to process orders request',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
