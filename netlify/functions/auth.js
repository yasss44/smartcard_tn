// Netlify serverless function for authentication
const axios = require('axios');
const fetch = require('node-fetch');

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
        console.log('Using fetch for profile request');

        const fetchOptions = {
          method: method.toLowerCase(),
          headers: {
            ...requestHeaders,
            'Accept': 'application/json',
            'Origin': 'https://smartcardbeta.netlify.app'
          },
          timeout: 30000 // 30 second timeout
        };

        if (data) {
          fetchOptions.body = JSON.stringify(data);
        }

        console.log('Fetch options for profile:', { ...fetchOptions, body: fetchOptions.body ? '***' : undefined });

        const response = await fetch(url, fetchOptions);

        console.log('Profile response status:', response.status);
        console.log('Profile response headers:', JSON.stringify(Object.fromEntries([...response.headers])));

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Profile request successful, response data:', JSON.stringify(responseData));

        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify(responseData)
        };
      } else {
        // Use axios for other endpoints
        const response = await axios({
          method: method.toLowerCase(),
          url,
          data,
          headers: requestHeaders,
          timeout: 30000 // 30 second timeout
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
