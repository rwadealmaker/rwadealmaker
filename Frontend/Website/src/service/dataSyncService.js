// dataSyncService.js - 统一数据同步服务
// 整合数据库同步、自动刷新、缓存管理、状态同步、订阅通知等功能

import { userDataService } from './userDataService'
import { projectDataService } from './projectDataService'
import { walletService } from './walletService'
import { contractService } from './contractService'

// 统一数据同步服务类
export class DataSyncService {
  constructor() {
    this.syncIntervals = new Map()
    this.isRunning = false
    this.syncConfig = {
      userData: { interval: 30000, enabled: true },
      projectData: { interval: 30000, enabled: true },
      walletData: { interval: 15000, enabled: true },
      contractData: { interval: 60000, enabled: false }
    }
    this.cache = new Map()
    this.lastSync = new Map()
    this.errorCount = new Map()
    this.maxRetries = 3
    
    // 新增：订阅者管理（从databaseSyncService整合）
    this.subscribers = new Map()
    this.lastRefreshTime = null
  }

  // ======================== 订阅通知机制 ========================

  /**
   * 订阅数据更新
   * @param {string} key - 订阅键
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  subscribe(key, callback) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set())
    }
    this.subscribers.get(key).add(callback)
    
    // 如果已有缓存数据，立即返回
    if (this.cache.has(key)) {
      const cached = this.cache.get(key)
      callback(cached.data || cached)
    }
    
    return () => this.unsubscribe(key, callback)
  }

  /**
   * 取消订阅
   * @param {string} key - 订阅键
   * @param {Function} callback - 回调函数
   */
  unsubscribe(key, callback) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).delete(callback)
      if (this.subscribers.get(key).size === 0) {
        this.subscribers.delete(key)
      }
    }
  }

  /**
   * 通知所有订阅者
   * @param {string} key - 通知键
   * @param {any} data - 数据
   */
  notify(key, data) {
    if (this.subscribers.has(key)) {
      this.subscribers.get(key).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('❌ DataSyncService: 通知订阅者失败:', error)
        }
      })
    }
  }

  // ======================== 数据同步管理 ========================

  /**
   * 开始数据同步
   * @param {Object} config - 同步配置
   * @returns {Promise<Object>} 启动结果
   */
  async startDataSync(config = {}) {
    try {
      console.log('🔄 DataSyncService: 启动数据同步服务...')
      
      // 合并配置
      this.syncConfig = { ...this.syncConfig, ...config }
      
      // 启动各项数据同步
      if (this.syncConfig.userData.enabled) {
        await this.startUserDataSync()
      }
      
      if (this.syncConfig.projectData.enabled) {
        await this.startProjectDataSync()
      }
      
      if (this.syncConfig.walletData.enabled) {
        await this.startWalletDataSync()
      }
      
      if (this.syncConfig.contractData.enabled) {
        await this.startContractDataSync()
      }
      
      this.isRunning = true
      console.log('✅ DataSyncService: 数据同步服务启动成功')
      
      return {
        success: true,
        message: '数据同步服务启动成功',
        config: this.syncConfig
      }

    } catch (error) {
      console.error('❌ DataSyncService: 启动数据同步服务失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 停止数据同步
   * @returns {Promise<Object>} 停止结果
   */
  async stopDataSync() {
    try {
      console.log('🔄 DataSyncService: 停止数据同步服务...')
      
      // 停止所有同步间隔
      for (const [key, interval] of this.syncIntervals) {
        clearInterval(interval)
        console.log(`✅ 停止 ${key} 数据同步`)
      }
      
      this.syncIntervals.clear()
      this.isRunning = false
      
      console.log('✅ DataSyncService: 数据同步服务已停止')
      
      return {
        success: true,
        message: '数据同步服务已停止'
      }

    } catch (error) {
      console.error('❌ DataSyncService: 停止数据同步服务失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======================== 用户数据同步 ========================

  /**
   * 开始用户数据同步
   * @returns {Promise<void>}
   */
  async startUserDataSync() {
    const interval = this.syncConfig.userData.interval
    
    const syncUserData = async () => {
      try {
        console.log('🔄 DataSyncService: 同步用户数据...')
        
        // 检查是否需要同步
        if (!this.shouldSync('userData')) {
          return
        }
        
        // 同步用户数据
        await this.syncUserData()
        
        // 更新最后同步时间
        this.lastSync.set('userData', Date.now())
        this.errorCount.set('userData', 0)
        
        console.log('✅ DataSyncService: 用户数据同步完成')
        
      } catch (error) {
        console.error('❌ DataSyncService: 用户数据同步失败:', error)
        this.handleSyncError('userData', error)
      }
    }
    
    // 立即执行一次
    await syncUserData()
    
    // 设置定时同步
    const intervalId = setInterval(syncUserData, interval)
    this.syncIntervals.set('userData', intervalId)
    
    console.log(`✅ DataSyncService: 用户数据同步已启动，间隔: ${interval}ms`)
  }

  /**
   * 同步用户数据
   * @returns {Promise<void>}
   */
  async syncUserData() {
    try {
      // 获取用户状态
      const userStatus = userDataService.getUserStatus()
      
      if (userStatus.isLoggedIn) {
        // 从API获取最新用户数据
        const result = await userDataService.getUserData()
        
        if (result.success) {
          // 更新缓存
          this.cache.set('userData', result.data)
          console.log('✅ 用户数据已更新到缓存')
        }
      }
      
    } catch (error) {
      console.error('❌ 同步用户数据失败:', error)
      throw error
    }
  }

  // ======================== 项目数据同步 ========================

  /**
   * 开始项目数据同步
   * @returns {Promise<void>}
   */
  async startProjectDataSync() {
    const interval = this.syncConfig.projectData.interval
    
    const syncProjectData = async () => {
      try {
        console.log('🔄 DataSyncService: 同步项目数据...')
        
        // 检查是否需要同步
        if (!this.shouldSync('projectData')) {
          return
        }
        
        // 同步项目数据
        await this.syncProjectData()
        
        // 更新最后同步时间
        this.lastSync.set('projectData', Date.now())
        this.errorCount.set('projectData', 0)
        
        console.log('✅ DataSyncService: 项目数据同步完成')
        
      } catch (error) {
        console.error('❌ DataSyncService: 项目数据同步失败:', error)
        this.handleSyncError('projectData', error)
      }
    }
    
    // 立即执行一次
    await syncProjectData()
    
    // 设置定时同步
    const intervalId = setInterval(syncProjectData, interval)
    this.syncIntervals.set('projectData', intervalId)
    
    console.log(`✅ DataSyncService: 项目数据同步已启动，间隔: ${interval}ms`)
  }

  /**
   * 同步项目数据
   * @returns {Promise<void>}
   */
  async syncProjectData() {
    try {
      // 刷新项目数据
      const result = await projectDataService.refreshProjectData()
      
      if (result.success) {
        const products = result.data || []
        
        // 更新缓存（兼容databaseSyncService的缓存格式）
        this.setCacheWithTimestamp('products', products)
        this.cache.set('projectData', products)
        
        // 通知订阅者
        this.notify('products', products)
        
        // 检查新项目并通知
        const newProjects = await this.checkForNewProjects(products)
        if (newProjects.length > 0) {
          this.notify('new_projects', newProjects)
        }
        
        console.log('✅ 项目数据已更新到缓存并通知订阅者')
      }
      
    } catch (error) {
      console.error('❌ 同步项目数据失败:', error)
      throw error
    }
  }

  // ======================== 钱包数据同步 ========================

  /**
   * 开始钱包数据同步
   * @returns {Promise<void>}
   */
  async startWalletDataSync() {
    const interval = this.syncConfig.walletData.interval
    
    const syncWalletData = async () => {
      try {
        console.log('🔄 DataSyncService: 同步钱包数据...')
        
        // 检查是否需要同步
        if (!this.shouldSync('walletData')) {
          return
        }
        
        // 同步钱包数据
        await this.syncWalletData()
        
        // 更新最后同步时间
        this.lastSync.set('walletData', Date.now())
        this.errorCount.set('walletData', 0)
        
        console.log('✅ DataSyncService: 钱包数据同步完成')
        
      } catch (error) {
        console.error('❌ DataSyncService: 钱包数据同步失败:', error)
        this.handleSyncError('walletData', error)
      }
    }
    
    // 立即执行一次
    await syncWalletData()
    
    // 设置定时同步
    const intervalId = setInterval(syncWalletData, interval)
    this.syncIntervals.set('walletData', intervalId)
    
    console.log(`✅ DataSyncService: 钱包数据同步已启动，间隔: ${interval}ms`)
  }

  /**
   * 同步钱包数据
   * @returns {Promise<void>}
   */
  async syncWalletData() {
    try {
      // 检查钱包连接状态
      const walletState = walletService.getCurrentState()
      
      if (walletState.connected) {
        // 刷新钱包数据
        await walletService.refreshAll()
        
        // 更新缓存
        this.cache.set('walletData', walletState)
        console.log('✅ 钱包数据已更新到缓存')
      }
      
    } catch (error) {
      console.error('❌ 同步钱包数据失败:', error)
      throw error
    }
  }

  // ======================== 合约数据同步 ========================

  /**
   * 开始合约数据同步
   * @returns {Promise<void>}
   */
  async startContractDataSync() {
    const interval = this.syncConfig.contractData.interval
    
    const syncContractData = async () => {
      try {
        console.log('🔄 DataSyncService: 同步合约数据...')
        
        // 检查是否需要同步
        if (!this.shouldSync('contractData')) {
          return
        }
        
        // 同步合约数据
        await this.syncContractData()
        
        // 更新最后同步时间
        this.lastSync.set('contractData', Date.now())
        this.errorCount.set('contractData', 0)
        
        console.log('✅ DataSyncService: 合约数据同步完成')
        
      } catch (error) {
        console.error('❌ DataSyncService: 合约数据同步失败:', error)
        this.handleSyncError('contractData', error)
      }
    }
    
    // 立即执行一次
    await syncContractData()
    
    // 设置定时同步
    const intervalId = setInterval(syncContractData, interval)
    this.syncIntervals.set('contractData', intervalId)
    
    console.log(`✅ DataSyncService: 合约数据同步已启动，间隔: ${interval}ms`)
  }

  /**
   * 同步合约数据
   * @returns {Promise<void>}
   */
  async syncContractData() {
    try {
      // 检查合约初始化状态
      const contractState = contractService.getCurrentState()
      
      if (contractState.isInitialized) {
        // 更新缓存
        this.cache.set('contractData', contractState)
        console.log('✅ 合约数据已更新到缓存')
      }
      
    } catch (error) {
      console.error('❌ 同步合约数据失败:', error)
      throw error
    }
  }

  // ======================== 手动同步 ========================

  /**
   * 手动同步所有数据
   * @returns {Promise<Object>} 同步结果
   */
  async syncAllData() {
    try {
      console.log('🔄 DataSyncService: 手动同步所有数据...')
      
      const results = {
        userData: { success: false, error: null },
        projectData: { success: false, error: null },
        walletData: { success: false, error: null },
        contractData: { success: false, error: null }
      }
      
      // 同步用户数据
      try {
        await this.syncUserData()
        results.userData.success = true
      } catch (error) {
        results.userData.error = error.message
      }
      
      // 同步项目数据
      try {
        await this.syncProjectData()
        results.projectData.success = true
      } catch (error) {
        results.projectData.error = error.message
      }
      
      // 同步钱包数据
      try {
        await this.syncWalletData()
        results.walletData.success = true
      } catch (error) {
        results.walletData.error = error.message
      }
      
      // 同步合约数据
      try {
        await this.syncContractData()
        results.contractData.success = true
      } catch (error) {
        results.contractData.error = error.message
      }
      
      const successCount = Object.values(results).filter(r => r.success).length
      const totalCount = Object.keys(results).length
      
      console.log(`✅ DataSyncService: 手动同步完成，成功: ${successCount}/${totalCount}`)
      
      return {
        success: successCount > 0,
        results: results,
        summary: `${successCount}/${totalCount} 项数据同步成功`
      }
      
    } catch (error) {
      console.error('❌ DataSyncService: 手动同步失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  // ======================== 缓存管理 ========================

  /**
   * 设置带时间戳的缓存数据（兼容databaseSyncService）
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   */
  setCacheWithTimestamp(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  /**
   * 获取缓存数据（兼容databaseSyncService）
   * @param {string} key - 缓存键
   * @param {number} maxAge - 最大缓存时间（毫秒），默认5分钟
   * @returns {any} 缓存数据
   */
  getCacheWithTimestamp(key, maxAge = 5 * 60 * 1000) {
    const cached = this.cache.get(key)
    if (cached && cached.timestamp) {
      // 检查缓存是否过期
      const isExpired = Date.now() - cached.timestamp > maxAge
      if (!isExpired) {
        return cached.data
      }
    }
    return null
  }

  /**
   * 检查新项目
   * @param {Array} newProducts - 新的产品列表
   * @returns {Array} 新项目列表
   */
  async checkForNewProjects(newProducts) {
    try {
      const cachedProducts = this.getCacheWithTimestamp('products') || []
      
      // 检查是否有新项目
      const newProjects = newProducts.filter(newProduct => 
        !cachedProducts.some(cached => 
          cached.code === newProduct.code || 
          cached.project_code === newProduct.project_code
        )
      )
      
      if (newProjects.length > 0) {
        console.log('🆕 DataSyncService: 发现', newProjects.length, '个新项目:', newProjects.map(p => p.code || p.project_code))
      }
      
      return newProjects
    } catch (error) {
      console.error('❌ DataSyncService: 检查新项目失败:', error)
      return []
    }
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any} 缓存数据
   */
  getCachedData(key) {
    return this.cache.get(key)
  }

  /**
   * 设置缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 数据
   */
  setCachedData(key, data) {
    this.cache.set(key, data)
  }

  /**
   * 清除缓存
   * @param {string} key - 缓存键（可选）
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key)
      console.log(`✅ 清除缓存: ${key}`)
    } else {
      this.cache.clear()
      console.log('✅ 清除所有缓存')
    }
  }

  // ======================== 工具方法 ========================

  /**
   * 检查是否应该同步
   * @param {string} dataType - 数据类型
   * @returns {boolean} 是否应该同步
   */
  shouldSync(dataType) {
    const lastSyncTime = this.lastSync.get(dataType)
    const errorCount = this.errorCount.get(dataType) || 0
    
    // 如果错误次数过多，暂停同步
    if (errorCount >= this.maxRetries) {
      console.warn(`⚠️ ${dataType} 同步错误次数过多，暂停同步`)
      return false
    }
    
    // 如果从未同步过，应该同步
    if (!lastSyncTime) {
      return true
    }
    
    // 检查同步间隔
    const interval = this.syncConfig[dataType]?.interval || 30000
    const timeSinceLastSync = Date.now() - lastSyncTime
    
    return timeSinceLastSync >= interval
  }

  /**
   * 处理同步错误
   * @param {string} dataType - 数据类型
   * @param {Error} error - 错误对象
   */
  handleSyncError(dataType, error) {
    const currentErrorCount = this.errorCount.get(dataType) || 0
    const newErrorCount = currentErrorCount + 1
    
    this.errorCount.set(dataType, newErrorCount)
    
    console.error(`❌ ${dataType} 同步错误 (${newErrorCount}/${this.maxRetries}):`, error.message)
    
    // 如果错误次数达到最大值，停止该类型的同步
    if (newErrorCount >= this.maxRetries) {
      console.error(`❌ ${dataType} 同步错误次数过多，停止同步`)
      this.stopDataTypeSync(dataType)
    }
  }

  /**
   * 停止特定类型的数据同步
   * @param {string} dataType - 数据类型
   */
  stopDataTypeSync(dataType) {
    const intervalId = this.syncIntervals.get(dataType)
    if (intervalId) {
      clearInterval(intervalId)
      this.syncIntervals.delete(dataType)
      console.log(`✅ 停止 ${dataType} 数据同步`)
    }
  }

  /**
   * 重置错误计数
   * @param {string} dataType - 数据类型
   */
  resetErrorCount(dataType) {
    this.errorCount.set(dataType, 0)
    console.log(`✅ 重置 ${dataType} 错误计数`)
  }

  // ======================== 状态获取 ========================

  /**
   * 获取同步状态
   * @returns {Object} 同步状态
   */
  getSyncStatus() {
    const status = {
      isRunning: this.isRunning,
      config: this.syncConfig,
      lastSync: Object.fromEntries(this.lastSync),
      errorCount: Object.fromEntries(this.errorCount),
      cacheSize: this.cache.size,
      activeSyncs: Array.from(this.syncIntervals.keys())
    }
    
    return status
  }

  /**
   * 获取缓存状态
   * @returns {Object} 缓存状态
   */
  getCacheStatus() {
    const cacheStatus = {}
    
    for (const [key, value] of this.cache) {
      cacheStatus[key] = {
        size: JSON.stringify(value).length,
        lastUpdated: this.lastSync.get(key) || null,
        hasData: value !== null && value !== undefined
      }
    }
    
    return cacheStatus
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.stopDataSync()
    this.cache.clear()
    this.lastSync.clear()
    this.errorCount.clear()
    this.subscribers.clear()
    this.isRunning = false
    this.lastRefreshTime = null
    console.log('✅ DataSyncService: 服务状态已重置')
  }
}

// 创建全局实例
export const dataSyncService = new DataSyncService()

// 导出便捷方法
export const {
  startDataSync,
  stopDataSync,
  syncAllData,
  getCachedData,
  setCachedData,
  clearCache,
  getSyncStatus,
  getCacheStatus,
  reset,
  subscribe,
  unsubscribe,
  notify,
  setCacheWithTimestamp,
  getCacheWithTimestamp,
  checkForNewProjects
} = dataSyncService

// 兼容databaseSyncService的接口
export const useDatabaseSync = () => {
  return {
    // 订阅产品列表更新
    subscribeProducts: (callback) => dataSyncService.subscribe('products', callback),
    
    // 订阅单个产品更新
    subscribeProduct: (code, callback) => dataSyncService.subscribe(`product_${code}`, callback),
    
    // 订阅新项目通知
    subscribeNewProjects: (callback) => dataSyncService.subscribe('new_projects', callback),
    
    // 手动刷新
    refresh: () => dataSyncService.syncAllData(),
    
    // 获取最后刷新时间
    getLastRefreshTime: () => dataSyncService.lastRefreshTime,
    
    // 检查更新
    checkForUpdates: () => dataSyncService.checkForNewProjects(dataSyncService.getCachedData('projectData') || []),
    
    // 开始自动刷新（兼容接口）
    startAutoRefresh: (interval) => dataSyncService.startDataSync({
      projectData: { interval: interval || 30000, enabled: true }
    }),
    
    // 停止自动刷新（兼容接口）
    stopAutoRefresh: () => dataSyncService.stopDataSync()
  }
}

// 创建databaseSyncService的兼容实例
export const databaseSyncService = {
  subscribe: dataSyncService.subscribe.bind(dataSyncService),
  unsubscribe: dataSyncService.unsubscribe.bind(dataSyncService),
  notify: dataSyncService.notify.bind(dataSyncService),
  setCache: dataSyncService.setCacheWithTimestamp.bind(dataSyncService),
  getCache: dataSyncService.getCacheWithTimestamp.bind(dataSyncService),
  startAutoRefresh: (interval) => dataSyncService.startDataSync({
    projectData: { interval: interval || 30000, enabled: true }
  }),
  stopAutoRefresh: () => dataSyncService.stopDataSync(),
  refresh: () => dataSyncService.syncAllData(),
  getLastRefreshTime: () => dataSyncService.lastRefreshTime,
  checkForUpdates: () => dataSyncService.checkForNewProjects(dataSyncService.getCachedData('projectData') || []),
  destroy: () => dataSyncService.reset()
}

export default dataSyncService
