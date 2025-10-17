import { createApp } from 'vue'
import App from './App.vue'
import './assets/style.css'   // 全局样式
import './assets/mobile-responsive.css'   // 手机端响应式样式
import router from './router'   // 默认会自动找 ./router/index.ts
import { useTheme } from './composables/useTheme'
import { useLanguage } from './composables/useLanguage'

const app = createApp(App)

// 初始化主题
const { initTheme } = useTheme()
initTheme()

// 初始化语言
const { initLanguage } = useLanguage()
initLanguage()

app.use(router).mount('#app')