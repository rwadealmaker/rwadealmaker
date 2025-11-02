/**
 * 环境变量配置
 * 统一管理所有 API 端点和环境配置
 */

// 获取基础 URL
const getBaseUrl = (): string => {
  // 在生产环境中,使用相对路径让 Vercel 自动处理
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_BASE_URL || ''
  }
  // 开发环境使用 localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

const BASE_URL = getBaseUrl()

export const API_CONFIG = {
  // 基础配置
  BASE_URL,

  // 用户相关
  USER_BASE: `${BASE_URL}/user`,
  USER_LOGIN: `${BASE_URL}/user/login`,
  USER_REGISTER: `${BASE_URL}/user/reguser`,
  USER_VERIFY_EMAIL: `${BASE_URL}/user/verify-email`,

  // 项目相关
  PROJECT_BASE: `${BASE_URL}/project`,
  PROJECT_SELECT: `${BASE_URL}/project/select`,
  PROJECT_ACTIVE: `${BASE_URL}/project/active`,
  PROJECT_INCOMING: `${BASE_URL}/project/incoming`,
  PROJECT_DEPLOY_CONTRACTS: `${BASE_URL}/project/deploy-contracts`,

  // 交易相关
  TRANSACTION_BASE: `${BASE_URL}/transaction`,

  // 订阅相关
  SUBSCRIPTION_BASE: `${BASE_URL}/api/subscriptions`,

  // 联系我们
  CONTACT: `${BASE_URL}/api/contact`,

  // 验证相关
  EMAIL_VERIFY: `${BASE_URL}/api/email/verify`,
  PHONE_VERIFY: `${BASE_URL}/api/phone/verify`,
}

/**
 * 获取项目详情 URL
 */
export const getProjectByCodeUrl = (code: string): string => {
  return `${API_CONFIG.PROJECT_SELECT}/${code}`
}

/**
 * 获取项目合约 URL
 */
export const getProjectContractsUrl = (projectCode: string): string => {
  return `${API_CONFIG.PROJECT_BASE}/${projectCode}/contracts`
}

/**
 * 获取项目订阅 URL
 */
export const getProjectSubscriptionUrl = (code: string): string => {
  return `${BASE_URL}/api/loans/${code}/subscription`
}

/**
 * 检查是否为生产环境
 */
export const isProduction = (): boolean => {
  return import.meta.env.PROD
}

/**
 * 检查是否为开发环境
 */
export const isDevelopment = (): boolean => {
  return import.meta.env.DEV
}

export default API_CONFIG
