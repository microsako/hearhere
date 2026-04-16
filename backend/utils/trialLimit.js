const dayjs = require('dayjs');
const TrialUsage = require('../models/TrialUsage');
const User = require('../models/User');

/**
 * 标准化 userKey（兼容 email_xxx@qq.com 和 xxx@qq.com 两种格式）
 */
const normalizeUserKey = (userKey) => {
  if (!userKey) return userKey;
  if (userKey.startsWith('email_')) {
    return userKey.substring(6);
  }
  return userKey;
};

/**
 * 获取用户当日试用次数（实时从数据库计算）
 * @param {String} userKey 支持 email_xxx@qq.com 或 xxx@qq.com
 * @returns {Object} { count, remaining, dailyLimit, monthlyRemaining, user }
 */
const getTrialCount = async (userKey) => {
  const today = dayjs().format('YYYY-MM-DD');
  const dailyLimit = 3;

  try {
    const normalizedKey = normalizeUserKey(userKey);

    // 查询今日记录
    let trialUsage = await TrialUsage.findOne({
      where: { user_key: normalizedKey, date: today }
    });

    // 没有记录则创建
    if (!trialUsage) {
      trialUsage = await TrialUsage.create({
        user_key: normalizedKey,
        date: today,
        count: 0,
        daily_limit: dailyLimit
      });
    }

    // 查询用户获取月度剩余（优先使用 user_key 字段）
    let user = null;
    let monthlyRemaining = 50;
    try {
      user = await User.findOne({ where: { user_key: normalizedKey } });
      if (!user) {
        // 备用：用 email 查询（兼容旧数据）
        user = await User.findOne({ where: { email: normalizedKey } });
      }
      if (user) {
        monthlyRemaining = user.monthly_remaining;
      }
    } catch (e) {
      console.warn('查询用户失败:', e.message);
    }

    return {
      count: trialUsage.count,
      remaining: Math.max(0, dailyLimit - trialUsage.count),
      dailyLimit,
      monthlyRemaining,
      user
    };
  } catch (error) {
    console.error('获取试用次数失败:', error);
    return { count: 0, remaining: 0, dailyLimit: 3, monthlyRemaining: 50, user: null };
  }
};

/**
 * 增加试用次数（同时更新 users 表的 daily_remaining 和 monthly_remaining）
 * @param {String} userKey 支持 email_xxx@qq.com 或 xxx@qq.com
 * @returns {Boolean}
 */
const increaseTrialCount = async (userKey) => {
  const today = dayjs().format('YYYY-MM-DD');
  const dailyLimit = 3;

  try {
    // 1. 获取实时状态
    const trialInfo = await getTrialCount(userKey);
    const { count, remaining, monthlyRemaining, user } = trialInfo;

    // 2. 用户不存在则拒绝
    if (!user) {
      console.error('用户不存在:', userKey);
      return false;
    }

    // 3. 判断可用性：每日或月度任一有剩余即可
    const hasDailyRemaining = remaining > 0;
    const hasMonthlyRemaining = monthlyRemaining > 0;

    if (!hasDailyRemaining && !hasMonthlyRemaining) {
      return false;
    }

    // 4. 更新每日使用记录（仅当使用每日额度时增加 count）
    const normalizedKey = normalizeUserKey(userKey);
    let newCount = count;

    if (hasDailyRemaining) {
      const existing = await TrialUsage.findOne({
        where: { user_key: normalizedKey, date: today }
      });

      if (existing) {
        await TrialUsage.increment('count', { where: { id: existing.id } });
        const updated = await TrialUsage.findByPk(existing.id);
        newCount = updated.count;
      } else {
        const created = await TrialUsage.create({
          user_key: normalizedKey,
          date: today,
          count: 1,
          daily_limit: dailyLimit
        });
        newCount = 1;
      }
    }

    // 5. 计算新的剩余次数
    // 关键：newCount >= dailyLimit 表示今日已用完，daily_remaining 必须为 0
    const newDailyRemaining = newCount >= dailyLimit ? 0 : dailyLimit - newCount;
    const newMonthlyRemaining = hasMonthlyRemaining ? monthlyRemaining - 1 : monthlyRemaining;

    // 6. 同步更新 users 表
    await user.update({
      daily_remaining: newDailyRemaining,
      monthly_remaining: newMonthlyRemaining
    });

    return true;
  } catch (error) {
    console.error('增加试用次数失败:', error);
    return false;
  }
};

/**
 * 检查月度剩余次数
 * @param {String} userKey 支持 email_xxx@qq.com 或 xxx@qq.com
 * @returns {Boolean}
 */
const checkMonthlyRemaining = async (userKey) => {
  try {
    const normalizedKey = normalizeUserKey(userKey);
    // 优先使用 user_key 查询
    let user = await User.findOne({ where: { user_key: normalizedKey } });
    if (!user) {
      user = await User.findOne({ where: { email: normalizedKey } });
    }
    return !!(user && user.monthly_remaining > 0);
  } catch (error) {
    return true;
  }
};

module.exports = {
  getTrialCount,
  increaseTrialCount,
  checkMonthlyRemaining
};
