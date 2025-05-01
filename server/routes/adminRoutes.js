const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Test route that doesn't require authentication
router.get('/test', (req, res) => {
  console.log('Admin test route called from router');
  res.json({ message: 'Admin API is working from router' });
});

// Debug route that only requires authentication but not admin privileges
router.get('/auth-test', auth, (req, res) => {
  console.log('Admin auth test route called');
  console.log('User in request:', req.user);
  res.json({
    message: 'Authentication successful',
    user: {
      id: req.user.id,
      email: req.user.email,
      is_admin: req.user.is_admin
    }
  });
});

// All other routes require authentication and admin privileges
router.use(auth);
router.use(adminAuth);

// User management routes
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/ban', adminController.banUser);

// Order management routes
router.get('/orders', adminController.getAllOrders);
router.get('/orders/:id', adminController.getOrderById);
router.get('/orders/:id/files/:fileType', adminController.getOrderFiles);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Analytics routes
router.get('/analytics', adminController.getAnalytics);

module.exports = router;
