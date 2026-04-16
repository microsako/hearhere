const axios = require('axios');

// 你的测试账号
const email = '1394855803@qq.com';
const password = '123456';

async function test() {
  try {
    // 1. 登录
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功');

    // 2. 查看初始剩余次数
    const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 初始剩余次数:', profileRes.data);

    // 3. 模拟调用生成接口（调用 increaseTrialCount）
    const userKey = loginRes.data.data.user.user_key;
    console.log('🔑 userKey:', userKey);

    // 手动调用 increaseTrialCount 测试
    const { increaseTrialCount } = require('./utils/trialLimit');
    const result = await increaseTrialCount(userKey);
    console.log('✅ increaseTrialCount 结果:', result);

    // 4. 再次查看剩余次数
    const profileRes2 = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 使用后剩余次数:', profileRes2.data);

    // 5. 查看数据库
    const mysql = require('mysql2/promise');
    const conn = await mysql.createConnection({
      host: 'localhost',
      user: 'hearhere_user',
      password: 'hearhere_123456',
      database: 'hearhere'
    });
    const [rows] = await conn.query(
      "SELECT daily_remaining, monthly_remaining FROM users WHERE email = ?",
      [email]
    );
    console.log('🗄️ 数据库中的剩余次数:', rows[0]);
    await conn.end();

  } catch (err) {
    console.error('❌ 错误:', err.response?.data || err.message);
  }
}

test();
