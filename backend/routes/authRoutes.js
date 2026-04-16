const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { getTrialCount } = require('../utils/trialLimit');

require('dotenv').config();

// JWT Secret
const JWT_SECRET = process.env.SECRET_KEY || 'hearhere_secret_key_2024';

// 统一响应格式
const response = (res, success, data = null, message = '') => {
  return res.json({ success, data, message });
};

// POST /api/auth/register - 注册
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // 验证必填项
    if (!email || !password) {
      return response(res, false, null, '邮箱和密码不能为空');
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(res, false, null, '邮箱格式不正确');
    }

    // 验证密码长度 >= 8
    if (password.length < 8) {
      return response(res, false, null, '密码至少8位');
    }

    // 检查邮箱是否已存在
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return response(res, false, null, '该邮箱已注册');
    }

    // 创建用户
    const user = await User.create({
      email,
      password,
      username: username || email.split('@')[0],
      user_key: 'user_' + Date.now() + '_' + uuidv4().split('-')[0],
      plan: 'free',
      daily_remaining: 3,
      monthly_remaining: 50
    });

    // 生成 token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_key: user.user_key },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ 用户注册成功:', email);

    return response(res, true, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_key: user.user_key,
        plan: user.plan
      }
    }, '注册成功');

  } catch (error) {
    console.error('注册错误:', error);
    return response(res, false, null, '注册失败，请稍后重试');
  }
});

// POST /api/auth/login - 登录
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 验证必填项
    if (!email || !password) {
      return response(res, false, null, '邮箱和密码不能为空');
    }

    // 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return response(res, false, null, '邮箱或密码错误');
    }

    // 验证密码
    const isValid = await user.verifyPassword(password);
    if (!isValid) {
      return response(res, false, null, '邮箱或密码错误');
    }

    // 检查用户是否激活
    if (!user.is_active) {
      return response(res, false, null, '账号已被禁用');
    }

    // 生成 token
    const token = jwt.sign(
      { id: user.id, email: user.email, user_key: user.user_key },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ 用户登录成功:', email);

    return response(res, true, {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_key: user.user_key,
        plan: user.plan,
        daily_remaining: user.daily_remaining,
        monthly_remaining: user.monthly_remaining
      }
    }, '登录成功');

  } catch (error) {
    console.error('登录错误:', error);
    return response(res, false, null, '登录失败，请稍后重试');
  }
});

// GET /api/auth/verify - 验证 token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return response(res, false, null, '未登录');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'user_key', 'plan', 'daily_remaining', 'monthly_remaining']
    });

    if (!user) {
      return response(res, false, null, '用户不存在');
    }

    return response(res, true, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_key: user.user_key,
        plan: user.plan,
        daily_remaining: user.daily_remaining,
        monthly_remaining: user.monthly_remaining
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response(res, false, null, '登录已过期');
    }
    return response(res, false, null, '验证失败');
  }
});

// GET /api/auth/profile - 获取用户信息（含实时试用次数）
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return response(res, false, null, '未登录');
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'username', 'email', 'user_key', 'plan']
    });

    if (!user) {
      return response(res, false, null, '用户不存在');
    }

    // 获取实时试用次数（从 trial_usages 表）
    const userKey = user.user_key || 'email_' + user.email;
    const trialInfo = await getTrialCount(userKey);

    return response(res, true, {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_key: user.user_key,
        plan: user.plan
      },
      remainingDaily: trialInfo.remaining,
      remainingMonthly: trialInfo.monthlyRemaining,
      dailyLimit: trialInfo.dailyLimit
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return response(res, false, null, '登录已过期');
    }
    return response(res, false, null, '获取用户信息失败');
  }
});

module.exports = router;
