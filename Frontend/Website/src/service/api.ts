// api.ts - API服务接口

// API响应结构
interface ApiResponse<T = any> {
  status: number
  message?: string
  data?: T
}

// API完整URL配置 - 直接从环境变量获取完整URL
const getApiUrl = (envKey: string, fallback: string) => {
  const envValue = (import.meta as any).env[envKey]
  console.log(`🔍 API配置: ${envKey} = ${envValue || '未设置'}`)
  return envValue || fallback
}

// 项目API接口
export const projectAPI = {
  /**
   * 获取所有项目
   * @returns {Promise<ApiResponse>} 项目列表
   */
  async getAllProjects(status?: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 从数据库获取所有项目数据', { status })

      // 构建URL，如果有状态参数则添加查询参数
      let url = getApiUrl('VITE_API_PROJECT_URL', 'http://localhost:3000/api/project')
      if (status && status !== 'all') {
        url += `?status=${encodeURIComponent(status)}`
      }
      
      console.log('📊 API: 请求URL:', url)

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 API: 数据库返回数据:', result)

      return result
    } catch (error) {
      console.error('❌ API: 获取项目数据失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  },

  /**
   * 根据代码获取项目
   * @param {string} code - 项目代码
   * @returns {Promise<ApiResponse>} 项目详情
   */
  async getProjectByCode(code: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 从数据库根据代码获取项目:', code)

      const url = `${getApiUrl('VITE_API_PROJECT_BY_CODE_URL', 'http://localhost:3000/project/select')}/${code}`
      console.log('📊 API: 请求项目详情URL:', url)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 API: 数据库返回项目详情:', result)

      return result
    } catch (error) {
      console.error('❌ API: 获取项目详情失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  },

  /**
   * 根据项目代码获取合约地址
   * @param {string} projectCode - 项目代码
   * @returns {Promise<ApiResponse>} 合约地址信息
   */
  async getProjectContractAddresses(projectCode: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 获取项目合约地址:', projectCode)

      const response = await fetch(`${getApiUrl('VITE_API_PROJECT_URL', 'http://localhost:3000/api/project')}/${projectCode}/contracts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 API: 数据库返回合约地址:', result)

      return result
    } catch (error) {
      console.error('❌ API: 获取项目合约地址失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  },

  /**
   * 搜索项目
   * @param {string} query - 搜索关键词
   * @returns {Promise<ApiResponse>} 搜索结果
   */
  async searchProjects(query: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 搜索项目:', query)

      // 先获取所有项目，然后在前端进行搜索过滤
      const allProjectsResponse = await this.getAllProjects()

      if (allProjectsResponse.status !== 0) {
        return allProjectsResponse
      }

      const projects = allProjectsResponse.data || []

      if (!query || query.trim() === '') {
        return {
          status: 0,
          message: 'Success',
          data: projects
        }
      }

      const filteredProjects = projects.filter(project => {
        const searchTerm = query.toLowerCase()
        return (
          project.code.toLowerCase().includes(searchTerm) ||
          project.name.toLowerCase().includes(searchTerm) ||
          project.propertyLocation.toLowerCase().includes(searchTerm) ||
          project.propertyState.toLowerCase().includes(searchTerm)
        )
      })

      return {
        status: 0,
        message: 'Success',
        data: filteredProjects
      }
    } catch (error) {
      console.error('❌ API: 搜索项目失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  },

  /**
   * 根据类型过滤项目
   * @param {string} type - 项目类型
   * @returns {Promise<ApiResponse>} 过滤结果
   */
  async getProjectsByType(type: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 根据类型获取项目:', type)

      // 先获取所有项目，然后在前端进行类型过滤
      const allProjectsResponse = await this.getAllProjects()

      if (allProjectsResponse.status !== 0) {
        return allProjectsResponse
      }

      const projects = allProjectsResponse.data || []

      if (!type || type === 'all') {
        return {
          status: 0,
          message: 'Success',
          data: projects
        }
      }

      const filteredProjects = projects.filter(project => project.propertyType === type)

      return {
        status: 0,
        message: 'Success',
        data: filteredProjects
      }
    } catch (error) {
      console.error('❌ API: 根据类型获取项目失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  },

  /**
   * 根据状态过滤项目
   * @param {string} status - 项目状态
   * @returns {Promise<ApiResponse>} 过滤结果
   */
  async getProjectsByStatus(status: string): Promise<ApiResponse> {
    try {
      console.log('📊 API: 根据状态获取项目:', status)

      // 先获取所有项目，然后在前端进行状态过滤
      const allProjectsResponse = await this.getAllProjects()

      if (allProjectsResponse.status !== 0) {
        return allProjectsResponse
      }

      const projects = allProjectsResponse.data || []

      if (!status || status === 'all') {
        return {
          status: 0,
          message: 'Success',
          data: projects
        }
      }

      const filteredProjects = projects.filter(project => project.status === status)

      return {
        status: 0,
        message: 'Success',
        data: filteredProjects
      }
    } catch (error) {
      console.error('❌ API: 根据状态获取项目失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  },

  /**
   * 更新项目订阅信息
   * @param {string} code - 项目代码
   * @param {object} subscriptionData - 订阅数据
   * @returns {Promise<ApiResponse>} 更新结果
   */
  async updateProjectSubscription(code: string, subscriptionData: any): Promise<ApiResponse> {
    try {
      console.log('📊 API: 更新项目订阅信息:', code, subscriptionData)

      // 转换字段名以匹配后端API
      const apiData = {
        subscribe_token: subscriptionData.subscribed || subscriptionData.subscribe_token
      }

      const response = await fetch(`${getApiUrl('VITE_API_PROJECT_SUBSCRIPTION_URL', 'http://localhost:3000/api/loans')}/${code}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 API: 数据库更新订阅信息结果:', result)

      return result
    } catch (error) {
      console.error('❌ API: 更新项目订阅信息失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }
}

// 用户API接口
export const userAPI = {
  /**
   * 获取用户信息（从localStorage）
   * @returns {Promise<ApiResponse>} 用户信息
   */
  async getUserInfo(): Promise<ApiResponse> {
    try {
      console.log('📊 API: 获取用户信息')

      // 模拟API延迟
      await new Promise(resolve => setTimeout(resolve, 50))

      // 从localStorage获取用户信息
      const userInfo = localStorage.getItem('userInfo')
      const parsedUserInfo = userInfo ? JSON.parse(userInfo) : null

      return {
        status: 0,
        message: 'Success',
        data: parsedUserInfo
      }
    } catch (error) {
      console.error('❌ API: 获取用户信息失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  },

  /**
   * 从服务器获取用户信息（包含user_id）
   * @returns {Promise<ApiResponse>} 用户信息
   */
  async getUserInfoFromServer(): Promise<ApiResponse> {
    try {
      console.log('📊 API: 从服务器获取用户信息')

      // 获取认证token
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('未找到认证token')
      }

      const response = await fetch(getApiUrl('VITE_API_USER_URL', 'http://localhost:3000/user'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('📊 API: 服务器返回用户信息:', result)
      console.log('🔍 API: user_id字段:', result.data?.user_id)
      console.log('🔍 API: id字段:', result.data?.id)

      return result
    } catch (error) {
      console.error('❌ API: 从服务器获取用户信息失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }
}

// 认证API接口
export const login = async (email: string, password: string): Promise<ApiResponse> => {
  try {
    console.log('🔐 API: 用户登录:', email)

    const response = await fetch(getApiUrl('VITE_API_LOGIN_URL', 'http://localhost:3000/user/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('🔐 API: 登录结果:', result)

    if (result.status === 0 && result.data) {
      // 存储到localStorage
      localStorage.setItem('userInfo', JSON.stringify(result.data.user))
      localStorage.setItem('authToken', result.data.token)
    }

    return result
  } catch (error) {
    console.error('❌ API: 登录失败:', error)
    return {
      status: 1,
      message: error instanceof Error ? error.message : 'Login failed',
      data: null
    }
  }
}

export const signup = async (userData: any): Promise<ApiResponse> => {
  try {
    console.log('📝 API: 用户注册:', userData)

    const response = await fetch(getApiUrl('VITE_API_REGISTER_URL', 'http://localhost:3000/user/reguser'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    console.log('📝 API: 注册结果:', result)

    if (result.status === 0 && result.data) {
      // 存储到localStorage
      localStorage.setItem('userInfo', JSON.stringify(result.data))
      localStorage.setItem('authToken', result.data.token)
    }

    return result
  } catch (error) {
    console.error('❌ API: 注册失败:', error)
    return {
      status: 1,
      message: error instanceof Error ? error.message : 'Registration failed',
      data: null
    }
  }
}

// 向后兼容的产品API别名
export const productAPI = {
  ...projectAPI,
  // 添加向后兼容的方法名
  getAllProducts: projectAPI.getAllProjects,
  getProductByCode: projectAPI.getProjectByCode,
  updateProductSubscription: projectAPI.updateProjectSubscription
}

// 交易API接口
export const transactionAPI = {
  /**
   * 保存交易历史
   * @param {Object} transactionData 交易数据
   * @returns {Promise<ApiResponse>} 保存结果
   */
  async saveTransactionHistory(transactionData: any): Promise<ApiResponse> {
    try {
      console.log('💾 TransactionAPI: 保存交易历史', transactionData)

      const response = await fetch(getApiUrl('VITE_API_TRANSACTION_URL', 'http://localhost:3000/api/transaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('TransactionAPI: 保存交易历史成功:', result)

      return result
    } catch (error) {
      console.error('TransactionAPI: 保存交易历史失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  },

  /**
   * 获取交易历史
   * @param {Object} params 查询参数
   * @returns {Promise<ApiResponse>} 交易历史列表
   */
  async getTransactionHistory(params: any = {}): Promise<ApiResponse> {
    try {
      console.log('📊 TransactionAPI: 获取交易历史', params)

      // 构建查询参数
      const queryParams = new URLSearchParams()
      if (params.userAddress) queryParams.append('userAddress', params.userAddress)
      if (params.projectCode) queryParams.append('projectCode', params.projectCode)
      if (params.limit) queryParams.append('limit', params.limit.toString())
      if (params.offset) queryParams.append('offset', params.offset.toString())

      const url = `${getApiUrl('VITE_API_TRANSACTION_URL', 'http://localhost:3000/transaction')}?${queryParams.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('TransactionAPI: 获取交易历史成功:', result)

      return result
    } catch (error) {
      console.error('TransactionAPI: 获取交易历史失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: []
      }
    }
  },

  /**
   * 部署智能合约并处理认购
   * @param {Object} contractData 合约部署数据
   * @returns {Promise<ApiResponse>} 部署结果
   */
  async deploySmartContracts(contractData: any): Promise<ApiResponse> {
    try {
      console.log('TransactionAPI: 部署智能合约', contractData)

      const response = await fetch(getApiUrl('VITE_API_PROJECT_URL', 'http://localhost:3000/api/project') + '/deploy-contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contractData)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log('TransactionAPI: 部署智能合约成功:', result)

      return result
    } catch (error) {
      console.error('TransactionAPI: 部署智能合约失败:', error)
      return {
        status: 1,
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      }
    }
  }
}

// 默认导出
export default {
  projectAPI,
  productAPI, // 向后兼容
  userAPI,
  transactionAPI
}
