const sequelize = require('./config/db');
const User = require('./models/User');

async function test() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 同步表
    await User.sync({ alter: true });
    console.log('✅ 表同步完成');

    // 尝试创建用户
    const user = await User.create({
      email: 'test@test.com',
      password: '123456'
    });
    console.log('✅ 用户创建成功:', user.email, 'user_key:', user.user_key);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

test();
