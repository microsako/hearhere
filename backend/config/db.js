const { Sequelize } = require('sequelize');
require('dotenv').config();

// 创建Sequelize实例（连接MySQL）
const sequelize = new Sequelize(
  process.env.MYSQL_DB || 'hearhere',       // 数据库名
  process.env.MYSQL_USER || 'hearhere_user',// 用户名
  process.env.MYSQL_PASSWORD || 'your_password', // 密码
  {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    dialect: 'mysql',
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true, // 自动添加createdAt/updatedAt
      underscored: true // 使用下划线命名（如trial_usage）
    },
    timezone: '+08:00' // 时区（中国标准时间）
  }
);

// 测试连接
sequelize.authenticate()
  .then(() => {
    console.log('✅ MySQL连接成功');
  })
  .catch(err => {
    console.error('❌ MySQL连接失败:', err);
    process.exit(1);
  });

module.exports = sequelize;