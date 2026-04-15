const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// 音频任务表
const AudioTask = sequelize.define('AudioTask', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  taskId: {
    type: DataTypes.STRING(50),
    unique: true,
    allowNull: false
  },
  user_key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  unit_topic: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  core_words: {
    type: DataTypes.STRING(500)
  },
  text_length: {
    type: DataTypes.INTEGER,
    defaultValue: 150
  },
  difficulty: {
    type: DataTypes.INTEGER,
    defaultValue: 4
  },
  speed_ratio: {
    type: DataTypes.FLOAT,
    defaultValue: 1.1
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  audio_url: {
    type: DataTypes.STRING(500)
  },
  doc_url: {
    type: DataTypes.STRING(500)
  },
  question_types: {
    type: DataTypes.JSON
  },
  error_message: {
    type: DataTypes.STRING(500)
  },
  completed_at: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'audio_tasks'
});

// 同步表结构
AudioTask.sync({ alter: true });

module.exports = AudioTask;