const cron = require('node-cron');
const User = require('../models/User');
const { sequelize } = require('../config/db');

/**
 * 每日重置试用次数任务
 * 每天凌晨 00:00 执行
 * - 将 daily_remaining 重置为 3
 * - 将 monthly_remaining 重置为 50（每月1号）
 */
const startDailyResetTask = () => {
  console.log('⏰ 每日重置任务已启动');

  // 每天凌晨 00:00 重置 daily_remaining
  cron.schedule('0 0 * * *', async () => {
    console.log(`[${new Date().toISOString()}] 开始执行每日重置任务...`);
    try {
      // 重置所有用户的 daily_remaining 为 3
      const [updatedRows] = await User.update(
        { daily_remaining: 3 },
        { where: { plan: 'free' } }
      );
      console.log(`✅ 已重置 ${updatedRows} 个免费版用户的 daily_remaining 为 3`);

      // 记录日志
      console.log(`[${new Date().toISOString()}] 每日重置完成`);
    } catch (error) {
      console.error('❌ 每日重置失败:', error);
    }
  });

  // 每月1号凌晨 00:00 重置 monthly_remaining
  cron.schedule('0 0 1 * *', async () => {
    console.log(`[${new Date().toISOString()}] 开始执行月度重置任务...`);
    try {
      const [updatedRows] = await User.update(
        { monthly_remaining: 50 },
        { where: { plan: 'free' } }
      );
      console.log(`✅ 已重置 ${updatedRows} 个免费版用户的 monthly_remaining 为 50`);

      // 同时也要清空 trial_usages 表的历史记录（可选）
      await sequelize.query("TRUNCATE TABLE trial_usages");
      console.log('✅ 已清空 trial_usages 历史记录');

      console.log(`[${new Date().toISOString()}] 月度重置完成`);
    } catch (error) {
      console.error('❌ 月度重置失败:', error);
    }
  });
};

module.exports = { startDailyResetTask };
