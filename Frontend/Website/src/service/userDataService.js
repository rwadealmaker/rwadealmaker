// userDataService.js - 用户数据服务
// 整合用户信息管理、状态管理、邮箱验证等功能

import { productAPI } from './api'
import { 
  getUserInfo, 
  setUserInfo, 
  getUserName, 
  getUserEmail, 
  getUserPhone,
  setUserEmail,
  setUserPhone,
  clearUserInfo,
  hasUserInfo,
  setUserInfoFromLogin,
  setUserInfoFromSignup
} from './userService'

// 用户数据服务类
export class UserDataService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
    this.userInfo = null
    this.loading = false
    this.error = null
  }

  // ======================== 用户信息获取 ========================

  /**
   * 从API获取用户信息
   * @param {string} userId - 用户ID（可选）
   * @returns {Promise<Object>} 用户信息
   */
  async getUserData(userId = null) {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 UserDataService: 开始获取用户信息...', { userId })
      
      // 如果没有提供userId，尝试从本地存储获取
      if (!userId) {
        const localUserInfo = getUserInfo()
        if (localUserInfo && localUserInfo.user_id) {
          userId = localUserInfo.user_id
        }
      }
      
      if (!userId) {
        throw new Error('用户ID未提供且本地存储中未找到')
      }

      // 构建API端点
      const endpoints = [
        `${this.baseUrl}/user/profile/${userId}`,
        `${this.baseUrl}/user/${userId}`,
        `${this.baseUrl}/profile/${userId}`
      ]

      let userData = null
      let lastError = null

      // 尝试多个端点
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 尝试端点: ${endpoint}`)
          
          const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          })

          console.log(`📡 ${endpoint} 响应状态:`, response.status)

          if (response.ok) {
            const data = await response.json()
            console.log(`✅ ${endpoint} 返回数据:`, data)
            
            // 处理不同的响应格式
            if (data.status === 0 && data.data) {
              userData = data.data
              break
            } else if (data.user_id || data.user_name) {
              userData = data
              break
            }
          }
        } catch (error) {
          console.warn(`⚠️ 端点 ${endpoint} 失败:`, error.message)
          lastError = error
        }
      }

      if (!userData) {
        throw lastError || new Error('所有API端点都无法获取用户数据')
      }

      // 标准化用户数据格式
      const standardizedUserData = this.standardizeUserData(userData)
      
      // 更新本地存储
      setUserInfo(standardizedUserData)
      
      this.userInfo = standardizedUserData
      console.log('✅ UserDataService: 用户信息获取成功:', standardizedUserData)
      
      return {
        success: true,
        data: standardizedUserData
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ UserDataService: 获取用户信息失败:', error)
      
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
   * 更新用户信息
   * @param {string} userId - 用户ID
   * @param {Object} userData - 要更新的用户数据
   * @returns {Promise<Object>} 更新结果
   */
  async updateUserData(userId, userData) {
    try {
      this.loading = true
      this.error = null
      
      console.log('🔄 UserDataService: 开始更新用户信息...', { userId, userData })
      
      const response = await fetch(`${this.baseUrl}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (result.status === 0) {
        // 更新本地存储
        const updatedUserInfo = { ...getUserInfo(), ...userData }
        setUserInfo(updatedUserInfo)
        this.userInfo = updatedUserInfo
        
        console.log('✅ UserDataService: 用户信息更新成功')
        return {
          success: true,
          data: result.data
        }
      } else {
        throw new Error(result.message || '更新失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ UserDataService: 更新用户信息失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  // ======================== 邮箱验证 ========================

  /**
   * 发送邮箱验证码
   * @param {string} email - 邮箱地址
   * @returns {Promise<Object>} 发送结果
   */
  async sendEmailVerification(email) {
    try {
      this.loading = true
      this.error = null
      
      if (!this.isValidEmail(email)) {
        throw new Error('请输入有效的邮箱地址')
      }

      console.log('🔄 UserDataService: 发送邮箱验证码...', { email })

      const response = await fetch(`${this.baseUrl}/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ user_email: email })
      })

      const data = await response.json()
      
      if (data.status === 0) {
        console.log('✅ UserDataService: 邮箱验证码发送成功')
        return {
          success: true,
          message: data.message || '验证码已发送到您的邮箱',
          code: data.code // 开发环境可能返回验证码
        }
      } else {
        throw new Error(data.message || '发送验证码失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ UserDataService: 发送邮箱验证码失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  /**
   * 验证邮箱验证码
   * @param {string} email - 邮箱地址
   * @param {string} code - 验证码
   * @returns {Promise<Object>} 验证结果
   */
  async verifyEmailCode(email, code) {
    try {
      this.loading = true
      this.error = null
      
      if (!this.isValidEmail(email)) {
        throw new Error('请输入有效的邮箱地址')
      }

      if (!code || code.length < 4) {
        throw new Error('请输入有效的验证码')
      }

      console.log('🔄 UserDataService: 验证邮箱验证码...', { email, code })

      const response = await fetch(`${this.baseUrl}/email/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          user_email: email, 
          verification_code: code 
        })
      })

      const data = await response.json()
      
      if (data.status === 0) {
        // 更新本地用户信息
        const userInfo = getUserInfo()
        userInfo.email = email
        userInfo.email_verified = true
        setUserInfo(userInfo)
        
        console.log('✅ UserDataService: 邮箱验证成功')
        return {
          success: true,
          message: data.message || '邮箱验证成功'
        }
      } else {
        throw new Error(data.message || '验证码验证失败')
      }

    } catch (error) {
      this.error = error.message
      console.error('❌ UserDataService: 验证邮箱验证码失败:', error)
      
      return {
        success: false,
        error: error.message
      }
    } finally {
      this.loading = false
    }
  }

  // ======================== 用户状态管理 ========================

  /**
   * 获取用户状态
   * @returns {Object} 用户状态信息
   */
  getUserStatus() {
    const userInfo = getUserInfo()
    return {
      isLoggedIn: hasUserInfo(),
      userName: getUserName(),
      userEmail: getUserEmail(),
      userPhone: getUserPhone(),
      emailVerified: userInfo.email_verified || false,
      kycStatus: userInfo.kyc_status || 'unverified',
      kycLevel: userInfo.kyc_level || 0,
      lastLogin: userInfo.last_login || null
    }
  }

  /**
   * 更新用户状态
   * @param {Object} status - 状态信息
   */
  updateUserStatus(status) {
    const userInfo = getUserInfo()
    const updatedInfo = { ...userInfo, ...status }
    setUserInfo(updatedInfo)
    this.userInfo = updatedInfo
  }

  /**
   * 清除用户信息
   */
  clearUserData() {
    clearUserInfo()
    this.userInfo = null
    this.error = null
  }

  // ======================== 工具方法 ========================

  /**
   * 标准化用户数据格式
   * @param {Object} rawData - 原始数据
   * @returns {Object} 标准化后的数据
   */
  standardizeUserData(rawData) {
    return {
      user_id: rawData.user_id || rawData.id || null,
      user_name: rawData.user_name || rawData.name || rawData.username || '',
      user_email: rawData.user_email || rawData.email || '',
      user_phone: rawData.user_phone || rawData.phone || '',
      user_wallet: rawData.user_wallet || rawData.wallet_address || '',
      email_verified: rawData.email_verified || false,
      kyc_status: rawData.kyc_status || 'unverified',
      kyc_level: rawData.kyc_level || 0,
      is_active: rawData.is_active !== false,
      created_at: rawData.created_at || null,
      updated_at: rawData.updated_at || null,
      last_login: rawData.last_login || null
    }
  }

  /**
   * 验证邮箱格式
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否有效
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 获取用户头像首字母
   * @returns {string} 首字母
   */
  getUserInitial() {
    const name = getUserName()
    return name.charAt(0).toUpperCase() || 'U'
  }

  // ======================== 登录相关 ========================

  /**
   * 从登录数据设置用户信息
   * @param {Object} loginData - 登录数据
   */
  setUserFromLogin(loginData) {
    setUserInfoFromLogin(loginData)
    this.userInfo = getUserInfo()
  }

  /**
   * 从注册数据设置用户信息
   * @param {Object} signupData - 注册数据
   */
  setUserFromSignup(signupData) {
    setUserInfoFromSignup(signupData)
    this.userInfo = getUserInfo()
  }
}

// 创建全局实例
export const userDataService = new UserDataService()

// 导出便捷方法
export const {
  getUserData,
  updateUserData,
  sendEmailVerification,
  verifyEmailCode,
  getUserStatus,
  updateUserStatus,
  clearUserData,
  getUserInitial
} = userDataService

export default userDataService
