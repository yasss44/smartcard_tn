/**
 * Smart Card Tunisia - Simplified Application Startup File
 *
 * This is a minimal version that doesn't depend on server modules
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const path = require('path');

// Create Express application
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Define basic routes
app.get('/', function(req, res) {
  res.send('Smart Card Tunisia API is running (Simple Mode)');
});

app.get('/api/test', function(req, res) {
  res.json({ message: 'API test route is working' });
});

// API mock routes - define specific routes instead of using wildcards
app.all('/api/auth', mockApiResponse);
app.all('/api/auth/login', mockApiResponse);
app.all('/api/auth/register', mockApiResponse);
app.all('/api/auth/profile', mockApiResponse);
app.all('/api/cards', mockApiResponse);
app.all('/api/upload', mockApiResponse);
app.all('/api/orders', mockApiResponse);
app.all('/api/admin', mockApiResponse);

// Mock API response function
function mockApiResponse(req, res) {
  res.status(503).json({
    message: 'API routes unavailable in simple mode',
    mode: 'simple',
    path: req.path,
    method: req.method
  });
}

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

// Handle SPA routes individually to avoid path-to-regexp issues
app.get('/dashboard', function(req, res) {
  renderSimplePage(req, res);
});

app.get('/login', function(req, res) {
  renderSimplePage(req, res);
});

app.get('/register', function(req, res) {
  renderSimplePage(req, res);
});

app.get('/editor', function(req, res) {
  renderSimplePage(req, res);
});

app.get('/plans', function(req, res) {
  renderSimplePage(req, res);
});

app.get('/admin', function(req, res) {
  renderSimplePage(req, res);
});

// Helper function to render a simple page
function renderSimplePage(req, res) {
  res.send(`<html>
    <head><title>Smart Card Tunisia</title></head>
    <body>
      <h1>Smart Card Tunisia</h1>
      <p>This is a simplified version of the application.</p>
      <p>Route: ${req.path}</p>
      <p>In production, this would serve the React app.</p>
    </body>
  </html>`);
}

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
