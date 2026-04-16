const bcrypt = require('bcrypt');

// 已知密码：123456
const passwords = ['123456', '12345678', 'password'];

// 数据库哈希
const hash = '$2b$10$j1gIq6VU/0ud5LvgRYecGuR7XbOz14up3KSz97oYkR2srwwvnTNne';

for (const pwd of passwords) {
  bcrypt.compare(pwd, hash, (err, result) => {
    console.log(`${pwd}: ${result}`);
  });
}
