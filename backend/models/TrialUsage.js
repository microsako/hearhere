const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 试用次数表（移除自动创建索引的配置）
const TrialUsage = sequelize.define('TrialUsage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_key: { // 用户标识（试用Token）
    type: DataTypes.STRING(100),
    allowNull: false
  },
  date: { // 日期（YYYY-MM-DD）
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  count: { // 当日试用次数
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  daily_limit: { // 每日限制次数
    type: DataTypes.INTEGER,
    defaultValue: 3
  }
}, {
  tableName: 'trial_usages',
  indexes: [] // 关键：清空索引配置，不让Sequelize自动创建
});

// 只创建表，不修改结构（禁用所有自动修改）
TrialUsage.sync({ force: false });

module.exports = TrialUsage;