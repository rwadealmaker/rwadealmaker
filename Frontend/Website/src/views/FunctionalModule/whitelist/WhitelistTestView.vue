<template>
  <div class="whitelist-test-page">
    <div class="container">
      <h1>白名单申请组件测试页面</h1>
      
      <div class="test-controls">
        <h2>测试控制</h2>
        
        <!-- KYC状态控制 -->
        <div class="control-group">
          <label>KYC状态:</label>
          <select v-model="isKycVerified">
            <option :value="false">未验证</option>
            <option :value="true">已验证</option>
          </select>
        </div>

        <!-- 用户信息编辑 -->
        <div class="control-group">
          <h3>用户信息</h3>
          <div class="form-row">
            <label>姓:</label>
            <input v-model="userInfo.firstName" placeholder="First Name">
          </div>
          <div class="form-row">
            <label>名:</label>
            <input v-model="userInfo.lastName" placeholder="Last Name">
          </div>
          <div class="form-row">
            <label>生日:</label>
            <input v-model="userInfo.dob" type="date">
          </div>
          <div class="form-row">
            <label>国家:</label>
            <input v-model="userInfo.country" placeholder="Country">
          </div>
          <div class="form-row">
            <label>证件类型:</label>
            <select v-model="userInfo.docType">
              <option value="passport">护照</option>
              <option value="id">身份证</option>
              <option value="driver">驾照</option>
            </select>
          </div>
        </div>

        <!-- 消息显示 -->
        <div class="message-log">
          <h3>消息日志</h3>
          <div class="log-container">
            <div v-for="(message, index) in messages" :key="index" :class="['log-item', message.type]">
              <span class="timestamp">{{ message.timestamp }}</span>
              <span class="content">{{ message.content }}</span>
            </div>
          </div>
          <button @click="clearMessages" class="btn clear-btn">清空日志</button>
        </div>
      </div>

      <!-- 白名单组件 -->
      <div class="component-container">
        <h2>白名单申请组件</h2>
        <WhitelistApplication 
          :is-kyc-verified="isKycVerified"
          :user-info="userInfo"
          @success="handleSuccess"
          @error="handleError"
          @info="handleInfo"
        />
      </div>

      <!-- 状态显示 -->
      <div class="status-display">
        <h2>当前状态</h2>
        <div class="status-item">
          <strong>KYC状态:</strong> {{ isKycVerified ? '已验证' : '未验证' }}
        </div>
        <div class="status-item">
          <strong>用户信息:</strong>
          <pre>{{ JSON.stringify(userInfo, null, 2) }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WhitelistApplication from './WhitelistApplication.vue'

export default {
  name: 'WhitelistTestView',
  components: {
    WhitelistApplication
  },
  data() {
    return {
      isKycVerified: false,
      userInfo: {
        firstName: 'John',
        lastName: 'Doe',
        dob: '1990-01-01',
        country: 'US',
        docType: 'passport'
      },
      messages: []
    }
  },
  methods: {
    handleSuccess(message) {
      this.addMessage('success', message)
    },
    handleError(message) {
      this.addMessage('error', message)
    },
    handleInfo(message) {
      this.addMessage('info', message)
    },
    addMessage(type, content) {
      this.messages.push({
        type,
        content,
        timestamp: new Date().toLocaleTimeString()
      })
      // 限制消息数量
      if (this.messages.length > 20) {
        this.messages.shift()
      }
    },
    clearMessages() {
      this.messages = []
    }
  }
}
</script>

<style scoped>
.whitelist-test-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #1f2937;
  margin-bottom: 24px;
  text-align: center;
}

h2 {
  color: #374151;
  margin-bottom: 16px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 8px;
}

h3 {
  color: #4b5563;
  margin-bottom: 12px;
}

.test-controls {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.control-group {
  margin-bottom: 20px;
}

.control-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #374151;
}

.control-group select,
.control-group input {
  width: 100%;
  max-width: 300px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.form-row label {
  min-width: 80px;
  margin-bottom: 0;
  font-size: 14px;
}

.form-row input,
.form-row select {
  flex: 1;
  max-width: 200px;
}

.message-log {
  margin-top: 20px;
}

.log-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 12px;
  background: white;
  margin-bottom: 12px;
}

.log-item {
  display: flex;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 6px;
  border-radius: 4px;
  font-size: 14px;
}

.log-item.success {
  background: #f0fdf4;
  border-left: 3px solid #16a34a;
}

.log-item.error {
  background: #fef2f2;
  border-left: 3px solid #dc2626;
}

.log-item.info {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
}

.timestamp {
  color: #6b7280;
  margin-right: 8px;
  font-size: 12px;
  min-width: 80px;
}

.content {
  flex: 1;
  color: #374151;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.clear-btn {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.clear-btn:hover {
  background: #e5e7eb;
}

.component-container {
  background: #f9fafb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.status-display {
  background: #f0f9ff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #bae6fd;
}

.status-item {
  margin-bottom: 12px;
}

.status-item strong {
  color: #0369a1;
}

.status-item pre {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  overflow-x: auto;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }
  
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-row label {
    min-width: auto;
  }
  
  .form-row input,
  .form-row select {
    max-width: none;
  }
}
</style>
