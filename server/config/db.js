const { Sequelize } = require('sequelize');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// Database configuration using MySQL
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  },
  logging: false
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
};

testConnection();

// Sync all models with database
sequelize.sync({ force: false }).then(() => {
  console.log('Database synced successfully');
}).catch(error => {
  console.error('Error syncing database:', error);
});

module.exports = sequelize;
