// projectDataService.js - 项目数据服务
// 整合项目信息管理、筛选搜索、数据同步等功能

import { productAPI } from './api'
import { useDatabaseSync } from './dataSyncService.js'

// 项目数据服务类
export class ProjectDataService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    this.projects = []
    this.currentProject = null
    this.loading = false
    this.error = null
    this.filters = {
      q: '',
      type: '',
      status: '',
      minYield: 0,
      maxYield: 20
    }
    this.syncInterval = null
  }

  // ======================== 项目数据获取 ========================

  /**
   * 获取所有项目列表
   * @param {Object} filters - 筛选条件
   * @returns {Promise<Object>} 项目列表
   */
  async getAllProjects(filters = {}) {
    try {
      this.loading = true
      this.error = null
      this.filters = { ...this.filters, ...filters }
      
      console.log('🔄 ProjectDataService: 从数据库加载项目数据...', this.filters)
      
      const response = await productAPI.getAllProducts()
      
      if (response.status === 0) {
        // 映射数据库字段到前端期望的字段名
        this.projects = (response.data || []).map(project => {
          return this.standardizeProjectData(project)
        })
        
        console.log('✅ ProjectDataService: 项目数据加载成功:', this.projects.length, '个项目')
        
        return {
          success: true,
          data: this.projects,
          count: this.projects.length
        }
      } else {
        throw new Error(response.message || '获取项目列表失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ ProjectDataService: 获取项目列表失败:', error)
      
      return {
        success: false,
        error: error.message,
        data: []
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 根据项目ID获取项目详情
   * @param {string} projectId - 项目ID
   * @returns {Promise<Object>} 项目详情
   */
  async getProjectById(projectId) {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 ProjectDataService: 获取项目详情...', { projectId })
      
      const response = await productAPI.getProductByCode(projectId)
      
      if (response.status === 0) {
        this.currentProject = this.standardizeProjectData(response.data)
        
        console.log('✅ ProjectDataService: 项目详情获取成功:', this.currentProject)
        
        return {
          success: true,
          data: this.currentProject
        }
      } else {
        throw new Error(response.message || '获取项目详情失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ ProjectDataService: 获取项目详情失败:', error)
      
      return {
        success: false,
        error: error.message,
        data: null
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 根据项目代码获取项目详情
   * @param {string} projectCode - 项目代码
   * @returns {Promise<Object>} 项目详情
   */
  async getProjectByCode(projectCode) {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 ProjectDataService: 根据代码获取项目详情...', { projectCode })
      
      const response = await productAPI.getProductByCode(projectCode)
      
      if (response.status === 0) {
        this.currentProject = this.standardizeProjectData(response.data)
        
        console.log('✅ ProjectDataService: 项目详情获取成功:', this.currentProject)
        
        return {
          success: true,
          data: this.currentProject
        }
      } else {
        throw new Error(response.message || '获取项目详情失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ ProjectDataService: 获取项目详情失败:', error)
      
      return {
        success: false,
        error: error.message,
        data: null
      }
    } finally {
      this.loading = false
    }
  }

  // ======================== 项目搜索和筛选 ========================

  /**
   * 搜索项目
   * @param {string} query - 搜索关键词
   * @returns {Array} 搜索结果
   */
  searchProjects(query) {
    if (!query || !query.trim()) {
      return this.projects
    }

    const q = query.trim().toLowerCase()
    
    return this.projects.filter(project => {
      // 搜索匹配：代码、名称、副标题、位置
      const matchCode = project.code && project.code.toLowerCase().includes(q)
      const matchName = project.name && project.name.toLowerCase().includes(q)
      const matchSubtitle = project.subtitle && project.subtitle.toLowerCase().includes(q)
      const matchLocation = project.location && project.location.toLowerCase().includes(q)
      
      return matchCode || matchName || matchSubtitle || matchLocation
    })
  }

  /**
   * 筛选项目
   * @param {Object} filters - 筛选条件
   * @returns {Array} 筛选结果
   */
  filterProjects(filters = {}) {
    const activeFilters = { ...this.filters, ...filters }
    
    return this.projects.filter(project => {
      // 搜索匹配
      const q = activeFilters.q?.trim().toLowerCase() || ''
      const matchSearch = !q || 
        (project.code && project.code.toLowerCase().includes(q)) ||
        (project.name && project.name.toLowerCase().includes(q)) ||
        (project.subtitle && project.subtitle.toLowerCase().includes(q)) ||
        (project.location && project.location.toLowerCase().includes(q))

      // 类型匹配
      const matchType = !activeFilters.type || project.type === activeFilters.type

      // 状态匹配
      const matchStatus = !activeFilters.status || project.status === activeFilters.status

      // 收益率匹配
      const estimatedYield = project.estimatedYield || 0
      const matchYield = estimatedYield >= activeFilters.minYield && 
                        estimatedYield <= activeFilters.maxYield

      return matchSearch && matchType && matchStatus && matchYield
    })
  }

  /**
   * 获取筛选后的项目列表
   * @param {Object} filters - 筛选条件
   * @returns {Array} 筛选后的项目列表
   */
  getFilteredProjects(filters = {}) {
    const filtered = this.filterProjects(filters)
    
    // 按收益率降序排序
    return filtered.sort((a, b) => {
      const yieldA = a.estimatedYield || 0
      const yieldB = b.estimatedYield || 0
      return yieldB - yieldA
    })
  }

  // ======================== 数据刷新和同步 ========================

  /**
   * 刷新项目数据
   * @param {boolean} forceRefresh - 是否强制刷新
   * @returns {Promise<Object>} 刷新结果
   */
  async refreshProjectData(forceRefresh = false) {
    try {
      console.log('🔄 ProjectDataService: 刷新项目数据...', { forceRefresh })
      
      if (this.currentProject) {
        // 刷新当前项目详情
        const result = await this.getProjectByCode(this.currentProject.code)
        return result
      } else {
        // 刷新项目列表
        const result = await this.getAllProjects()
        return result
      }

    } catch (error) {
      console.error('❌ ProjectDataService: 刷新项目数据失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * 设置数据库同步
   * @param {number} interval - 同步间隔（毫秒）
   */
  setupDatabaseSync(interval = 30000) {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }

    this.syncInterval = setInterval(async () => {
      try {
        console.log('🔄 ProjectDataService: 自动同步项目数据...')
        await this.refreshProjectData()
      } catch (error) {
        console.error('❌ ProjectDataService: 自动同步失败:', error)
      }
    }, interval)

    console.log('✅ ProjectDataService: 数据库同步已设置，间隔:', interval, 'ms')
  }

  /**
   * 停止数据库同步
   */
  stopDatabaseSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log('✅ ProjectDataService: 数据库同步已停止')
    }
  }

  // ======================== 项目状态管理 ========================

  /**
   * 更新项目状态
   * @param {string} projectCode - 项目代码
   * @param {string} status - 新状态
   * @returns {Promise<Object>} 更新结果
   */
  async updateProjectStatus(projectCode, status) {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 ProjectDataService: 更新项目状态...', { projectCode, status })
      
      const response = await fetch(`${this.baseUrl}/project/${projectCode}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ status })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.status === 0) {
        // 更新本地项目数据
        const projectIndex = this.projects.findIndex(p => p.code === projectCode)
        if (projectIndex !== -1) {
          this.projects[projectIndex].status = status
        }
        
        if (this.currentProject && this.currentProject.code === projectCode) {
          this.currentProject.status = status
        }
        
        console.log('✅ ProjectDataService: 项目状态更新成功')
        return {
          success: true,
          data: result.data
        }
      } else {
        throw new Error(result.message || '更新项目状态失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ ProjectDataService: 更新项目状态失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  // ======================== 工具方法 ========================

  /**
   * 标准化项目数据格式
   * @param {Object} rawData - 原始数据
   * @returns {Object} 标准化后的数据
   */
  standardizeProjectData(rawData) {
    return {
      // 基本信息
      id: rawData.id || rawData.project_id,
      code: rawData.project_code || rawData.code,
      name: rawData.project_name || rawData.name,
      subtitle: rawData.property_summary || rawData.subtitle || '',
      status: rawData.loan_status || rawData.status || 'INCOMING',
      
      // 财务信息
      subscribeToken: parseFloat(rawData.subscribe_token || 0),
      totalOfferingToken: parseFloat(rawData.total_offering_token || 0),
      loanAmount: parseFloat(rawData.loan_amount || 0),
      interestRate: parseFloat(rawData.interest_rate || 0),
      lvr: parseFloat(rawData.lvr || 0),
      
      // 物业信息
      location: rawData.property_location || rawData.location || '',
      state: rawData.property_state || rawData.state || '',
      type: rawData.property_type || rawData.type || '',
      value: parseFloat(rawData.property_value || 0),
      
      // 贷款信息
      loanType: rawData.loan_type || '',
      loanProduct: rawData.loan_product || '',
      loanPurpose: rawData.loan_purpose || '',
      loanTermMonths: parseInt(rawData.loan_term_months || 0),
      
      // 时间信息
      commencementDate: rawData.commencement_date || null,
      expiryDate: rawData.expiry_date || null,
      expectedRecoveryDate: rawData.expected_recovery_date || null,
      
      // 计算字段
      estimatedYield: this.calculateEstimatedYield(rawData),
      progressPercentage: this.calculateProgressPercentage(rawData),
      remainingAmount: this.calculateRemainingAmount(rawData),
      
      // 审计字段
      createdAt: rawData.created_at || null,
      updatedAt: rawData.updated_at || null,
      createdBy: rawData.created_by || null,
      updatedBy: rawData.updated_by || null
    }
  }

  /**
   * 计算预计收益率
   * @param {Object} project - 项目数据
   * @returns {number} 预计收益率
   */
  calculateEstimatedYield(project) {
    const interestRate = parseFloat(project.interest_rate || 0)
    const loanTermMonths = parseInt(project.loan_term_months || 0)
    
    if (interestRate > 0 && loanTermMonths > 0) {
      // 简单年化收益率计算
      return interestRate
    }
    
    return 0
  }

  /**
   * 计算进度百分比
   * @param {Object} project - 项目数据
   * @returns {number} 进度百分比
   */
  calculateProgressPercentage(project) {
    const subscribed = parseFloat(project.subscribe_token || 0)
    const total = parseFloat(project.total_offering_token || 0)
    
    if (total > 0) {
      return Math.min((subscribed / total) * 100, 100)
    }
    
    return 0
  }

  /**
   * 计算剩余金额
   * @param {Object} project - 项目数据
   * @returns {number} 剩余金额
   */
  calculateRemainingAmount(project) {
    const subscribed = parseFloat(project.subscribe_token || 0)
    const total = parseFloat(project.total_offering_token || 0)
    
    return Math.max(total - subscribed, 0)
  }

  // ======================== 状态获取 ========================

  /**
   * 获取当前状态
   * @returns {Object} 当前状态
   */
  getCurrentState() {
    return {
      projects: this.projects,
      currentProject: this.currentProject,
      loading: this.loading,
      error: this.error,
      filters: this.filters,
      isSyncing: !!this.syncInterval
    }
  }

  /**
   * 清除错误状态
   */
  clearError() {
    this.error = null
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.projects = []
    this.currentProject = null
    this.loading = false
    this.error = null
    this.filters = {
      q: '',
      type: '',
      status: '',
      minYield: 0,
      maxYield: 20
    }
    this.stopDatabaseSync()
  }
}

// 创建全局实例
export const projectDataService = new ProjectDataService()

// 导出便捷方法
export const {
  getAllProjects,
  getProjectById,
  getProjectByCode,
  searchProjects,
  filterProjects,
  getFilteredProjects,
  refreshProjectData,
  setupDatabaseSync,
  stopDatabaseSync,
  updateProjectStatus,
  getCurrentState,
  clearError,
  reset
} = projectDataService

export default projectDataService
