const express = require('express');
const cors = require('cors');
const sequelize = require('./config/db');

require('dotenv').config();

// 引入模型（确保表被创建）
require('./models/User');
require('./models/Task');
require('./models/AudioTask');
require('./models/TrialToken');
require('./models/TrialUsage');

// 引入路由
const audioRoutes = require('./routes/audioRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API 路由
app.use('/api/audio', audioRoutes);
app.use('/api/auth', authRoutes);

// 首页路由
app.get('/', (req, res) => {
  res.json({ 
    message: 'HearHere API Server',
    version: '1.0.0',
    status: 'running'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({ 
    success: false, 
    message: '服务器内部错误' 
  });
});

// 启动服务器
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');
    
    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ 无法启动服务器:', error);
    process.exit(1);
  }
};

startServer();
