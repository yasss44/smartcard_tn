const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to authenticate JWT token
const auth = async (req, res, next) => {
  try {
    console.log('Auth middleware called');

    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      console.log('No token found in request');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    // Find user by ID
    const user = await User.findById(decoded.id);
    console.log('User found:', user);

    if (!user) {
      console.log('No user found with ID:', decoded.id);
      return res.status(401).json({ message: 'Token is invalid' });
    }

    // Add user to request object
    req.user = user;
    req.userId = user.id;

    console.log('User authenticated:', user.email);
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Token is invalid' });
  }
};

module.exports = auth;
