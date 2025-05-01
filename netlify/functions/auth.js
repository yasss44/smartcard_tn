// Netlify serverless function for authentication
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { testConnection, findUserById } = require('./db-simple');

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
    // Handle auth endpoints directly with database
    console.log('Handling auth request directly with database');

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
        console.log('Getting user profile directly from database');

        try {
          // Check if authorization header exists
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
          let decoded;
          try {
            decoded = jwt.verify(token, 'nfc_business_card_secret_key');
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

          console.log('Database connected, finding user with ID:', decoded.id);

          // Find user by ID
          const user = await findUserById(decoded.id);

          // Check if user exists
          if (!user) {
            console.log('User not found with ID:', decoded.id);
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({
                message: 'User not found'
              })
            };
          }

          console.log('User found, returning profile data');

          // Return user profile
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
              }
            })
          };
        } catch (profileError) {
          console.error('Profile request error:', profileError.message);
          console.error('Profile error stack:', profileError.stack);

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
      } else if (segments.length > 0 && segments[0] === 'login' && method === 'POST') {
        console.log('Handling login request directly with database');

        try {
          // Validate required fields
          if (!data.email || !data.password) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                message: 'Email and password are required'
              })
            };
          }

          // Test database connection
          const isConnected = await testConnection();
          if (!isConnected) {
            throw new Error('Database connection failed');
          }

          console.log('Database connected, attempting to find user:', data.email);

          // Find the user by email
          const { pool } = require('./db-simple');
          const [users] = await pool.execute(
            'SELECT * FROM Users WHERE email = ?',
            [data.email]
          );

          // Check if user exists
          if (users.length === 0) {
            console.log('User not found:', data.email);
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({
                message: 'Invalid credentials'
              })
            };
          }

          const user = users[0];
          console.log('User found, checking password');

          // Check if password is correct
          const isMatch = await bcrypt.compare(data.password, user.password);
          if (!isMatch) {
            console.log('Password does not match');
            return {
              statusCode: 401,
              headers,
              body: JSON.stringify({
                message: 'Invalid credentials'
              })
            };
          }

          console.log('Password matches, generating token');

          // Generate JWT token
          const token = jwt.sign(
            { id: user.id },
            'nfc_business_card_secret_key', // JWT secret
            { expiresIn: '7d' }
          );

          console.log('Login successful for user:', user.email);

          // Return the response
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
              token,
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
              },
              message: 'Login successful'
            })
          };
        } catch (loginError) {
          console.error('Login request error:', loginError.message);
          console.error('Login error stack:', loginError.stack);

          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              message: 'Login failed',
              error: loginError.message,
              stack: loginError.stack
            })
          };
        }
      } else if (segments.length > 0 && segments[0] === 'register' && method === 'POST') {
        console.log('Handling register request directly with database');

        try {
          // Validate required fields
          if (!data.name || !data.email || !data.password) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                message: 'Name, email, and password are required'
              })
            };
          }

          // Test database connection
          const isConnected = await testConnection();
          if (!isConnected) {
            throw new Error('Database connection failed');
          }

          // Check if user already exists
          const { pool } = require('./db-simple');
          const [existingUsers] = await pool.execute(
            'SELECT * FROM Users WHERE email = ?',
            [data.email]
          );

          if (existingUsers.length > 0) {
            return {
              statusCode: 400,
              headers,
              body: JSON.stringify({
                message: 'User with this email already exists'
              })
            };
          }

          // Hash password
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(data.password, salt);

          // Create new user
          const [result] = await pool.execute(
            'INSERT INTO Users (name, email, password, is_admin) VALUES (?, ?, ?, ?)',
            [data.name, data.email, hashedPassword, false]
          );

          // Get the new user ID
          const userId = result.insertId;

          // Generate JWT token
          const token = jwt.sign(
            { id: userId },
            'nfc_business_card_secret_key',
            { expiresIn: '7d' }
          );

          console.log('User registered successfully:', data.email);

          // Return success response
          return {
            statusCode: 201,
            headers,
            body: JSON.stringify({
              token,
              user: {
                id: userId,
                name: data.name,
                email: data.email,
                is_admin: false
              },
              message: 'User registered successfully'
            })
          };
        } catch (registerError) {
          console.error('Register request error:', registerError.message);
          console.error('Register error stack:', registerError.stack);

          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
              message: 'Registration failed',
              error: registerError.message,
              stack: registerError.stack
            })
          };
        }
      } else {
        // For other endpoints, return a not implemented response
        console.log('Endpoint not implemented:', segments.join('/'));

        return {
          statusCode: 501,
          headers,
          body: JSON.stringify({
            message: 'Endpoint not implemented',
            path: path,
            method: method
          })
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
