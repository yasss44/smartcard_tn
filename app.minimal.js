/**
 * Smart Card Tunisia - Minimal Application Startup File
 * 
 * This is the most basic version with minimal dependencies
 */

// Import required modules
const express = require('express');

// Create Express application
const app = express();

// Configure middleware
app.use(express.json());

// Define basic routes
app.get('/', function(req, res) {
  res.send('Smart Card Tunisia API is running (Minimal Mode)');
});

app.get('/api/test', function(req, res) {
  res.json({ message: 'API test route is working' });
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// Export the app
module.exports = app;
