// userService.js - 用户信息服务
// 管理用户信息的存储和获取

const USER_INFO_KEY = 'userInfo';
const USER_NAME_KEY = 'userName';

// 用户信息结构
const DEFAULT_USER_INFO = {
  name: '',
  email: '',
  phone: '',
  firstName: '',
  lastName: '',
  dob: '1990-01-01',
  country: 'US',
  docType: 'passport',
  agreeEmailUpdates: false
};

/**
 * 获取用户信息
 * @returns {Object} 用户信息对象
 */
export function getUserInfo() {
  try {
    const stored = localStorage.getItem(USER_INFO_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_USER_INFO, ...parsed };
    }
  } catch (error) {
    console.error('Failed to get user info:', error);
  }
  return { ...DEFAULT_USER_INFO };
}

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息对象
 */
export function setUserInfo(userInfo) {
  try {
    const merged = { ...DEFAULT_USER_INFO, ...userInfo };
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(merged));
    
    // 触发用户信息更新事件
    window.dispatchEvent(new CustomEvent('user-info-changed', { 
      detail: merged 
    }));
  } catch (error) {
    console.error('Failed to set user info:', error);
  }
}

/**
 * 获取用户名称
 * @returns {string} 用户名称
 */
export function getUserName() {
  const userInfo = getUserInfo();
  return userInfo.name || 'User';
}

/**
 * 设置用户名称
 * @param {string} name - 用户名称
 */
export function setUserName(name) {
  const userInfo = getUserInfo();
  userInfo.name = name;
  setUserInfo(userInfo);
}

/**
 * 获取用户邮箱
 * @returns {string} 用户邮箱
 */
export function getUserEmail() {
  const userInfo = getUserInfo();
  return userInfo.email || '';
}

/**
 * 设置用户邮箱
 * @param {string} email - 用户邮箱
 */
export function setUserEmail(email) {
  const userInfo = getUserInfo();
  userInfo.email = email;
  setUserInfo(userInfo);
}

/**
 * 获取用户手机号
 * @returns {string} 用户手机号
 */
export function getUserPhone() {
  const userInfo = getUserInfo();
  return userInfo.phone || '';
}

/**
 * 设置用户手机号
 * @param {string} phone - 用户手机号
 */
export function setUserPhone(phone) {
  const userInfo = getUserInfo();
  userInfo.phone = phone;
  setUserInfo(userInfo);
}

/**
 * 获取用户邮件更新偏好
 * @returns {boolean} 是否同意接收邮件更新
 */
export function getUserEmailUpdatesPreference() {
  const userInfo = getUserInfo();
  return userInfo.agreeEmailUpdates || false;
}

/**
 * 设置用户邮件更新偏好
 * @param {boolean} agree - 是否同意接收邮件更新
 */
export function setUserEmailUpdatesPreference(agree) {
  const userInfo = getUserInfo();
  userInfo.agreeEmailUpdates = agree;
  setUserInfo(userInfo);
}

/**
 * 获取用户头像首字母
 * @returns {string} 头像首字母
 */
export function getUserInitial() {
  const name = getUserName();
  return name.charAt(0).toUpperCase() || 'U';
}

/**
 * 解析用户姓名为firstName和lastName
 * @param {string} fullName - 完整姓名
 * @returns {Object} 包含firstName和lastName的对象
 */
export function parseUserName(fullName) {
  const parts = fullName.trim().split(' ');
  const firstName = parts[0] || '';
  const lastName = parts.slice(1).join(' ') || '';
  
  return { firstName, lastName };
}

/**
 * 更新用户姓名字段
 * @param {string} fullName - 完整姓名
 */
export function updateUserNameFields(fullName) {
  const userInfo = getUserInfo();
  const { firstName, lastName } = parseUserName(fullName);
  
  userInfo.name = fullName;
  userInfo.firstName = firstName;
  userInfo.lastName = lastName;
  
  setUserInfo(userInfo);
}

/**
 * 清除用户信息
 */
export function clearUserInfo() {
  localStorage.removeItem(USER_INFO_KEY);
  localStorage.removeItem(USER_NAME_KEY);
  
  // 触发用户信息清除事件
  window.dispatchEvent(new CustomEvent('user-info-changed', { 
    detail: null 
  }));
}

/**
 * 检查是否有用户信息
 * @returns {boolean} 是否有用户信息
 */
export function hasUserInfo() {
  const userInfo = getUserInfo();
  return !!(userInfo.name || userInfo.email);
}

/**
 * 从注册数据设置用户信息
 * @param {Object} signupData - 注册数据
 */
export function setUserInfoFromSignup(signupData) {
  const userInfo = {
    name: signupData.user_name || '',
    email: signupData.user_email || '',
    phone: signupData.user_phone || '',
    agreeEmailUpdates: signupData.agree_email_updates || false,
    ...parseUserName(signupData.user_name || '')
  };
  
  setUserInfo(userInfo);
}

/**
 * 从登录数据设置用户信息
 * @param {Object} loginData - 登录数据
 */
export function setUserInfoFromLogin(loginData) {
  const userInfo = getUserInfo();
  
  // 如果登录数据包含用户信息，则更新
  if (loginData.user_name) {
    userInfo.name = loginData.user_name;
    const { firstName, lastName } = parseUserName(loginData.user_name);
    userInfo.firstName = firstName;
    userInfo.lastName = lastName;
  }
  
  if (loginData.user_email) {
    userInfo.email = loginData.user_email;
  }
  
  if (loginData.user_phone) {
    userInfo.phone = loginData.user_phone;
  }
  
  setUserInfo(userInfo);
}

// 导出常量
export const USER_INFO_EVENT = 'user-info-changed';
