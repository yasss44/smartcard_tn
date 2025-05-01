const { User } = require('../config/dbInit');
const bcrypt = require('bcrypt');

// User model methods
const UserModel = {
  // Create a new user
  async create(userData) {
    const { name, email, password, is_admin } = userData;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
        is_admin: is_admin || false
      });

      // Return user without password
      const userJson = user.toJSON();
      delete userJson.password;

      return userJson;
    } catch (error) {
      throw error;
    }
  },

  // Find user by email
  async findByEmail(email) {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      throw error;
    }
  },

  // Find user by ID
  async findById(id) {
    try {
      const user = await User.findByPk(id);

      if (!user) return null;

      // Return user without password
      const userJson = user.toJSON();
      delete userJson.password;

      return userJson;
    } catch (error) {
      throw error;
    }
  },

  // Find all users
  async findAll() {
    try {
      console.log('User model findAll called');
      // Use the Sequelize model directly to avoid recursion
      const { User: UserModel } = require('../config/dbInit');

      const users = await UserModel.findAll({
        order: [['createdAt', 'DESC']]
      });

      console.log('Users found in model:', users.length);

      return users.map(user => {
        const userJson = user.toJSON();
        delete userJson.password;
        return userJson;
      });
    } catch (error) {
      console.error('Error in User.findAll:', error);
      throw error;
    }
  },

  // Delete a user
  async delete(id) {
    try {
      const user = await User.findByPk(id);

      if (!user) return null;

      await user.destroy();

      return { id };
    } catch (error) {
      throw error;
    }
  }
};

module.exports = UserModel;
