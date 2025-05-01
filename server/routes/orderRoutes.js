const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const uploadController = require('../controllers/uploadController');
const auth = require('../middleware/auth');
const fileUpload = require('express-fileupload');

// Create a new order (protected)
router.post('/', auth, orderController.createOrder);

// Get all orders for a user (protected)
router.get('/', auth, orderController.getUserOrders);

// Get an order by ID (protected)
router.get('/:id', auth, orderController.getOrderById);

// Update order card created status (protected)
router.put('/:id/card-created', auth, orderController.updateOrderCardCreated);

// Upload files for an order (protected)
router.post('/upload-files', auth, fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  abortOnLimit: true,
  createParentPath: true
}), uploadController.uploadOrderFiles);

module.exports = router;
