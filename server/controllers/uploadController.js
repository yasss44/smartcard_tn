const fs = require('fs');
const path = require('path');
const { Order } = require('../config/dbInit');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Create order uploads directory if it doesn't exist
const orderUploadsDir = path.join(uploadsDir, 'orders');
if (!fs.existsSync(orderUploadsDir)) {
  fs.mkdirSync(orderUploadsDir);
}

// Handle file upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Return file path
    const filePath = `/uploads/${req.file.filename}`;

    res.json({
      message: 'File uploaded successfully',
      filePath
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload files for an order
exports.uploadOrderFiles = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.userId;

    console.log('Uploading files for order:', orderId);
    console.log('Files received:', req.files);

    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    // Check if order exists and belongs to user
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.UserId !== userId) {
      return res.status(403).json({ message: 'Not authorized to upload files for this order' });
    }

    // Create directory for this order if it doesn't exist
    const orderDir = path.join(orderUploadsDir, orderId.toString());
    if (!fs.existsSync(orderDir)) {
      fs.mkdirSync(orderDir);
    }

    const uploadedFiles = [];

    // Handle logo file
    if (req.files && req.files.logo) {
      const logoFile = req.files.logo;
      const logoPath = path.join(orderDir, 'logo' + path.extname(logoFile.name));

      // Save file
      await logoFile.mv(logoPath);
      uploadedFiles.push({ type: 'logo', path: logoPath });

      console.log('Logo file saved to:', logoPath);
    }

    // Handle design file
    if (req.files && req.files.design) {
      const designFile = req.files.design;
      const designPath = path.join(orderDir, 'design' + path.extname(designFile.name));

      // Save file
      await designFile.mv(designPath);
      uploadedFiles.push({ type: 'design', path: designPath });

      console.log('Design file saved to:', designPath);
    }

    // Update order with file information
    order.has_logo_file = !!req.files?.logo;
    order.has_design_file = !!req.files?.design;
    await order.save();

    res.status(200).json({
      message: 'Files uploaded successfully',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Upload files error:', error);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
};
