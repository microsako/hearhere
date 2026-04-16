const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskFeedback = sequelize.define('TaskFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 原始任务ID
  original_task_id: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '原始任务ID'
  },
  // 用户ID
  user_key: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  // 用户反馈内容（修改要求）
  feedback_content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '用户反馈/修改要求'
  },
  // 新生成的音频URL
  new_audio_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // 新生成的文档URL
  new_doc_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  // Coze API 返回的完整结果
  coze_result: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // 状态：pending 生成中, completed 完成, failed 失败
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending'
  },
  // 错误信息
  error_msg: {
    type: DataTypes.STRING(500),
    allowNull: true
  }
}, {
  tableName: 'task_feedbacks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = TaskFeedback;
