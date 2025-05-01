const sequelize = require('./db');
const { DataTypes } = require('sequelize');

// Define models
const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  is_admin: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

const Card = sequelize.define('Card', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  background: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePic: {
    type: DataTypes.TEXT('long'),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('profilePic');
      return rawValue;
    },
    set(value) {
      this.setDataValue('profilePic', value);
    }
  },
  links: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('links');
      return value ? JSON.parse(value) : [];
    },
    set(value) {
      this.setDataValue('links', JSON.stringify(value));
    }
  },
  colors: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '{}',
    get() {
      const value = this.getDataValue('colors');
      return value ? JSON.parse(value) : {};
    },
    set(value) {
      this.setDataValue('colors', JSON.stringify(value));
    }
  },
  planType: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'standard'
  },
  unique_url: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  }
});

const Order = sequelize.define('Order', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'cash_on_delivery'
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending'
  },
  plan_type: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'standard'
  },
  card_created: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  custom_url_name: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      is: /^[a-zA-Z0-9-_]+$/i // Only allow alphanumeric characters, hyphens, and underscores
    }
  },
  shipping_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 7.00
  },
  has_logo_file: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  has_design_file: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

// Define relationships
User.hasMany(Card, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  constraints: true,
  name: 'user_cards_fk'
});
Card.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  },
  constraints: true,
  name: 'card_user_fk'
});

User.hasMany(Order, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  constraints: true,
  name: 'user_orders_fk'
});
Order.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  },
  constraints: true,
  name: 'order_user_fk'
});

Card.hasMany(Order, {
  foreignKey: {
    name: 'CardId',
    allowNull: true
  },
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE',
  constraints: true,
  name: 'card_orders_fk'
});
Order.belongsTo(Card, {
  foreignKey: {
    name: 'CardId',
    allowNull: true
  },
  constraints: true,
  name: 'order_card_fk'
});

// Initialize database
const initDb = async () => {
  try {
    // Sync all models with database
    await sequelize.sync({ force: false });
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
};

// Export models
module.exports = {
  sequelize,
  User,
  Card,
  Order,
  initDb
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDb();
}
