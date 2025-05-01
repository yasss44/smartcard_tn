// Netlify serverless function for orders endpoints
const axios = require('axios');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Orders request from origin:', origin);
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
    console.log('Handling OPTIONS request for orders');
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/orders', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('Orders request path:', path);
  console.log('Orders path segments:', segments);
  console.log('Orders HTTP method:', method);

  try {
    // Handle GET /orders - Get all orders for a user
    if (method === 'GET' && segments.length === 0) {
      console.log('Creating mock orders response for testing');
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([
          {
            id: 1,
            quantity: 1,
            total_price: 35,
            status: 'pending',
            plan_type: 'standard',
            card_created: false,
            created_at: new Date().toISOString(),
            shipping_address: '123 Main St, Tunis, Tunisia',
            phone: '+216 12 345 678'
          },
          {
            id: 2,
            quantity: 2,
            total_price: 90,
            status: 'delivered',
            plan_type: 'logo',
            card_created: true,
            card_id: 1,
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            shipping_address: '456 Oak St, Sfax, Tunisia',
            phone: '+216 98 765 432'
          }
        ])
      };
    }

    // Handle GET /orders/:id - Get an order by ID
    if (method === 'GET' && segments.length === 1) {
      const orderId = segments[0];
      console.log(`Creating mock order response for ID: ${orderId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: parseInt(orderId),
          quantity: 1,
          total_price: 35,
          status: 'pending',
          plan_type: 'standard',
          card_created: false,
          created_at: new Date().toISOString(),
          shipping_address: '123 Main St, Tunis, Tunisia',
          phone: '+216 12 345 678'
        })
      };
    }

    // Handle POST /orders - Create a new order
    if (method === 'POST' && segments.length === 0) {
      let data;
      try {
        data = JSON.parse(event.body);
        console.log('Create order request data:', data);
      } catch (error) {
        console.error('Error parsing create order request body:', error);
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

      console.log('Creating mock new order response');
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          id: 3,
          quantity: data.quantity || 1,
          total_price: data.total_price || 35,
          status: 'pending',
          plan_type: data.plan_type || 'standard',
          card_created: false,
          created_at: new Date().toISOString(),
          shipping_address: data.shipping_address || '123 Main St, Tunis, Tunisia',
          phone: data.phone || '+216 12 345 678'
        })
      };
    }

    // Handle PUT /orders/:id/card-created - Update order card created status
    if (method === 'PUT' && segments.length === 2 && segments[1] === 'card-created') {
      const orderId = segments[0];
      let data;
      try {
        data = JSON.parse(event.body);
        console.log(`Update order card created status for ID: ${orderId}`, data);
      } catch (error) {
        console.error('Error parsing update order request body:', error);
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

      console.log(`Creating mock update order card created response for ID: ${orderId}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          id: parseInt(orderId),
          card_created: data.card_created || true,
          card_id: data.card_id || 1,
          updated_at: new Date().toISOString(),
          message: 'Order updated successfully'
        })
      };
    }

    // Handle other orders requests
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: 'Mock orders endpoint response',
        path: path,
        method: method,
        segments: segments
      })
    };
  } catch (error) {
    console.error('Orders function error:', error.message);
    console.error('Error stack:', error.stack);
    
    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in orders function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
