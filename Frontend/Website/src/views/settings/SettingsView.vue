<template>
  <div class="settings-page">
    <div class="settings-container">
      <!-- 左侧边栏 - 桌面端显示 -->
      <div class="settings-sidebar desktop-only">
        <div class="sidebar-header">
          <h1 class="sidebar-title">{{ t('settings.title') }}</h1>
        </div>
        <nav class="sidebar-nav">
          <button 
            v-for="section in settingsSections" 
            :key="section.id"
            class="sidebar-item"
            :class="{ active: activeSection === section.id }"
            @click="setActiveSection(section.id)"
          >
            <span class="sidebar-icon">{{ section.icon }}</span>
            <span class="sidebar-text">{{ t(section.title) }}</span>
          </button>
        </nav>
      </div>

      <!-- 右侧主内容区 -->
      <div class="settings-main">
        <div class="main-header desktop-only">
          <h2 class="main-title">{{ getActiveSectionTitle() }}</h2>
          <p class="main-subtitle">{{ getActiveSectionDescription() }}</p>
        </div>
        
        <!-- 移动端标题 -->
        <div class="main-header mobile-only">
          <h2 class="main-title">{{ t('settings.title') }}</h2>
          <p class="main-subtitle">{{ t('settings.subtitle') }}</p>
        </div>
        
        <div class="main-content">
          <!-- 桌面端：显示当前激活的section -->
          <div class="desktop-only">
            <!-- General Settings -->
            <div v-if="activeSection === 'general'" class="settings-section">
            <div class="settings-items">
            <!-- <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.language') }}</h3>
                <p class="settings-description">{{ t('settings.language.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="en">{{ t('settings.language.en') }}</option>
                  <option value="zh">{{ t('settings.language.zh') }}</option>
                </select>
              </div>
            </div> -->

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.theme') }}</h3>
                <p class="settings-description">{{ t('settings.theme.description') }}</p>
              </div>
              <div class="settings-control">
                <select 
                  class="settings-select" 
                  :value="currentTheme" 
                  @change="handleThemeChange"
                >
                  <option value="dark">{{ t('settings.theme.dark') }}</option>
                  <option value="light">{{ t('settings.theme.light') }}</option>
                </select>
              </div>
            </div>


            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.timezone') }}</h3>
                <p class="settings-description">{{ t('settings.timezone.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="UTC">{{ t('settings.timezone.utc') }}</option>
                  <option value="EST">{{ t('settings.timezone.est') }}</option>
                  <option value="PST">{{ t('settings.timezone.pst') }}</option>
                  <option value="CST">{{ t('settings.timezone.cst') }}</option>
                </select>
              </div>
            </div>

            <!-- Notification Settings in General -->
            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.pushNotifications') }}</h3>
                <p class="settings-description">{{ t('settings.pushNotifications.description') }}</p>
              </div>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.emailNotifications') }}</h3>
                <p class="settings-description">{{ t('settings.emailNotifications.description') }}</p>
              </div>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.smsNotifications') }}</h3>
                <p class="settings-description">{{ t('settings.smsNotifications.description') }}</p>
              </div>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <!-- <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.introVideo') }}</h3>
                <p class="settings-description">{{ t('settings.introVideo.description') }}</p>
              </div>
              <div class="settings-control">
                <button class="btn btn-secondary" @click="watchIntroVideo">{{ t('settings.introVideo.watch') }}</button>
              </div>
            </div> -->
          </div>
        </div>

          <!-- Security Settings -->
          <div v-if="activeSection === 'security'" class="settings-section">
            <div class="settings-items">
            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.password') }}</h3>
                <p class="settings-description">{{ t('settings.password.description') }}</p>
              </div>
              <div class="settings-control">
                <button class="btn btn-secondary">{{ t('settings.password.change') }}</button>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.sessionTimeout') }}</h3>
                <p class="settings-description">{{ t('settings.sessionTimeout.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="15">{{ t('settings.sessionTimeout.15min') }}</option>
                  <option value="30">{{ t('settings.sessionTimeout.30min') }}</option>
                  <option value="60">{{ t('settings.sessionTimeout.1hour') }}</option>
                  <option value="480">{{ t('settings.sessionTimeout.8hours') }}</option>
                </select>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.loginAlerts') }}</h3>
                <p class="settings-description">{{ t('settings.loginAlerts.description') }}</p>
              </div>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox" checked>
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>

          <!-- Wallet Settings -->
          <div v-if="activeSection === 'wallet'" class="settings-section">
            <div class="settings-items">
            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.defaultWallet') }}</h3>
                <p class="settings-description">{{ t('settings.defaultWallet.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="metamask">{{ t('settings.defaultWallet.metamask') }}</option>
                  <option value="walletconnect">{{ t('settings.defaultWallet.walletconnect') }}</option>
                  <!-- <option value="coinbase">Coinbase Wallet</option> -->
                </select>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.autoConnect') }}</h3>
                <p class="settings-description">{{ t('settings.autoConnect.description') }}</p>
              </div>
              <div class="settings-control">
                <label class="toggle-switch">
                  <input type="checkbox">
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.gasSettings') }}</h3>
                <p class="settings-description">{{ t('settings.gasSettings.description') }}</p>
              </div>
              <div class="settings-control">
                <button class="btn btn-secondary">{{ t('settings.gasSettings.configure') }}</button>
              </div>
            </div>
          </div>
        </div>

          <!-- Performance Settings -->
          <div v-if="activeSection === 'performance'" class="settings-section">
            <div class="settings-items">
            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.autoRefresh') }}</h3>
                <p class="settings-description">{{ t('settings.autoRefresh.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="0">{{ t('settings.autoRefresh.disabled') }}</option>
                  <option value="30">{{ t('settings.autoRefresh.30sec') }}</option>
                  <option value="60">{{ t('settings.autoRefresh.1min') }}</option>
                  <option value="300">{{ t('settings.autoRefresh.5min') }}</option>
                </select>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.cacheSize') }}</h3>
                <p class="settings-description">{{ t('settings.cacheSize.description') }}</p>
              </div>
              <div class="settings-control">
                <select class="settings-select">
                  <option value="100">100 MB</option>
                  <option value="250">250 MB</option>
                  <option value="500">500 MB</option>
                  <option value="1000">1 GB</option>
                </select>
              </div>
            </div>

            <div class="settings-item">
              <div class="settings-info">
                <h3 class="settings-name">{{ t('settings.clearCache') }}</h3>
                <p class="settings-description">{{ t('settings.clearCache.description') }}</p>
              </div>
              <div class="settings-control">
                <button class="btn btn-secondary">{{ t('settings.clearCache.button') }}</button>
              </div>
            </div>
          </div>
        </div>




          </div>

          <!-- 移动端：显示所有section -->
          <div class="mobile-only">
            <!-- General Settings -->
            <div class="settings-section mobile-section">
              <div class="section-header">
                <h3 class="section-title">{{ t('settings.general') }}</h3>
                <p class="section-description">{{ t('settings.general.description') }}</p>
              </div>
              <div class="settings-items">

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.theme') }}</h3>
                    <p class="settings-description">{{ t('settings.theme.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <select 
                      class="settings-select" 
                      :value="currentTheme" 
                      @change="handleThemeChange"
                    >
                      <option value="dark">{{ t('settings.theme.dark') }}</option>
                      <option value="light">{{ t('settings.theme.light') }}</option>
                    </select>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.timezone') }}</h3>
                    <p class="settings-description">{{ t('settings.timezone.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <select class="settings-select">
                      <option value="UTC">{{ t('settings.timezone.utc') }}</option>
                      <option value="EST">{{ t('settings.timezone.est') }}</option>
                      <option value="PST">{{ t('settings.timezone.pst') }}</option>
                      <option value="CST">{{ t('settings.timezone.cst') }}</option>
                    </select>
                  </div>
                </div>

                <!-- Notification Settings in Mobile General -->
                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.pushNotifications') }}</h3>
                    <p class="settings-description">{{ t('settings.pushNotifications.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <label class="toggle-switch">
                      <input type="checkbox" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.emailNotifications') }}</h3>
                    <p class="settings-description">{{ t('settings.emailNotifications.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <label class="toggle-switch">
                      <input type="checkbox" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.smsNotifications') }}</h3>
                    <p class="settings-description">{{ t('settings.smsNotifications.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <label class="toggle-switch">
                      <input type="checkbox">
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.introVideo') }}</h3>
                    <p class="settings-description">{{ t('settings.introVideo.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <button class="btn btn-secondary" @click="watchIntroVideo">{{ t('settings.introVideo.watch') }}</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Security Settings -->
            <div class="settings-section mobile-section">
              <div class="section-header">
                <h3 class="section-title">{{ t('settings.security') }}</h3>
                <p class="section-description">{{ t('settings.security.description') }}</p>
              </div>
              <div class="settings-items">
                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.password') }}</h3>
                    <p class="settings-description">{{ t('settings.password.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <button class="btn btn-secondary">{{ t('settings.password.change') }}</button>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.sessionTimeout') }}</h3>
                    <p class="settings-description">{{ t('settings.sessionTimeout.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <select class="settings-select">
                      <option value="15">{{ t('settings.sessionTimeout.15min') }}</option>
                      <option value="30">{{ t('settings.sessionTimeout.30min') }}</option>
                      <option value="60">{{ t('settings.sessionTimeout.1hour') }}</option>
                      <option value="480">{{ t('settings.sessionTimeout.8hours') }}</option>
                    </select>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.loginAlerts') }}</h3>
                    <p class="settings-description">{{ t('settings.loginAlerts.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <label class="toggle-switch">
                      <input type="checkbox" checked>
                      <span class="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Wallet Settings -->
            <div class="settings-section mobile-section">
              <div class="section-header">
                <h3 class="section-title">{{ t('settings.wallet') }}</h3>
                <p class="section-description">{{ t('settings.wallet.description') }}</p>
              </div>
              <div class="settings-items">
                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.connectWallet') }}</h3>
                    <p class="settings-description">{{ t('settings.connectWallet.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <button class="btn btn-primary">{{ t('settings.connectWallet.button') }}</button>
                  </div>
                </div>

                <div class="settings-item">
                  <div class="settings-info">
                    <h3 class="settings-name">{{ t('settings.walletAddress') }}</h3>
                    <p class="settings-description">{{ t('settings.walletAddress.description') }}</p>
                  </div>
                  <div class="settings-control">
                    <button class="btn btn-secondary">{{ t('settings.walletAddress.view') }}</button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- 页面操作按钮 -->
        <!-- <div class="page-actions">
          <button class="btn btn-primary" @click="saveSettings">保存设置</button>
          <button class="btn btn-secondary" @click="resetSettings">重置</button>
        </div> -->
      </div>
    </div>
  </div>
</template>

<script>
import { useTheme } from '@/composables/useTheme'
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'SettingsView',
  setup() {
    const { currentTheme, setTheme, getCurrentTheme, getAvailableThemes } = useTheme()
    const { currentLanguage, setLanguage, getCurrentLanguage, getAvailableLanguages, t } = useLanguage()
    
    return {
      currentTheme,
      setTheme,
      getCurrentTheme,
      getAvailableThemes,
      currentLanguage,
      setLanguage,
      getCurrentLanguage,
      getAvailableLanguages,
      t
    }
  },
  data() {
    return {
      activeSection: 'general', // 默认显示General Settings
      settingsSections: [
        { id: 'general', title: 'settings.general', icon: '', description: 'settings.general.description' },
        { id: 'security', title: 'settings.security', icon: '', description: 'settings.security.description' },
        { id: 'wallet', title: 'settings.wallet', icon: '', description: 'settings.wallet.description' },
        { id: 'performance', title: 'settings.performance', icon: '', description: 'settings.performance.description' }
      ],
      settings: {
        language: 'en',
        timezone: 'UTC',
        sessionTimeout: 30,
        defaultWallet: 'metamask',
        autoConnect: false,
        pushNotifications: true,
        emailNotifications: true,
        smsAlerts: false,
        autoRefresh: 60,
        cacheSize: 250,
        developerMode: false,
        analytics: true,
        // Account Options
        profileVisibility: 'public',
        twoFactorAuth: false,
        // Trading Options
        defaultTradingPair: 'ETH/USDT',
        autoConfirmTrades: false,
        // Privacy Options
        dataCollection: true,
        marketingEmails: false,
        thirdPartySharing: false
      }
    }
  },
  methods: {
    setActiveSection(sectionId) {
      this.activeSection = sectionId;
    },
    getActiveSectionTitle() {
      const section = this.settingsSections.find(s => s.id === this.activeSection);
      return section ? this.t(section.title) : this.t('settings.title');
    },
    getActiveSectionDescription() {
      const section = this.settingsSections.find(s => s.id === this.activeSection);
      return section ? this.t(section.description) : this.t('settings.subtitle');
    },
    saveSettings() {
      // Save settings logic
      console.log('Settings saved:', this.settings);
      // Here you would typically save to localStorage or send to backend
      localStorage.setItem('userSettings', JSON.stringify(this.settings));
      alert('Settings saved successfully!');
    },
    resetSettings() {
      if (confirm('Are you sure you want to reset all settings to default values?')) {
        // Reset to default values
        this.settings = {
          language: 'en',
          theme: 'dark',
          timezone: 'UTC',
          sessionTimeout: 30,
          defaultWallet: 'metamask',
          autoConnect: false,
          pushNotifications: true,
          emailNotifications: true,
          smsAlerts: false,
          autoRefresh: 60,
          cacheSize: 250,
          developerMode: false,
          analytics: true,
          // Account Options
          profileVisibility: 'public',
          twoFactorAuth: false,
          // Trading Options
          defaultTradingPair: 'ETH/USDT',
          autoConfirmTrades: false,
          // Privacy Options
          dataCollection: true,
          marketingEmails: false,
          thirdPartySharing: false
        };
        localStorage.removeItem('userSettings');
        alert('Settings reset to default values!');
      }
    },
    watchIntroVideo() {
      // 清除开场视频观看记录，跳转到开场视频页面
      localStorage.removeItem('rwa_intro_seen');
      this.$router.push('/intro');
    },
    handleThemeChange(event) {
      const newTheme = event.target.value;
      this.setTheme(newTheme);
      console.log('Theme changed to:', newTheme);
    },
    handleLanguageChange(event) {
      const newLanguage = event.target.value;
      this.setLanguage(newLanguage);
      console.log('Language changed to:', newLanguage);
    }
  },
  mounted() {
    // Load saved settings
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }
  }
}
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: var(--bg, #0f0f23);
  padding: 40px 0;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.settings-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  gap: 30px;
  min-height: calc(100vh - 80px);
}

/* 左侧边栏样式 */
.settings-sidebar {
  width: 280px;
  background: var(--card-bg, #1a1a2e);
  border-radius: 16px;
  padding: 24px 0;
  height: fit-content;
  position: sticky;
  top: 40px;
}

.sidebar-header {
  padding: 0 24px 20px;
  border-bottom: 1px solid var(--border, #303049);
  margin-bottom: 20px;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text, #ffffff);
  margin: 0;
}

.sidebar-nav {
  padding: 0 12px;
}

.sidebar-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-secondary, #a0a0a0);
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.sidebar-item:hover {
  background: var(--hover-bg, #30304c);
  color: var(--text, #ffffff);
}

.sidebar-item.active {
  background: var(--brand, #667eea);
  color: #ffffff;
  font-weight: 600;
}

.sidebar-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.sidebar-text {
  flex: 1;
}

/* 右侧主内容区样式 */
.settings-main {
  flex: 1;
  background: var(--card-bg, #1a1a2e);
  border-radius: 16px;
  padding: 32px;
}

.main-header {
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border, #2a2a4a);
}

.main-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text, #ffffff);
  margin: 0 0 8px;
}

.main-subtitle {
  font-size: 1rem;
  color: var(--text-secondary, #a0a0a0);
  margin: 0;
}

.main-content {
  min-height: 400px;
}

.settings-section {
  padding: 0;
  margin-bottom: 0;
}

/* section-header 样式已移除，现在使用 main-header */

.settings-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: var(--bg-secondary, #16213e);
  border-radius: 8px;
  border: 1px solid var(--border-light, #3a3a5a);
}

.settings-info {
  flex: 1;
}

.settings-name {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text, #ffffff);
  margin: 0 0 4px 0;
}

.settings-description {
  font-size: 0.9rem;
  color: var(--text-secondary, #a0a0a0);
  margin: 0;
}

.settings-control {
  margin-left: 20px;
}

.settings-select {
  padding: 8px 12px;
  background: var(--bg, #0f0f23);
  border: 1px solid var(--border, #2a2a4a);
  border-radius: 6px;
  color: var(--text, #ffffff);
  font-size: 0.9rem;
  min-width: 140px;
}

.settings-select:focus {
  outline: none;
  border-color: var(--brand, #ffa500);
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border, #2a2a4a);
  transition: .4s;
  border-radius: 24px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider {
  background-color: var(--brand, #ffa500);
}

input:checked + .toggle-slider:before {
  transform: translateX(26px);
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
  text-align: center;
}

.btn-primary {
  background: var(--brand, #3f3d39);
  color: #fffefe;
}

.btn-primary:hover {
  background: #e6940a;
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--text, #ffffff);
  border: 1px solid var(--border, #2a2a4a);
}

.btn-secondary:hover {
  background: var(--brand-600, rgba(255, 165, 0, 0.1));
  border-color: var(--brand, #ffa500);
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.page-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 30px;
  border-top: 1px solid var(--border, #2a2a4a);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .settings-container {
    flex-direction: column;
    gap: 20px;
  }

  .settings-sidebar {
    width: 100%;
    position: static;
    order: 2;
  }

  .settings-main {
    order: 1;
  }

  .sidebar-nav {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 24px;
  }

  .sidebar-item {
    flex: 1;
    min-width: 120px;
    justify-content: center;
    margin-bottom: 0;
  }
}

/* 桌面端和移动端显示控制 */
.desktop-only {
  display: block;
}

.mobile-only {
  display: none;
}

@media (max-width: 768px) {
  /* 移动端隐藏桌面端内容 */
  .desktop-only {
    display: none;
  }
  
  /* 移动端显示移动端内容 */
  .mobile-only {
    display: block;
  }

  .settings-container {
    padding: 0 16px;
  }

  .settings-main {
    padding: 20px;
  }

  .main-title {
    font-size: 1.5rem;
  }

  .sidebar-item {
    min-width: 100px;
    padding: 8px 12px;
  }

  .sidebar-text {
    display: none;
  }

  .sidebar-icon {
    font-size: 1.2rem;
  }

  .settings-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .settings-control {
    margin-left: 0;
    align-self: flex-end;
  }

  .page-actions {
    flex-direction: column;
    gap: 12px;
  }

  /* 移动端section样式 */
  .mobile-section {
    margin-bottom: 32px;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .section-header {
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text);
    margin: 0 0 8px 0;
  }

  .section-description {
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin: 0;
  }
}

@media (max-width: 480px) {
  .sidebar-nav {
    padding: 0 16px;
  }

  .sidebar-item {
    min-width: 80px;
    padding: 6px 8px;
  }

  .sidebar-icon {
    font-size: 1rem;
  }
}
</style>
