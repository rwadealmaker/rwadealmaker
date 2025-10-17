// src/composables/useAuth.js
import { ref, computed, onMounted } from 'vue'
import { isLoggedIn, getToken, clearAuth, setAuth } from '@/utils/auth'
import { login as apiLogin, signup as apiSignup } from '@/service/api'

export function useAuth() {
  const isAuthenticated = ref(false)
  const token = ref('')
  const loading = ref(false)

  // 初始化认证状态
  onMounted(() => {
    isAuthenticated.value = isLoggedIn()
    token.value = getToken()
  })

  // 登录函数
  const login = async (email, password) => {
    loading.value = true
    try {
      const response = await apiLogin(email, password)
      if (response.status === 0) {
        setAuth(response.token)
        isAuthenticated.value = true
        token.value = response.token
        return { success: true, message: response.message || '登录成功', token: response.token }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error?.response?.data?.message || error.message || '登录失败，请稍后重试' 
      }
    } finally {
      loading.value = false
    }
  }

  // 注册函数
  const signup = async (email, password, name) => {
    loading.value = true
    try {
      const response = await apiSignup(email, password, name)
      if (response.status === 0) {
        return { success: true, message: '注册成功，请手动登录' }
      } else {
        return { success: false, message: response.message }
      }
    } catch (error) {
      return { 
        success: false, 
        message: error?.response?.data?.message || '注册失败，请稍后重试' 
      }
    } finally {
      loading.value = false
    }
  }

  // 登出函数
  const logout = () => {
    clearAuth()
    isAuthenticated.value = false
    token.value = ''
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    token: computed(() => token.value),
    loading: computed(() => loading.value),
    login,
    signup,
    logout
  }
}
