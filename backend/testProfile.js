const axios = require('axios');

async function test() {
  try {
    // 登录
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email: '1394855803@qq.com',
      password: '123456'
    });
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功');

    // 调用 profile 接口
    const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 Profile 响应:', JSON.stringify(profileRes.data, null, 2));

  } catch (err) {
    console.error('❌ 错误:', err.response?.data || err.message);
  }
}

test();
