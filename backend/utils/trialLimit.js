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

  try {
    const normalizedKey = normalizeUserKey(userKey);

    // 查询用户获取计划信息
    let user = null;
    try {
      user = await User.findOne({ where: { user_key: normalizedKey } });
      if (!user) {
        user = await User.findOne({ where: { email: normalizedKey } });
      }
    } catch (e) {
      console.warn('查询用户失败:', e.message);
    }

    // 根据计划确定限额
    let dailyLimit = 3;
    let expectedMonthlyRemaining = 50;

    if (user) {
      if (user.plan === 'free') {
        dailyLimit = 3;
        expectedMonthlyRemaining = 50;
      } else if (user.plan === 'plus') {
        dailyLimit = Infinity; // 每日无限制
        expectedMonthlyRemaining = 100;
      } else if (user.plan === 'pro') {
        dailyLimit = Infinity; // 每日无限制
        expectedMonthlyRemaining = 200;
      } else {
        // 默认按免费版
        dailyLimit = 3;
        expectedMonthlyRemaining = 50;
      }
    }

    // 查询今日记录（仅当有每日限额时才需要）
    let trialUsage = null;
    if (dailyLimit !== Infinity) {
      trialUsage = await TrialUsage.findOne({
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
    }

    // 获取月度剩余（优先使用用户表中的值，如果不符合计划预期则修正）
    let monthlyRemaining = 50;
    if (user) {
      // 如果用户表中的 monthly_remaining 与计划不匹配，更新为正确的值
      if (user.monthly_remaining !== expectedMonthlyRemaining) {
        await user.update({ monthly_remaining: expectedMonthlyRemaining });
        monthlyRemaining = expectedMonthlyRemaining;
      } else {
        monthlyRemaining = user.monthly_remaining;
      }
    }

    // 计算剩余次数
    let remaining = 0;
    if (dailyLimit === Infinity) {
      remaining = Infinity; // 每日无限制
    } else {
      remaining = Math.max(0, dailyLimit - (trialUsage ? trialUsage.count : 0));
    }

    return {
      count: trialUsage ? trialUsage.count : 0,
      remaining,
      dailyLimit: dailyLimit === Infinity ? 0 : dailyLimit, // 0 表示无限制
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
    const hasDailyRemaining = remaining === Infinity || remaining > 0;
    const hasMonthlyRemaining = monthlyRemaining > 0;

    if (!hasDailyRemaining && !hasMonthlyRemaining) {
      console.log('限额已用完');
      return false;
    }

    // 4. 根据用户计划处理
    const normalizedKey = normalizeUserKey(userKey);
    const isUnlimitedDaily = user.plan === 'plus' || user.plan === 'pro';

    if (isUnlimitedDaily) {
      // Plus/Pro 用户：只扣减月度剩余
      await user.update({
        monthly_remaining: monthlyRemaining - 1
      });
    } else {
      // 免费版用户：扣减每日次数和月度剩余
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
          await TrialUsage.create({
            user_key: normalizedKey,
            date: today,
            count: 1,
            daily_limit: 3
          });
          newCount = 1;
        }
      }

      // 计算新的每日剩余
      const newDailyRemaining = Math.max(0, 3 - newCount);
      const newMonthlyRemaining = hasMonthlyRemaining ? monthlyRemaining - 1 : monthlyRemaining;

      await user.update({
        daily_remaining: newDailyRemaining,
        monthly_remaining: newMonthlyRemaining
      });
    }

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
    let user = await User.findOne({ where: { user_key: normalizedKey } });
    if (!user) {
      user = await User.findOne({ where: { email: normalizedKey } });
    }
    if (!user) return false;

    // Plus/Pro 用户检查月度剩余，免费版检查每日+月度
    if (user.plan === 'plus' || user.plan === 'pro') {
      return user.monthly_remaining > 0;
    } else {
      // 免费版：检查每日或月度任一有剩余
      const trialInfo = await getTrialCount(userKey);
      return trialInfo.remaining > 0 || trialInfo.monthlyRemaining > 0;
    }
  } catch (error) {
    return true;
  }
};

module.exports = {
  getTrialCount,
  increaseTrialCount,
  checkMonthlyRemaining
};
