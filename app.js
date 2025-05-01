/**
 * Smart Card Tunisia - Application Startup File
 */

// Import required modules
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express application
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize database connection
// Skip database connection if SKIP_DB_CONNECTION is set to true
console.log('SKIP_DB_CONNECTION:', process.env.SKIP_DB_CONNECTION);
if (process.env.NODE_ENV !== 'test' && process.env.SKIP_DB_CONNECTION !== 'true') {
  try {
    // Wrap in a try-catch to prevent app from crashing if DB is not available
    const db = require('./server/config/db');
    console.log('Database connection initialized');

    // Handle database connection errors
    process.on('unhandledRejection', (error) => {
      if (error.name === 'SequelizeConnectionError' ||
          error.name === 'SequelizeConnectionRefusedError' ||
          error.name === 'SequelizeHostNotFoundError' ||
          error.name === 'SequelizeAccessDeniedError') {
        console.error('Database connection issue:', error.message);
      } else {
        console.error('Unhandled Rejection:', error);
      }
    });
  } catch (error) {
    console.error('Database initialization failed:', error.message);
    console.log('Application will continue without database connection');
  }
} else {
  console.log('Skipping database connection');
}

// Import routes with error handling
let authRoutes, cardRoutes, uploadRoutes, orderRoutes, adminRoutes;

try {
  authRoutes = require('./server/routes/authRoutes');
  cardRoutes = require('./server/routes/cardRoutes');
  uploadRoutes = require('./server/routes/uploadRoutes');
  orderRoutes = require('./server/routes/orderRoutes');
  adminRoutes = require('./server/routes/adminRoutes');
  console.log('Routes loaded successfully');
} catch (error) {
  console.error('Error loading routes:', error.message);
  // Create dummy route handlers for development
  const dummyRouter = express.Router();
  dummyRouter.all('*', (req, res) => {
    res.status(503).json({ message: 'API routes unavailable in development mode' });
  });
  authRoutes = cardRoutes = uploadRoutes = orderRoutes = adminRoutes = dummyRouter;
}

// Define basic routes
app.get('/', function(req, res) {
  res.send('Smart Card Tunisia API is running');
});

app.get('/api/test', function(req, res) {
  res.json({ message: 'API test route is working' });
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'server/uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, 'client/dist')));

// Fallback route for SPA
app.get('/dashboard', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/login', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/register', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/editor', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/editor/:id', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/plans', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/admin', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.get('/card/:uniqueUrl', function(req, res) {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Error handling middleware
app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err
  });
});

// Export the app
module.exports = app;
