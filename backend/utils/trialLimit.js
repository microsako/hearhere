const dayjs = require('dayjs');
const TrialUsage = require('../models/TrialUsage');

/**
 * 获取用户当日试用次数
 * @param {String} userKey 
 * @returns {Object}
 */
const getTrialCount = async (userKey) => {
  const today = dayjs().format('YYYY-MM-DD');
  const dailyLimit = 3;
  
  try {
    // 查询今日记录
    let trialUsage = await TrialUsage.findOne({
      where: {
        user_key: userKey,
        date: today
      }
    });
    
    // 没有记录则创建
    if (!trialUsage) {
      trialUsage = await TrialUsage.create({
        user_key: userKey,
        date: today,
        count: 0,
        daily_limit: dailyLimit
      });
    }
    
    return {
      count: trialUsage.count,
      remaining: Math.max(0, dailyLimit - trialUsage.count),
      dailyLimit
    };
  } catch (error) {
    console.error('获取试用次数失败:', error);
    return { count: 0, remaining: 0, dailyLimit };
  }
};

/**
 * 增加试用次数
 * @param {String} userKey 
 * @returns {Boolean}
 */
const increaseTrialCount = async (userKey) => {
  const today = dayjs().format('YYYY-MM-DD');
  const dailyLimit = 3;
  
  try {
    // 查询今日记录
    let trialUsage = await TrialUsage.findOne({
      where: {
        user_key: userKey,
        date: today
      }
    });
    
    // 次数已满
    if (trialUsage && trialUsage.count >= dailyLimit) {
      return false;
    }
    
    // 更新/创建记录
    if (trialUsage) {
      await trialUsage.update({
        count: trialUsage.count + 1,
        updated_at: new Date()
      });
    } else {
      await TrialUsage.create({
        user_key: userKey,
        date: today,
        count: 1,
        daily_limit: dailyLimit
      });
    }
    
    return true;
  } catch (error) {
    console.error('增加试用次数失败:', error);
    return false;
  }
};

module.exports = {
  getTrialCount,
  increaseTrialCount
};