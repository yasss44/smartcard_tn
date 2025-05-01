const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');
const auth = require('../middleware/auth');

// Create a new card (protected)
router.post('/', auth, cardController.createCard);

// Get all cards for a user (protected)
router.get('/', auth, cardController.getUserCards);

// Get a card by ID (protected)
router.get('/:id', auth, cardController.getCardById);

// Get a card by unique URL (public)
router.get('/url/:uniqueUrl', cardController.getCardByUniqueUrl);

// Update a card (protected)
router.put('/:id', auth, cardController.updateCard);

// Delete a card (protected)
router.delete('/:id', auth, cardController.deleteCard);

module.exports = router;
