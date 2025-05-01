const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const cardRoutes = require('./routes/cardRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the React app in production
app.use(express.static(path.join(__dirname, '../client/dist')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('NFC Business Card API is running');
});

// Test route for admin
app.get('/api/admin/test', (req, res) => {
  console.log('Admin test route called');
  res.json({ message: 'Admin API is working' });
});

// Test route for updating order status
app.put('/api/admin/test-update-order/:id', async (req, res) => {
  try {
    console.log('Test update order route called');
    console.log('Order ID:', req.params.id);
    console.log('Status:', req.body.status);

    const { Order } = require('./config/dbInit');
    const orderId = parseInt(req.params.id, 10);

    if (isNaN(orderId)) {
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Test update order error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Catch-all route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
