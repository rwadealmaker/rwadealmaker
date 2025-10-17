
import { KYC_CONFIG } from '@/config/contractConfig'

export const KYC_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const KYC_LEVELS = {
  LEVEL_0: 0, // 未验证
  LEVEL_1: 1, // 基础验证
  LEVEL_2: 2, // 中级验证
  LEVEL_3: 3, // 高级验证
};

const KEY = 'kycStatus';
const LEVEL_KEY = 'kycLevel';

// 获取KYC状态，如果配置为默认成功则返回已验证
export function getKycStatus() {
  // 如果配置为默认KYC成功，直接返回已验证状态
  if (KYC_CONFIG.DEFAULT_SUCCESS) {
    return KYC_STATUS.VERIFIED;
  }
  
  const v = localStorage.getItem(KEY);
  return v || KYC_STATUS.UNVERIFIED;
}

// 获取KYC级别
export function getKycLevel() {
  // 如果配置为默认KYC成功，返回配置的默认级别
  if (KYC_CONFIG.DEFAULT_SUCCESS) {
    return KYC_CONFIG.DEFAULT_LEVEL;
  }
  
  const v = localStorage.getItem(LEVEL_KEY);
  return v ? parseInt(v) : KYC_LEVELS.LEVEL_0;
}

// 设置KYC状态
export function setKycStatus(status) {
  localStorage.setItem(KEY, status);
}

// 设置KYC级别
export function setKycLevel(level) {
  localStorage.setItem(LEVEL_KEY, level.toString());
}

// 清除KYC状态
export function clearKycStatus() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(LEVEL_KEY);
}

// 检查是否已通过KYC验证
export function isKycVerified() {
  return getKycStatus() === KYC_STATUS.VERIFIED;
}

// 检查KYC级别是否满足要求
export function isKycLevelSufficient(requiredLevel = KYC_LEVELS.LEVEL_1) {
  return getKycLevel() >= requiredLevel;
}

// 模拟KYC验证（用于测试）
export function simulateKycVerification() {
  if (KYC_CONFIG.DEFAULT_SUCCESS) {
    setKycStatus(KYC_STATUS.VERIFIED);
    setKycLevel(KYC_CONFIG.DEFAULT_LEVEL);
    return {
      success: true,
      status: KYC_STATUS.VERIFIED,
      level: KYC_CONFIG.DEFAULT_LEVEL,
      message: 'KYC验证成功（默认配置）'
    };
  }
  
  // 模拟验证过程
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70%成功率
      if (success) {
        setKycStatus(KYC_STATUS.VERIFIED);
        setKycLevel(KYC_LEVELS.LEVEL_2);
        resolve({
          success: true,
          status: KYC_STATUS.VERIFIED,
          level: KYC_LEVELS.LEVEL_2,
          message: 'KYC验证成功'
        });
      } else {
        setKycStatus(KYC_STATUS.REJECTED);
        resolve({
          success: false,
          status: KYC_STATUS.REJECTED,
          message: 'KYC验证失败'
        });
      }
    }, 2000);
  });
}
