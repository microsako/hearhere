const bcrypt = require('bcrypt');
const sql = require('mysql2/promise');

async function resetPassword() {
  const hash = await bcrypt.hash('123456', 10);
  console.log('密码哈希:', hash);

  const conn = await sql.createConnection({
    host: 'localhost',
    user: 'hearhere_user',
    password: 'hearhere_123456',
    database: 'hearhere'
  });

  await conn.query(
    "UPDATE users SET password = ? WHERE email = '1394855803@qq.com'",
    [hash]
  );
  console.log('✅ 密码已更新');
  await conn.end();
}

resetPassword();
