const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');

// Upload a file (protected)
router.post('/', auth, upload.single('image'), uploadController.uploadFile);

module.exports = router;
