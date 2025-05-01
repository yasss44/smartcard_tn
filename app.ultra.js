/**
 * Smart Card Tunisia - Ultra Minimal Application
 * 
 * This version uses only the most basic Express functionality
 * with no routers, no middleware, and no complex patterns
 */

// Import only Express
const express = require('express');
const path = require('path');

// Create Express application
const app = express();

// Basic JSON middleware
app.use(express.json());

// Root route
app.get('/', function(req, res) {
  res.send('Smart Card Tunisia API is running (Ultra Minimal Mode)');
});

// Test API route
app.get('/api/test', function(req, res) {
  res.json({ message: 'API test route is working' });
});

// Basic API routes that don't use Router
app.all('/api/auth', function(req, res) {
  res.status(503).json({ message: 'Auth API unavailable in ultra minimal mode' });
});

app.all('/api/cards', function(req, res) {
  res.status(503).json({ message: 'Cards API unavailable in ultra minimal mode' });
});

app.all('/api/upload', function(req, res) {
  res.status(503).json({ message: 'Upload API unavailable in ultra minimal mode' });
});

app.all('/api/orders', function(req, res) {
  res.status(503).json({ message: 'Orders API unavailable in ultra minimal mode' });
});

app.all('/api/admin', function(req, res) {
  res.status(503).json({ message: 'Admin API unavailable in ultra minimal mode' });
});

// Serve static files if they exist
try {
  // Static files
  app.use('/uploads', express.static(path.join(__dirname, 'server/uploads')));
  
  // Serve static files from the React app in production
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  console.log('Static file serving configured');
} catch (error) {
  console.error('Error setting up static file serving:', error.message);
}

// Simple fallback for all other routes
app.use(function(req, res) {
  // Simple HTML response for all other routes
  res.send(`
    <html>
      <head><title>Smart Card Tunisia</title></head>
      <body>
        <h1>Smart Card Tunisia</h1>
        <p>Welcome to Smart Card Tunisia (Ultra Minimal Mode)</p>
        <p>Path: ${req.path}</p>
      </body>
    </html>
  `);
});

// Export the app
module.exports = app;
