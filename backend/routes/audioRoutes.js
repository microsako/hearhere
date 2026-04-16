const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Task = require('../models/Task');
const { verifyToken } = require('../utils/tokenUtils');
const { getTrialCount, increaseTrialCount, checkMonthlyRemaining } = require('../utils/trialLimit');
const generateTaskId = require('../utils/generateTaskId');
const axios = require('axios'); // 添加 axios
require('dotenv').config();

// --------------------------
// 1. 调用 Coze API 并解析流式响应（修复版）
// --------------------------
const callCozeAPI = async (params) => {
  try {
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
      Main_Idea: params.Main_Idea || '0'
    };

    console.log('Coze Parameters:', cozeParams);

    const response = await axios({
      method: 'post',
      url: 'https://api.coze.cn/v1/workflow/stream_run',
      data: {
        workflow_id: process.env.COZE_WORKFLOW_ID,
        parameters: cozeParams
      },
      headers: {
        'Authorization': `Bearer ${process.env.COZE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
      let fullContent = '';
      
      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n');
        lines.forEach(line => {
          if (line.includes('data: ') && !line.includes('PING')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''));
              if (data.content) {
                fullContent += data.content;
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        });
      });

      response.data.on('end', () => {
        console.log('Full Content received:', fullContent.substring(0, 500) + '...');
        
        // 提取链接 - 根据你提供的格式：听力音频链接:output 和 题目、原文与解答链接：link
        let audioUrl = '';
        let docUrl = '';
        
        // 音频链接：匹配 "听力音频链接:" 或 "听力音频链接："
        const audioMatch = fullContent.match(/听力音频链接[:：]\s*(https?:\/\/[^\s\n]+)/i);
        if (audioMatch) {
          audioUrl = audioMatch[1];
        }
        
        // 文档链接：匹配 "题目、原文与解答链接：" 或 "题目、原文与解答链接:"
        const docMatch = fullContent.match(/题目、原文与解答链接[:：]\s*(https?:\/\/[^\s\n]+)/i);
        if (docMatch) {
          docUrl = docMatch[1];
        }
        
        console.log('✅ 提取结果 - 音频:', audioUrl, '文档:', docUrl);
        
        resolve({
          audioUrl: audioUrl || '',
          docUrl: docUrl || '',
          fullContent
        });
      });

      response.data.on('error', (err) => {
        console.error('Stream error:', err);
        reject(err);
      });
    });
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

    // 2. 获取试用次数信息
    const trialInfo = await getTrialCount(userKey);

    // 3. 检查总可用次数
    // 规则：每日3次 + 每月50次（每日用完后可以用月度抵扣）
    if (trialInfo.remaining <= 0 && trialInfo.monthlyRemaining <= 0) {
      return res.status(403).json({
        success: false,
        message: '本月试用次数已用完（每日3次 + 每月50次）'
      });
    }

    // 4. 校验前端参数
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

    // 4. 生成任务 ID
    const taskId = generateTaskId();

    // 5. 创建任务记录
    await Task.create({
      task_id: taskId,
      user_key: userKey,
      unit_topic: Unit_Topic,
      core_words: Core_Vocabulary,
      text_length: parseInt(Text_Length),
      question_count: totalQuestions,
      status: 'processing'
    });

    // 6. 增加试用次数
    await increaseTrialCount(userKey);

    // 7. 重新获取最新的试用次数信息（用于返回）
    const updatedTrialInfo = await getTrialCount(userKey);

    // 8. 异步调用 Coze API
    (async () => {
      try {
        const cozeResult = await callCozeAPI(req.body);
        await Task.update({
          status: 'completed',
          audio_url: cozeResult.audioUrl,
          doc_url: cozeResult.docUrl,
          coze_result: cozeResult.fullContent,
          updated_at: new Date()
        }, { where: { task_id: taskId } });
      } catch (error) {
        console.error('生成任务失败:', error);
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

module.exports = router;