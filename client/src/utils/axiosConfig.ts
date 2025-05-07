import axios from 'axios';

// Determine the API URL based on the environment
const isNetlify = window.location.hostname.includes('netlify.app');
const API_URL = isNetlify ? '/api' : 'https://smart-card.tn/api';

// Create a custom axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Special handling for Netlify requests
    if (isNetlify) {
      console.log(`Intercepting request: ${config.method} ${config.url}`);

      // Handle registration requests
      if (config.url === '/auth/register' && config.method === 'post') {
        console.log('Redirecting to auth-register function');
        config.baseURL = '';
        config.url = '/.netlify/functions/auth-register';
      }
      // Handle login requests
      else if (config.url === '/auth/login' && config.method === 'post') {
        console.log('Redirecting to auth-login function');
        config.baseURL = '';
        config.url = '/.netlify/functions/auth-login';
      }
      // Handle profile requests
      else if (config.url === '/auth/profile' && config.method === 'get') {
        console.log('Redirecting to auth-profile function');
        config.baseURL = '';
        config.url = '/.netlify/functions/auth-profile';
      }
      // Handle cards requests - GET all cards
      else if (config.url === '/cards' && config.method === 'get') {
        console.log('Redirecting to api-cards function');
        config.baseURL = '';
        config.url = '/.netlify/functions/api-cards';

        // Log the full request configuration for debugging
        console.log('Cards request config:', {
          method: config.method,
          url: config.url,
          baseURL: config.baseURL,
          headers: config.headers
        });
      }
      // Handle cards requests - GET specific card
      else if (config.url?.startsWith('/cards/') && config.method === 'get') {
        console.log('Redirecting to cards function with ID');
        const cardId = config.url.split('/')[2];
        config.baseURL = '';
        config.url = `/.netlify/functions/cards/${cardId}`;
      }
      // Handle cards requests - POST new card
      else if (config.url === '/cards' && config.method === 'post') {
        console.log('Redirecting to cards function for POST');
        config.baseURL = '';
        config.url = '/.netlify/functions/cards';
      }
      // Handle cards requests - PUT update card
      else if (config.url?.startsWith('/cards/') && config.method === 'put') {
        console.log('Redirecting to cards function for PUT');
        const cardId = config.url.split('/')[2];
        config.baseURL = '';
        config.url = `/.netlify/functions/cards/${cardId}`;
      }
      // Handle cards requests - DELETE card
      else if (config.url?.startsWith('/cards/') && config.method === 'delete') {
        console.log('Redirecting to cards function for DELETE');
        const cardId = config.url.split('/')[2];
        config.baseURL = '';
        config.url = `/.netlify/functions/cards/${cardId}`;
      }
      // Handle other API requests
      else {
        console.log('Using API function for request');
        config.baseURL = '';
        config.url = `/.netlify/functions/api${config.url}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
