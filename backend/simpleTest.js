const http = require('http');

const loginData = JSON.stringify({
  email: '1394855803@qq.com',
  password: '123456'
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('登录响应:', data);
    try {
      const result = JSON.parse(data);
      if (result.success) {
        console.log('Token:', result.data.token.substring(0, 50) + '...');
      }
    } catch (e) {}
  });
});

req.on('error', (e) => console.error('错误:', e.message));
req.write(loginData);
req.end();
