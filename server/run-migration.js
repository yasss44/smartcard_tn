require('dotenv').config();
const { Sequelize } = require('sequelize');
const migration = require('./migrations/add_file_fields_to_orders');

// Create a Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: console.log
  }
);

// Create a simple queryInterface object
const queryInterface = {
  addColumn: async (tableName, columnName, attributes) => {
    try {
      // For MySQL, we need to use VARCHAR instead of STRING
      const dataType = 'VARCHAR(255)';

      await sequelize.query(
        `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${dataType} ${attributes.allowNull ? 'NULL' : 'NOT NULL'}`
      );
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  },
  removeColumn: async (tableName, columnName) => {
    try {
      await sequelize.query(
        `ALTER TABLE ${tableName} DROP COLUMN ${columnName}`
      );
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
};

// Run the migration
async function runMigration() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    console.log('Running migration...');
    await migration.up(queryInterface, Sequelize);
    console.log('Migration completed successfully.');

    await sequelize.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error running migration:', error);
    process.exit(1);
  }
}

runMigration();
