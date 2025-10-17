<template>
  <div class="about-page">
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
        {{ t('common.browserNotSupported') }}
      </video>
      
      <!-- Skip Button (右上角) -->
      <button 
        v-if="showIntroSkipButton" 
        class="skip-button" 
        @click="skipIntroVideo"
        title="Skip Video"
      >
    {{ t('common.skipVideo') }}
      </button>
      
      <!-- Video Overlay -->
      <div class="video-overlay">
        <!-- Loading Indicator -->
        <div v-if="introVideoLoading" class="loading-indicator">
          <div class="loading-spinner"></div>
          <p class="loading-text">{{ t('common.loadingVideo') }}</p>
        </div>
        
        <!-- Error Message -->
        <div v-if="introVideoError" class="error-message">
          <p>{{ t('common.videoLoadError') }}</p>
          <button class="btn btn-secondary" @click="closeIntroVideo">{{ t('common.close') }}</button>
        </div>
      </div>
      
      <!-- Brand Information Display -->
      <div class="brand-info">
        <div class="logo-container">
          <!-- <img src="/icons/RWA-logo.png" alt="RWA Logo" class="brand-logo"> -->
        </div>
        <h1 class="headline">{{ t('about.headline') }}</h1>
        
      </div>
    </div>
  </div>

  <div class="container" :class="{ 'fade-in': !showIntroVideo && !isTransitioning }">
    <div class="page-header">
      <h1 class="title" style="color: var(--heading-color);">{{ t('about.title') }}</h1>
      <!-- <p class="page-subtitle">Innovative technology company dedicated to revolutionizing real estate investment</p> -->
    </div>

    <div class="about-content">
      <!-- 项目背景与愿景部分 -->
      <div class="background-vision-section">
        <!-- <h2>Background</h2> -->
        <!-- <div class="vision-content"> -->
          <div class="vision-text">
            <p :class="['vision-intro', { 'no-indent': currentLanguage.code === 'en' }]">
              {{ t('about.intro1') }}
            </p>
            
            <p :class="['vision-intro', { 'no-indent': currentLanguage.code === 'en' }]">
              {{ t('about.intro2') }}
            </p>
            
            <p :class="['vision-intro', { 'no-indent': currentLanguage.code === 'en' }]">
              {{ t('about.intro3') }}
            </p>
          </div>
      </div>

      <!-- <div class="mission-section">
        <div class="mission-text">
          <h2>Our Mission</h2>
          <p>We are committed to revolutionizing traditional real estate investment through blockchain technology, allowing everyone to participate in high-quality real estate investment, and share the growth红利 of the real estate market.</p>
          <p>Through tokenization technology, we will break down traditional real estate investment that requires a large amount of capital into small, tradable units, allowing ordinary investors to enjoy stable returns from real estate investment.</p>
        </div>
        <div class="mission-image">
        </div>
      </div> -->

      <!-- <div class="values-section">
        <h2>Core Values</h2>
        <div class="values-grid">
          <div class="value-card">
            <h3>Security First</h3>
            <p>Use the most advanced encryption technology and multiple security measures to ensure the security of user assets and transactions.</p>
          </div>
          <div class="value-card">
            <h3>Transparent and Open</h3>
            <p>All transaction records are stored on the chain, project information is completely transparent, allowing investors to invest clearly and clearly.</p>
          </div>
          <div class="value-card">
            <h3>Continuous Innovation</h3>
            <p>Continuously explore new technologies, optimize user experience, and provide better services for investors.</p>
          </div>
          <div class="value-card">
            <h3>User-Centered</h3>
            <p>Provide professional,贴心 services, helping users achieve wealth增值。</p>
          </div>
        </div>
      </div> -->

      <!-- <div class="team-section">
        <h2>Core Team</h2>
        <div class="team-grid">
          <div class="team-member">
            <h4>张明</h4>
            <p class="member-title"></p>
            <p class="member-bio">拥有15年金融科技经验，曾在多家知名金融机构担任高管职务。</p>
          </div>
          <div class="team-member">
            <h4>李华</h4>
            <p class="member-title">CFO</p>
            <p class="member-bio">区块链技术专家，在分布式系统和智能合约开发方面有丰富经验。</p>
          </div>
          <div class="team-member">
            <h4>王强</h4>
            <p class="member-title">CMO</p>
            <p class="member-bio">房地产行业资深专家，对市场趋势和投资机会有深刻洞察。</p>
          </div>
        </div>
      </div>

      <div class="stats-section">
        <h2>Company Data</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">2023</div>
            <div class="stat-label">Year of Establishment</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">50+</div>
            <div class="stat-label">Team Members</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">$50M+</div>
            <div class="stat-label">Managed Assets</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">1,200+</div>
            <div class="stat-label">Active Users</div>
          </div>
        </div>
      </div> -->
    </div>
  </div>
  </div>
</template>

<script>
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'AboutUsView',
  setup() {
    const { t, currentLanguage } = useLanguage()
    return { t, currentLanguage }
  },
  data() {
    return {
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
  mounted() {
    // 页面加载时自动播放intro video
    this.playIntroVideo()
  },
  beforeUnmount() {
    // 清理定时器
    if (this.introVideoTimer) {
      clearTimeout(this.introVideoTimer)
    }
    if (this.transitionTimer) {
      clearTimeout(this.transitionTimer)
    }
  },
  methods: {
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
  }
}
</script>

<style scoped>
/* Intro Video Styles */
.intro-video-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: #000;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease;
}

.intro-video-overlay.fade-out {
  opacity: 0;
}

/* 主页内容淡入效果 */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  color: var(--dark-text);
  opacity: 0;
  transition: opacity 0.5s ease;
}

.container.fade-in {
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
  transition: opacity 0.5s ease;
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
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 1;
}

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
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
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
}

.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #ffffff;
}

.error-message p {
  font-size: 16px;
  margin: 0;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #6b7280;
  color: #ffffff;
}

.btn-secondary:hover {
  background: #4b5563;
}

.skip-button {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 2;
}

.skip-button:hover {
  background: rgba(0, 0, 0, 0.9);
  border-color: rgba(255, 255, 255, 0.5);
}

.brand-info {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #ffffff;
  z-index: 2;
  max-width: 800px;
  padding: 0 40px;
  transition: opacity 0.5s ease;
}

.intro-video-container.fade-out .brand-info {
  opacity: 0.5;
}

.logo-container {
  position: fixed;
  top: 100px;
  left: 100px;
}

.headline {
  font-size: 38px;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 20px 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
}

.brand-subtitle {
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

@media (max-width: 768px) {
  .headline {
    font-size: 1.8rem;
  }
  
  .brand-subtitle {
    font-size: 1rem;
  }
  
  .brand-info {
    padding: 0 20px;
    bottom: 20px;
  }
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
}

.page-header h1 {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: #ffffff;
}

.page-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  margin: 0;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 80px;
}

.background-vision-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 40px;
  color: #ffffff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.vision-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 60px;
  align-items: start;
}

.vision-text {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.vision-intro {
  color: #94a3b8;
  line-height: 1.8;
  font-size: 1.1rem;
  margin: 0;
  text-align: justify;
  text-indent: 2em;
  display: block;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.vision-intro.no-indent {
  text-indent: 0;
}

.vision-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.mission-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}

.mission-text h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 24px;
  color: #ffffff;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.mission-text p {
  color: #94a3b8;
  line-height: 1.6;
  margin-bottom: 16px;
}

.mission-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-placeholder {
  font-size: 8rem;
  background: #1d1d36;
  border: 1px solid #2a2a4a;
  border-radius: 20px;
  padding: 60px;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.values-section h2,
.team-section h2,
.stats-section h2 {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 40px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.value-card {
  background: #1d1d36;
  border: 1px solid #2a2a4a;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
  transition: transform 0.2s ease;
}

.value-card:hover {
  transform: translateY(-4px);
}

.value-icon {
  font-size: 3rem;
  margin-bottom: 20px;
}

.value-card h3 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #ffffff;
}

.value-card p {
  color: #94a3b8;
  line-height: 1.6;
  margin: 0;
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
}

.team-member {
  background: #1d1d36;
  border: 1px solid #2a2a4a;
  border-radius: 16px;
  padding: 30px;
  text-align: center;
}

.member-avatar {
  font-size: 4rem;
  margin-bottom: 20px;
}

.team-member h4 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #ffffff;
}

.member-title {
  color: #f97316;
  font-weight: 500;
  margin-bottom: 12px;
}

.member-bio {
  color: #94a3b8;
  line-height: 1.5;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 30px;
}

.stat-item {
  background: #1d1d36;
  border: 1px solid #2a2a4a;
  border-radius: 12px;
  padding: 30px 20px;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 8px;
}

.stat-label {
  color: #94a3b8;
  font-size: 1rem;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .background-vision-section h2 {
    font-size: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .mission-text h2 {
    font-size: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .values-section h2,
  .team-section h2,
  .stats-section h2 {
    font-size: 2rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .vision-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .mission-section {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .values-grid,
  .team-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
