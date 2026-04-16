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
    const userKey = loginRes.data.data.user.user_key;
    console.log('✅ 登录成功, userKey:', userKey);

    // 2. 查看初始剩余次数
    const profileRes = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 初始剩余:', {
      daily: profileRes.data.data.remainingDaily,
      monthly: profileRes.data.data.remainingMonthly
    });

    // 3. 调用生成接口
    console.log('\n🚀 第1次调用生成接口...');
    const generateRes = await axios.post(
      'http://localhost:3000/api/audio/generate',
      {
        Unit_Topic: 'test topic',
        Core_Vocabulary: 'test words',
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
        headers: { Authorization: `Bearer ${token}` },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    console.log('生成结果:', generateRes.data.success ? '✅ 成功' : '❌ 失败');

    // 4. 查看使用后剩余次数
    const profileRes2 = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 第1次后剩余:', {
      daily: profileRes2.data.data.remainingDaily,
      monthly: profileRes2.data.data.remainingMonthly
    });

    // 5. 再次调用生成
    console.log('\n🚀 第2次调用生成接口...');
    const generateRes2 = await axios.post(
      'http://localhost:3000/api/audio/generate',
      {
        Unit_Topic: 'test topic 2',
        Core_Vocabulary: 'test words 2',
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
        headers: { Authorization: `Bearer ${token}` },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      }
    );
    console.log('生成结果:', generateRes2.data.success ? '✅ 成功' : '❌ 失败');

    // 6. 查看剩余次数
    const profileRes3 = await axios.get('http://localhost:3000/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('📊 第2次后剩余:', {
      daily: profileRes3.data.data.remainingDaily,
      monthly: profileRes3.data.data.remainingMonthly
    });

  } catch (err) {
    console.error('❌ 错误:', err.response?.data || err.message);
  }
}

testFlow();
