// API基础配置（复用老代码的配置）
export const API_CONFIG = {
  baseURL: 'http://118.89.119.213:3000', // 你的后端地址
  timeout: 15000,
  cozeToken: process.env.VITE_COZE_TOKEN || '', // 可选：如果前端需要直接调用Coze
};

// 试用次数限制配置
export const TRIAL_CONFIG = {
  dailyLimit: 3, // 每日试用次数
  cookieKey: 'hearhere_trial_info', // 存储试用信息的cookie键名
};