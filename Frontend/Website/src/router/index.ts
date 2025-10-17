import { createRouter, createWebHistory } from 'vue-router'
// Core pages
import HomeView from '../views/core/HomeView.vue'
import WalletView from '../views/core/WalletView.vue'
import PortfolioView from '../views/core/PortfolioView.vue'
import ListedProjectsView from '../views/core/ListedProjectsView.vue'
import ToBeListedView from '../views/core/ToBeListedView.vue'
import ProfileView from '../views/core/ProfileView.vue'
import TradeProjectView from '../views/core/TradeProjectView.vue'
import TokenDetailView from '../views/core/TokenDetailView.vue'
import NotificationsView from '../views/core/NotificationsView.vue'
import LoginView from '../views/auth/LoginView.vue'
import SignupView from '../views/auth/SignupView.vue'
import AboutUsView from '../views/info/aboutus/AboutUsView.vue'
import SettingsView from '../views/settings/SettingsView.vue'
import ContactUs from '../components/ContactUs.vue'
import kycService from '../components/kycService.vue'
// Admin pages
import AdminDashboard from '../views/admin/AdminDashboard.vue'
// import AdminSubscriptions from '../views/admin/AdminSubscriptions.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/about'},
    // { path: '/home', name: 'home', component: HomeView },
    { path: '/wallet', name: 'wallet', component: WalletView },
    { path: '/portfolio', name: 'portfolio', component: PortfolioView },
    { path: '/listedprojects', name: 'listedprojects', component: ListedProjectsView },
    { path: '/listedprojects/:code', name: 'listedProjectDetail', component: ListedProjectsView, props: true },
    { path: '/to-be-listed', name: 'toBeListed', component: ToBeListedView },
    { path: '/to-be-listed/:code', name: 'toBeListedDetail', component: ToBeListedView, props: true },
    { path: '/token/:address', name: 'tokenDetail', component: TokenDetailView, props: true },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/login', name: 'login', component: LoginView },
    { path: '/signup', name: 'signup', component: SignupView },
    { path: '/trade/:code', name: 'tradeProject', component: TradeProjectView, props: true },
    { path: '/kycService', component: kycService },
    { path: '/about', name: 'about', component: AboutUsView },
    { path: '/contact', name: 'contact', component: ContactUs },
    {path:'/settings',name:'settings',component:SettingsView},
    { path: '/notifications', name: 'notifications', component: NotificationsView },
    // Admin routes
    { path: '/admin', name: 'admin', component: AdminDashboard },
    { path: '/admin/subscriptions', redirect: '/admin' }, // 重定向到管理员面板，认购管理功能已整合
  ]
})

// 路由守卫 - 保护管理员页面
router.beforeEach((to, from, next) => {
  const isAdmin = localStorage.getItem('isAdmin') === 'true'
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
  
  // 检查是否是管理员页面
  if (to.path.startsWith('/admin')) {
    if (!isLoggedIn) {
      // 未登录，重定向到登录页面
      next('/login')
      return
    }
    
    if (!isAdmin) {
      // 已登录但不是管理员，重定向到首页
      next('/about')
      return
    }
  }
  
  next()
})

export default router