// Script to create an admin user
require('dotenv').config();
const { User } = require('../config/dbInit');
const bcrypt = require('bcrypt');

async function createAdmin(name, email, password) {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      console.log(`User ${email} already exists. Updating to admin...`);
      existingUser.is_admin = true;
      await existingUser.save();
      console.log(`User ${email} is now an admin`);
      process.exit(0);
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new admin user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      is_admin: true
    });
    
    console.log(`Admin user ${email} created successfully`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

// Default admin credentials
const name = 'Admin';
const email = 'admin@smartcardtunisia.com';
const password = 'admin123'; // You should change this in production

createAdmin(name, email, password);
