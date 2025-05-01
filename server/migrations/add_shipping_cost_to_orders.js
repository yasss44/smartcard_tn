module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Adding shipping_cost column to Orders table...');
      await queryInterface.addColumn('Orders', 'shipping_cost', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 7.00
      });
      console.log('Successfully added shipping_cost column to Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding shipping_cost column:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing shipping_cost column from Orders table...');
      await queryInterface.removeColumn('Orders', 'shipping_cost');
      console.log('Successfully removed shipping_cost column from Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing shipping_cost column:', error);
      return Promise.reject(error);
    }
  }
};
