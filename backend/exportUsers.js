/**
 * 导出所有用户数据到 JSON 文件
 * 运行方式: node exportUsers.js
 */

const fs = require('fs');
const path = require('path');
const sequelize = require('./config/db');

async function exportUsers() {
  try {
    console.log('🔄 正在导出用户数据...\n');

    // 查询所有用户（不包含密码）
    const [users] = await sequelize.query(`
      SELECT id, username, email, user_key, plan, daily_remaining, monthly_remaining, is_active, created_at, updated_at
      FROM users ORDER BY created_at DESC
    `);

    // 查询所有听力任务
    const [audioTasks] = await sequelize.query(`
      SELECT id, user_id, input_params, result, status, created_at, updated_at
      FROM audio_tasks ORDER BY created_at DESC
    `);

    // 创建导出目录
    const exportDir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // 写入用户数据
    const usersFile = path.join(exportDir, 'users.json');
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');

    // 写入听力任务数据
    const tasksFile = path.join(exportDir, 'audio_tasks.json');
    fs.writeFileSync(tasksFile, JSON.stringify(audioTasks, null, 2), 'utf8');

    // 输出统计
    console.log('📊 数据统计:');
    console.log(`   用户总数: ${users.length}`);
    console.log(`   听力任务总数: ${audioTasks.length}`);

    console.log('\n📁 套餐分布:');
    const planCounts = {};
    users.forEach(u => {
      planCounts[u.plan] = (planCounts[u.plan] || 0) + 1;
    });
    Object.entries(planCounts).forEach(([plan, count]) => {
      const planNames = { free: '免费版', plus: 'Plus版', pro: 'Pro版', school: '校企版' };
      console.log(`   ${planNames[plan] || plan}: ${count} 人`);
    });

    console.log('\n✅ 数据已导出到:');
    console.log(`   - ${usersFile}`);
    console.log(`   - ${tasksFile}`);

    // 显示最近注册的用户
    if (users.length > 0) {
      console.log('\n👤 最近注册的用户 (前5个):');
      users.slice(0, 5).forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username || 'N/A'} (${u.email}) - ${u.plan} - ${u.created_at}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 导出失败:', error);
    process.exit(1);
  }
}

exportUsers();