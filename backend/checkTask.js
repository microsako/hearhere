const sequelize = require('./config/db');

async function checkTask() {
  try {
    const [tasks] = await sequelize.query(`
      SELECT task_id, status, coze_result, audio_url, doc_url, error_msg, created_at, updated_at
      FROM tasks 
      WHERE task_id = 'task_ce7vy0x9mo1k56em'
    `);
    
    if (tasks.length > 0) {
      const task = tasks[0];
      console.log('Task:', task.task_id);
      console.log('Status:', task.status);
      console.log('Created:', task.created_at);
      console.log('Updated:', task.updated_at);
      console.log('Error:', task.error_msg || '无');
      console.log('Audio URL:', task.audio_url ? '有 ✓' : '无 ✗');
      console.log('Doc URL:', task.doc_url ? '有 ✓' : '无 ✗');
      console.log('Coze Result:', task.coze_result ? `有 (${task.coze_result.length}字) ✓` : '无 ✗');
      if (task.coze_result) {
        console.log('\n=== 内容预览 ===');
        console.log(task.coze_result.substring(0, 500));
      }
    } else {
      console.log('任务不存在');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkTask();