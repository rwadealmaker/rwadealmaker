<template>
  <div class="login-container">
    <div class="auth-card">
    <!-- <div class="auth-logo"><img src="/icons/signup-icon1.png" alt="Mortgage RWA" /></div> -->
    <h1 class="auth-title">{{ t('login.title') }}</h1>
    <p class="auth-sub">{{ t('login.subtitle') }}</p> 

    <!-- Login Status Display -->
    <div v-if="loginStatus" class="status" :class="loginStatusClass">
      {{ loginStatusMessage }}
    </div>

    <form class="auth-form" @submit.prevent="submitLogin">
      <label for="lemail" class="auth-label">{{ t('login.email') }}</label>
      <input
        id="lemail"
        type="email"
        class="input auth-input"
        :placeholder="t('login.emailPlaceholder')"
        v-model.trim="user_email"
        required
      />

      <label for="lpass" class="auth-label">{{ t('login.password') }}</label>
      <input
        id="lpass"
        type="password"
        class="input auth-input"
        :placeholder="t('login.passwordPlaceholder')"
        v-model="user_password"
        required
      />

      <div class="auth-row">
        <label class="auth-check">
          <input type="checkbox" v-model="remember" />
          <span>{{ t('login.remember') }}</span>
        </label>
        <a href="#" class="auth-link" @click.prevent="$emit('navigate','forgot')">{{ t('login.forgotPassword') }}</a>
      </div>

      <button class="btn orange auth-submit" type="submit" :disabled="loading">
        {{ loading ? t('login.loggingIn') : t('login.loginButton') }}
      </button>

      <p class="auth-alt">
        {{ t('login.noAccount') }}
        <a href="#" class="auth-link" @click.prevent="$emit('navigate','signup')">{{ t('login.signupLink') }}</a>
      </p>
    </form>
    </div>
  </div>
</template>

<script>
import { setUserInfoFromLogin } from '@/service/userService'
import { useLanguage } from '@/composables/useLanguage'

export default {
  name: 'LoginView',
  emits: ['notify','navigate'],
  data() {
    return {
      user_email: '',
      user_password: '',
      remember: false,
      loginStatus: false,
      loginStatusMessage: '',
      loginStatusClass: '',
      loading: false
    }
  },
  mounted() {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      this.loginStatus = true;
      this.loginStatusClass = 'status success';
      // this.loginStatusMessage = 'Logged in - Wallet and Profile buttons are displayed';
    }
  },
  methods: {
    t(key) {
      const { t } = useLanguage()
      return t(key)
    },
    async submitLogin() {
      if (!this.user_email || !this.user_password) {
        this.$emit('notify', 'Please enter email and password');
        return;
      }
      
      this.loading = true;
      this.loginStatus = true;
      this.loginStatusClass = 'status';
      this.loginStatusMessage = 'Logging in...';
      
      try {
        const response = await fetch(import.meta.env.VITE_API_LOGIN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            user_email: this.user_email,
            user_password: this.user_password
          })
        });
        
        const data = await response.json();
        
        if (data.status === 0) {
          this.loginStatusClass = 'status success';
          // this.loginStatusMessage = `Successful Login！Token: ${data.token ? data.token.substring(0, 50) + '...' : 'None'}`;
          this.loginStatusMessage = 'Login successful!';
          
          // Save login status
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('token', data.token);
          
          // Remember email (optional)
          if (this.remember) localStorage.setItem('remember_email', this.user_email);
          
          // Save user info to local storage
          this.saveUserInfo(data);
          
          // Check if admin user
          const isAdmin = this.user_email === 'han@rwadealmaker.com';
          localStorage.setItem('isAdmin', isAdmin.toString());
          
          // Trigger global login status update event
          window.dispatchEvent(new CustomEvent('auth-changed'));
          
          // this.$emit('notify', 'Login successful! Now you can see Wallet and Profile buttons.');
          this.$emit('notify', isAdmin ? 'Admin login successful!' : 'Login successful!');
          
          // Redirect based on user type
          setTimeout(() => {
            if (isAdmin) {
              this.$router.push('/admin');
            } else {
              this.$router.push('/about');
            }
          }, 1000);
        } else {
          this.loginStatusClass = 'status error';
          this.loginStatusMessage = `Login failed: ${data.message}`;
          this.$emit('notify', data.message);
        }
      } catch (error) {
        this.loginStatusClass = 'status error';
        this.loginStatusMessage = `Network error: ${error.message}`;
        this.$emit('notify', `Network error: ${error.message}`);
      } finally {
        this.loading = false;
      }
    },

    // Save user info to local storage
    saveUserInfo(loginData) {
      try {
        setUserInfoFromLogin({
          user_email: this.user_email,
          user_name: loginData.user_name || '', // If backend returns username
          ...loginData, // Include other possible user information
          user_phone: loginData.user_phone || '',
          user_password: loginData.user_password || '',
          user_wallet: loginData.user_wallet || '',
          email_list: loginData.email_list || '',
        });
        console.log('User info saved from login:', this.user_email);
      } catch (error) {
        console.error('Failed to save user info from login:', error);
      }
    }
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px #eee;
  padding: 32px;
  min-width: 340px;
  max-width: 400px;
  width: 100%;
}
.auth-title { color: #000; }

.status {
  margin:auto;
  padding: 15px;
  border-radius: 6px;
  font-weight: 500;
  text-align: center;
}

.status.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* 手机端响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 20px;
  }
  
  .auth-card {
    margin: 0;
    width: 100%;
    padding: 24px;
  }
  
  .auth-title {
    font-size: 20px;
  }
  
  .auth-input {
    padding: 12px 16px;
    font-size: 14px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 12px 20px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }
  
  .auth-card {
    margin: 0;
    width: 100%;
    padding: 20px;
  }
  
  .auth-title {
    font-size: 18px;
  }
  
  .auth-input {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .btn-primary, .btn-secondary {
    padding: 10px 16px;
    font-size: 13px;
  }
}

</style>
