const { sequelize, Card } = require('./dbInit');

async function updateSchema() {
  try {
    console.log('Checking if profilePic column exists...');
    
    // Check if the column exists
    const [results] = await sequelize.query(
      "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Cards' AND COLUMN_NAME = 'profilePic'"
    );
    
    if (results.length === 0) {
      console.log('Adding profilePic column to Cards table...');
      
      // Add the column if it doesn't exist
      await sequelize.query(
        "ALTER TABLE Cards ADD COLUMN profilePic TEXT"
      );
      
      console.log('profilePic column added successfully!');
    } else {
      console.log('profilePic column already exists.');
    }
    
    console.log('Schema update completed successfully!');
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    // Close the connection
    await sequelize.close();
  }
}

// Run the update
updateSchema();
