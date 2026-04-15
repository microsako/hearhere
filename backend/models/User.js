const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const bcrypt = require('bcryptjs');

// 用户表
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  user_key: {
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: true
  },
  plan: {
    type: DataTypes.ENUM('free', 'plus', 'pro', 'school'),
    defaultValue: 'free'
  },
  daily_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  monthly_remaining: {
    type: DataTypes.INTEGER,
    defaultValue: 50
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'users',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        user.password = await bcrypt.hash(user.password, 10);
      }
      if (!user.user_key) {
        user.user_key = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 10);
      }
    }
  }
});

// 验证密码
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// 同步表结构
User.sync({ alter: true });

module.exports = User;
