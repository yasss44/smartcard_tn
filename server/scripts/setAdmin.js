// Script to set a user as admin
require('dotenv').config();
const { User } = require('../config/dbInit');

async function setAdmin(email) {
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }
    
    // Set user as admin
    user.is_admin = true;
    await user.save();
    
    console.log(`User ${email} is now an admin`);
    process.exit(0);
  } catch (error) {
    console.error('Error setting admin:', error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address');
  console.log('Usage: node setAdmin.js <email>');
  process.exit(1);
}

setAdmin(email);
