const sequelize = require('./config/db');
const User = require('./models/User');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 删除旧表重新创建
    await User.drop();
    console.log('✅ 删除旧表');

    await User.sync({ force: true });
    console.log('✅ 创建新表完成');

  } catch (error) {
    console.error('❌ 错误:', error.message);
  } finally {
    await sequelize.close();
  }
}

fix();
