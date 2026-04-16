const bcrypt = require('bcrypt');

async function generateHash() {
  const hash = await bcrypt.hash('123456', 10);
  console.log('哈希值:', hash);
  
  // 更新数据库
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'hearhere_user',
    password: 'hearhere_123456',
    database: 'hearhere'
  });
  
  await conn.query(
    "UPDATE users SET password = ? WHERE email = '1394855803@qq.com'",
    [hash]
  );
  console.log('✅ 密码已更新为 123456');
  await conn.end();
}

generateHash();
