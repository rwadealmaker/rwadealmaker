<!-- src/App.vue -->
<template>
  <div id="app">
    <AppHeader v-if="!isIntroPage" @search="handleSearch" />
    <main class="page-wrap">
      <router-view />
    </main>
  <AppFooter v-if="!isAuthPage && !isIntroPage" />
  </div>
</template>


<script>
import AppHeader from './components/AppHeader.vue'
// import HomeView from './views/core/HomeView.vue'
import ListedProjectsView from './views/core/ListedProjectsView.vue'
import PortfolioView from './views/core/PortfolioView.vue'
import LoginView from './views/auth/LoginView.vue'
import SignupView from './views/auth/SignupView.vue'
import ProfileView from './views/core/ProfileView.vue'
import WalletView from './views/core/WalletView.vue'
import kycService from './components/kycService.vue'
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: { 
    AppHeader, 
    AppFooter, 
    // HomeView, 
    ListedProjectsView, 
    LoginView, 
    SignupView, 
    ProfileView, 
    WalletView, 
    PortfolioView, 
    kycService, 
  },
  data(){
    return { 
      user: null
    }
  },
  computed: {
    isAuthPage() {
      const path = this.$route.path;
      return path === '/login' || path === '/signup';
    },
    isIntroPage() {
      return this.$route.path === '/intro';
    }
  },
  methods: {
    alertMsg(msg){ alert(msg) },
    handleSearch(q){
      const v = (q || '').toLowerCase().trim()
      if(!v) return
      if(v.includes('project')) this.$router.push({ name: 'projects' })
      else if(v.includes('login')) this.$router.push({ name: 'login' })
      else if(v.includes('signup') || v.includes('register')) this.$router.push({ name: 'signup' })
      else alert('No matching page found.')
    }
  }
}
</script>
