const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 任务表
const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  task_id: { // 自定义任务ID
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  user_key: { // 用户标识
    type: DataTypes.STRING(100),
    allowNull: false
  },
  unit_topic: { // 任务参数
    type: DataTypes.STRING(200),
    allowNull: false
  },
  core_words: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  text_length: {
    type: DataTypes.INTEGER,
    defaultValue: 450
  },
  question_count: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  },
  status: { // 任务状态：pending/processing/completed/failed
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  audio_url: { // 生成结果
    type: DataTypes.STRING(500)
  },
  doc_url: {
    type: DataTypes.STRING(500)
  },
  coze_result: {
    type: DataTypes.TEXT
  },
  error_msg: { // 错误信息
    type: DataTypes.STRING(500)
  }
}, {
  tableName: 'tasks'
});

// 同步表结构
Task.sync({ alter: true });

module.exports = Task;