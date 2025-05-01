// Netlify serverless function for login
const https = require('https');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Login request from origin:', origin);
  console.log('Request path:', event.path);
  console.log('Request method:', event.httpMethod);

  const headers = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request for login');
    return {
      statusCode: 204,
      headers
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log(`Invalid method: ${event.httpMethod}`);
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ message: 'Method not allowed' })
    };
  }

  try {
    console.log('Processing login request');

    // Parse request body
    let data;
    try {
      data = JSON.parse(event.body);
      console.log('Login request data:', { email: data.email, password: '***' });
    } catch (error) {
      console.error('Error parsing login request body:', error);
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

    // Forward the request to the actual API using native https module
    console.log('Forwarding login request to smart-card.tn');

    // Create a promise-based https request
    const makeRequest = () => {
      return new Promise((resolve, reject) => {
        const requestOptions = {
          hostname: 'smart-card.tn',
          port: 443,
          path: '/api/auth/login',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://smartcardbeta.netlify.app',
            'User-Agent': 'Netlify Function'
          }
        };

        console.log('Request options:', JSON.stringify(requestOptions));

        const req = https.request(requestOptions, (res) => {
          console.log('Response status code:', res.statusCode);
          console.log('Response headers:', JSON.stringify(res.headers));

          let responseBody = '';

          res.on('data', (chunk) => {
            responseBody += chunk;
          });

          res.on('end', () => {
            console.log('Response body length:', responseBody.length);
            try {
              const parsedBody = JSON.parse(responseBody);
              resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: parsedBody
              });
            } catch (error) {
              console.error('Error parsing response body:', error);
              console.error('Raw response body:', responseBody);
              reject(new Error('Invalid JSON response from API'));
            }
          });
        });

        req.on('error', (error) => {
          console.error('Request error:', error);
          reject(error);
        });

        // Set a timeout
        req.setTimeout(30000, () => {
          req.abort();
          reject(new Error('Request timed out'));
        });

        // Write the request body
        const requestBody = JSON.stringify(data);
        req.write(requestBody);
        req.end();
      });
    };

    try {
      const response = await makeRequest();
      console.log('Login successful, response status:', response.statusCode);

      // Return the response
      return {
        statusCode: response.statusCode,
        headers,
        body: JSON.stringify(response.body)
      };
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API error stack:', apiError.stack);

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Login failed',
          error: apiError.message,
          stack: apiError.stack
        })
      };
    }
  } catch (error) {
    console.error('Login function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in login function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
