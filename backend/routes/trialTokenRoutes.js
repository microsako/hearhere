const express = require('express');
const router = express.Router();
const TrialToken = require('../models/TrialToken');

/**
 * 生成试用Token
 * POST /api/trial/generate-token
 */
router.post('/generate-token', async (req, res) => {
  try {
    // 生成试用Token
    const trialToken = `trial_${Math.random().toString(36).substring(2, 15)}${Date.now().toString(36)}`;
    
    // 保存到数据库
    const newToken = await TrialToken.create({
      token: trialToken,
      is_valid: true
    });
    
    return res.json({
      success: true,
      data: {
        token: trialToken,
        expiredAt: newToken.expired_at
      }
    });
  } catch (error) {
    console.error('生成试用Token失败:', error);
    return res.json({
      success: false,
      message: error.message || '生成试用Token失败'
    });
  }
});

module.exports = router;