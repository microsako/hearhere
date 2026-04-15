const sequelize = require('./config/db');
const User = require('./models/User');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 先查询现有用户数据
    const [results] = await sequelize.query('SELECT id, email FROM users LIMIT 5');
    console.log('现有用户:', results);

    if (results.length > 0) {
      // 为每个用户生成唯一的 user_key
      for (const user of results) {
        const userKey = 'user_' + user.id + '_' + Date.now();
        await sequelize.query(
          'UPDATE users SET user_key = ? WHERE id = ?',
          { replacements: [userKey, user.id] }
        );
        console.log(`✅ 用户 ${user.email} 已分配 user_key`);
      }
    } else {
      console.log('没有现有用户');
    }

    // 验证
    const [final] = await sequelize.query('SELECT id, email, user_key FROM users');
    console.log('最终结果:', final);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fix();
