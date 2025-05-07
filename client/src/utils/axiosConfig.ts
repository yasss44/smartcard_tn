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

    // Special handling for registration requests on Netlify
    if (isNetlify && config.url === '/auth/register' && config.method === 'post') {
      console.log('Intercepting registration request');
      // Modify the URL to use the direct function
      config.baseURL = '';
      config.url = '/.netlify/functions/auth-register';
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
