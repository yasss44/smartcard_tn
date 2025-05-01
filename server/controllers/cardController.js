const Card = require('../models/Card');

// Create a new card
exports.createCard = async (req, res) => {
  try {
    const { title, background, profilePic, links, colors, orderId } = req.body;
    const userId = req.userId;

    console.log('Creating card with profile pic:', profilePic ? 'Present (length: ' + profilePic.length + ')' : 'Not present');

    // Check if required fields are provided
    if (!title || !links) {
      return res.status(400).json({ message: 'Please provide title and links' });
    }

    // If orderId is provided, check if it exists and get the custom_url_name
    let customUrlName = null;
    if (orderId) {
      console.log('Order ID provided:', orderId);

      // Use the Sequelize model directly to avoid any issues
      const { Order: OrderModel } = require('../config/dbInit');

      try {
        // Convert orderId to number if it's a string
        const orderIdNum = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;

        if (isNaN(orderIdNum)) {
          console.error('Invalid order ID:', orderId);
        } else {
          const order = await OrderModel.findByPk(orderIdNum);

          if (order) {
            console.log('Order found:', order.id);

            if (order.custom_url_name) {
              customUrlName = order.custom_url_name;
              console.log('Using custom URL name from order:', customUrlName);
            } else {
              console.log('Order does not have a custom URL name');
            }
          } else {
            console.log('Order not found with ID:', orderIdNum);
          }
        }
      } catch (orderError) {
        console.error('Error finding order:', orderError);
      }
    }

    // Create new card
    const newCard = await Card.create({
      UserId: userId,
      title,
      background: background || '',
      profilePic: profilePic || null,
      links,
      colors: colors || {},
      unique_url: customUrlName // Use the custom URL name if available
    });

    res.status(201).json(newCard);
  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all cards for a user
exports.getUserCards = async (req, res) => {
  try {
    const userId = req.userId;

    // Get all cards for the user
    const cards = await Card.findByUserId(userId);

    res.json(cards);
  } catch (error) {
    console.error('Get user cards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get a card by ID
exports.getCardById = async (req, res) => {
  try {
    const { id } = req.params;

    // Get card by ID
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user owns the card
    if (card.UserId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to access this card' });
    }

    res.json(card);
  } catch (error) {
    console.error('Get card by ID error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Get a card by unique URL (public access)
exports.getCardByUniqueUrl = async (req, res) => {
  try {
    const { uniqueUrl } = req.params;
    console.log('Getting card by unique URL:', uniqueUrl);

    // Get card by unique URL
    const card = await Card.findByUniqueUrl(uniqueUrl);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    console.log('Card found:', {
      id: card.id,
      title: card.title,
      hasProfilePic: !!card.profilePic,
      profilePicLength: card.profilePic ? card.profilePic.length : 0
    });

    res.json(card);
  } catch (error) {
    console.error('Get card by unique URL error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Update a card
exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, background, profilePic, links, colors } = req.body;

    console.log('Updating card with profile pic:', profilePic ? 'Present (length: ' + profilePic.length + ')' : 'Not present');

    // Get card by ID
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user owns the card
    if (card.UserId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to update this card' });
    }

    // Update card
    const updatedCard = await Card.update(id, {
      title: title || card.title,
      background: background || card.background,
      profilePic: profilePic !== undefined ? profilePic : card.profilePic,
      links: links || card.links,
      colors: colors || card.colors
    });

    res.json(updatedCard);
  } catch (error) {
    console.error('Update card error:', error);
    console.error('Update error details:', JSON.stringify(error, null, 2));
    console.error('Request body:', JSON.stringify(req.body, null, 2));
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};

// Delete a card
exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;

    // Get card by ID
    const card = await Card.findById(id);

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user owns the card
    if (card.UserId !== req.userId) {
      return res.status(403).json({ message: 'Not authorized to delete this card' });
    }

    // Delete card
    await Card.delete(id);

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
