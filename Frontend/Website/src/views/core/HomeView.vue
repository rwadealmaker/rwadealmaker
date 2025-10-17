<template>
  <!-- Intro Video Overlay -->
  <div 
    v-if="showIntroVideo || isTransitioning" 
    class="intro-video-overlay"
    :class="{ 'fade-out': isTransitioning }"
  >
    <div 
      class="intro-video-container"
      :class="{ 'fade-out': isTransitioning }"
    >
      <video 
        ref="introVideo"
        class="intro-video"
        autoplay 
        muted 
        playsinline
        @ended="handleIntroVideoEnd"
        @canplaythrough="handleIntroVideoReady"
        @error="handleIntroVideoError"
      >
        <source src="/videos/Introvideo.mp4" type="video/mp4">
        你的浏览器不支持视频播放
      </video>
      
      <!-- Skip Button (右上角) -->
      <button 
        v-if="showIntroSkipButton" 
        class="skip-button" 
        @click="skipIntroVideo"
        title="Skip Video"
      >
    -> 跳过视频
      </button>
      
      <!-- Video Overlay -->
      <div class="video-overlay">
        <!-- Loading Indicator -->
        <div v-if="introVideoLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p class="loading-text">加载视频...</p>
        </div>
        
        <!-- Error Message -->
        <div v-if="introVideoError" class="error-message">
          <p>视频加载失败</p>
          <button class="btn btn-secondary" @click="closeIntroVideo">关闭</button>
        </div>
      </div>
      
      <!-- Brand Information Display -->
      <div class="brand-info">
        <div class="logo-container">
          <!-- <img src="/icons/RWA-logo.png" alt="RWA Logo" class="brand-logo"> -->
        </div>
        <h1 class="headline">我们是专注于把房地产资产包装成<br>投资人喜欢的RWA底层资产的<br>RWA Dealmaker</br>
        </h1>
        <p class="brand-subtitle">本平台以保护RWA投资人的投资安全为出发点，组织合法合规，风险低，回报高的优质资产</p>
      </div>
    </div>
  </div>

  <!--Homepage-->
  <!-- <section 
    class="container hero" 
    :class="{ 'fade-in': !showIntroVideo && !isTransitioning }"
  >
    <div class="grid">
      <div>
        <h1 class="headline">我们是专注于把房地产资产包装成投资人喜欢的RWA底层资产的RWA Dealmaker -->
          <!-- Invest in RWA Property Loans with Monthly Returns -->
        <!-- </h1> -->
        <!-- <p class="sub">We specialize in originating real estate assets into RWA underlying assets that investors prefer</p> -->
        <!-- <p class="sub">本平台以保护RWA投资人的投资安全为出发点，组织合法合规，风险低，回报高的优质资产 -->
          <!-- Australian Real Estate On-Chain · A safe, compliant, and high-return RWA investment platform-->
          <!-- </p> -->
        <!-- <p class="foot">继续使用，即表示您同意我们的条款并承认我们的  -->
          <!-- <a href="/src/components/privacypolicy.vue" >隐私政策.</a></p> -->
        <!-- <div style="margin-top: 40px;margin-left: 100px;display: flex;gap: 20px;width: 500px;"> -->
          <!-- <button class="btn-primary" @click="goToProjects">Invest Now</button>
          <button class="btn-secondary" @click="goToContact">Contact Us</button> -->
        <!-- </div> -->
      <!-- </div> -->
        <!-- Blockchain Smart Contract Trading Dynamic Pattern -->
         <!-- <video autoplay loop muted playsinline class="bg-video">
           <source src="/videos/Blockchainvideo.mp4" type="video/mp4">
         </video> -->
    <!-- </div> -->
  <!-- </section> -->

  <!-- Contact Us Section -->
  <!-- <ContactUs 
    :show-intro-video="showIntroVideo" 
    :is-transitioning="isTransitioning"
  /> -->

</template>

<script>
import { productAPI } from '@/service/api.ts'
import { useDatabaseSync } from '@/service/dataSyncService.js'
import ContactUs from '@/components/ContactUs.vue'

export default {
  name: 'HomeView',
  components: {
    ContactUs
  },
  emits: ['notify'],
  data() {
    return {
      products: [],
      loading: false,
      error: null,
      // Intro video related states
      showIntroVideo: false,
      introVideoLoading: true,
      showIntroSkipButton: false,
      introVideoError: false,
      introVideoTimer: null,
      // Transition effect states
      isTransitioning: false,
      transitionTimer: null
    }
  },
  computed: {
    // Get INCOMING status projects, sorted by project code in ascending order
    upcomingProjects() {
      return this.products
        .filter(product => product.status === 'INCOMING')
        .sort((a, b) => {
          // Sort by project code in ascending order
          return a.code.localeCompare(b.code)
        })
    },
    // Get the latest upcoming project as New Listing
    newListingProject() {
      return this.upcomingProjects.length > 0 ? this.upcomingProjects[0] : null
    }
  },
  methods: { 
    notify(msg){ this.$emit('notify', msg) },
    
    // Load product data from database
    async loadProducts() {
      this.loading = true
      this.error = null
      
      try {
        console.log('HomeView: Loading product data from database...')
        const response = await productAPI.getAllProducts()
        
        if (response.status === 0) {
          const products = response.data || []
          
          // Immediately update product list, trigger reactive update
          this.products = products
          
          console.log('HomeView: Successfully loaded', products.length, 'products')
          console.log('HomeView: Upcoming projects:', this.upcomingProjects)
          
          // 如果有项目数据，显示成功消息
          if (products.length > 0) {
            const upcomingCount = this.upcomingProjects.length
            if (upcomingCount > 0) {
              this.notify(`成功加载 ${upcomingCount} 个即将发布的项目`)
            }
          }
          
          // 确保UI立即更新
          this.$nextTick(() => {
            console.log('HomeView: UI已更新，项目列表已显示')
          })
          
        } else {
          this.error = response.message || '加载产品数据失败'
          console.error('HomeView: 加载产品数据失败:', this.error)
          this.notify('加载产品数据失败: ' + this.error)
        }
      } catch (error) {
        this.error = error.message || '网络错误'
        console.error('HomeView: 加载产品数据异常:', error)
        this.notify('加载产品数据异常: ' + this.error)
      } finally {
        this.loading = false
      }
    },
    
    // 设置数据库同步
    setupDatabaseSync() {
      const { subscribeProducts, subscribeNewProjects } = useDatabaseSync()
      
      // 订阅产品列表更新
      this.unsubscribeProducts = subscribeProducts((products) => {
        console.log('🔄 HomeView: 收到产品数据更新，共', products.length, '个项目')
        
        const oldProducts = [...this.products]
        this.products = products
        
        // 检查是否有新的upcoming项目
        const oldUpcomingCount = oldProducts.filter(p => p.status === 'INCOMING').length
        const newUpcomingCount = products.filter(p => p.status === 'INCOMING').length
        
        if (newUpcomingCount > oldUpcomingCount) {
          console.log('🆕 HomeView: 发现', newUpcomingCount - oldUpcomingCount, '个新的upcoming项目')
          this.notify(`发现 ${newUpcomingCount - oldUpcomingCount} 个新项目`)
        }
        
        // 确保UI立即更新
        this.$nextTick(() => {
          console.log('HomeView: 实时更新完成，项目列表已刷新')
        })
      })
      
      // 订阅新项目通知
      this.unsubscribeNewProjects = subscribeNewProjects((newProjects) => {
        console.log('🆕 HomeView: 收到新项目通知:', newProjects)
        this.notify(`新增 ${newProjects.length} 个项目`)
      })
    },
    getStatusText(status) {
      const statusMap = {
        'ACTIVE': 'Active',
        'INCOMING': 'Upcoming',
        'PERFORMING': 'Performing',
        'DEFAULT': 'Default'
      }
      return statusMap[status] || 'Unknown'
    },
    getStatusClass(status) {
      const classMap = {
        'ACTIVE': 'status-active',
        'INCOMING': 'status-upcoming',
        'PERFORMING': 'status-performing',
        'DEFAULT': 'status-default'
      }
      return classMap[status] || 'status-unknown'
    },
    viewProjectDetails(projectCode) {
      // 跳转到项目详情页面
      this.$router.push(`/detail/${projectCode}`)
    },
    addToWatchlist(projectCode) {
      // 添加到关注列表
      this.notify(`Added ${projectCode} to watchlist`)
      console.log('Added to watchlist:', projectCode)
    },
    refreshListings() {
      // 刷新项目列表
      this.notify('Refreshing listings...')
      console.log('🔄 Refreshing listings...')
      this.loadProducts()
    },
    viewAllProjects() {
      // 跳转到项目列表页面
      this.$router.push('/projects')
    },
    formatNumber(number) {
      // 格式化数字显示
      if (!number) return '0'
      return new Intl.NumberFormat('en-US').format(number)
    },
    
    // 处理钱包活动更新
    handleWalletActivityUpdate(activity) {
      console.log('🏠 HomeView: Received wallet activity update:', activity)
      // 这里可以添加处理钱包活动更新的逻辑
    },
    
    // 播放开场视频
    playIntroVideo() {
      this.showIntroVideo = true
      this.introVideoLoading = true
      this.introVideoError = false
      this.showIntroSkipButton = true // 立即显示跳过按钮
      
      // 清除之前的定时器
      if (this.introVideoTimer) {
        clearTimeout(this.introVideoTimer)
        this.introVideoTimer = null
      }
    },
    
    // 跳转到项目页面
    goToProjects() {
      this.$router.push('/listedprojects')
    },
    
    // 跳转到联系我们页面
    goToContact() {
      // 滚动到页面底部的联系我们部分
      const contactSection = document.querySelector('.contact-content')
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' })
      } else {
        // 如果找不到联系我们部分，跳转到项目页面
        this.$router.push('/projects')
      }
    },
    
    // 视频准备就绪
    handleIntroVideoReady() {
      this.introVideoLoading = false
      console.log('开场视频加载完成')
    },
    
    // 视频播放结束
    handleIntroVideoEnd() {
      console.log('开场视频播放完成')
      this.startTransition()
    },
    
    // 视频加载错误
    handleIntroVideoError() {
      console.error('开场视频加载失败')
      this.introVideoLoading = false
      this.introVideoError = true
    },
    
    // 跳过视频
    skipIntroVideo() {
      console.log('用户跳过开场视频')
      this.startTransition()
    },
    
    // 开始过渡效果
    startTransition() {
      this.isTransitioning = true
      
      // 停止视频播放
      const video = this.$refs.introVideo
      if (video) {
        video.pause()
      }
      
      // 1秒后开始淡出视频，再1秒后完全关闭
      this.transitionTimer = setTimeout(() => {
        this.showIntroVideo = false
        
        // 再延迟一点时间确保过渡完成
        setTimeout(() => {
          this.isTransitioning = false
          this.resetVideoState()
        }, 10)
      }, 10)
    },
    
    // 关闭视频覆盖层
    closeIntroVideo() {
      this.showIntroVideo = false
      this.introVideoLoading = false
      this.introVideoError = false
      this.showIntroSkipButton = false
      this.isTransitioning = false
      
      // 清除定时器
      if (this.introVideoTimer) {
        clearTimeout(this.introVideoTimer)
        this.introVideoTimer = null
      }
      
      if (this.transitionTimer) {
        clearTimeout(this.transitionTimer)
        this.transitionTimer = null
      }
      
      this.resetVideoState()
    },
    
    // 重置视频状态
    resetVideoState() {
      // 停止视频播放并重置
      const video = this.$refs.introVideo
      if (video) {
        video.pause()
        video.currentTime = 0
      }
      
      // 重置所有状态
      this.introVideoLoading = false
      this.introVideoError = false
      this.showIntroSkipButton = false
      this.isTransitioning = false
    }
  },
  async mounted() {
    console.log('🏠 HomeView: 组件已挂载，开始初始化...')
    
    // 自动播放intro video
    this.playIntroVideo()
    
    // 设置数据库同步
    this.setupDatabaseSync()
    
    // 立即加载产品数据
    console.log('🏠 HomeView: 开始加载产品数据...')
    await this.loadProducts()
    
    // 测试数据关联
    console.log('🏠 HomeView: Loaded product data:', this.products.length, 'projects')
    console.log('📋 HomeView: Upcoming项目:', this.upcomingProjects)
    console.log('🆕 HomeView: New Listing项目:', this.newListingProject)
    
    if (this.newListingProject) {
      console.log('✅ HomeView: Project Details of New Listing:', {
        code: this.newListingProject.code,
        name: this.newListingProject.name,
        loanAmount: this.newListingProject.loanAmount,
        targetYield: this.newListingProject.targetYield,
        loanTerm: this.newListingProject.loanTerm,
        status: this.newListingProject.status
      })
      
      // 如果有项目数据，确保UI立即更新
      this.$nextTick(() => {
        console.log('🏠 HomeView: 项目列表已显示在UI中')
      })
    } else {
      console.log('ℹ️ HomeView: No upcoming project')
    }
    
    // 监听钱包活动更新事件
    this.$root.$on('walletActivityUpdated', this.handleWalletActivityUpdate)
  },
  beforeUnmount() {
    // 清理数据库同步订阅
    if (this.unsubscribeProducts) {
      this.unsubscribeProducts()
    }
    if (this.unsubscribeNewProjects) {
      this.unsubscribeNewProjects()
    }
    
    // 清理事件监听
    this.$root.$off('walletActivityUpdated', this.handleWalletActivityUpdate)
    
    // 清理视频定时器
    if (this.introVideoTimer) {
      clearTimeout(this.introVideoTimer)
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer)
    }
  }
}
</script>

<style scoped>
/* 开场视频覆盖层样式 */
.intro-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 1;
  transition: opacity 1s ease-in-out;
}

/* 淡出效果 */
.intro-video-overlay.fade-out {
  opacity: 0;
}

/* 主页内容淡入效果 */
.hero, .section, .container {
  opacity: 0;
  transition: opacity 1s ease-in-out 0.5s;
}

.hero.fade-in, .section.fade-in, .container.fade-in {
  opacity: 1;
}

.intro-video-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.intro-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 1;
  transition: opacity 1s ease-in-out;
}

.intro-video-container.fade-out .intro-video {
  opacity: 0.3;
}

.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

/* 加载指示器 */
.loading-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #ffffff;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid #33CCFF;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

/* 跳过按钮 */
.skip-button {
  position: absolute;
  top: 30px;
  right: 30px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  z-index: 3;
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-2px);
}

/* 错误提示 */
.error-message {
  color: #ffffff;
  text-align: center;
  background: rgba(239, 68, 68, 0.8);
  padding: 20px 30px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.error-message p {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 500;
}

/* 品牌信息 */
.brand-info {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 3;
  color: #ffffff;
  transition: opacity 1s ease-in-out;
}

.intro-video-container.fade-out .brand-info {
  opacity: 0.5;
}

.logo-container {
  margin-bottom: 20px;
  animation: logoFloat 3s ease-in-out infinite;
}

.brand-logo {
  width: 80px;
  height: 80px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.brand-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.brand-subtitle {
  font-size: 16px;
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  max-width: 800px;
  line-height: 1.5;
}

@keyframes logoFloat {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .skip-button {
    top: 20px;
    right: 20px;
    padding: 10px 20px;
    font-size: 13px;
  }
  
  .brand-info {
    bottom: 40px;
    padding: 0 20px;
  }
  
  .brand-logo {
    width: 60px;
    height: 60px;
  }
  
  .brand-title {
    font-size: 24px;
  }
  
  .brand-subtitle {
    font-size: 14px;
  }
  
  /* 手机端页边距 */
  .hero .headline {
    margin-left: 30px;
    margin-right: 30px;
    width: 800px;
  }
  
  .hero .sub {
    margin-left: 30px;
    margin-right: 30px;
    width: 600px;
  }
  
  .hero .foot {
    margin-left: 30px;
    margin-right: 30px;
  }
  
  .hero div[style*="display: flex"] {
    margin-left: 30px !important;
    margin-right: 30px !important;
    width: calc(100% - 60px) !important;
  }
  
  .contact-container {
    padding: 0 30px;
  }
}

@media (max-width: 480px) {
  .skip-button {
    top: 15px;
    right: 15px;
    padding: 8px 16px;
    font-size: 12px;
  }
  
  .brand-info {
    bottom: 30px;
  }
  
  .brand-logo {
    width: 50px;
    height: 50px;
  }
  
  .brand-title {
    font-size: 20px;
  }
  
  .brand-subtitle {
    font-size: 13px;
  }
  
  /* 小屏手机端页边距 */
  .hero .headline {
    margin-left: 30px;
    margin-right: 30px;
    width: calc(100% - 60px);
    font-size: 24px;
  }
  
  .hero .sub {
    margin-left: 30px;
    margin-right: 30px;
    width: calc(100% - 60px);
  }
  
  .hero .foot {
    margin-left: 30px;
    margin-right: 30px;
  }
  
  .hero div[style*="display: flex"] {
    margin-left: 30px !important;
    margin-right: 30px !important;
    width: calc(100% - 60px) !important;
  }
  
  .contact-container {
    padding: 0 30px;
  }
}

.section{
  margin: 0;
  padding: 0;
  background: 
        radial-gradient(circle at 20% 80%, rgba(51, 204, 255, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0, 153, 204, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(25, 25, 112, 0.1) 0%, transparent 50%);
  position: relative;
  overflow: hidden;
  min-height: 100vh;
  width: 100vw;
  max-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}
/* Hero section 深色背景样式 */
.hero.container {
  max-width: none; /* 覆盖全局container的max-width限制 */
  margin: 0;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 100vh; /* 全屏高度 */
  height: 100vh;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100vw;
  height: 100vh;
    background: 
      radial-gradient(circle at 20% 80%, rgba(51, 204, 255, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(0, 153, 204, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(25, 25, 112, 0.1) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.hero .grid {
  position: relative;
  z-index: 1;
}

.hero .headline {
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 40px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  margin-left:100px;
  width:1000px;
}

.hero .sub {
  color: #e0e0e0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  max-width: 650px;
  margin-left:100px;
}

.hero .foot{
  margin-left:100px;
  font-size: 18px;
}

.hero-image {
  width: 100%;
  max-width: 600px;
  height: auto;
  border-radius: 16px;
  /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3); */
  transition: transform 0.3s ease;
}

/* .hero-image:hover {
  transform: scale(1.02);
} */

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: 16px;
  object-fit: cover;
}

/* Hero Image 响应式设计 */
@media (max-width: 768px) {
  .hero-image {
    max-width: 100%;
    margin: 0 auto;
  }
  
  .hero .headline {
    margin-left: 0;
    width: 100%;
    font-size: 36px;
  }
  
  .hero .sub {
    margin-left: 0;
  }
  
  .hero .foot {
    margin-left: 0;
  }
  
  .blockchain-live-visual {
    height: 100vh;
  }
  
  .bg-video {
    min-width: 100%;
    min-height: 100%;
  }
  
  /* 移动端按钮布局 */
  .hero div[style*="display: flex"] {
    flex-direction: column !important;
    width: 100% !important;
    margin-left: 0 !important;
    gap: 12px !important;
  }
  
  .btn-primary, .btn-secondary, .btn-intro {
    width: 100%;
    font-size: 14px;
    padding: 14px 20px;
  }
}

@media (max-width: 480px) {
  .hero-image {
    max-width: 100%;
    border-radius: 12px;
  }
  
  .hero-image img {
    border-radius: 12px;
  }
  
  .hero .headline {
    font-size: 28px;
    text-align: center;
  }
  
  .hero .sub {
    text-align: center;
  }
  
  .blockchain-live-visual {
    height: 100vh;
  }
  
  .bg-video {
    min-width: 100%;
    min-height: 100%;
  }
}

.hero .card {
  background: rgba(20, 20, 38, 0.8);
  backdrop-filter: blur(10px);
    border: 1px solid rgba(51, 204, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.hero .card h3 {
  color: #ffffff;
}

.hero .li {
  color: #d0d0d0;
}

.hero .check svg {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
}

.blockchain-live-visual {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: -1;
  border-radius: 0; /* 移除圆角，完全覆盖 */
} 


/* 重新设计的New Listing卡片样式 */
.new-listings-section {
  margin-top:30px;
  margin-left: 200px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 40px;
  padding: 0;
  position: relative;
  overflow: hidden;
  min-height: 10vh;
  width: 100vw;
  max-width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}

.new-listings-section h1 {
  position: absolute;
  top: 20px;
  left: 20px;
  color: #ffffff;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.new-listings-section .container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 100px 100px;
  padding: 0 20px;
}

/* 项目网格布局 */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
}

.projects-grid.fade-in {
  opacity: 1;
  transform: translateY(0);
}

.listing-card {
  width: 100%;
  background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 32px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(51, 204, 255, 0.2);
    border: 1px solid rgba(51, 204, 255, 0.1);
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition: opacity 0.6s ease-in-out, transform 0.6s ease-in-out;
}

.listing-card.card-fade-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.listing-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #33CCFF, #0099CC, #33CCFF);
  border-radius: 20px 20px 0 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(10, 15, 25, 0.2);
}

.card-title {
  color: #ffffff;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.status-active {
  background: linear-gradient(135deg, #10b981, #059669);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.status-badge.status-incoming {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.status-badge.status-performing {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.status-badge.status-default {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.card-content {
  color: #e5e7eb;
}

.project-info {
  margin-bottom: 24px;
}

.project-name {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.project-description {
  color: #9ca3af;
  font-size: 14px;
  margin: 0;
  line-height: 1;
}

.project-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
}

.detail-value.highlight {
  color: #10b981;
  font-size: 18px;
}

.detail-value.status {
  color: #f59e0b;
}

.card-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-primary, .btn-secondary, .btn-intro {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: rgb(21, 32, 53);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(10, 15, 25, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10, 15, 25, 0.4);
  background: rgb(15, 20, 30);
}

.btn-secondary {
  background: transparent;
  color: #33CCFF;
  border: 2px solid rgba(51, 204, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(51, 204, 255, 0.1);
  border-color: rgba(51, 204, 255, 0.5);
}

.btn-intro {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: #ffffff;
  border: 2px solid rgba(255, 107, 107, 0.3);
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  position: fixed;
  top: 80px;
  left: 120px;
}

.btn-intro:hover {
  background: linear-gradient(135deg, #ff5252, #d63031);
  border-color: rgba(255, 107, 107, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.btn-icon {
  font-size: 14px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .new-listings-section {
    padding: 40px 0;
  }
  
  .new-listings-section h1 {
    position: static;
    text-align: center;
    margin-bottom: 20px;
    font-size: 28px;
  }
  
  .new-listings-section .container {
    padding: 0 16px;
  }
  
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 20px;
    max-width: 500px;
  }
  
  .listing-card {
    width: 100%;
    padding: 24px;
  }
  
  .card-title {
    font-size: 20px;
  }
  
  .project-name {
    font-size: 18px;
  }
  
  .project-details {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .new-listings-section h1 {
    font-size: 24px;
    margin-bottom: 16px;
  }
  
  .projects-grid {
    gap: 16px;
  }
  
  .listing-card {
    padding: 20px;
  }
  
  .card-title {
    font-size: 18px;
  }
  
  .project-name {
    font-size: 16px;
  }
  
  .detail-value {
    font-size: 14px;
  }
  
  .detail-value.highlight {
    font-size: 16px;
  }
}

/* 财务信息网格 */
.financial-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.financial-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.financial-label {
  font-size: 12px;
  font-weight: 600;
  color: #8ca0c3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.financial-value {
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.financial-value.yield {
  color: #16a34a;
  text-shadow: 0 0 8px rgba(22, 163, 74, 0.3);
}

.financial-value.status {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  text-align: center;
  display: inline-block;
  width: fit-content;
}

.status-active {
  background: rgba(22, 163, 74, 0.2);
  color: #16a34a;
  border: 1px solid rgba(22, 163, 74, 0.3);
}

.status-upcoming {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-research {
  background: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.3);
}

.status-planning {
  background: rgba(147, 51, 234, 0.2);
  color: #9333ea;
  border: 1px solid rgba(147, 51, 234, 0.3);
}

.status-completed {
  background: rgba(107, 114, 128, 0.2);
  color: #6b7280;
  border: 1px solid rgba(107, 114, 128, 0.3);
}

/* 操作按钮 */
.listing-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {/**view details */
  flex: 1;
  padding: 12px 20px;
  background: rgb(51, 96, 187);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(10, 15, 25, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(10, 15, 25, 0.4);
  background: rgb(19, 38, 77);
}

.btn-secondary { /**add to watchlist */
  flex: 1;
  padding: 12px 20px;
  background: rgb(122, 124, 140);
  color: #e0e0e0;
  border: 1px solid rgba(43, 49, 59, 0.3);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  transform: translateY(-2px);
  border-color: rgba(51, 204, 255, 0.6);
  background: rgba(51, 204, 255, 0.1);
  color: #ffffff;
}

/* 项目列表样式 */
.projects-header {
  margin-bottom: 24px;
  text-align: center;
  width:300px;
}

.projects-title {
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  width:400px;
  
}

.projects-subtitle {
  font-size: 14px;
  color: #8ca0c3;
  margin: 0;
  line-height: 1.5;
  width:400px;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
  width:400px;
}

.wallet-grid {
  background: #0a0a1a;
  border-radius: 16px;
  padding: 32px 24px;
}
.section.wallet {
  background: #0A0A19;
}

.input{
  background: #242435;
}

.card{
  max-height: 280px;
}

/* 自定义滚动条 */
.projects-list::-webkit-scrollbar {
  width: 6px;
}

.projects-list::-webkit-scrollbar-track {
  background: rgba(51, 204, 255, 0.1);
  border-radius: 3px;
}

.projects-list::-webkit-scrollbar-thumb {
  background: rgba(10, 15, 25, 0.3);
  border-radius: 3px;
}

.projects-list::-webkit-scrollbar-thumb:hover {
  background: rgba(10, 15, 25, 0.5);
}

.project-card {
  background: rgba(20, 20, 40, 0.6);
    border: 1px solid rgba(51, 204, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s ease;
}

.project-card:hover {
  transform: translateY(-2px);
  border-color: rgba(51, 204, 255, 0.4);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-info {
  flex: 1;
}

.project-name {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.project-subtitle {
  font-size: 12px;
  color: #8ca0c3;
  margin: 0;
  line-height: 1.4;
}

.project-status {
  flex-shrink: 0;
  margin-left: 12px;
}

.project-financials {
  margin-bottom: 16px;
}

.financial-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  margin-bottom: 8px;
}

.financial-row:last-child {
  margin-bottom: 0;
}

.financial-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.financial-label {
  font-size: 10px;
  font-weight: 600;
  color: #8ca0c3;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.financial-value {
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.financial-value.yield {
  color: #16a34a;
  text-shadow: 0 0 4px rgba(22, 163, 74, 0.3);
}

.project-actions {
  display: flex;
  gap: 8px;
}

.project-actions .btn-primary,
.project-actions .btn-secondary {
  flex: 1;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.project-actions .btn-primary {
  background: rgb(10, 15, 25);
  color: white;
  border: none;
  box-shadow: 0 2px 8px rgba(10, 15, 25, 0.3);
}

.project-actions .btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(10, 15, 25, 0.4);
}

.project-actions .btn-secondary {
  background: rgba(20, 20, 40, 0.8);
  color: #e0e0e0;
  border: 1px solid rgba(10, 15, 25, 0.3);
}

.project-actions .btn-secondary:hover {
  border-color: rgba(51, 204, 255, 0.6);
  background: rgba(51, 204, 255, 0.1);
  color: #ffffff;
}

.view-all-projects {
  text-align: center;
  padding-top: 16px;
  border-top: 1px solid rgba(10, 15, 25, 0.1);
}

.btn-outline {
  padding: 12px 24px;
  background: transparent;
  color: #184b5d;
  border: 2px solid rgba(51, 204, 255, 0.3);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: -15px;
  margin-bottom: 30px;
}

.btn-outline:hover {
  background: rgba(51, 204, 255, 0.1);
  border-color: rgba(51, 204, 255, 0.6);
  color: #ffffff;
  transform: translateY(-2px);
}

/* 加载状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
  opacity: 1;
  transition: opacity 0.3s ease-in-out;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(10, 15, 25, 0.2);
  border-top: 3px solid rgb(10, 15, 25);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #9ca3af;
  font-size: 16px;
  margin: 0;
}

/* 错误状态样式 */
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-title {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.error-description {
  color: #9ca3af;
  font-size: 14px;
  margin: 0 0 24px 0;
}

/* 空状态样式 */
/* 查看所有项目按钮 */
.view-all-section {
  text-align: center;
  margin-top: 32px;
  padding: 24px 0;
}

.view-all-projects {
  background: transparent;
  border: 2px solid rgba(51, 204, 255, 0.3);
  color: #33CCFF;
  padding: 12px 32px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.view-all-projects:hover {
  background: rgba(51, 204, 255, 0.1);
  border-color: rgba(51, 204, 255, 0.6);
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(51, 204, 255, 0.2);
}

.empty-state {
  padding: 40px 24px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.6;
}

.empty-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.empty-description {
  font-size: 14px;
  color: #8ca0c3;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .financial-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .listing-actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    flex: none;
  }
  
  .financial-row {
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  
  .project-actions {
    flex-direction: column;
  }
  
  .project-actions .btn-primary,
  .project-actions .btn-secondary {
    flex: none;
  }
}

@media (max-width: 480px) {
  .listing-header {
    padding: 20px 20px 12px 20px;
  }
  
  .listing-content {
    padding: 20px;
  }
  
  .project-title {
    font-size: 16px;
  }
  
  .financial-value {
    font-size: 14px;
  }
  
  .projects-list {
    max-height: 300px;
  }
  
  .project-card {
    padding: 12px;
  }
  
  .project-name {
    font-size: 14px;
  }
  
  .financial-row {
    grid-template-columns: 1fr;
    gap: 6px;
  }
  
  .financial-label {
    font-size: 9px;
  }
  
  .financial-value {
    font-size: 12px;
  }
}

  .background {
    background: radial-gradient(circle at 30% 30%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
    radial-gradient(circle at 70% 70%, rgba(147, 51, 234, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, 
      rgba(10, 20, 40, 0.8) 0%,
      rgba(20, 40, 80, 0.6) 25%,
      rgba(30, 60, 120, 0.4) 50%,
      rgba(20, 40, 80, 0.6) 75%,
      rgba(10, 20, 40, 0.8) 100%
    );
  box-shadow: 
    inset -20px -20px 50px rgba(0, 0, 0, 0.3),
    inset 20px 20px 50px rgba(59, 130, 246, 0.1),
    0 0 100px rgba(59, 130, 246, 0.2);
  position: relative;
  animation: earthRotate 20s linear infinite;
}

.earth-sphere::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: 
    radial-gradient(circle at 20% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 80% 80%, rgba(245, 158, 11, 0.1) 0%, transparent 30%),
    radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.1) 0%, transparent 40%);
  animation: earthGlow 8s ease-in-out infinite alternate;
}

.earth-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%);
  animation: earthPulse 4s ease-in-out infinite;
}

.network-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.network-svg {
  width: 100%;
  height: 100%;
}

/* 地球旋转动画 */
@keyframes earthRotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 地球发光动画 */
@keyframes earthGlow {
  0% { 
    opacity: 0.3;
    transform: scale(1);
  }
  100% { 
    opacity: 0.6;
    transform: scale(1.05);
  }
}

/* 地球脉冲动画 */
@keyframes earthPulse {
  0%, 100% { 
    opacity: 0.2;
    transform: translate(-50%, -50%) scale(1);
  }
  50% { 
    opacity: 0.4;
    transform: translate(-50%, -50%) scale(1.1);
  }
}

@keyframes binaryFlicker {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

@keyframes dataPulse {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  50% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}

@keyframes iconFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translateY(-10px) scale(1.1);
    opacity: 1;
  }
}

</style>
