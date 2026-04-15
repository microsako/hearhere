const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 试用Token表
const TrialToken = sequelize.define('TrialToken', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: { // 试用Token
    type: DataTypes.STRING(100),
    unique: true,
    allowNull: false
  },
  is_valid: { // 是否有效
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  expired_at: { // 过期时间（7天）
    type: DataTypes.DATE,
    defaultValue: () => new Date(+new Date() + 7*24*60*60*1000)
  }
}, {
  tableName: 'trial_tokens'
});

// 同步表结构
TrialToken.sync({ alter: true });

module.exports = TrialToken;