module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Adding file fields to Orders table...');
      
      // Add has_logo_file column
      await queryInterface.addColumn('Orders', 'has_logo_file', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
      
      // Add has_design_file column
      await queryInterface.addColumn('Orders', 'has_design_file', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      });
      
      console.log('Successfully added file fields to Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error adding file fields:', error);
      return Promise.reject(error);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      console.log('Removing file fields from Orders table...');
      
      // Remove has_logo_file column
      await queryInterface.removeColumn('Orders', 'has_logo_file');
      
      // Remove has_design_file column
      await queryInterface.removeColumn('Orders', 'has_design_file');
      
      console.log('Successfully removed file fields from Orders table');
      return Promise.resolve();
    } catch (error) {
      console.error('Error removing file fields:', error);
      return Promise.reject(error);
    }
  }
};
