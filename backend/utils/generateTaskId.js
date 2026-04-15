/**
 * 生成唯一任务ID
 * @returns {String}
 */
const generateTaskId = () => {
  const randomStr = Math.random().toString(36).substring(2, 10);
  const timestamp = Date.now().toString(36);
  return `task_${randomStr}${timestamp}`;
};

module.exports = generateTaskId;