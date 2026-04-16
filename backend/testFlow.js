const axios = require('axios');

const email = '1394855803@qq.com';
const password = '123456';

async function testFlow() {
  try {
    // 1. 登录
    const loginRes = await axios.post('http://localhost:3000/api/auth/login', {
      email,
      password
    });
    const token = loginRes.data.data.token;
    console.log('✅ 登录成功');

    // 2. 查看初始状态
    const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 初始剩余:', profileRes.data);

    // 3. 调用生成接口
    console.log('\n🚀 调用生成接口...');
    const generateRes = await axios.post(
      'http://localhost:3000/api/audio/generate',
      {
        Unit_Topic: 'test',
        Core_Vocabulary: 'test',
        Text_Length: 150,
        S_m: ' ',
        difficulty: 4,
        speed_ratio: 1.1,
        Factual_Information: 5,
        Inference_Judgment: 2,
        Attitude_Opinion: 2,
        Main_Idea: 1
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log('✅ 生成成功:', generateRes.data.success ? '成功' : '失败');

    // 4. 查看使用后状态
    const profileRes2 = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 使用后剩余:', profileRes2.data);

  } catch (err) {
    console.error('❌ 错误:', err.response?.data || err.message);
  }
}

testFlow();
