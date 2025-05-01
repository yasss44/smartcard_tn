const { Sequelize } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      // Add the custom_url_name column to the Orders table
      await queryInterface.addColumn('Orders', 'custom_url_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
      
      console.log('Successfully added custom_url_name column to Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding custom_url_name column:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Remove the custom_url_name column from the Orders table
      await queryInterface.removeColumn('Orders', 'custom_url_name');
      
      console.log('Successfully removed custom_url_name column from Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing custom_url_name column:', error);
      return Promise.reject(error);
    }
  }
};
