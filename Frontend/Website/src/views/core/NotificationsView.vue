<template>
  <div class="notifications-page">
    <div class="page-header">
      <h1 class="page-title">{{ t('notifications.title') }}</h1>
      <div class="header-actions">
        <button 
          v-if="notifications.length > 0" 
          class="btn danger" 
          @click="clearAllNotifications"
          :disabled="loading"
        >
          {{ t('notifications.clearAll') }}
        </button>
        <button 
          v-if="unreadCount > 0" 
          class="btn light" 
          @click="markAllAsRead"
          :disabled="loading"
        >
          {{ t('notifications.markAllRead') }}
        </button>
        <button class="btn primary" @click="refreshNotifications" :disabled="loading">
          <span v-if="loading">🔄</span>
          <span v-else>{{ t('notifications.refresh') }}</span>
        </button>
      </div>
    </div>

    <!-- 过滤器 -->
    <div class="filters-section">
      <div class="filter-tabs">
        <button 
          class="filter-tab" 
          :class="{ active: filterType === 'all' }"
          @click="filterType = 'all'"
        >
          {{ t('notifications.all') }} ({{ notifications.length }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filterType === 'unread' }"
          @click="filterType = 'unread'"
        >
          {{ t('notifications.unread') }} ({{ unreadCount }})
        </button>
        <button 
          class="filter-tab" 
          :class="{ active: filterType === 'read' }"
          @click="filterType = 'read'"
        >
          {{ t('notifications.read') }} ({{ readCount }})
        </button>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="notifications-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>{{ t('notifications.loading') }}</p>
      </div>

      <div v-else-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h3>{{ t('notifications.noNotifications') }}</h3>
        <p>{{ t('notifications.noNotificationsDesc') }}</p>
      </div>

      <div v-else class="notifications-list">
        <div 
          v-for="notification in paginatedNotifications" 
          :key="notification.id"
          class="notification-item"
          :class="{ 
            unread: !notification.read,
            [notification.type]: true 
          }"
          @click="handleNotificationClick(notification)"
        >
          <!-- <div class="notification-icon">
            <span v-if="notification.type === 'success'">✅</span>
            <span v-else-if="notification.type === 'warning'">⚠️</span>
            <span v-else-if="notification.type === 'error'">❌</span>
            <span v-else-if="notification.type === 'info'">ℹ️</span>
            <span v-else-if="notification.type === 'payment'">💳</span>
            <span v-else>📢</span>
          </div> -->
          
          <div class="notification-content">
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
            </div>
            <p class="notification-message">{{ notification.message }}</p>
            <div v-if="notification.action_url" class="notification-action">
              <router-link :to="notification.action_url" class="action-link">
                {{ notification.action_text || t('notifications.viewDetails') }}
              </router-link>
            </div>
          </div>

          <div class="notification-status">
            <button 
              v-if="!notification.read"
              class="mark-read-btn"
              @click.stop="markAsRead(notification.id)"
              :title="t('notifications.markAsRead')"
            >
              <span class="unread-dot"></span>
            </button>
            <button 
              class="delete-btn"
              @click.stop="deleteNotification(notification.id)"
              :title="t('notifications.delete')"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="btn-small" 
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          {{ t('notifications.previous') }}
        </button>
        <span class="page-info">
          {{ t('notifications.page') }} {{ currentPage }} / {{ totalPages }}
        </span>
        <button 
          class="btn-small" 
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          {{ t('notifications.next') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useLanguage } from '@/composables/useLanguage'
import { ethers } from 'ethers'

const router = useRouter()
const { t, currentLanguage } = useLanguage()

// 响应式数据
const notifications = ref([])
const loading = ref(false)
const filterType = ref('all') // all, unread, read
const clearTimestamp = ref(null) // 一键删除的时间戳

// 分页
const currentPage = ref(1)
const itemsPerPage = ref(10)

// 计算属性
const unreadCount = computed(() => 
  notifications.value.filter(n => !n.read).length
)

const readCount = computed(() => 
  notifications.value.filter(n => n.read).length
)

const filteredNotifications = computed(() => {
  let filtered = notifications.value
  
  // 如果设置了清除时间戳，过滤掉该时间戳之前的所有通知
  if (clearTimestamp.value) {
    filtered = filtered.filter(n => new Date(n.created_at) > new Date(clearTimestamp.value))
  }
  
  // 根据类型过滤
  if (filterType.value === 'unread') {
    filtered = filtered.filter(n => !n.read)
  } else if (filterType.value === 'read') {
    filtered = filtered.filter(n => n.read)
  }
  
  return filtered
})

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredNotifications.value.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage.value)
})

// 方法
const loadNotifications = async () => {
  try {
    loading.value = true
    console.log('📋 加载通知...')
    
    // 加载保存的清除时间戳
    const savedClearTimestamp = localStorage.getItem('notification_clear_timestamp')
    if (savedClearTimestamp) {
      clearTimestamp.value = savedClearTimestamp
      console.log('📅 加载清除时间戳:', savedClearTimestamp)
    }
    
    // 获取用户钱包地址
    const userWallet = localStorage.getItem('walletAddress')
    const userId = localStorage.getItem('userId')
    
    if (!userWallet && !userId) {
      console.warn('⚠️ 未找到用户信息，使用模拟数据')
      notifications.value = generateMockNotifications()
      return
    }
    
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const params = new URLSearchParams()
      if (userWallet) params.append('user_wallet_address', userWallet)
      if (userId) params.append('user_id', userId)
      
      const response = await fetch(`${apiUrl}/api/subscriptions/notifications/list?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.status === 0 && result.data.notifications) {
          // 转换API数据到前端格式
          notifications.value = result.data.notifications.map(n => ({
            id: n.id,
            type: mapNotificationType(n.type),
            title: n.title,
            message: n.body,
            action_url: getActionUrl(n),
            action_text: getActionText(n),
            read: n.is_read === 1,
            created_at: n.created_at,
            subscription_id: n.subscription_id,
            payload: n.payload
          }))
          console.log('✅ 成功加载通知:', notifications.value.length, '条')
        } else {
          throw new Error(result.message || '获取通知失败')
        }
      } else {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    } catch (apiError) {
      console.error('❌ API调用失败，使用模拟数据:', apiError)
      notifications.value = generateMockNotifications()
    }
    
  } catch (error) {
    console.error('❌ 加载通知失败:', error)
    notifications.value = []
  } finally {
    loading.value = false
  }
}

// 映射通知类型
const mapNotificationType = (apiType) => {
  const typeMap = {
    'SUBMITTED': 'info',
    'STATUS_CHANGED': 'info',
    'PAYMENT_REQUIRED': 'warning',
    'PAYMENT_SUBMITTED': 'info',
    'PAYMENT_CONFIRMED': 'success',
    'COMPLETED': 'success',
    'TRANSACTION_SUCCESS': 'success',
    'NEW_PROJECT_LAUNCHED': 'info',
    'SUBSCRIPTION_PROGRESS': 'info',
    'KYC_STATUS_UPDATE': 'info',
    'WHITELIST_STATUS_UPDATE': 'info',
    'PRINCIPAL_TOKEN_RECEIVED': 'success',
    'INTEREST_TOKEN_RECEIVED': 'success',
    'PROJECT_MATURITY': 'warning',
    'SUBSCRIPTION_APPLIED': 'info',
    'SUBSCRIPTION_UNDER_REVIEW': 'info',
    'SUBSCRIPTION_APPROVED': 'success'
  }
  return typeMap[apiType] || 'info'
}

// 获取操作URL
const getActionUrl = (notification) => {
  if (!notification.payload) return null
  
  const payload = typeof notification.payload === 'string' 
    ? JSON.parse(notification.payload) 
    : notification.payload
  
  // 支付相关通知
  if (notification.type === 'PAYMENT_REQUIRED' || notification.type === 'SUBSCRIPTION_APPROVED') {
    return `/subscription/${notification.subscription_id}/payment`
  }
  
  // 交易成功通知
  if (notification.type === 'TRANSACTION_SUCCESS') {
    return `/portfolio` // 交易成功后跳转到投资组合页面
  }
  
  // 新项目上线通知
  if (notification.type === 'NEW_PROJECT_LAUNCHED') {
    return `/projects/${payload.project_id || ''}` // 跳转到项目详情页
  }
  
  // 认购进度通知
  if (notification.type === 'SUBSCRIPTION_PROGRESS') {
    return `/projects/${payload.project_id || ''}` // 跳转到项目详情页
  }
  
  // KYC状态更新通知
  if (notification.type === 'KYC_STATUS_UPDATE') {
    return `/profile` // 跳转到个人资料页面
  }
  
  // 白名单状态更新通知
  if (notification.type === 'WHITELIST_STATUS_UPDATE') {
    return `/profile` // 跳转到个人资料页面
  }
  
  // Token接收通知
  if (notification.type === 'PRINCIPAL_TOKEN_RECEIVED' || notification.type === 'INTEREST_TOKEN_RECEIVED') {
    return `/portfolio` // 跳转到投资组合页面
  }
  
  // 项目到期通知
  if (notification.type === 'PROJECT_MATURITY') {
    return `/subscription/${notification.subscription_id}` // 跳转到认购详情页
  }
  
  // 认购状态变更通知
  if (notification.type === 'SUBSCRIPTION_APPLIED' || notification.type === 'SUBSCRIPTION_UNDER_REVIEW') {
    return `/subscription/${notification.subscription_id}` // 跳转到认购详情页
  }
  
  // 默认跳转到认购详情页
  if (notification.subscription_id) {
    return `/subscription/${notification.subscription_id}`
  }
  
  return null
}

// 获取操作文本
const getActionText = (notification) => {
  // 支付相关通知
  if (notification.type === 'PAYMENT_REQUIRED' || notification.type === 'SUBSCRIPTION_APPROVED') {
    return t('notifications.actions.payNow')
  }
  
  // 交易成功通知
  if (notification.type === 'TRANSACTION_SUCCESS') {
    return t('notifications.actions.viewPortfolio')
  }
  
  // 新项目上线通知
  if (notification.type === 'NEW_PROJECT_LAUNCHED') {
    return t('notifications.actions.viewProject')
  }
  
  // 认购进度通知
  if (notification.type === 'SUBSCRIPTION_PROGRESS') {
    return t('notifications.actions.viewProject')
  }
  
  // KYC状态更新通知
  if (notification.type === 'KYC_STATUS_UPDATE') {
    return t('notifications.actions.viewProfile')
  }
  
  // 白名单状态更新通知
  if (notification.type === 'WHITELIST_STATUS_UPDATE') {
    return t('notifications.actions.viewProfile')
  }
  
  // Token接收通知
  if (notification.type === 'PRINCIPAL_TOKEN_RECEIVED' || notification.type === 'INTEREST_TOKEN_RECEIVED') {
    return t('notifications.actions.viewPortfolio')
  }
  
  // 项目到期通知
  if (notification.type === 'PROJECT_MATURITY') {
    return t('notifications.actions.viewDetails')
  }
  
  // 认购状态变更通知
  if (notification.type === 'SUBSCRIPTION_APPLIED' || notification.type === 'SUBSCRIPTION_UNDER_REVIEW') {
    return t('notifications.actions.viewDetails')
  }
  
  // 默认按钮文本
  if (notification.subscription_id) {
    return t('notifications.actions.viewDetails')
  }
  
  return null
}

const generateMockNotifications = () => {
  const isZh = currentLanguage.value === 'zh'
  
  return [
    {
      id: 1,
      type: 'success',
      title: isZh ? '交易成功完成' : 'Transaction Successfully Completed',
      message: isZh ? 
        '🎉 恭喜！您的MetaMask支付交易已成功完成，认购申请已全部处理完成。您已成功认购1000个代币，可以点击查看详情。' :
        '🎉 Congratulations! Your MetaMask payment transaction has been successfully completed. Your subscription application has been fully processed. You have successfully subscribed to 1000 tokens. Click to view details.',
      action_url: '/portfolio',
      action_text: isZh ? '查看投资组合' : 'View Portfolio',
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      type: 'info',
      title: isZh ? '新项目上线' : 'New Project Launched',
      message: isZh ? 
        '🎉 新项目"优质房地产投资"已上线！年化收益率8.5%，立即查看详情。' :
        '🎉 New project "Premium Real Estate Investment" has been launched! Annual yield 8.5%, view details now.',
      action_url: '/projects/1',
      action_text: isZh ? '查看项目' : 'View Project',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'info',
      title: isZh ? '认购进度更新' : 'Subscription Progress Update',
      message: isZh ? 
        '项目"绿色能源基金"认购进度已达75%，还有25%即可满额。' :
        'Project "Green Energy Fund" subscription progress has reached 75%, only 25% left to be fully subscribed.',
      action_url: '/projects/2',
      action_text: isZh ? '查看项目' : 'View Project',
      read: false,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      type: 'success',
      title: isZh ? 'KYC验证成功' : 'KYC Verification Successful',
      message: isZh ? 
        '🎉 恭喜！您的KYC验证已通过，当前等级：Level 2' :
        '🎉 Congratulations! Your KYC verification has been approved. Current level: Level 2',
      action_url: '/profile',
      action_text: isZh ? '查看资料' : 'View Profile',
      read: true,
      created_at: new Date(Date.now() - 10800000).toISOString()
    },
    {
      id: 5,
      type: 'success',
      title: isZh ? '白名单申请通过' : 'Whitelist Application Approved',
      message: isZh ? 
        '🎉 恭喜！您的白名单申请已通过，现在可以参与更多投资项目。' :
        '🎉 Congratulations! Your whitelist application has been approved. You can now participate in more investment projects.',
      action_url: '/profile',
      action_text: isZh ? '查看资料' : 'View Profile',
      read: true,
      created_at: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 6,
      type: 'success',
      title: isZh ? '收到利息token' : 'Interest Token Received',
      message: isZh ? 
        '💎 您已收到项目"基础设施基金"的利息token 50个，收益已到账！' :
        '💎 You have received 50 interest tokens from project "Infrastructure Fund". Returns are now available!',
      action_url: '/portfolio',
      action_text: isZh ? '查看投资组合' : 'View Portfolio',
      read: false,
      created_at: new Date(Date.now() - 18000000).toISOString()
    },
    {
      id: 7,
      type: 'warning',
      title: isZh ? '项目即将到期' : 'Project Maturity Reminder',
      message: isZh ? 
        '⏰ 项目"企业债券投资"即将到期，请关注本金和收益返还。' :
        '⏰ Project "Corporate Bond Investment" is about to mature. Please pay attention to principal and return.',
      action_url: '/subscription/3',
      action_text: isZh ? '查看详情' : 'View Details',
      read: false,
      created_at: new Date(Date.now() - 21600000).toISOString()
    },
    {
      id: 8,
      type: 'info',
      title: isZh ? '认购申请已提交' : 'Subscription Applied',
      message: isZh ? 
        '您的"科技创新基金"项目认购申请已成功提交，等待管理员审核。' :
        'Your subscription application for "Tech Innovation Fund" has been successfully submitted, waiting for admin review.',
      action_url: '/subscription/4',
      action_text: isZh ? '查看详情' : 'View Details',
      read: true,
      created_at: new Date(Date.now() - 25200000).toISOString()
    },
    {
      id: 2,
      type: 'info',
      title: 'KYC验证提醒',
      message: '您的KYC验证即将过期，请及时更新您的身份信息。',
      action_url: '/profile',
      action_text: '前往更新',
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'success',
      title: '白名单申请通过',
      message: '恭喜！您已成功加入白名单，现在可以参与所有项目的认购。',
      action_url: '/listedprojects',
      action_text: '浏览项目',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 4,
      type: 'info',
      title: '新项目上线',
      message: '新的房地产代币化项目 YYD 已上线，年化收益率8.5%，欢迎查看。',
      action_url: '/trade/YYD',
      action_text: '查看项目',
      read: true,
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 5,
      type: 'warning',
      title: '账户安全提醒',
      message: '检测到您的账户在新设备上登录，如非本人操作请及时修改密码。',
      action_url: '/settings',
      action_text: '安全设置',
      read: true,
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 6,
      type: 'success',
      title: '收益已到账',
      message: '您的项目 RWAT0001 本月收益 AUD 85.00 已到账。',
      action_url: '/portfolio',
      action_text: '查看详情',
      read: true,
      created_at: new Date(Date.now() - 345600000).toISOString()
    },
    {
      id: 7,
      type: 'info',
      title: '系统维护通知',
      message: '系统将于本周六凌晨2:00-4:00进行维护升级，届时部分功能可能暂时无法使用。',
      read: true,
      created_at: new Date(Date.now() - 432000000).toISOString()
    },
    {
      id: 8,
      type: 'error',
      title: '认购申请被拒绝',
      message: '您的项目 SQNB 认购申请未通过审核，原因：资料不完整。',
      action_url: '/profile',
      action_text: '补充资料',
      read: true,
      created_at: new Date(Date.now() - 518400000).toISOString()
    }
  ]
}

const refreshNotifications = async () => {
  currentPage.value = 1
  await loadNotifications()
}

const markAsRead = async (notificationId) => {
  try {
    console.log('✅ 标记通知为已读:', notificationId)
    
    // 调用API标记为已读
    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
      const response = await fetch(`${apiUrl}/api/subscriptions/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        console.log('✅ 通知已标记为已读')
      }
    } catch (apiError) {
      console.error('❌ API调用失败:', apiError)
    }
    
    // 更新本地状态
    const notification = notifications.value.find(n => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  } catch (error) {
    console.error('❌ 标记通知失败:', error)
  }
}

const markAllAsRead = async () => {
  try {
    loading.value = true
    console.log('✅ 标记所有通知为已读')
    
    // TODO: 调用API标记所有为已读
    // await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/read-all`, {
    //   method: 'PUT'
    // })
    
    notifications.value.forEach(n => {
      n.read = true
    })
  } catch (error) {
    console.error('❌ 标记所有通知失败:', error)
  } finally {
    loading.value = false
  }
}

const clearAllNotifications = async () => {
  try {
    loading.value = true
    console.log('🗑️ 一键删除所有通知')
    
    // 确认对话框
    const confirmed = confirm(t('notifications.clearAllConfirm'))
    if (!confirmed) {
      loading.value = false
      return
    }
    
    // 记录当前时间戳
    const currentTime = new Date().toISOString()
    clearTimestamp.value = currentTime
    
    // 保存到localStorage
    localStorage.setItem('notification_clear_timestamp', currentTime)
    
    // 调用API更新删除时间戳（如果后端支持）
    try {
      const userWallet = localStorage.getItem('walletAddress')
      const userId = localStorage.getItem('userId')
      
      if (userWallet || userId) {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        const params = new URLSearchParams()
        if (userWallet) params.append('user_wallet_address', userWallet)
        if (userId) params.append('user_id', userId)
        
        await fetch(`${apiUrl}/api/subscriptions/notifications/clear?${params}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            clear_timestamp: currentTime
          })
        })
      }
    } catch (apiError) {
      console.error('❌ API调用失败，但本地删除仍然有效:', apiError)
    }
    
    console.log('✅ 通知已清除，清除时间戳:', currentTime)
    
  } catch (error) {
    console.error('❌ 一键删除通知失败:', error)
  } finally {
    loading.value = false
  }
}

const deleteNotification = async (notificationId) => {
  try {
    console.log('🗑️ 删除通知:', notificationId)
    
    // TODO: 调用API删除通知
    // await fetch(`${import.meta.env.VITE_API_URL}/api/notifications/${notificationId}`, {
    //   method: 'DELETE'
    // })
    
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  } catch (error) {
    console.error('❌ 删除通知失败:', error)
  }
}

const handleNotificationClick = (notification) => {
  if (!notification.read) {
    markAsRead(notification.id)
  }
  
  // 特殊处理支付通知
  if (notification.action_url === `/subscription/${notification.subscription_id}/payment`) {
    handlePaymentNotification(notification)
    return
  }
  
  if (notification.action_url) {
    router.push(notification.action_url)
  }
}

// 处理支付通知 - 调用MetaMask支付
const handlePaymentNotification = async (notification) => {
  try {
    const payload = typeof notification.payload === 'string' 
      ? JSON.parse(notification.payload) 
      : notification.payload
    
    // 获取认购详情
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/subscriptions/${notification.subscription_id}`)
    
    if (!response.ok) {
      throw new Error('无法获取认购详情')
    }
    
    const result = await response.json()
    if (result.status !== 0) {
      throw new Error(result.message || '获取认购详情失败')
    }
    
    const subscription = result.data.subscription
    
    // 检查MetaMask
    if (!window.ethereum) {
      alert('请安装MetaMask钱包')
      return
    }
    
    // 请求用户确认
    const confirmMsg = `您将向 ${subscription.loan_issuer_address} 转账 ${subscription.token_amount} 个代币来完成认购。\n\n是否继续？`
    if (!confirm(confirmMsg)) {
      return
    }
    
    // 调用MetaMask发起交易
    await initiatePayment(subscription)
    
  } catch (error) {
    console.error('❌ 处理支付通知失败:', error)
    alert(`处理支付失败: ${error.message}`)
  }
}

// 发起支付交易
const initiatePayment = async (subscription) => {
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    const userAddress = accounts[0]
    
    // 如果是ERC20代币，需要调用代币合约
    if (subscription.token_address || subscription.token_address_native) {
      // ERC20 transfer
      const tokenAddress = subscription.token_address || subscription.token_address_native
      const amount = ethers.parseUnits(subscription.token_amount.toString(), 18)
      
      // ERC20 transfer方法的ABI
      const transferAbi = [{
        "constant": false,
        "inputs": [
          {"name": "_to", "type": "address"},
          {"name": "_value", "type": "uint256"}
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function"
      }]
      
      const iface = new ethers.Interface(transferAbi)
      const data = iface.encodeFunctionData('transfer', [
        subscription.loan_issuer_address,
        amount
      ])
      
      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: userAddress,
          to: tokenAddress,
          data: data,
          gas: '0x5208', // 21000
        }],
      })
      
      console.log('✅ 交易已提交:', txHash)
      
      // 提交交易哈希到后端
      await submitPaymentHash(subscription.id, txHash, userAddress)
      
      alert('支付交易已提交！交易哈希: ' + txHash)
      
      // 刷新通知
      await loadNotifications()
      
    } else {
      alert('代币地址未配置，无法发起支付')
    }
    
  } catch (error) {
    console.error('❌ 发起支付失败:', error)
    alert(`支付失败: ${error.message}`)
  }
}

// 提交支付哈希到后端
const submitPaymentHash = async (subscriptionId, txHash, userAddress) => {
  try {
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/subscriptions/${subscriptionId}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tx_hash: txHash,
        user_wallet_address: userAddress
      })
    })
    
    if (response.ok) {
      console.log('✅ 支付哈希已提交')
    } else {
      throw new Error('提交支付哈希失败')
    }
  } catch (error) {
    console.error('❌ 提交支付哈希失败:', error)
    throw error
  }
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) {
    return t('notifications.justNow')
  } else if (minutes < 60) {
    return t('notifications.minutesAgo', { count: minutes })
  } else if (hours < 24) {
    return t('notifications.hoursAgo', { count: hours })
  } else if (days < 7) {
    return t('notifications.daysAgo', { count: days })
  } else {
    return date.toLocaleDateString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    })
  }
}

// 监听语言变化，重新生成通知数据
watch(currentLanguage, () => {
  // 如果当前使用的是模拟数据，重新生成
  if (notifications.value.length > 0 && notifications.value[0].id === 1) {
    notifications.value = generateMockNotifications()
  }
})

// 生命周期
onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.notifications-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  margin-left: 150px;
  margin-right: 150px;
  padding: 0 16px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.notifications-content {
  max-width: 1000px;
  margin: 0 auto;
}

/* 过滤器 */
.filters-section {
  margin-bottom: 24px;
  padding: 0 16px;
  margin-left: 150px;
  margin-right: 145px;
}

.filter-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0;
}

.filter-tab {
  padding: 12px 24px;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  border-bottom: 3px solid transparent;
  margin-bottom: -2px;
}

.filter-tab:hover {
  color: var(--text);
  background: var(--bg-secondary);
}

.filter-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* 加载和空状态 */
.loading-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: var(--card-bg);
  border-radius: 12px;
  margin: 0 16px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--text);
  margin: 0 0 8px 0;
}

.empty-state p {
  color: var(--text-secondary);
  margin: 0;
}

/* 通知列表 */
.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background: var(--card-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: var(--primary);
}

.notification-item.unread {
  background: var(--primary-bg);
  border-left: 4px solid var(--primary);
}

.notification-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: 12px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.notification-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  margin: 0;
}

.notification-time {
  font-size: 0.85rem;
  color: var(--text-secondary);
  white-space: nowrap;
}

.notification-message {
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
  line-height: 1.6;
}

.notification-action {
  margin-top: 8px;
}

.action-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--primary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.action-link:hover {
  text-decoration: underline;
}

.notification-status {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

.mark-read-btn,
.delete-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.mark-read-btn:hover,
.delete-btn:hover {
  background: var(--border);
  transform: scale(1.1);
}

.unread-dot {
  width: 10px;
  height: 10px;
  background: var(--primary);
  border-radius: 50%;
  display: block;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
  padding: 16px;
}

.page-info {
  font-size: 14px;
  color: var(--text-secondary);
}

/* 按钮样式 */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn.primary {
  background: var(--primary);
  color: white;
}

.btn.primary:hover {
  background: var(--primary-hover);
}

.btn.light {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn.light:hover {
  background: var(--border);
}

.btn.danger {
  background: #dc3545;
  color: white;
}

.btn.danger:hover {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-small {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--card-bg);
  color: var(--text);
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-small:hover:not(:disabled) {
  background: var(--bg-secondary);
  border-color: var(--primary);
}

.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notifications-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .header-actions {
    justify-content: space-between;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .filter-tab {
    padding: 10px 16px;
    font-size: 13px;
  }

  .notification-item {
    flex-direction: column;
    gap: 12px;
  }

  .notification-header {
    flex-direction: column;
    gap: 8px;
  }

  .notification-time {
    white-space: normal;
  }

  .notification-status {
    flex-direction: row;
    align-self: flex-end;
  }

  .pagination {
    flex-direction: column;
    gap: 12px;
  }
}

/* 深色主题适配 */
[data-theme="dark"] .notification-item:hover {
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.05);
}

/* 浅色主题适配 */
[data-theme="light"] .notifications-page {
  background: var(--bg);
}

[data-theme="light"] .notification-item {
  background: var(--card-bg);
  border-color: var(--border);
}

[data-theme="light"] .notification-item.unread {
  background: rgba(59, 130, 246, 0.05);
}
</style>

