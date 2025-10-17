<template>
  <section class="profile-page">
    <!-- 顶部：面包屑 & 操作按钮 -->
    <header class="topbar container">
      <nav class="breadcrumb" aria-label="Breadcrumb">
        <button class="crumb-back" @click="$router.back()" aria-label="Back to Previous Page">
          <svg viewBox="0 0 24 24" class="i"><path d="M10 19a1 1 0 0 1-.7-.3l-7-7a1 1 0 0 1 0-1.4l7-7a1 1 0 1 1 1.4 1.4L4.41 11H21a1 1 0 1 1 0 2H4.41l6.3 6.3A1 1 0 0 1 10 19z"/></svg>
        </button>
        <span class="sep">/</span>
        <span class="crumb-current">{{ t('profile.personalCenter') }}</span>
      </nav>
    </header>
      
    <!-- 标题块 -->
    <div class="container head">
      <div class="avatar">
        <span class="avatar-initial">{{ userInitial }}</span>
        </div>
      <div>
        <h1 class="title">{{ userName }}</h1>
      </div>
      <!-- <p class="title">{{ userid }}</p> -->
     
    </div>
    <form class="container form" @submit.prevent="onSave">

    <!-- 用户联系信息 -->
    <div class="user-contact-info">
      <!--email and phone-->
      <div>
        <label class="label">{{ t('profile.personalInfo') }} <span class="req"></span></label>
        <div class="contact-item">
          <!-- <span class="contact-icon">📧</span> -->
          <span class="contact-label">{{ t('profile.email') }}</span>
          <div class="contact-value-group">
            <span class="contact-value">
              {{ userEmail || t('profile.notProvided') }}
            </span>
            <span class="email-status" :class="emailVerificationClass">
              <template v-if="emailVerified">
                <svg viewBox="0 0 24 24" class="email-verified-icon">
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                </svg>
              </template>
              <template v-else>
                {{ emailVerificationText }}
              </template>
            </span>
          </div>
          <button v-if="!emailVerified" class="btn-small" type="button" @click.stop.prevent="sendEmailVerification">
            {{ t('profile.verifyEmail') }}
          </button>
        </div>
        <div class="contact-item">
          <!-- <span class="contact-icon">📱</span> -->
          <span class="contact-label">{{ t('profile.phone') }}</span>
          <div class="contact-value-group">
            <span class="contact-value">
              {{ userPhone || t('profile.notProvided') }}
            </span>
            <span class="phone-status" :class="phoneVerificationClass">
              <template v-if="phoneVerified">
                <svg viewBox="0 0 24 24" class="phone-verified-icon">
                  <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                </svg>
              </template>
              <template v-else>
                {{ phoneVerificationText }}
              </template>
            </span>
          </div>
          <button v-if="!phoneVerified && userPhone" class="btn-small" type="button" @click.stop.prevent="sendPhoneVerification">{{ t('profile.verifyPhone') }}</button>
          <button v-if="!userPhone" class="btn-small" type="button" >{{ t('profile.addPhone') }}</button>
        </div>
        <div class="contact-item">
          <span class="contact-label">{{ t('profile.password') }}</span>
          <button class="btn-small" type="button" >{{ t('profile.changePassword') }}</button>
        </div>
        <!-- 用户信息加载状态已隐藏 -->
        <!-- <div v-if="userLoading" class="contact-item loading-item">
          <span class="contact-icon">🔄</span>
          <span class="contact-label">{{ t('profile.status') }}</span>
          <span class="contact-value">{{ t('profile.loadingUserInfo') }}</span>
        </div> -->
        <div v-if="userError && !userLoading" class="contact-item error-item">
          <span class="contact-icon">⚠️</span>
          <span class="contact-label">{{ t('profile.status') }}</span>
          <span class="contact-value">{{ userError }}</span>
        </div>
      </div>
    </div>
    
    <!-- KYC & Whitelist Status Section -->
    <div class="status-section">
      <h3 class="status-title">{{ t('profile.accountStatus') }}</h3>
      <!-- KYC -->
      <div class="field">
        <label class="label">{{ t('profile.kycVerification') }} <span class="req">*</span></label>
        <div class="kyc-banner" :class="isVerified ? 'green' : 'orange'" role="status">
          <span class="icon" :class="{ 'icon-verified': isVerified }">
            <svg viewBox="0 0 24 24" class="i">
              <path d="M12 2 2 7l10 5 10-5-10-5Zm0 7L2 4v13l10 5 10-5V4L12 9Zm0 9.5-7-3.5V9l7 3.5V20.5Z"/>
            </svg>
          </span>
          <span v-if="!isVerified">{{ t('profile.startVerification') }}</span>
          <span v-else class="verified">
            <svg viewBox="0 0 24 24" class="i"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>
            <!-- Verified -->{{ kycLevelText }}
            <!-- <span class="level-badge" :class="kycLevelClass"> {{ kycLevelText }}</span> -->
          </span>
          <!-- 右侧按钮：未验证=Start；已验证=Cancel -->
          <button v-if="!isVerified" class="link" type="button" @click="verifyKYC">
            {{ t('profile.start') }}
          </button>
          <button v-else class="link danger" type="button" @click="cancelKYC">{{ t('profile.cancelVerification') }}</button>
        </div>
      </div>

      <!-- Whitelist Application Component -->
      <WhitelistApplication 
        v-if="isVerified"
        :is-kyc-verified="isVerified"
        :user-info="userInfo"
        @success="handleWhitelistSuccess"
        @error="handleWhitelistError"
        @info="handleWhitelistInfo"
      />

      <!-- Trading Permission -->
      <!-- <div class="field">
        <label class="label">{{ t('profile.tradingPermission') }} <span class="req"></span></label>
        <div class="kyc-banner" :class="isTradingFullyVerified ? 'green' : 'orange'" role="status">
          <span class="icon" :class="{ 'icon-verified': isTradingFullyVerified }">
            <svg viewBox="0 0 24 24" class="i">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z"/>
            </svg>
          </span>
          <span v-if="isTradingFullyVerified" class="trading-permission-text">{{ tradingPermissionText }}</span>
          <span v-else class="permission-text">                
            <li v-for="requirement in tradingPermissionRequirements" :key="requirement" 
                      :class="{ 'requirement-met': isRequirementMet(requirement) }">
                    <span class="requirement-icon">{{ isRequirementMet(requirement) ? '' : '' }}</span>
                    {{ requirement }}
                  </li></span>
          <button v-if="!isVerified" class="link" type="button" @click="verifyKYC">{{ t('profile.start') }}</button>
          <button v-else class="link danger" type="button" @click="cancelKYC">{{ t('profile.cancelVerification') }}</button>
        </div>
      </div> -->
    </div>
  
    <!-- 底部按钮 -->
    <div class="actions bottom">
      <!-- <button class="btn light" type="button" @click="onCancel">{{ t('common.cancel') }}</button>
      <button class="btn orange" type="submit">{{ t('common.save') }}</button> -->
      <!-- 新增：安全退出 -->
      <button class="btn light" type="button" @click="logout" style="margin-left:auto;">{{ t('profile.logout') }}</button>
    </div>
    </form>

    <!-- 邮箱验证码弹窗 -->
    <div v-if="showVerificationModal" class="modal-mask" @click.self="closeVerificationModal">
      <div class="modal-wrapper">
        <div class="modal-container">
          <h2 style="margin-bottom:16px;">邮箱验证</h2>
          <p style="margin-bottom:20px; color: #9ca3af;">已向您的邮箱发送验证码，请查收</p>
          
          <div class="verification-input-group">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:#9ca3af;">验证码</label>
            <input 
              v-model="verificationCode" 
              type="text" 
              placeholder="请输入6位验证码"
              maxlength="6"
              class="verification-input"
              @keyup.enter="confirmVerification"
            />
          </div>
          
          <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn light" @click.stop.prevent="closeVerificationModal">取消</button>
            <button type="button" class="btn orange" @click.stop.prevent="confirmVerification" :disabled="verificationCode.length !== 6">确认</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 手机号验证码弹窗 -->
    <div v-if="showPhoneVerificationModal" class="modal-mask" @click.self="closePhoneVerificationModal">
      <div class="modal-wrapper">
        <div class="modal-container">
          <h2 style="margin-bottom:16px;">手机号验证</h2>
          <p style="margin-bottom:20px; color: #9ca3af;">已向您的手机号发送验证码，请查收</p>
          
          <div class="verification-input-group">
            <label style="display:block; margin-bottom:8px; font-size:14px; color:#9ca3af;">验证码</label>
            <input 
              v-model="phoneVerificationCode" 
              type="text" 
              placeholder="请输入6位验证码"
              maxlength="6"
              class="verification-input"
              @keyup.enter="confirmPhoneVerification"
            />
          </div>
          
          <div style="margin-top:24px; display:flex; gap:12px; justify-content:flex-end;">
            <button type="button" class="btn light" @click.stop.prevent="closePhoneVerificationModal">取消</button>
            <button type="button" class="btn orange" @click.stop.prevent="confirmPhoneVerification" :disabled="phoneVerificationCode.length !== 6">确认</button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 验证成功弹窗 -->
    <div v-if="showSuccessModal" class="modal-mask" @click.self="showSuccessModal=false">
      <div class="modal-wrapper">
        <div class="modal-container success-modal">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" style="width:48px; height:48px; fill:#10b981;">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
            </svg>
          </div>
          <h2 style="margin-bottom:8px; color:#10b981;">验证成功</h2>
          <p style="color:#9ca3af;">{{ successMessage }}</p>
          <div style="margin-top:20px; text-align:center;">
            <button type="button" class="btn orange" @click.stop.prevent="showSuccessModal=false">确定</button>
          </div>
        </div>
      </div>
    </div>

  </section>
</template>

<script>
import {
  getKycStatus,
  setKycStatus,
  setKycLevel,
  getKycLevel,
  KYC_STATUS,
  KYC_LEVELS
} from '/src/service/kycService'
import WhitelistApplication from '@/views/FunctionalModule/whitelist/WhitelistApplication.vue'
import {
  getUserInfo,
  getUserName,
  getUserInitial,
  getUserEmail,
  setUserInfo,
  USER_INFO_EVENT
} from '@/service/userService'
import { userAPI } from '@/service/api'
import { unifiedContractService as contractService } from '@/service/unifiedContractService'
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'ProfileView',
  components: {
    WhitelistApplication
  },
  emits: ['navigate','notify'],
  data(){
    return {
      kycStatus: getKycStatus(),
      form: {
        twoFA: 'off',
        email: '',
        walletAction: ''
      },
      emailCode: '',
      emailCodeSent: false,
      emailVerified: false,
      generatedCode: '',
  _offVis: null,
  _offStorage: null,
  _offAfterEach: null,
  showEmailModal: false,
  showVerificationModal: false,
  showSuccessModal: false,
  verificationCode: '',
  // 手机号验证相关
  showPhoneVerificationModal: false,
  phoneVerificationCode: '',
  phoneVerified: false,
  phoneCodeSent: false,
  successMessage: '您的邮箱已验证',
  // 用户信息，传递给白名单组件
  userInfo: getUserInfo(),
  // 状态信息
  whitelistStatus: 'none',
  kycLevel: getKycLevel(),
  // API获取的用户数据
  apiUserData: null,
  userLoading: false,
  userError: null
    }
  },
  computed:{
    isVerified(){ return this.kycStatus === KYC_STATUS.VERIFIED },
    isPending(){ return this.kycStatus === KYC_STATUS.PENDING },
    // 用户信息计算属性
    userid(){
      // 多重fallback策略
      if (this.apiUserData?.user_id) {
        return this.apiUserData.user_id
      }
      
      if (this.apiUserData?.id) {
        return this.apiUserData.id
      }
      
      // 从localStorage获取用户ID
      const localUserInfo = getUserInfo()
      if (localUserInfo.user_id) {
        return localUserInfo.user_id
      }
      
      if (localUserInfo.id) {
        return localUserInfo.id
      }
      
      return 'User ID'
    },
    userName(){   
      // 多重fallback策略
      if (this.apiUserData?.name) {
        return this.apiUserData.name
      }
      
      const localName = getUserName()
      if (localName) {
        return localName
      }
      
      // 从邮箱生成用户名
      const email = this.userEmail
      if (email && email.includes('@')) {
        return email.split('@')[0]
      }
      
      return 'User'
    },
    
    userInitial(){ 
      // 多重fallback策略
      if (this.apiUserData?.name) {
        return this.apiUserData.name.charAt(0).toUpperCase()
      }
      
      const localInitial = getUserInitial()
      if (localInitial) {
        return localInitial
      }
      
      // 从邮箱生成首字母
      const email = this.userEmail
      if (email && email.includes('@')) {
        return email.charAt(0).toUpperCase()
      }
      
      return 'U'
    },
    
    userEmail(){ 
      // 多重fallback策略
      if (this.apiUserData?.email) {
        return this.apiUserData.email
      }
      
      const localEmail = getUserEmail()
      if (localEmail) {
        return localEmail
      }
      
      // 从localStorage获取记住的邮箱
      const rememberEmail = localStorage.getItem('remember_email')
      if (rememberEmail) {
        return rememberEmail
      }
      
      return ''
    },
    
    userPhone() {
      // 多重fallback策略
      if (this.apiUserData?.phone) {
        return this.apiUserData.phone
      }
      
      // 从本地存储获取手机号
      const userInfo = getUserInfo()
      if (userInfo.phone) {
        return userInfo.phone
      }
      
      return ''
    },
    
    // Email验证状态
    emailVerificationText() {
      if (this.emailVerified) {
        return '已验证'
      } else if (this.emailCodeSent) {
        return '验证已发送'
      } else {
        return '未验证'
      }
    },
    
    emailVerificationIcon() {
      if (this.emailVerified) {
        return '已验证'
      } else if (this.emailCodeSent) {
        return '验证已发送'
      } else {
        return '未验证'
      }
    },
    
    emailVerificationClass() {
      if (this.emailVerified) {
        return '邮箱已验证'
      } else if (this.emailCodeSent) {
        return '邮箱验证已发送'
      } else {
        return '邮箱未验证'
      }
    },
    
    // 手机号验证状态
    phoneVerificationText() {
      if (this.phoneVerified) {
        return '已验证'
      } else if (this.phoneCodeSent) {
        return '验证已发送'
      } else {
        return '未验证'
      }
    },
    
    phoneVerificationClass() {
      if (this.phoneVerified) {
        return '手机号已验证'
      } else if (this.phoneCodeSent) {
        return '手机号验证已发送'
      } else {
        return '手机号未验证'
      }
    },
    
    // KYC等级显示
    kycLevelText() {
      switch(this.kycLevel) {
        case KYC_LEVELS.LEVEL_0: return 'Level 0 (未验证)'
        case KYC_LEVELS.LEVEL_1: return 'Level 1 (基础)'
        case KYC_LEVELS.LEVEL_2: return 'Level 2 (高级)'
        case KYC_LEVELS.LEVEL_3: return 'Level 3 (高级)'
        default: return '未知'
      }
    },
    
    kycLevelClass() {
      switch(this.kycLevel) {
        case KYC_LEVELS.LEVEL_0: return 'level-0'
        case KYC_LEVELS.LEVEL_1: return 'level-1'
        case KYC_LEVELS.LEVEL_2: return 'level-2'
        case KYC_LEVELS.LEVEL_3: return 'level-3'
        default: return 'level-unknown'
      }
    },
    
    // 白名单状态显示
    whitelistStatusText() {
      switch(this.whitelistStatus) {
        case 'approved': return '同意'
        case 'pending': return '待审核'
        case 'rejected': return '不符合交易资格'
        case 'none': return '未申请'
        default: return '未知'
      }
    },
    
    whitelistStatusClass() {
      switch(this.whitelistStatus) {
        case 'approved': return '同意'
        case 'pending': return '待审核'
        case 'rejected': return '不符合交易资格'
        case 'none': return '未申请'
        default: return '未知'
      }
    },
    
    // 交易权限是否完全验证
    isTradingFullyVerified() {
      return this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved'
    },
    
    // 交易权限显示
    tradingPermissionText() {
      if (this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved') {
        return '全访问'
      } else if (this.kycLevel >= KYC_LEVELS.LEVEL_2) {
        return '有限访问'
      } else {
        return '无访问'
      }
    },
    
    tradingPermissionClass() {
      if (this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved') {
        return 'permission-full'
      } else if (this.kycLevel >= KYC_LEVELS.LEVEL_2) {
        return 'permission-limited'
      } else {
        return 'permission-none'
      }
    },
    
    // 交易权限详细描述
    tradingPermissionDescription() {
      if (this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved') {
        return '完全交易访问所有RWA产品和功能'
      } else if (this.kycLevel >= KYC_LEVELS.LEVEL_2) {
        return '有限交易访问 - 白名单批准要求完全访问'
      } else {
        return '交易访问需要KYC验证和白名单批准'
      }
    },
    
    // 交易权限要求列表
    tradingPermissionRequirements() {
      const requirements = []
      
      // KYC要求
      if (this.kycLevel < KYC_LEVELS.LEVEL_2) {
        // requirements.push('完全KYC验证 (Level 2+)')
      }
      
      // 白名单要求
      if (this.whitelistStatus !== 'approved') {
        if (this.whitelistStatus === 'none') {
          requirements.push('申请白名单批准')
        } else if (this.whitelistStatus === 'pending') {
          requirements.push('待审核')
        } else if (this.whitelistStatus === 'rejected') {
          requirements.push('重新申请白名单批准')
        }
      }
      
      // 其他要求（如果有的话）
      if (this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved') {
        requirements.push('所有要求满足')
      }
      
      return requirements
    }
  },
  watch: {
    // 监听KYC状态变化
    kycStatus: {
      handler(newStatus, oldStatus) {
        console.log('🔄 KYC状态变化:', oldStatus, '->', newStatus)
        if (newStatus === KYC_STATUS.VERIFIED && oldStatus !== KYC_STATUS.VERIFIED) {
          console.log('✅ KYC验证成功，自动更新Account Status')
          // KYC验证成功时，自动设置等级为2并更新白名单状态
          this.kycLevel = getKycLevel()
          if (this.kycLevel < KYC_LEVELS.LEVEL_2) {
            setKycLevel(KYC_LEVELS.LEVEL_2)
            this.kycLevel = KYC_LEVELS.LEVEL_2
            console.log('🔧 自动设置KYC等级为Level 2')
          }
          // 更新白名单状态
          this.loadStatusInfo()
        }
      },
      immediate: false
    },
    
    // 监听KYC等级变化
    kycLevel: {
      handler(newLevel, oldLevel) {
        console.log('🔄 KYC等级变化:', oldLevel, '->', newLevel)
        if (newLevel >= KYC_LEVELS.LEVEL_2 && this.isVerified) {
          console.log('✅ KYC等级达到Level 2，自动更新白名单状态')
          // 更新白名单状态
          this.loadStatusInfo()
        }
      },
      immediate: false
    }
  },
  async mounted(){
    // 刷新函数：从 localStorage 读取最新状态
    const refresh = () => { 
      this.kycStatus = getKycStatus()
      this.kycLevel = getKycLevel()
      // KYC状态变化时，立即更新Account Status
      this.loadStatusInfo()
    }
    const refreshUserInfo = () => { this.userInfo = getUserInfo() }
    const refreshStatus = () => { this.loadStatusInfo() }

    // 1) 初次进入
    refresh()
    refreshUserInfo()
    refreshStatus()
    
    // 2) 立即初始化用户信息显示
    this.initializeUserDisplay()
    
    // 3) 从API获取用户信息
    await this.loadUserFromAPI()
    
    // 3) 监听登录状态变化
    const onAuthChange = () => {
      console.log('🔄 ProfileView: 检测到登录状态变化，重新加载用户信息')
      this.loadUserFromAPI()
    }
    window.addEventListener('auth-changed', onAuthChange)
    this._offAuthChange = () => window.removeEventListener('auth-changed', onAuthChange)
    
    // 4) 标签激活（从 /kycService 返回就会触发）
    const onVis = () => document.visibilityState === 'visible' && (refresh(), refreshUserInfo(), refreshStatus())
    document.addEventListener('visibilitychange', onVis)
    this._offVis = () => document.removeEventListener('visibilitychange', onVis)

    // 3) 跨标签同步（若多标签页同时登录）
    const onStore = (e) => { 
      if (e.key === 'kycStatus') refresh()
      if (e.key === 'kycLevel') refresh()
      if (e.key === 'userInfo') refreshUserInfo()
      if (e.key === 'whitelistStatus') refreshStatus()
    }
    window.addEventListener('storage', onStore)
    this._offStorage = () => window.removeEventListener('storage', onStore)

    // 4) 路由返回时（从 KYC 页面 push 回来）
    this._offAfterEach = this.$router.afterEach((to) => {
      if (to.path === '/profile') {
        refresh()
        refreshUserInfo()
        refreshStatus()
      }
    })

    // 5) 监听用户信息更新事件
    const onUserInfoChange = () => {
      refreshUserInfo()
      this.$forceUpdate() // 强制更新组件
    }
    window.addEventListener(USER_INFO_EVENT, onUserInfoChange)
    this._offUserInfo = () => window.removeEventListener(USER_INFO_EVENT, onUserInfoChange)

    // 6) 监听KYC验证成功事件
    const onKycSuccess = () => {
      console.log('🎉 收到KYC验证成功事件，更新Account Status')
      refresh()
    }
    window.addEventListener('kyc-verification-success', onKycSuccess)
    this._offKycSuccess = () => window.removeEventListener('kyc-verification-success', onKycSuccess)
  },
  activated(){
    // keep-alive 场景下也会被调用
    this.kycStatus = getKycStatus()
  },
  beforeUnmount(){
    this._offVis && this._offVis()
    this._offStorage && this._offStorage()
    this._offAfterEach && this._offAfterEach()
    this._offUserInfo && this._offUserInfo()
    this._offKycSuccess && this._offKycSuccess()
    this._offAuthChange && this._offAuthChange()
  },
  methods:{
    // 获取翻译文本
    t(key) {
      const { t } = useLanguage()
      return t(key)
    },
    // 初始化用户信息显示
    initializeUserDisplay() {
      console.log('🚀 ProfileView: 初始化用户信息显示')
      
      // 立即尝试显示本地存储的用户信息
      const localUserInfo = getUserInfo()
      const rememberEmail = localStorage.getItem('remember_email')
      
      if (localUserInfo.name || localUserInfo.email || rememberEmail) {
        this.apiUserData = {
          name: localUserInfo.name || (rememberEmail ? rememberEmail.split('@')[0] : ''),
          email: localUserInfo.email || rememberEmail || '',
          phone: localUserInfo.phone || '',
          firstName: localUserInfo.firstName || '',
          lastName: localUserInfo.lastName || '',
          user_id: localUserInfo.user_id || localUserInfo.id || '',
          id: localUserInfo.user_id || localUserInfo.id || ''
        }
        console.log('✅ ProfileView: 立即显示本地用户信息:', this.apiUserData)
      }
    },
    
    // 从API获取用户信息
    async loadUserFromAPI() {
      try {
        this.userLoading = true
        this.userError = null
        console.log('🔄 ProfileView: 开始获取用户信息...')
        
        // 检查用户是否已登录
        const isLoggedIn = localStorage.getItem('isLoggedIn')
        const token = localStorage.getItem('token')
        const rememberEmail = localStorage.getItem('remember_email')
        
        console.log('📊 ProfileView: 登录状态检查:', { isLoggedIn, hasToken: !!token, rememberEmail })
        
        // 如果用户未登录，尝试使用本地存储的信息
        if (!isLoggedIn || !token) {
          console.log('⚠️ ProfileView: 用户未登录，使用本地存储信息')
          
          // 从本地存储获取用户信息
          const localUserInfo = getUserInfo()
          if (localUserInfo.name || localUserInfo.email) {
            this.apiUserData = {
              name: localUserInfo.name,
              email: localUserInfo.email,
              phone: localUserInfo.phone,
              firstName: localUserInfo.firstName,
              lastName: localUserInfo.lastName,
              user_id: localUserInfo.user_id || localUserInfo.id || '',
              id: localUserInfo.user_id || localUserInfo.id || ''
            }
            console.log('✅ ProfileView: 使用本地存储用户信息:', this.apiUserData)
            return
          }
          
          // 如果有记住的邮箱，使用它
          if (rememberEmail) {
            this.apiUserData = {
              email: rememberEmail,
              name: rememberEmail.split('@')[0] // 使用邮箱前缀作为默认用户名
            }
            console.log('✅ ProfileView: 使用记住的邮箱信息:', this.apiUserData)
            return
          }
          
          this.userError = '用户未登录，请先登录'
          return
        }
        
        console.log('🔑 ProfileView: 使用userAPI获取用户信息')
        
        // 使用userAPI获取用户信息
        const response = await userAPI.getUserInfoFromServer()
        
        let userData = null
        let lastError = null
        
        if (response.status === 0 && response.data) {
          userData = response.data
          console.log('✅ ProfileView: 成功获取用户数据:', userData)
          console.log('🔍 ProfileView: user_id字段:', userData.user_id)
          console.log('🔍 ProfileView: id字段:', userData.id)
        } else {
          lastError = response.message || '获取用户信息失败'
          console.warn('⚠️ ProfileView: 获取用户信息失败:', lastError)
        }
        
        if (userData) {
          
          // 处理并更新用户信息
          const processedUserData = {
            // 处理邮箱字段
            email: userData.user_email || userData.email || userData.userEmail,
            // 处理姓名字段
            name: userData.user_name || userData.name || userData.userName,
            // 处理电话字段
            phone: userData.user_phone || userData.phone || userData.userPhone,
            // 处理其他字段
            firstName: userData.firstName || userData.first_name,
            lastName: userData.lastName || userData.last_name,
            user_id: userData.user_id || userData.id || userData.userId,
            id: userData.user_id || userData.id || userData.userId
          }
          
          // 保存API获取的用户数据（包含处理后的数据）
          this.apiUserData = {
            ...userData,
            ...processedUserData
          }
          
          // 过滤掉空值
          const validUserData = Object.fromEntries(
            Object.entries(processedUserData).filter(([_, value]) => value)
          )
          
          if (Object.keys(validUserData).length > 0) {
            const updatedUserInfo = {
              ...getUserInfo(),
              ...validUserData
            }
            
            // 更新本地用户信息
            setUserInfo(updatedUserInfo)
            this.userInfo = updatedUserInfo
            
            console.log('✅ ProfileView: 本地用户信息已更新:', updatedUserInfo)
          }
        } else {
          console.warn('⚠️ ProfileView: 所有API端点都失败，使用本地存储信息')
          
          // 如果所有API都失败，使用本地存储信息
          const localUserInfo = getUserInfo()
          if (localUserInfo.name || localUserInfo.email) {
            this.apiUserData = {
              name: localUserInfo.name,
              email: localUserInfo.email,
              phone: localUserInfo.phone,
              user_id: localUserInfo.user_id || localUserInfo.id || '',
              id: localUserInfo.user_id || localUserInfo.id || ''
            }
            console.log('✅ ProfileView: 使用本地存储作为fallback:', this.apiUserData)
          } else {
            this.userError = lastError || '无法获取用户信息'
          }
        }
        
      } catch (error) {
        console.error('❌ ProfileView: 获取用户信息失败:', error)
        
        // 检查是否是网络错误
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
          this.userError = '网络连接失败，使用本地存储信息'
          
          // 网络失败时使用本地存储
          const localUserInfo = getUserInfo()
          if (localUserInfo.name || localUserInfo.email) {
            this.apiUserData = {
              name: localUserInfo.name,
              email: localUserInfo.email,
              phone: localUserInfo.phone,
              user_id: localUserInfo.user_id || localUserInfo.id || '',
              id: localUserInfo.user_id || localUserInfo.id || ''
            }
            console.log('✅ ProfileView: 网络失败，使用本地存储:', this.apiUserData)
          }
        } else {
          this.userError = `获取用户信息失败: ${error.message}`
        }
      } finally {
        this.userLoading = false
        console.log('🏁 ProfileView: 用户信息加载完成')
      }
    },
    
    // 检查要求是否满足
    isRequirementMet(requirement) {
      if (requirement.includes('KYC verification')) {
        return this.kycLevel >= KYC_LEVELS.LEVEL_2
      } else if (requirement.includes('whitelist approval')) {
        return this.whitelistStatus === 'approved'
      } else if (requirement.includes('All requirements met')) {
        return this.kycLevel >= KYC_LEVELS.LEVEL_2 && this.whitelistStatus === 'approved'
      }
      return false
    },
    
    // 加载状态信息
    async loadStatusInfo() {
      try {
        console.log('🔄 开始加载状态信息...')
        // 更新KYC等级
        this.kycLevel = getKycLevel()
        console.log('📊 当前KYC等级:', this.kycLevel)
        console.log('📊 当前KYC状态:', this.kycStatus)
        
        // 加载白名单状态（无论KYC状态如何都显示）
        if (this.isVerified) {
          console.log('✅ 用户已通过KYC验证')
          // 简化：KYC Level 2用户直接设置为approved
          if (this.kycLevel >= KYC_LEVELS.LEVEL_2) {
            this.whitelistStatus = 'approved'
            localStorage.setItem('whitelistStatus', 'approved')
            console.log('✅ KYC Level 2用户，白名单状态自动设置为approved')
            console.log('📊 更新后的状态 - KYC Level:', this.kycLevel, 'Whitelist:', this.whitelistStatus)
            return
          }
          
          // 从本地存储获取白名单状态
          const savedStatus = localStorage.getItem('whitelistStatus')
          if (savedStatus) {
            this.whitelistStatus = savedStatus
            console.log('📊 从本地存储加载白名单状态:', savedStatus)
          }
        } else {
          // 如果KYC未验证，设置默认状态
          this.whitelistStatus = 'none'
          console.log('❌ 用户未通过KYC验证，设置默认状态')
        }
        console.log('📊 最终状态 - KYC Level:', this.kycLevel, 'Whitelist:', this.whitelistStatus)
      } catch (error) {
        console.error('Failed to load status info:', error)
      }
    },

    // 校验邮箱格式
    isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // 发送邮箱验证
    async sendEmailVerification() {
      console.log('🔘 sendEmailVerification 方法被调用');
      console.log('📧 当前邮箱:', this.userEmail);
      
      const email = this.userEmail;
      if (!email || !this.isValidEmail(email)) {
        console.log('❌ 邮箱验证失败: 邮箱为空或格式不正确');
        alert('请提供有效的邮箱地址');
        return;
      }

      try {
        console.log('📧 开始发送邮箱验证到:', email);
        
        // 先显示验证码输入弹窗（模拟发送成功）
        this.emailCodeSent = true;
        this.showVerificationModal = true;
        this.verificationCode = '';
        console.log('✅ 验证码弹窗已显示');
        
        // 调用后端API发送验证邮件
        const res = await fetch(import.meta.env.VITE_API_EmailVerify || 'http://localhost:3000/api/email/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: email })
        });

        if (res.ok) {
          const data = await res.json();
          this.generatedCode = data.code; // 保存验证码（开发环境）
          console.log('✅ 邮箱验证邮件发送成功, 验证码:', data.code);
        } else {
          console.warn('⚠️ 邮箱验证邮件发送失败:', res.status);
        }
      } catch (error) {
        console.error('❌ 发送邮箱验证失败:', error);
        // 即使API失败也显示弹窗，允许用户输入
        console.log('⚠️ API调用失败，但仍显示验证码输入弹窗');
      }
    },
    
    // 关闭验证码弹窗
    closeVerificationModal() {
      this.showVerificationModal = false;
      this.verificationCode = '';
    },
    
    // 确认验证码
    async confirmVerification() {
      if (this.verificationCode.length !== 6) {
        this.$emit('notify', '请输入6位验证码');
        return;
      }

      try {
        console.log('🔍 验证验证码:', this.verificationCode);
        
        // 调用后端API验证验证码
        const res = await fetch(import.meta.env.VITE_API_EmailVerify || 'http://localhost:3000/api/email/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_email: this.userEmail, 
            verification_code: this.verificationCode 
          })
        });

        const data = await res.json();
        
        if (data.status === 0 || res.ok) {
          // 验证成功
          this.emailVerified = true;
          this.emailCodeSent = false;
          this.showVerificationModal = false;
          this.verificationCode = '';
          
          // 显示成功弹窗
          this.successMessage = '您的邮箱已验证';
          this.showSuccessModal = true;
          
          console.log('✅ 邮箱验证成功');
        } else {
          this.$emit('notify', '验证码错误，请重新输入');
          console.error('❌ 验证码验证失败:', data.message);
        }
      } catch (error) {
        console.error('❌ 验证验证码失败:', error);
        this.$emit('notify', 'Network error, please try again');
      }
    },
    
    // 发送手机号验证
    async sendPhoneVerification() {
      console.log('🔘 sendPhoneVerification 方法被调用');
      console.log('📱 当前手机号:', this.userPhone);
      
      const phone = this.userPhone;
      if (!phone) {
        console.log('❌ 手机号验证失败: 手机号为空');
        alert('请先添加手机号');
        return;
      }

      try {
        console.log('📱 开始发送手机号验证到:', phone);
        
        // 先显示验证码输入弹窗（模拟发送成功）
        this.phoneCodeSent = true;
        this.showPhoneVerificationModal = true;
        this.phoneVerificationCode = '';
        console.log('✅ 手机号验证码弹窗已显示');
        
        // 调用后端API发送验证短信
        const res = await fetch(import.meta.env.VITE_API_PhoneVerify || 'http://localhost:3000/api/phone/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_phone: phone })
        });

        if (res.ok) {
          const data = await res.json();
          this.generatedCode = data.code; // 保存验证码（开发环境）
          console.log('✅ 手机号验证短信发送成功, 验证码:', data.code);
        } else {
          console.warn('⚠️ 手机号验证短信发送失败:', res.status);
        }
      } catch (error) {
        console.error('❌ 发送手机号验证失败:', error);
        // 即使API失败也显示弹窗，允许用户输入
        console.log('⚠️ API调用失败，但仍显示验证码输入弹窗');
      }
    },
    
    // 关闭手机号验证码弹窗
    closePhoneVerificationModal() {
      this.showPhoneVerificationModal = false;
      this.phoneVerificationCode = '';
    },
    
    // 确认手机号验证码
    async confirmPhoneVerification() {
      if (this.phoneVerificationCode.length !== 6) {
        this.$emit('notify', '请输入6位验证码');
        return;
      }

      try {
        console.log('🔍 验证手机号验证码:', this.phoneVerificationCode);
        
        // 调用后端API验证验证码
        const res = await fetch(import.meta.env.VITE_API_PhoneVerify || 'http://localhost:3000/api/phone/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_phone: this.userPhone, 
            verification_code: this.phoneVerificationCode 
          })
        });

        const data = await res.json();
        
        if (data.status === 0 || res.ok) {
          // 验证成功
          this.phoneVerified = true;
          this.phoneCodeSent = false;
          this.showPhoneVerificationModal = false;
          this.phoneVerificationCode = '';
          
          // 显示成功弹窗
          this.successMessage = '您的手机号已验证';
          this.showSuccessModal = true;
          
          console.log('✅ 手机号验证成功');
        } else {
          this.$emit('notify', '验证码错误，请重新输入');
          console.error('❌ 手机号验证码验证失败:', data.message);
        }
      } catch (error) {
        console.error('❌ 验证手机号验证码失败:', error);
        this.$emit('notify', 'Network error, please try again');
      }
    },

    // 发送验证码
    async sendEmailCode() {
      if (!this.isValidEmail(this.form.email)) {
        this.$emit('notify','Please enter a valid email.');
        return;
      }
      try {
        // 调用后端API发送验证码邮件
        const res = await fetch(import.meta.env.VITE_API_EmailVerify, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_email: this.form.email })
        });
        const data = await res.json();
        if (data.status === 0) {
          this.emailCodeSent = true;
          this.generatedCode = data.code; // 开发环境返回验证码，便于测试
          this.showEmailModal = true;
          this.$emit('notify', data.message || '验证码已发送到您的邮箱');
        } else {
          this.$emit('notify', data.message || 'Failed to send email.');
        }
      } catch (e) {
        this.$emit('notify','Network error, please try again.');
      }
    },

    // 验证验证码
    async verifyEmailCode() {
      try {
        // 调用后端API校验验证码
        const res = await fetch(import.meta.env.VITE_API_EmailVerify, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_email: this.form.email, 
            verification_code: this.form.emailCode 
          })
        });
        const data = await res.json();
        if (data.status === 0) {
          this.emailVerified = true;
          this.emailCodeSent = false; // 隐藏验证码输入框
          this.form.emailCode = ''; // 清空验证码
          this.$emit('notify', data.message || 'Email verified and bound to account.');
        } else {
          this.$emit('notify', data.message || 'Incorrect verification code.');
        }
      } catch (e) {
        this.$emit('notify','Network error, please try again.');
      }
    },
    verifyKYC(){ this.$router.push('/kycService') },

    // 撤销 KYC：立即变回黄色并显示 Start
    cancelKYC(){
      if (!confirm('Are you sure you want to cancel KYC verification?')) return
      setKycStatus(KYC_STATUS.UNVERIFIED)     // 写入存储
      this.kycStatus = KYC_STATUS.UNVERIFIED  // 立刻刷新 UI
      
      // 清除KYC级别
      setKycLevel(KYC_LEVELS.LEVEL_0)
      
      this.$emit('notify','KYC verification has been cancelled.')
    },

    onCancel(){ this.$emit('navigate','home') },

    onSave(){
      if (!this.isVerified) return this.$emit('notify','Please complete KYC first.')
      if (this.form.email && !this.isValidEmail(this.form.email))
        return this.$emit('notify','Please enter a valid email.')
      if (this.form.email && !this.emailVerified)
        return this.$emit('notify','Please verify your email before saving.')
      this.$emit('notify','Profile saved (demo)')
    },

    logout() {
    // 1) 清理本地状态
    localStorage.removeItem('token');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('remember_email');
    
    // 2) 触发全局登录状态更新事件
    window.dispatchEvent(new CustomEvent('auth-changed'));

    // 3) 友好提示
    this.$emit('notify','You have logged out.');

    // 4) 跳转到登录页
    this.$router.push('/login');
  },

  // 白名单组件事件处理
  handleWhitelistSuccess(message) {
    console.log('✅ Whitelist application successful:', message)
    this.$emit('notify', message);
    
    // 更新白名单状态
    this.whitelistStatus = 'pending'
    localStorage.setItem('whitelistStatus', 'pending')
    
    // 刷新状态信息
    this.loadStatusInfo();
    
    // 更新Trading Permission显示
    console.log('🔄 Trading Permission updated after whitelist application')
  },

  handleWhitelistError(message) {
    console.log('❌ Whitelist application error:', message)
    this.$emit('notify', message);
  },

  handleWhitelistInfo(message) {
    console.log('ℹ️ Whitelist application info:', message)
    this.$emit('notify', message);
    
    // 刷新状态信息
    this.loadStatusInfo();
    
    // 更新Trading Permission显示
    console.log('🔄 Trading Permission updated after whitelist info update')
  }
}
}
</script>

<style scoped>
/* Profile 页面主题适配 */
.profile-page {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}

/* 加载指示器样式 */
.loading-indicator {
  display: inline-block;
  margin-left: 8px;
  animation: spin 1s linear infinite;
  font-size: 0.8em;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误文本样式 */
.error-text {
  color: #dc3545;
  font-size: 0.9em;
  margin-top: 4px;
  font-weight: 500;
}

/* 用户操作区域样式 */
.user-actions {
  margin-top: 8px;
}

.btn-refresh {
  background: #007bff;
  color: var(--text);
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-refresh:hover:not(:disabled) {
  background: #0056b3;
}

.btn-refresh:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-retry {
  background: #dc3545;
  color: var(--text);
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8em;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.btn-retry:hover:not(:disabled) {
  background: #c82333;
}

.btn-retry:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

/* 用户联系信息样式 - 与标题风格一致 */
.user-contact-info {
  max-width: 1000px;
  margin: 20px 0;
  margin-left: 50px;
  padding: 24px;
  background: var(--card-bg);
  border-radius: 16px;
  border: 1px solid var(--border);
  backdrop-filter: blur(12px);
  box-shadow: var(--shadow);
}

.user-contact-info .label {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
  display: block;
  /* text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3); */
  letter-spacing: 0.5px;
  font-family: 'Inter', sans-serif;
}

.contact-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
}

.contact-item:hover {
  background-color: var(--hover-bg);
  border-radius: 8px;
  margin: 0 -8px;
  padding-left: 8px;
  padding-right: 8px;
}

.contact-item:first-child {
  padding-top: 0;
}

.contact-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.contact-icon {
  font-size: 16px;
  margin-right: 8px;
  width: 20px;
  text-align: center;
}

.contact-label {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--text);
  min-width: 80px;
  flex-shrink: 0;
  font-size: 14px;
  letter-spacing: 0.3px;
}

.contact-value-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  max-width: 400px;
}

.contact-value {
  color: var(--text);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background: var(--bg-secondary);
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  word-break: break-all;
  font-size: 13px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.contact-value:hover {
  background: var(--hover-bg);
  border-color: var(--border-light);
}

/* Email验证状态样式 */
.email-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.email-status-icon {
  font-size: 14px;
}

.email-verified-icon {
  width: 20px;
  height: 20px;
  fill: #10b981; /* 绿色对勾 */
}

.邮箱已验证 {
  color: #10b981;
}

.邮箱验证已发送 {
  color: #f59e0b;
}

.邮箱未验证 {
  color: #ef4444; /* 红色文字 */
  font-weight: 500;
}

/* 手机号验证状态样式 */
.phone-verified-icon {
  width: 20px;
  height: 20px;
  fill: #10b981; /* 绿色对勾 */
}

.手机号已验证 {
  color: #10b981;
}

.手机号验证已发送 {
  color: #f59e0b;
}

.手机号未验证 {
  color: #ef4444; /* 红色文字 */
  font-weight: 500;
}

.btn-small {
  background: var(--bg-secondary);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.btn-small:hover {
  background: var(--hover-bg);
}

/* 确保按钮贴着右侧 */
.contact-item .btn-small {
  margin-left: auto;
  flex-shrink: 0;
}

/* 移动端布局调整 */
@media (max-width: 768px) {
  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .contact-item .btn-small {
    margin-left: 0;
    margin-top: 4px;
    align-self: flex-start;
  }
  
  .contact-value-group {
    max-width: 100%;
    width: 100%;
    flex-wrap: wrap;
  }
  
  .contact-value {
    max-width: 100%;
    flex: 1;
  }
  
  .email-status {
    flex-shrink: 0;
  }
}

/* 加载状态样式 */
.loading-item .contact-value {
  background: #92400e;
  border-color: #b45309;
  color: #fbbf24;
  animation: pulse 1.5s ease-in-out infinite;
}

/* 错误状态样式 */
.error-item .contact-value {
  background: #7f1d1d;
  border-color: #991b1b;
  color: #fca5a5;
}

/* 脉冲动画 */
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* 加载图标动画 */
.loading-item .contact-icon {
  animation: spin 1s linear infinite;
}
/* 状态显示区域样式 */
.status-section {
  max-width: 1000px;
  margin: 20px 0;
  margin-left: 50px;
  padding: 20px;
  background: var(--card-bg);
  border-radius: 12px;
  border: 1px solid var(--border);
  backdrop-filter: blur(10px);
}

.status-title {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--text);
  font-family: 'Inter', sans-serif;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.status-item:last-child {
  border-bottom: none;
}

.status-label {
  display: flex;
  align-items: center;
  font-weight: 500;
  color: var(--text);
}

.status-icon {
  width: 20px;
  height: 20px;
  margin-right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.kyc-icon {
  color: #007bff;
}

.whitelist-icon {
  color: #28a745;
}

.trading-icon {
  color: #ffc107;
}

.status-value {
  display: flex;
  align-items: center;
}

/* KYC等级徽章样式 */
.level-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.level-0 {
  background: #f8d7da;
  color: #721c24;
}

.level-1 {
  background: #fff3cd;
  color: #856404;
}

.level-2 {
  background: #d4edda;
  color: #155724;
}

.level-3 {
  background: #cce5ff;
  color: #004085;
}

.level-unknown {
  background: #e2e3e5;
  color: #6c757d;
}

/* 白名单状态徽章样式 */
.status-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-rejected {
  background: #f8d7da;
  color: #721c24;
}

.status-none {
  background: #e2e3e5;
  color: #6c757d;
}

.status-unknown {
  background: #f8d7da;
  color: #721c24;
}

/* 交易权限徽章样式 */
.permission-badge {
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.permission-full {
  background: #d4edda;
  color: #155724;
}

.permission-limited {
  background: #fff3cd;
  color: #856404;
}

.permission-none {
  background: #f8d7da;
  color: #721c24;
}

/* 交易权限详细信息样式 */
.permission-details {
  margin-top: 8px;
  padding: 12px;
  background: rgba(31, 41, 55, 0.9);
  border-radius: 6px;
  border-left: 3px solid #3b82f6;
}

.permission-description {
  display: block;
  font-size: 13px;
  color: #cbd5e1;
  margin-bottom: 8px;
  line-height: 1.4;
}

.permission-requirements {
  margin-top: 8px;
}

.requirements-label {
  font-size: 12px;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 6px;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  display: flex;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
  color: #cbd5e1;
  transition: all 0.2s ease;
}

.requirements-list li:hover {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  padding-left: 8px;
}

.requirement-icon {
  margin-right: 8px;
  font-size: 14px;
  width: 16px;
  text-align: center;
}

.requirement-met {
  color: #10b981;
}

.requirement-met .requirement-icon {
  color: #10b981;
}

.requirements-list li:not(.requirement-met) {
  color: #ef4444;
}

.requirements-list li:not(.requirement-met) .requirement-icon {
  color: #ef4444;
}

/* 简易弹窗样式 */
.modal-mask {
  position: fixed;
  z-index: 99999;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}
.modal-wrapper {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 100000;
}
.modal-container {
  background: var(--modal-bg);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.1);
  padding: 28px 24px 18px;
  font-size: 15px;
  color: #ffffff;
  border: 1px solid rgba(74, 85, 104, 0.3);
  position: relative;
  z-index: 100001;
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  0% {
    transform: translateY(-20px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}
.container { max-width: 920px; margin: 0 auto; }
/* 页面容器深色主题 - 与图片风格一致 */
.profile-page { 
  padding-bottom: 64px; 
  background: var(--gradient-bg-hero);
  min-height: 100vh;
  color: var(--text);
}

.container {
  background: transparent;
}

/* 顶部 */
.topbar { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:24px 16px;font-size: 20px; }.breadcrumb { display:flex; align-items:center; gap:10px; color:#9ca3af; }
.crumb-back { 
  border: 0; 
  background: transparent; 
  cursor: pointer; 
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crumb-back:hover {
  background: var(--hover-bg);
  color: var(--text);
}
.sep{ opacity:.6; }
.crumb-current{ color:var(--text); font-weight:600; }

/* 标题块 */
.head { display:flex; align-items:center; gap:16px; padding:0 16px 8px;}
.avatar{ width:44px; height:44px; border-radius:999px; background:var(--bg-secondary); display:grid; place-items:center;}
.avatar-initial{ font-weight:700; color:var(--text); }
.title{ font-size:24px; line-height:1.2; margin:0; color:var(--text); }
.subtitle{ margin:2px 0 0; color:#9ca3af; }

/* 表单与控件 */
.form{ margin-top:24px; padding:0 16px; }
.field{ margin:18px 0; }
.label{ display:block; font-size:12px; color:#9ca3af; margin-bottom:8px; }
.req{ color:#f97316; }
.input{ width:100%; height:40px; border:1px solid #374151; border-radius:8px; padding:0 12px; background:#1f2937; color:#ffffff; }
.input:focus{ border-color:#4b5563; box-shadow:0 0 0 3px rgba(59, 130, 246, 0.1); }
.input::placeholder{ color:#9ca3af; }
.input.with-icon{ display:flex; align-items:center; gap:8px; padding:0 8px; }
.input.with-icon select{ border:0; outline:none; width:100%; height:38px; background:transparent; color:#ffffff; }
.input.with-icon .icon{ width:28px; height:28px; border-radius:10px; background:#374151; display:grid; place-items:center;
  box-shadow:0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px #4b5563; }
.i{ 
  width: 18px; 
  height: 18px; 
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* KYC 横幅 */
.kyc-banner{ 
  display:flex; 
  align-items:center; 
  gap:10px; 
  height:40px; 
  border-radius:8px; 
  padding:0 12px; 
  border:1px solid; 
  font-size: 13px; /* 与contact-value保持一致 */
}
.kyc-banner.orange{ background:var(--card-bg); color:#f97316; border-color:var(--border); }
.kyc-banner.green{ background:var(--card-bg); color:#16a34a; border-color:var(--border); }
.kyc-banner .icon{
  width:28px; height:28px; border-radius:10px; background:var(--bg-secondary); display:grid; place-items:center;
  box-shadow:0 2px 6px rgba(0, 0, 0, 0.2), inset 0 0 0 1px #4b5563; opacity:.9;
  transition: all 0.3s ease;
}

/* 验证通过的图标样式 */
.kyc-banner .icon.icon-verified {
  background: #16a34a;
  color: #ffffff;
  box-shadow: 0 2px 6px rgba(22, 163, 74, 0.3), inset 0 0 0 1px #15803d;
  opacity: 1;
}

.kyc-banner .icon.icon-verified svg {
  fill: #ffffff;
}


.link{ margin-left:auto; color:inherit; background:transparent; border:0; cursor:pointer; text-decoration:underline; }
.link.danger{ color:#dc2626; }
.verified{ margin-left:4px; display:inline-flex; align-items:center; gap:6px; font-weight:600; }

/* 交易权限文字样式 - 直接显示在icon后面，无背景色 */
.trading-permission-text {
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: inherit; /* 继承父元素颜色 */
  background: none; /* 无背景色 */
  padding: 0; /* 无内边距 */
  border: none; /* 无边框 */
  border-radius: 0; /* 无圆角 */
}


/* 底部按钮 */
.actions { display:flex; gap:12px; }
.actions.bottom { margin-top: 16px; }
.btn{ border:1px solid transparent; border-radius:10px; padding:8px 14px; cursor:pointer; font-weight:600; line-height:1; }
.btn.orange{ background:#ea7a2e; color:#fff; }
.btn.orange:hover{ filter:brightness(.96); }
.btn.light{ background:#374151; color:#ffffff; border-color:#4b5563; }
.btn.light:hover{ background:#4b5563; }

/* 验证码输入样式 */
.verification-input-group {
  margin: 16px 0;
}

.verification-input {
  width: 100%;
  height: 48px;
  border: 2px solid var(--border);
  border-radius: 8px;
  padding: 0 16px;
  background: var(--bg-secondary);
  color: var(--text);
  font-size: 16px;
  letter-spacing: 4px;
  text-align: center;
  transition: all 0.2s ease;
}

.verification-input:focus {
  border-color: #ea7a2e;
  outline: none;
  box-shadow: 0 0 0 3px rgba(234, 122, 46, 0.1);
}

.verification-input::placeholder {
  letter-spacing: normal;
  color: #9ca3af;
}

/* 成功弹窗样式 */
.success-modal {
  text-align: center;
}

.success-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 50%;
  animation: scaleIn 0.3s ease;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 禁用按钮样式 */
.btn.orange:disabled {
  background: #6b7280;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn.orange:disabled:hover {
  filter: none;
}

/* 移动端弹窗优化 */
@media (max-width: 768px) {
  .modal-mask {
    z-index: 999999;
    padding: 20px;
  }
  
  .modal-wrapper {
    z-index: 1000000;
    max-width: 100%;
  }
  
  .modal-container {
    z-index: 1000001;
    padding: 24px 20px 16px;
    margin: 0;
  }
}
</style>
