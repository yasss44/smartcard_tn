const User = require('../models/User');
const Order = require('../models/Order');
const Card = require('../models/Card');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Admin getAllUsers called');

    // Use the Sequelize model directly
    const { User: UserModel } = require('../config/dbInit');

    const users = await UserModel.findAll({
      attributes: { exclude: ['password'] },  // Exclude password from results
      order: [['createdAt', 'DESC']]
    });

    console.log('Users found:', users.length);

    // Transform to plain objects
    const usersData = users.map(user => user.toJSON());

    res.json(usersData);
  } catch (error) {
    console.error('Get all users error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Ban a user
exports.banUser = async (req, res) => {
  try {
    const { id } = req.params;

    // In a real app, you would set a 'banned' flag on the user
    // For this example, we'll just delete the user
    await User.delete(id);

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders with user and card details
exports.getAllOrders = async (req, res) => {
  try {
    console.log('Admin getAllOrders called');

    // Use the Sequelize model directly
    const { Order: OrderModel, User: UserModel, Card: CardModel } = require('../config/dbInit');

    const orders = await OrderModel.findAll({
      include: [
        {
          model: UserModel,
          attributes: ['id', 'name', 'email']
        },
        {
          model: CardModel,
          attributes: ['id', 'title', 'unique_url']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('Orders found:', orders.length);

    // Transform the data
    const enhancedOrders = orders.map(order => {
      const orderData = order.toJSON();

      // Create a clean object without nested User and Card
      const cleanOrder = {
        ...orderData,
        user_name: orderData.User ? orderData.User.name : 'Unknown',
        card_title: orderData.Card ? orderData.Card.title : 'Unknown'
      };

      // Remove nested objects
      delete cleanOrder.User;
      delete cleanOrder.Card;

      return cleanOrder;
    });

    console.log('Enhanced orders:', enhancedOrders.length);
    res.json(enhancedOrders);
  } catch (error) {
    console.error('Get all orders error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get order files
exports.getOrderFiles = async (req, res) => {
  try {
    const { id, fileType } = req.params;
    console.log(`Admin getOrderFiles called for order ${id}, file type: ${fileType}`);

    if (!['logo', 'design'].includes(fileType)) {
      return res.status(400).json({ message: 'Invalid file type. Must be "logo" or "design".' });
    }

    // Convert id to number if it's a string
    const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(orderId)) {
      console.error('Invalid order ID:', id);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Use the Sequelize model directly
    const { Order: OrderModel } = require('../config/dbInit');

    // Find the order
    const order = await OrderModel.findByPk(orderId);

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the file exists
    const fileExists = fileType === 'logo' ? order.has_logo_file : order.has_design_file;

    if (!fileExists) {
      console.log(`Order ${orderId} does not have a ${fileType} file`);
      return res.status(404).json({ message: `Order does not have a ${fileType} file` });
    }

    // Get the file path
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '../uploads/orders', orderId.toString());

    // Find the file in the directory
    let filePath;
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir);
      const filePattern = new RegExp(`^${fileType}\\.(jpg|jpeg|png|gif|pdf)$`, 'i');
      const matchingFile = files.find(file => filePattern.test(file));

      if (matchingFile) {
        filePath = path.join(uploadsDir, matchingFile);
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      console.log(`File not found for order ${orderId}, file type: ${fileType}`);
      return res.status(404).json({ message: 'File not found' });
    }

    // Determine content type
    const ext = path.extname(filePath).toLowerCase();
    let contentType;

    switch (ext) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
      default:
        contentType = 'application/octet-stream';
    }

    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${fileType}${ext}`);

    // Send the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

  } catch (error) {
    console.error('Get order files error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get a single order by ID with user and card details
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Admin getOrderById called with id:', id);

    // Convert id to number if it's a string
    const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(orderId)) {
      console.error('Invalid order ID:', id);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Use the Sequelize model directly
    const { Order: OrderModel, User: UserModel, Card: CardModel } = require('../config/dbInit');

    const order = await OrderModel.findByPk(orderId, {
      include: [
        {
          model: UserModel,
          attributes: ['id', 'name', 'email']
        },
        {
          model: CardModel,
          attributes: ['id', 'title', 'unique_url']
        }
      ]
    });

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found:', order.id);

    // Transform the data
    const orderData = order.toJSON();

    // Create a clean object with user and card details
    const enhancedOrder = {
      ...orderData,
      user_name: orderData.User ? orderData.User.name : 'Unknown',
      card_title: orderData.Card ? orderData.Card.title : 'Unknown'
    };

    // Remove nested objects
    delete enhancedOrder.User;
    delete enhancedOrder.Card;

    res.json(enhancedOrder);
  } catch (error) {
    console.error('Get order by ID error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    console.log('Update order status called with id:', id, 'status:', status);

    // Validate status
    const validStatuses = ['pending', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    // Use the Sequelize model directly
    const { Order: OrderModel } = require('../config/dbInit');

    // Convert id to number
    const orderId = parseInt(id, 10);

    if (isNaN(orderId)) {
      console.error('Invalid order ID:', id);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Find the order
    const order = await OrderModel.findByPk(orderId);

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update the status
    order.status = status;
    await order.save();

    console.log('Order status updated successfully');

    res.json(order.toJSON());
  } catch (error) {
    console.error('Update order status error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get analytics data
exports.getAnalytics = async (req, res) => {
  try {
    const users = await User.findAll();
    const orders = await Order.findAll();

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_price), 0);

    // Calculate plan breakdown
    const planBreakdown = {
      standard: orders.filter(order => order.plan_type === 'standard').length,
      logo: orders.filter(order => order.plan_type === 'logo').length,
      full: orders.filter(order => order.plan_type === 'full').length
    };

    res.json({
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue,
      planBreakdown
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
