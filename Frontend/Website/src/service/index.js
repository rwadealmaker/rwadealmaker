// service/index.js - 统一服务入口
// 导出所有整合后的服务，提供统一的API接口

// 导入所有服务
import { userDataService } from './userDataService'
import { projectDataService } from './projectDataService'
import { walletService } from './walletService'
import { contractService } from './contractService'
import { dataSyncService } from './dataSyncService'

// 导入原有服务（保持向后兼容）
import { productAPI } from './api'
import { 
  getUserInfo, 
  setUserInfo, 
  getUserName, 
  getUserEmail, 
  getUserPhone,
  clearUserInfo,
  hasUserInfo
} from './userService'
import { 
  getKycStatus, 
  setKycStatus, 
  getKycLevel, 
  setKycLevel, 
  KYC_STATUS, 
  KYC_LEVELS 
} from './kycService'
import { useDatabaseSync } from './dataSyncService.js'

// 统一服务管理器
class UnifiedServiceManager {
  constructor() {
    this.services = {
      user: userDataService,
      project: projectDataService,
      wallet: walletService,
      contract: contractService,
      sync: dataSyncService
    }
    this.initialized = false
  }

  /**
   * 初始化所有服务
   * @returns {Promise<Object>} 初始化结果
   */
  async initialize() {
    try {
      console.log('🚀 UnifiedServiceManager: 初始化所有服务...')
      
      // 启动数据同步服务
      await dataSyncService.startDataSync()
      
      this.initialized = true
      console.log('✅ UnifiedServiceManager: 所有服务初始化完成')
      
      return {
        success: true,
        message: '所有服务初始化完成'
      }
    } catch (error) {
      console.error('❌ UnifiedServiceManager: 初始化失败:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 获取服务状态
   * @returns {Object} 服务状态
   */
  getStatus() {
    return {
      initialized: this.initialized,
      services: {
        user: userDataService.getCurrentState(),
        project: projectDataService.getCurrentState(),
        wallet: walletService.getCurrentState(),
        contract: contractService.getCurrentState(),
        sync: dataSyncService.getSyncStatus()
      }
    }
  }

  /**
   * 重置所有服务
   */
  reset() {
    Object.values(this.services).forEach(service => {
      if (service.reset) {
        service.reset()
      }
    })
    this.initialized = false
    console.log('✅ UnifiedServiceManager: 所有服务已重置')
  }
}

// 创建全局服务管理器实例
export const serviceManager = new UnifiedServiceManager()

// 导出所有服务
export {
  // 新的统一服务
  userDataService,
  projectDataService,
  walletService,
  contractService,
  dataSyncService,
  
  // 原有服务（向后兼容）
  productAPI,
  getUserInfo,
  setUserInfo,
  getUserName,
  getUserEmail,
  getUserPhone,
  clearUserInfo,
  hasUserInfo,
  getKycStatus,
  setKycStatus,
  getKycLevel,
  setKycLevel,
  KYC_STATUS,
  KYC_LEVELS,
  useDatabaseSync
}

// 导出服务管理器 (已在上面导出)

// 默认导出
export default {
  userDataService,
  projectDataService,
  walletService,
  contractService,
  dataSyncService,
  serviceManager
}
