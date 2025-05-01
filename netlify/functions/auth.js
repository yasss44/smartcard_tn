// Netlify serverless function for authentication
const axios = require('axios');
const https = require('https');
const got = require('got');

exports.handler = async (event, context) => {
  // Set CORS headers
  const origin = event.headers.origin || event.headers.Origin || '*';
  console.log('Auth request from origin:', origin);
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
    console.log('Handling OPTIONS request for auth');
    return {
      statusCode: 204,
      headers
    };
  }

  // Parse the path and method
  const path = event.path.replace('/.netlify/functions/auth', '');
  const segments = path.split('/').filter(Boolean);
  const method = event.httpMethod;

  console.log('Auth request path:', path);
  console.log('Auth path segments:', segments);
  console.log('Auth HTTP method:', method);

  try {
    // Forward all auth endpoints to the real API
    console.log('Forwarding auth request to smart-card.tn');
    const API_URL = 'https://smart-card.tn/api/auth';
    const url = `${API_URL}${path}`;

    console.log('Forwarding auth request to:', url);

    // Get the request body if it exists
    let data = null;
    if (event.body) {
      try {
        data = JSON.parse(event.body);
        console.log('Auth request data:', data);
      } catch (error) {
        console.error('Error parsing auth request body:', error);
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
      // Special handling for profile endpoint
      if (segments.length > 0 && segments[0] === 'profile') {
        console.log('Using got for profile request');

        try {
          // Prepare headers
          const gotHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://smartcardbeta.netlify.app',
            'User-Agent': 'Netlify Function'
          };

          // Add authorization header if it exists
          if (authHeader) {
            gotHeaders['Authorization'] = authHeader;
          }

          console.log('Profile request URL:', `https://smart-card.tn/api/auth${path}`);
          console.log('Profile request headers:', JSON.stringify(gotHeaders));

          const response = await got(`https://smart-card.tn/api/auth${path}`, {
            method: method.toLowerCase(),
            headers: gotHeaders,
            json: data || undefined,
            https: {
              rejectUnauthorized: false // Bypass SSL certificate verification
            },
            timeout: {
              request: 30000 // 30 second timeout
            },
            responseType: 'json'
          });

          console.log('Profile request successful, response status:', response.statusCode);
          console.log('Profile response body:', JSON.stringify(response.body));

          // Return the response
          return {
            statusCode: response.statusCode,
            headers,
            body: JSON.stringify(response.body)
          };
        } catch (profileError) {
          console.error('Profile API request error:', profileError.message);
          console.error('Profile API error stack:', profileError.stack);

          // Log more details about the error
          if (profileError.response) {
            console.error('Profile API response status:', profileError.response.statusCode);
            console.error('Profile API response body:', profileError.response.body);
          }

          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              message: 'Profile request failed',
              error: profileError.message,
              stack: profileError.stack
            })
          };
        }
      } else {
        // Use axios for other endpoints
        const response = await axios({
          method: method.toLowerCase(),
          url,
          data,
          headers: requestHeaders,
          timeout: 30000, // 30 second timeout
          httpsAgent: new https.Agent({
            rejectUnauthorized: false // Bypass SSL certificate verification
          })
        });

        console.log('Auth request successful');

        // Return the response
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify(response.data)
        };
      }
    } catch (apiError) {
      console.error('API request error:', apiError.message);
      console.error('API error stack:', apiError.stack);
      console.error('Full error object:', JSON.stringify(apiError, Object.getOwnPropertyNames(apiError)));

      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          message: 'Auth request failed',
          error: apiError.message,
          stack: apiError.stack
        })
      };
    }
  } catch (error) {
    console.error('Auth function error:', error.message);
    console.error('Error stack:', error.stack);

    // Return the error response
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: 'Internal server error in auth function',
        error: error.message,
        stack: error.stack
      })
    };
  }
};
