// Database connection for Netlify functions
const { Sequelize, DataTypes } = require('sequelize');

// Database configuration using MySQL
const sequelize = new Sequelize('defaultdb', 'avnadmin', 'AVNS_mxDPO2lgZRVAbKhlnfp', {
  host: 'nfc-lucifer-nfc-lucifer.b.aivencloud.com',
  port: 12639,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      rejectUnauthorized: false,
      require: true
    }
  },
  logging: false
});

// Define User model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
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
}, {
  tableName: 'Users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Define Card model
const Card = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unique_url: {
    type: DataTypes.STRING,
    allowNull: true
  },
  background: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profilePic: {
    type: DataTypes.TEXT('long'),
    allowNull: true
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
    allowNull: true,
    get() {
      const value = this.getDataValue('colors');
      return value ? JSON.parse(value) : null;
    },
    set(value) {
      this.setDataValue('colors', JSON.stringify(value));
    }
  },
  planType: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Cards',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Define Order model
const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  plan_type: {
    type: DataTypes.ENUM('standard', 'logo', 'full'),
    allowNull: false
  },
  card_created: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  shipping_address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  payment_method: {
    type: DataTypes.ENUM('cash_on_delivery'),
    allowNull: false,
    defaultValue: 'cash_on_delivery'
  },
  custom_url_name: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'Orders',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Define relationships
User.hasMany(Card, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  }
});
Card.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  }
});

User.hasMany(Order, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  }
});
Order.belongsTo(User, {
  foreignKey: {
    name: 'UserId',
    allowNull: true
  }
});

Card.hasOne(Order, {
  foreignKey: {
    name: 'CardId',
    allowNull: true
  }
});
Order.belongsTo(Card, {
  foreignKey: {
    name: 'CardId',
    allowNull: true
  }
});

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error);
    return false;
  }
};

module.exports = {
  sequelize,
  User,
  Card,
  Order,
  testConnection
};
