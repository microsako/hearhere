const bcrypt = require('bcrypt');

// 数据库中的哈希
const hash = '$2b$10$j1gIq6VU/0ud5LvgRYecGuR7XbOz14up3KSz97oYkR2srwwvnTNne';

bcrypt.compare('123456', hash, (err, result) => {
  console.log('密码比对结果:', result);
});
