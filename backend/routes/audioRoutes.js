const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Task = require('../models/Task');
const User = require('../models/User');
const { verifyToken } = require('../utils/tokenUtils');
const { getTrialCount, increaseTrialCount, checkMonthlyRemaining } = require('../utils/trialLimit');
const generateTaskId = require('../utils/generateTaskId');
const axios = require('axios');
const { CozeAPI } = require('@coze/api');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
require('dotenv').config();

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// 检查用户是否为 Plus 会员
const checkPlusUser = async (userKey) => {
  const user = await User.findOne({ where: { user_key: userKey } });
  return user && (user.plan === 'plus' || user.plan === 'pro');
};

// --------------------------
// 1. 调用 Coze API 并解析流式响应
// workflowType: 'basic' | 'plus' | 'regenerate'
// --------------------------
const callCozeAPI = async (params, workflowType = 'basic') => {
  try {
    // 根据工作流类型选择 ID
    let workflowId;
    switch (workflowType) {
      case 'plus':
        workflowId = process.env.COZE_PLUS_WORKFLOW_ID;
        break;
      case 'regenerate':
        workflowId = process.env.COZE_PLUS_REGENERATE_WORKFLOW_ID;
        break;
      default:
        workflowId = process.env.COZE_WORKFLOW_ID;
    }

    // 构建参数对象
    const cozeParams = {
      Unit_Topic: params.Unit_Topic,
      Core_Vocabulary: params.Core_Vocabulary,
      Text_Length: params.Text_Length,
      S_m: params.S_m || ' ',
      difficulty: params.difficulty || '3',
      speed_ratio: params.speed_ratio || '1.1',
      Factual_Information: params.Factual_Information || '0',
      Inference_Judgment: params.Inference_Judgment || '0',
      Attitude_Opinion: params.Attitude_Opinion || '0',
      Main_Idea: params.Main_Idea || '0',
      // Plus 多模态参数
      docs: params.docs || [],
      images: params.images || [],
      ppts: params.ppts || []
    };

    // 二次生成专用参数
    if (workflowType === 'regenerate') {
      cozeParams.link_of_doc = params.link_of_doc || '';
      cozeParams.reflection = params.reflection || '';
    }

    console.log(`📤 [${workflowType}] 工作流 ${workflowId} 参数:`, JSON.stringify(cozeParams, null, 2));

    // 使用 Coze SDK
    const cozeClient = new CozeAPI({
      token: process.env.COZE_TOKEN,
      baseURL: 'https://api.coze.cn'
    });

    const cozeResponse = await cozeClient.workflows.runs.create({
      workflow_id: workflowId,
      parameters: cozeParams
    });

    console.log('📥 Coze SDK 响应 code:', cozeResponse.code);

    // 解析 data 字段（是 JSON 字符串）
    let resultData = {};
    if (cozeResponse.data && typeof cozeResponse.data === 'string') {
      try {
        resultData = JSON.parse(cozeResponse.data);
        console.log('✅ 解析 resultData 成功, keys:', Object.keys(resultData));
      } catch (e) {
        console.error('❌ 解析 resultData 失败:', e.message);
      }
    }

    const audioUrl = resultData.output || '';
    const docUrl = resultData.link || '';
    const cleanedOutput = resultData.cleanedoutput || '';

    console.log('✅ 提取结果 - 音频:', audioUrl ? '有' : '无', '文档:', docUrl ? '有' : '无');
    console.log('✅ cleanedoutput 长度:', cleanedOutput.length);

    return {
      audioUrl,
      docUrl,
      cleanedOutput,
      fullContent: cleanedOutput
    };
  } catch (error) {
    console.error('Coze API 调用失败:', error);
    throw new Error('Coze API 调用失败: ' + error.message);
  }
};

// --------------------------
// 2. 生成听力材料任务（核心接口）
// --------------------------
router.post('/generate', async (req, res) => {
  try {
    // 0. 获取工作流类型（默认为基础工作流）
    const workflowType = req.body.workflowType || 'basic';
    
    // 1. Token 验证
    const authHeader = req.headers.authorization || '';
    const tokenVerify = await verifyToken(authHeader);
    if (!tokenVerify.valid) {
      return res.status(401).json({
        success: false,
        message: 'Token验证失败，请使用有效的试用Token'
      });
    }
    const userKey = tokenVerify.userKey || 'email_' + tokenVerify.email;

    // 2. Plus 版本需要检查会员资格
    if (workflowType === 'plus' || workflowType === 'regenerate') {
      const isPlusUser = await checkPlusUser(userKey);
      if (!isPlusUser) {
        return res.status(403).json({
          success: false,
          message: '此功能仅对 Plus 会员开放'
        });
      }
    }

    // 3. 获取试用次数信息
    const trialInfo = await getTrialCount(userKey);

    // 4. 检查总可用次数
    // 规则：每日3次 + 每月50次（每日用完后可以用月度抵扣）
    if (trialInfo.remaining <= 0 && trialInfo.monthlyRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: '本月试用次数已用完（每日3次 + 每月50次）'
      });
    }

    // 5. 校验前端参数
    const {
      Unit_Topic,
      Core_Vocabulary,
      Text_Length,
      S_m,
      difficulty,
      speed_ratio,
      Factual_Information,
      Inference_Judgment,
      Attitude_Opinion,
      Main_Idea
    } = req.body;

    // 基础参数校验
    if (!Unit_Topic || !Core_Vocabulary || !Text_Length) {
      return res.status(400).json({
        success: false,
        message: '单元主题、核心词汇、语料长度不能为空'
      });
    }

    // 题型参数校验
    const questionTypes = [
      { key: 'Factual_Information', count: parseInt(Factual_Information) || 0 },
      { key: 'Inference_Judgment', count: parseInt(Inference_Judgment) || 0 },
      { key: 'Attitude_Opinion', count: parseInt(Attitude_Opinion) || 0 },
      { key: 'Main_Idea', count: parseInt(Main_Idea) || 0 }
    ];

    const totalQuestions = questionTypes.reduce((sum, type) => sum + type.count, 0);
    if (totalQuestions === 0) {
      return res.status(400).json({
        success: false,
        message: '请至少选择一种题目类型并设置题量'
      });
    }

    // 6. 生成任务 ID
    const taskId = generateTaskId();

    // 7. 创建任务记录
    await Task.create({
      task_id: taskId,
      user_key: userKey,
      unit_topic: Unit_Topic,
      core_words: Core_Vocabulary,
      text_length: parseInt(Text_Length),
      question_count: totalQuestions,
      status: 'processing'
    });

    // 8. 增加试用次数
    await increaseTrialCount(userKey);

    // 9. 重新获取最新的试用次数信息（用于返回）
    const updatedTrialInfo = await getTrialCount(userKey);

    // 10. 异步调用 Coze API（根据 workflowType 选择工作流）
    (async () => {
      try {
        const cozeResult = await callCozeAPI(req.body, workflowType);
        await Task.update({
          status: 'completed',
          audio_url: cozeResult.audioUrl,
          doc_url: cozeResult.docUrl,
          coze_result: cozeResult.cleanedOutput || cozeResult.fullContent || '',
          updated_at: new Date()
        }, { where: { task_id: taskId } });
        console.log('✅ 任务完成，coze_result 长度:', (cozeResult.cleanedOutput || cozeResult.fullContent || '').length);
      } catch (error) {
        console.error('生成任务失败:', error);
        await Task.update({
          status: 'failed',
          error_msg: error.message || '生成失败',
          updated_at: new Date()
        }, { where: { task_id: taskId } });
      }
    })();

    // 11. 返回成功响应
    return res.json({
      success: true,
      message: `任务提交成功！剩余试用次数：${updatedTrialInfo.remaining}次，本月剩余：${updatedTrialInfo.monthlyRemaining}次`,
      data: {
        taskId,
        remainingTrials: updatedTrialInfo.remaining,
        monthlyRemaining: updatedTrialInfo.monthlyRemaining
      }
    });
  } catch (error) {
    console.error('生成任务失败:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// --------------------------
// 3. 查询任务状态
// --------------------------
router.get('/task/:taskId', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenVerify = await verifyToken(authHeader);
    if (!tokenVerify.valid) {
      return res.status(401).json({ success: false, message: 'Token验证失败' });
    }

    const task = await Task.findOne({ where: { task_id: req.params.taskId } });
    if (!task) {
      return res.status(404).json({ success: false, message: '任务不存在' });
    }

    return res.json({
      success: true,
      data: {
        taskId: task.task_id,
        status: task.status,
        unit_topic: task.unit_topic,
        core_words: task.core_words,
        text_length: task.text_length,
        question_count: task.question_count,
        audioUrl: task.audio_url,
        docUrl: task.doc_url,
        cleanedoutput: task.coze_result || '',
        errorMsg: task.error_msg,
        createdAt: task.created_at,
        updatedAt: task.updated_at
      }
    });
  } catch (error) {
    console.error('查询任务失败:', error);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// --------------------------
// 4. 查询剩余试用次数
// --------------------------
router.get('/trial-count', async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenVerify = await verifyToken(authHeader);
    if (!tokenVerify.valid) {
      return res.status(401).json({ success: false, message: 'Token验证失败' });
    }

    const trialInfo = await getTrialCount(tokenVerify.userKey);
    return res.json({ success: true, data: trialInfo });
  } catch (error) {
    console.error('查询试用次数失败:', error);
    return res.status(500).json({ success: false, message: '服务器内部错误' });
  }
});

// --------------------------
// 5. 上传多模态文件到 Coze（Plus 专属）
// --------------------------
router.post('/upload-multimodal', upload.single('file'), async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const tokenVerify = await verifyToken(authHeader);
    if (!tokenVerify.valid) {
      return res.status(401).json({ success: false, message: 'Token验证失败' });
    }

    // 检查用户是否为 Plus 会员
    const User = require('../models/User');
    const user = await User.findOne({ where: { user_key: tokenVerify.userKey } });
    if (!user || user.plan !== 'plus') {
      return res.status(403).json({
        success: false,
        message: '多模态上传功能仅限 Plus 会员使用'
      });
    }

    // 获取文件
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: '请上传文件' });
    }

    console.log('📤 开始上传文件到 Coze:', file.originalname);

    // 调用 Coze 文件上传 API
    const formData = new FormData();
    formData.append('file', fs.createReadStream(file.path));
    formData.append('purpose', 'assistants');  // 移除前导空格

    const cozeResponse = await axios.post(
      'https://api.coze.cn/v1/files/upload',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${process.env.COZE_TOKEN}`,
          ...formData.getHeaders()
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity
      }
    );

    console.log('📤 Coze 响应:', JSON.stringify(cozeResponse.data));

    if (cozeResponse.data.code === 0 && cozeResponse.data.data) {
      // 删除临时文件
      try {
        fs.unlinkSync(file.path);
      } catch (e) {
        console.error('删除临时文件失败:', e);
      }

      return res.json({
        success: true,
        data: {
          file_id: cozeResponse.data.data.id,
          file_name: cozeResponse.data.data.file_name
        }
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Coze 文件上传失败: ' + (cozeResponse.data.msg || '未知错误')
      });
    }
  } catch (error) {
    console.error('上传文件失败:', error);
    return res.status(500).json({
      success: false,
      message: '上传文件失败: ' + error.message
    });
  }
});

module.exports = router;

// --------------------------
// 6. Plus 用户二次生成（微调反馈）
// --------------------------
router.post('/regenerate', async (req, res) => {
  try {
    // 1. Token 验证
    const authHeader = req.headers.authorization || '';
    const tokenVerify = await verifyToken(authHeader);
    if (!tokenVerify.valid) {
      return res.status(401).json({
        success: false,
        message: 'Token验证失败'
      });
    }
    const userKey = tokenVerify.userKey || 'email_' + tokenVerify.email;

    // 2. 检查用户是否为 Plus 会员
    const User = require('../models/User');
    const user = await User.findOne({ where: { user_key: userKey } });
    if (!user || user.plan !== 'plus') {
      return res.status(403).json({
        success: false,
        message: '二次生成功能仅限 Plus 会员使用'
      });
    }

    // 3. 获取试用次数信息
    const trialInfo = await getTrialCount(userKey);
    if (trialInfo.remaining <= 0 && trialInfo.monthlyRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: '本月试用次数已用完'
      });
    }

    // 4. 校验必填参数
    const {
      Unit_Topic,
      Core_Vocabulary,
      Text_Length,
      S_m,
      difficulty,
      speed_ratio,
      Factual_Information,
      Inference_Judgment,
      Attitude_Opinion,
      Main_Idea,
      docs,
      images,
      ppts,
      link_of_doc,
      reflection
    } = req.body;

    if (!reflection || reflection.trim() === '') {
      return res.status(400).json({
        success: false,
        message: '请输入微调需求（reflection）'
      });
    }

    if (!link_of_doc) {
      return res.status(400).json({
        success: false,
        message: '缺少上一次生成的文档链接'
      });
    }

    // 5. 生成任务 ID
    const taskId = generateTaskId();

    // 6. 创建任务记录
    await Task.create({
      task_id: taskId,
      user_key: userKey,
      unit_topic: Unit_Topic || '二次生成',
      core_words: Core_Vocabulary || '',
      text_length: parseInt(Text_Length) || 0,
      question_count: parseInt(Factual_Information) + parseInt(Inference_Judgment) + parseInt(Attitude_Opinion) + parseInt(Main_Idea) || 1,
      status: 'processing'
    });

    // 7. 增加试用次数
    await increaseTrialCount(userKey);

    // 8. 异步调用 Coze API（二次生成工作流）
    (async () => {
      try {
        const cozeResult = await callCozeAPI(req.body, 'regenerate');
        await Task.update({
          status: 'completed',
          audio_url: cozeResult.audioUrl,
          doc_url: cozeResult.docUrl,
          coze_result: cozeResult.cleanedOutput || cozeResult.fullContent || '',
          updated_at: new Date()
        }, { where: { task_id: taskId } });
        console.log('✅ 二次生成完成，coze_result 长度:', (cozeResult.cleanedOutput || cozeResult.fullContent || '').length);
      } catch (error) {
        console.error('二次生成任务失败:', error);
        await Task.update({
          status: 'failed',
          error_msg: error.message || '生成失败',
          updated_at: new Date()
        }, { where: { task_id: taskId } });
      }
    })();

    // 9. 返回成功响应
    return res.json({
      success: true,
      message: '二次生成任务已提交',
      data: { taskId }
    });
  } catch (error) {
    console.error('二次生成接口错误:', error);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});