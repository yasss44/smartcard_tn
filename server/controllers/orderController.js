const Order = require('../models/Order');
const Card = require('../models/Card');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const {
      card_id,
      quantity,
      shipping_address,
      phone_number,
      total_price,
      plan_type,
      custom_url_name
    } = req.body;

    const userId = req.userId;

    // Check if required fields are provided
    if (!shipping_address || !phone_number || !total_price) {
      return res.status(400).json({
        message: 'Please provide shipping_address, phone_number, and total_price'
      });
    }

    // Validate custom_url_name if provided
    if (custom_url_name) {
      // Check if it contains only alphanumeric characters, hyphens, and underscores
      const validUrlPattern = /^[a-zA-Z0-9-_]+$/;
      if (!validUrlPattern.test(custom_url_name)) {
        return res.status(400).json({
          message: 'Custom URL name can only contain letters, numbers, hyphens, and underscores'
        });
      }
    }

    // If card_id is provided, check if it exists and belongs to user
    let cardId = null;
    if (card_id) {
      const card = await Card.findById(card_id);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      if (card.user_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to order this card' });
      }

      cardId = card_id;
    }

    // Create new order
    const newOrder = await Order.create({
      user_id: userId,
      card_id: cardId,
      quantity: quantity || 1,
      shipping_address,
      phone_number,
      total_price,
      payment_method: 'cash_on_delivery',
      plan_type: plan_type || 'standard',
      card_created: !!cardId, // Set to true if card_id is provided
      custom_url_name: custom_url_name || null,
      shipping_cost: req.body.shipping_cost || (plan_type === 'custom' ? 0 : 7)
    });

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders for a user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all orders for the user
    const orders = await Order.findByUserId(userId);

    res.json(orders);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get an order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get order by ID
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.user_id !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to access this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Get order by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order card created status
exports.updateOrderCardCreated = async (req, res) => {
  try {
    const { id } = req.params;
    const { card_created, card_id } = req.body;

    console.log('updateOrderCardCreated called with id:', id);
    console.log('Request body:', req.body);
    console.log('User ID:', req.userId);

    // Use the Sequelize model directly to avoid any issues
    const { Order: OrderModel } = require('../config/dbInit');

    // Convert id to number if it's a string
    const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

    if (isNaN(orderId)) {
      console.error('Invalid order ID:', id);
      return res.status(400).json({ message: 'Invalid order ID' });
    }

    // Get order by ID
    const order = await OrderModel.findByPk(orderId);

    if (!order) {
      console.log('Order not found with ID:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    console.log('Order found:', {
      id: order.id,
      UserId: order.UserId,
      status: order.status,
      card_created: order.card_created
    });

    // Check if user owns the order
    if (order.UserId !== req.userId) {
      console.log('User does not own this order. Order UserId:', order.UserId, 'Request userId:', req.userId);
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // Check if order is delivered (only delivered orders can have cards created)
    if (order.status !== 'delivered') {
      console.log('Order is not delivered. Current status:', order.status);
      return res.status(400).json({ message: 'Cannot create card for an order that is not delivered' });
    }

    // Update order card_created status
    order.card_created = card_created;

    // If card_id is provided, update the order with the card_id
    if (card_id) {
      console.log('Updating order CardId to:', card_id);
      order.CardId = card_id;
    }

    // Save the changes
    await order.save();
    console.log('Order updated successfully');

    res.json(order.toJSON());
  } catch (error) {
    console.error('Update order card created error:', error);
    console.error('Error details:', error.stack);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};
