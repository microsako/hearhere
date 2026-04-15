const sequelize = require('./config/db');

async function fix() {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功');

    // 检查表结构
    const [columns] = await sequelize.query('SHOW COLUMNS FROM users');
    console.log('现有字段:', columns.map(c => c.Field));

    // 如果有 user_key 字段，先删除唯一约束
    try {
      await sequelize.query('ALTER TABLE users DROP INDEX user_key');
      console.log('✅ 删除 user_key 唯一索引');
    } catch (e) {
      console.log('⚠️  没有 user_key 索引或已删除');
    }

    // 如果有 user_key 字段，先删除它
    try {
      await sequelize.query('ALTER TABLE users DROP COLUMN user_key');
      console.log('✅ 删除 user_key 字段');
    } catch (e) {
      console.log('⚠️  没有 user_key 字段或已删除');
    }

    // 重新添加 user_key 字段（允许 NULL）
    await sequelize.query('ALTER TABLE users ADD COLUMN user_key VARCHAR(100) NULL UNIQUE');
    console.log('✅ 添加 user_key 字段');

    // 为现有用户生成 user_key
    const [users] = await sequelize.query('SELECT id, email FROM users');
    console.log(`找到 ${users.length} 个用户`);

    for (const user of users) {
      const userKey = 'user_' + user.id + '_' + Date.now();
      await sequelize.query(
        'UPDATE users SET user_key = ? WHERE id = ?',
        { replacements: [userKey, user.id] }
      );
      console.log(`✅ ${user.email} -> ${userKey}`);
    }

    // 设置为 NOT NULL
    await sequelize.query('ALTER TABLE users MODIFY COLUMN user_key VARCHAR(100) NOT NULL UNIQUE');
    console.log('✅ 设置 user_key 为 NOT NULL');

    // 验证
    const [final] = await sequelize.query('SELECT id, email, user_key FROM users LIMIT 3');
    console.log('验证:', final);

  } catch (error) {
    console.error('❌ 错误:', error.message);
    console.error(error.stack);
  } finally {
    await sequelize.close();
  }
}

fix();
