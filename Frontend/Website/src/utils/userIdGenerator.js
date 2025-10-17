/**
 * 用户ID生成工具
 * 前端和后端共享相同的生成逻辑
 */

/**
 * 生成用户ID
 * 格式: user + 时间戳 + 随机字符串
 * @returns {string} 生成的用户ID
 */
export function generateUserId() {
  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 7);
  return `user${ts}${rand}`;
}

/**
 * 验证用户ID格式
 * @param {string} userId 用户ID
 * @returns {boolean} 是否格式正确
 */
export function validateUserId(userId) {
  if (!userId || typeof userId !== 'string') {
    return false;
  }
  
  // 检查格式: user + 数字时间戳 + 5位随机字符串
  const pattern = /^user\d{13}[a-z0-9]{5}$/;
  return pattern.test(userId);
}

/**
 * 从用户ID中提取时间戳
 * @param {string} userId 用户ID
 * @returns {number|null} 时间戳或null
 */
export function extractTimestampFromUserId(userId) {
  if (!validateUserId(userId)) {
    return null;
  }
  
  const timestampStr = userId.slice(4, 17); // 提取时间戳部分
  return parseInt(timestampStr, 10);
}

/**
 * 检查用户ID是否过期（可选功能）
 * @param {string} userId 用户ID
 * @param {number} maxAge 最大年龄（毫秒），默认7天
 * @returns {boolean} 是否过期
 */
export function isUserIdExpired(userId, maxAge = 7 * 24 * 60 * 60 * 1000) {
  const timestamp = extractTimestampFromUserId(userId);
  if (!timestamp) {
    return true; // 无效格式视为过期
  }
  
  const now = Date.now();
  return (now - timestamp) > maxAge;
}

export default {
  generateUserId,
  validateUserId,
  extractTimestampFromUserId,
  isUserIdExpired
};
