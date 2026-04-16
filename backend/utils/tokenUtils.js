const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const TrialToken = require('../models/TrialToken');
const dayjs = require('dayjs'); // 确保已安装dayjs：npm install dayjs
require('dotenv').config();

// 使用你的SECRET_KEY
const JWT_SECRET = process.env.SECRET_KEY || 'hearhere_2026_prod_key';

/**
 * 验证正式Token
 * @param {String} token 
 * @returns {Object}
 */
const verifyOfficialToken = async (token) => {
  try {
    if (!token) return { valid: false, userId: null, email: null };
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, userId: decoded.user_key, email: decoded.email };
  } catch (error) {
    console.error('Token验证失败:', error);
    return { valid: false, userId: null, email: null };
  }
};

/**
 * 验证试用Token（修复日期比较逻辑）
 * @param {String} token 
 * @returns {Object}
 */
const verifyTrialToken = async (token) => {
  try {
    if (!token) return { valid: false };
    
    // 调试：打印待验证的Token
    console.log('验证试用Token:', token);
    
    // 查询Token是否存在且有效（修复时区/日期格式问题）
    const trialToken = await TrialToken.findOne({
      where: {
        token: token,
        is_valid: true,
        expired_at: {
          [Op.gt]: dayjs().format('YYYY-MM-DD HH:mm:ss') // 用dayjs统一日期格式
        }
      }
    });
    
    // 调试：打印查询结果
    console.log('Token查询结果:', trialToken ? '存在且有效' : '无效/不存在');
    
    return { valid: !!trialToken };
  } catch (error) {
    console.error('试用Token验证失败:', error);
    return { valid: false };
  }
};

/**
 * 通用Token验证
 * @param {String} authHeader 
 * @returns {Object}
 */
const verifyToken = async (authHeader) => {
  try {
    if (!authHeader) return { valid: false, userKey: null };
    
    // 调试：打印原始Authorization头
    console.log('原始Authorization头:', authHeader);
    
    // 提取Token（兼容大小写/多余空格）
    const token = authHeader.replace(/Bearer\s+/i, '').trim();
    
    // 调试：打印提取后的Token
    console.log('提取后的Token:', token);
    
    // 试用Token
    if (token.startsWith('trial_')) {
      const trialVerify = await verifyTrialToken(token);
      return { valid: trialVerify.valid, userKey: token, email: null };
    } else {
      // 正式Token
      const officialVerify = await verifyOfficialToken(token);
      return { valid: officialVerify.valid, userKey: officialVerify.userId, email: officialVerify.email };
    }
  } catch (error) {
    console.error('通用Token验证失败:', error);
    return { valid: false, userKey: null };
  }
};

module.exports = {
  verifyOfficialToken,
  verifyTrialToken,
  verifyToken
};