const { Card } = require('../config/dbInit');
const { v4: uuidv4 } = require('uuid');

// Card model methods
const CardModel = {
  // Create a new card
  async create(cardData) {
    const { UserId, title, background, profilePic, links, colors, planType, unique_url: customUrl } = cardData;
    // Use the provided custom URL name or generate a UUID
    const unique_url = customUrl || uuidv4();

    console.log('Creating card with unique URL:', unique_url, customUrl ? '(custom)' : '(generated)');

    try {
      // Check if the custom URL is already in use
      if (customUrl) {
        const existingCard = await Card.findOne({
          where: { unique_url: customUrl }
        });

        if (existingCard) {
          throw new Error('Custom URL name is already in use');
        }
      }

      const card = await Card.create({
        UserId,
        title,
        background: background || '',
        profilePic: profilePic || null,
        links,
        colors,
        planType: planType || 'standard',
        unique_url
      });

      return card.toJSON();
    } catch (error) {
      throw error;
    }
  },

  // Get all cards for a user
  async findByUserId(userId) {
    try {
      const cards = await Card.findAll({
        where: { UserId: userId },
        order: [['createdAt', 'DESC']]
      });

      return cards.map(card => card.toJSON());
    } catch (error) {
      throw error;
    }
  },

  // Get card by ID
  async findById(id) {
    try {
      const card = await Card.findByPk(id);
      return card ? card.toJSON() : null;
    } catch (error) {
      throw error;
    }
  },

  // Get card by unique URL
  async findByUniqueUrl(uniqueUrl) {
    try {
      const card = await Card.findOne({
        where: { unique_url: uniqueUrl }
      });

      return card ? card.toJSON() : null;
    } catch (error) {
      throw error;
    }
  },

  // Update a card
  async update(id, cardData) {
    console.log('Updating card with data:', JSON.stringify(cardData, null, 2));
    const { title, background, profilePic, links, colors, planType } = cardData;

    try {
      const card = await Card.findByPk(id);

      if (!card) return null;

      card.title = title || card.title;
      card.background = background !== undefined ? background : card.background;

      // Handle profilePic separately since it can be null
      if (profilePic !== undefined) {
        card.profilePic = profilePic;
        console.log('Setting profilePic:', profilePic ? 'Has profile pic' : 'No profile pic');
      }

      if (links) card.links = links;
      if (colors) card.colors = colors;
      if (planType) card.planType = planType;

      await card.save();

      return card.toJSON();
    } catch (error) {
      throw error;
    }
  },

  // Delete a card
  async delete(id) {
    try {
      const card = await Card.findByPk(id);

      if (!card) return null;

      await card.destroy();

      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = CardModel;
