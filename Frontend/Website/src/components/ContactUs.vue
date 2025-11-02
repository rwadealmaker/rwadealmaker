<template>
  <!-- Contact Us Section -->
  <section 
    class="contact-section"
  >
    <!-- Background Decorations -->
    <!-- <div class="contact-bg-decoration">
      <div class="blockchain-token token-1"></div>
      <div class="blockchain-token token-2"></div>
      <div class="blockchain-token token-3"></div>
      <div class="real-estate-icon building-1"></div>
      <div class="real-estate-icon building-2"></div>
    </div> -->
    <!-- Main Contact Container -->
    <div class="contact-container">
      <!-- Bold Header -->
      <header class="contact-header">
        <h2 class="headline">{{ t('contact.title') }}</h2>
        <p class="description">{{ t('contact.description') }}</p>
      </header>
      <!-- Two Column Layout -->
      <div class="contact-layout">
        <!-- Right Column: Contact Form -->
        <div class="contact-form-column">
          <div class="contact-form-card">
            <form @submit.prevent="submitForm" class="modern-form">
              <div class="form-group">
                <label for="contact-name">{{ t('contact.name') }} *</label>
                <input 
                  type="text" 
                  id="contact-name" 
                  v-model="form.name" 
                  required
                  :placeholder="t('contact.name.placeholder')"
                >
              </div>

              <div class="form-group">
                <label for="contact-email">{{ t('contact.email') }} *</label>
                <input 
                  type="email" 
                  id="contact-email" 
                  v-model="form.email" 
                  required
                  :placeholder="t('contact.email.placeholder')"
                >
              </div>

              <div class="form-group">
                <label for="contact-type">{{ t('contact.type') }} *</label>
                <select id="contact-type" v-model="form.type" required>
                  <option value="choose">{{ t('contact.type.placeholder') }}</option>
                  <option value="individual">{{ t('contact.type.individual') }}</option>
                  <option value="business">{{ t('contact.type.business') }}</option>
                  <option value="other">{{ t('contact.type.other') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="contact-subject">{{ t('contact.subject') }} *</label>
                <select id="contact-subject" v-model="form.subject" required>
                  <option value="choose">{{ t('contact.subject.placeholder') }}</option>
                  <option value="investor">{{ t('contact.subject.investor') }}</option>
                  <option value="asset_holder">{{ t('contact.subject.asset_holder') }}</option>
                  <option value="general">{{ t('contact.subject.general') }}</option>
                  <option value="technical">{{ t('contact.subject.technical') }}</option>
                  <option value="business">{{ t('contact.subject.business') }}</option>
                  <option value="other">{{ t('contact.subject.other') }}</option>
                </select>
              </div>

              <div class="form-group">
                <label for="contact-message">{{ t('contact.message') }}*</label>
                <textarea 
                  id="contact-message" 
                  v-model="form.message" 
                  rows="5" 
                  required
                  :placeholder="t('contact.message.placeholder')"
                ></textarea>
              </div>

              <button type="submit" class="send-message-btn" :disabled="isSubmitting">
                {{ isSubmitting ? t('common.sending') : t('contact.send') }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Social Media Section -->
      <div class="social-media-section">
        <h3 style="color: #000000;">{{ t('follow.us') }}</h3>
        <div class="social-links">
          <a href="#" class="social-link" title="LinkedIn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" fill="currentColor"/>
            </svg>
          </a>
          <a href="#" class="social-link" title="Instagram">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="currentColor"/>
            </svg>
          </a>
          <a href="#" class="social-link" title="X (Twitter)">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="currentColor"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'ContactUs',
  setup() {
    const { t } = useLanguage()
    return { t }
  },
  props: {
    showIntroVideo: {
      type: Boolean,
      default: false
    },
    isTransitioning: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      // Contact form data
      form: {
        name: '',
        email: '',
        type: 'choose',
        subject: 'choose',
        message: ''
      },
      isSubmitting: false
    }
  },
  methods: {
    // 处理联系表单提交
    async submitForm() {
      if (this.isSubmitting) return
      
      // 验证必填字段
      if (!this.form.name || !this.form.email || !this.form.subject || !this.form.message) {
        alert('Please fill in all required fields')
        return
      }
      
      // 验证邮箱格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(this.form.email)) {
        alert('Please enter a valid email address')
        return
      }
      
      this.isSubmitting = true
      
      try {
        // 发送到后端API
        const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
        const response = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: this.form.name,
            email: this.form.email,
            type: this.form.type,
            subject: this.form.subject,
            message: this.form.message
          })
        })
        
        const result = await response.json()
        
        if (result.success) {
          // 显示成功消息
          alert('Message sent successfully! We will reply to you within 24 hours.')
          
          // 重置表单
          this.form = {
            name: '',
            email: '',
            type: 'choose',
            subject: 'choose',
            message: ''
          }
        } else {
          throw new Error(result.message || 'Failed to send message')
        }
        
      } catch (error) {
        console.error('Form submission failed:', error)
        alert(`Message sending failed: ${error.message}. Please try again later.`)
      } finally {
        this.isSubmitting = false
      }
    }
  }
}
</script>

<style scoped>
/* Contact Section */
.contact-section {
  position: relative;
  background: 
    radial-gradient(circle at 20% 80%, rgba(51, 204, 255, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(0, 153, 204, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(25, 25, 112, 0.1) 0%, transparent 50%);
  padding: 40px 0;
  overflow: hidden;
}


/* Background Decorations */
.contact-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 1;
}

.blockchain-token {
  position: absolute;
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #141426, #2a2a4a);
  border-radius: 50%;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.blockchain-token.token-1 {
  top: 20%;
  right: 15%;
  animation-delay: 0s;
}

.blockchain-token.token-2 {
  top: 60%;
  right: 30%;
  animation-delay: 2s;
}

.blockchain-token.token-3 {
  bottom: 30%;
  left: 20%;
  animation-delay: 4s;
}

.real-estate-icon {
  position: absolute;
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #141426, #2a2a4a);
  opacity: 0.08;
  animation: float 8s ease-in-out infinite;
}

.real-estate-icon.building-1 {
  top: 15%;
  right: 25%;
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  animation-delay: 1s;
}

.real-estate-icon.building-2 {
  bottom: 20%;
  right: 10%;
  clip-path: polygon(0% 0%, 100% 0%, 100% 70%, 50% 100%, 0% 70%);
  animation-delay: 3s;
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(180deg); }
}

/* Main Contact Container */
.contact-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
}

/* Bold Header */
.contact-header {
  text-align: center;
  margin-bottom: 40px;
}

.contact-title {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 3.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.headline {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: var(--heading-color);
  margin: 0;
  background: var(--heading-color);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.description {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: center;
  margin: 0 auto;
  max-width: 80%;
}

/* Two Column Layout */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  margin-bottom: 80px;
  align-items: start;
}

/* Left Column: Contact Information */
.contact-info-column {
  display: flex;
  flex-direction: column;
}

.contact-info-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.contact-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateY(-2px);
}

.contact-icon {
  width: 56px;
  height: 56px;
  background: #141426;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.contact-icon svg {
  width: 24px;
  height: 24px;
  color: #667eea;
}

.contact-details h4 {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.contact-details p {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #94a3b8;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Right Column: Contact Form */
.contact-form-column {
  display: flex;
  flex-direction: column;
  width: 1000px;
  margin-left: 60px;
  margin-right: 100px;
}

.contact-form-card {
  background: var(--form-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  padding: 40px;
  backdrop-filter: blur(10px);
}

.modern-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 16px 20px;
  background: var(--form-bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  color: var(--text);
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input::placeholder,
.form-group textarea::placeholder {
  color: var(--text-secondary);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--brand);
  background: var(--hover-bg);
  box-shadow: 0 0 0 3px var(--ring);
}

/* 下拉菜单选项样式 */
.form-group select option {
  background: var(--modal-bg) !important;
  color: var(--text) !important;
  padding: 12px 16px;
  border: none;
}

.form-group select option:hover {
  background: var(--hover-bg) !important;
}

.form-group select option:checked {
  background: var(--brand) !important;
  color: var(--text) !important;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.send-message-btn {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  padding: 16px 32px;
  background: var(--brand);
  border: 1px solid var(--brand);
  border-radius: 12px;
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 8px;
}

.send-message-btn:hover:not(:disabled) {
  background: var(--brand-600);
  border-color: var(--brand-600);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px var(--shadow);
}

.send-message-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Social Media Section */
.social-media-section {
  text-align: center;
  margin-top: 60px;
}

.social-media-section h3 {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 24px 0;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 24px;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  color: #ffffff;
  transform: translateY(-2px);
}

.social-link svg {
  width: 24px;
  height: 24px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .contact-container {
    padding: 0 20px;
  }
  
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .contact-form-column {
    width: 100%;
    margin: 0;
  }
  
  .headline {
    font-size: 2.5rem;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }
  
  .description {
    text-align: center;
    margin: 0 auto;
    max-width: 90%;
    font-size: 14px;
  }
  
  .contact-header {
    margin-bottom: 30px;
    margin-top: 15px;
    text-align: center;
  }
  
  .social-links {
    flex-wrap: wrap;
    gap: 16px;
  }
}
</style>
