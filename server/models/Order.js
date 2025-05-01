const { Order, Card } = require('../config/dbInit');

// Order model methods
const OrderModel = {
  // Get all orders
  async findAll() {
    try {
      console.log('Order model findAll called');

      const orders = await Order.findAll({
        include: [{
          model: Card,
          attributes: ['title', 'unique_url']
        }],
        order: [['createdAt', 'DESC']]
      });

      console.log('Orders found in model:', orders.length);

      const result = orders.map(order => {
        const orderJson = order.toJSON();
        if (orderJson.Card) {
          orderJson.card_title = orderJson.Card.title;
          orderJson.unique_url = orderJson.Card.unique_url;
          delete orderJson.Card;
        }
        return orderJson;
      });

      console.log('Processed orders:', result.length);
      return result;
    } catch (error) {
      console.error('Error in Order.findAll:', error);
      throw error;
    }
  },
  // Create a new order
  async create(orderData) {
    const {
      user_id,
      card_id,
      quantity,
      shipping_address,
      phone_number,
      total_price,
      payment_method,
      plan_type,
      custom_url_name
    } = orderData;

    try {
      const order = await Order.create({
        UserId: user_id,
        CardId: card_id,
        quantity,
        shipping_address,
        phone_number,
        total_price,
        payment_method: payment_method || 'cash_on_delivery',
        status: 'pending',
        plan_type: plan_type || 'standard',
        custom_url_name
      });

      return order.toJSON();
    } catch (error) {
      throw error;
    }
  },

  // Get all orders for a user
  async findByUserId(userId) {
    try {
      const orders = await Order.findAll({
        where: { UserId: userId },
        include: [{
          model: Card,
          attributes: ['title', 'unique_url']
        }],
        order: [['createdAt', 'DESC']]
      });

      return orders.map(order => {
        const orderJson = order.toJSON();
        if (orderJson.Card) {
          orderJson.card_title = orderJson.Card.title;
          orderJson.unique_url = orderJson.Card.unique_url;
          delete orderJson.Card;
        }
        return orderJson;
      });
    } catch (error) {
      throw error;
    }
  },

  // Get order by ID
  async findById(id) {
    try {
      const order = await Order.findByPk(id, {
        include: [{
          model: Card,
          attributes: ['title', 'unique_url']
        }]
      });

      if (!order) return null;

      const orderJson = order.toJSON();
      if (orderJson.Card) {
        orderJson.card_title = orderJson.Card.title;
        orderJson.unique_url = orderJson.Card.unique_url;
        delete orderJson.Card;
      }

      return orderJson;
    } catch (error) {
      throw error;
    }
  },

  // Update order status
  async updateStatus(id, status) {
    try {
      console.log('Order updateStatus called with id:', id, 'status:', status);

      // Convert id to number if it's a string
      const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(orderId)) {
        console.error('Invalid order ID:', id);
        throw new Error('Invalid order ID');
      }

      const order = await Order.findByPk(orderId);
      console.log('Order found:', order ? 'Yes' : 'No');

      if (!order) return null;

      order.status = status;
      await order.save();
      console.log('Order status updated successfully');

      return order.toJSON();
    } catch (error) {
      console.error('Error in Order.updateStatus:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  },

  // Update card created status
  async updateCardCreated(id, cardCreated) {
    try {
      console.log('Order updateCardCreated called with id:', id, 'cardCreated:', cardCreated);

      // Convert id to number if it's a string
      const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(orderId)) {
        console.error('Invalid order ID:', id);
        throw new Error('Invalid order ID');
      }

      const order = await Order.findByPk(orderId);
      console.log('Order found:', order ? 'Yes' : 'No');

      if (!order) return null;

      order.card_created = cardCreated;
      await order.save();
      console.log('Order card_created updated successfully');

      return order.toJSON();
    } catch (error) {
      console.error('Error in Order.updateCardCreated:', error);
      console.error('Error details:', error.stack);
      throw error;
    }
  },

  // Update card ID
  async updateCardId(id, cardId) {
    try {
      console.log('Order updateCardId called with id:', id, 'cardId:', cardId);

      // Convert id to number if it's a string
      const orderId = typeof id === 'string' ? parseInt(id, 10) : id;

      if (isNaN(orderId)) {
        console.error('Invalid order ID:', id);
        throw new Error('Invalid order ID');
      }

      const order = await Order.findByPk(orderId);
      console.log('Order found:', order ? 'Yes' : 'No');

      if (!order) return null;

      order.CardId = cardId;
      await order.save();
      console.log('Order CardId updated successfully to:', cardId);

      return order.toJSON();
    } catch (error) {
      console.error('Error in Order.updateCardId:', error);
      console.error('Error details:', error.stack);
      throw error;
    }
  },

  // Get orders by status
  async findByStatus(status) {
    try {
      const orders = await Order.findAll({
        where: { status },
        include: [{
          model: Card,
          attributes: ['title', 'unique_url']
        }],
        order: [['createdAt', 'DESC']]
      });

      return orders.map(order => {
        const orderJson = order.toJSON();
        if (orderJson.Card) {
          orderJson.card_title = orderJson.Card.title;
          orderJson.unique_url = orderJson.Card.unique_url;
          delete orderJson.Card;
        }
        return orderJson;
      });
    } catch (error) {
      throw error;
    }
  }
};

module.exports = OrderModel;
