<!-- src/components/AppFooter.vue -->
<template>
  <footer class="footer">
    <!-- <div class="container footer-top">
      <div class="footer-brand">
        <img src="/icons/RWA-logo.svg" alt="Mortgage RWA Logo" class="footer-logo" />
        <p class="footer-tagline">Design amazing digital experiences that create more happy in the world.</p>
      </div>

      <div class="footer-links">
        <div><h4>Product</h4><ul>
          <li><router-link to="/overview">Overview</router-link></li>
          <li><router-link to="/features">Features</router-link></li>
          <li><router-link to="/solutions">Solutions <span class="new">New</span></router-link></li>
          <li><router-link to="/tutorials">Tutorials</router-link></li>
          <li><router-link to="/pricing">Pricing</router-link></li>
          <li><router-link to="/releases">Releases</router-link></li></ul></div>
        <div><h4>Company</h4><ul>
          <li><router-link to="/about">About us</router-link></li>
          <li><router-link to="/careers">Careers</router-link></li>
          <li><router-link to="/press">Press</router-link></li>
          <li><router-link to="/news">News</router-link></li>
          <li><router-link to="/media-kit">Media kit</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li></ul></div>
        <div><h4>Resources</h4><ul>
          <li><router-link to="/blog">Blog</router-link></li>
          <li><router-link to="/newsletter">Newsletter</router-link></li>
          <li><router-link to="/events">Events</router-link></li>
          <li><router-link to="/help">Help centre</router-link></li>
          <li><router-link to="/tutorials">Tutorials</router-link></li>
          <li><router-link to="/support">Support</router-link></li></ul></div>
        <div><h4>Social</h4><ul>
          <li><a href="https://twitter.com" target="_blank">Twitter</a></li>
          <li><a href="https://linkedin.com" target="_blank">LinkedIn</a></li>
          <li><a href="https://facebook.com" target="_blank">Facebook</a></li>
          <li><a href="https://github.com" target="_blank">GitHub</a></li>
          <li><a href="https://angel.co" target="_blank">AngelList</a></li>
          <li><a href="https://dribbble.com" target="_blank">Dribbble</a></li></ul></div>
        <div><h4>Legal</h4><ul>
          <li><router-link to="/terms">Terms</router-link></li>
          <li><router-link to="/privacy">Privacy</router-link></li>
          <li><router-link to="/cookies">Cookies</router-link></li>
          <li><router-link to="/licenses">Licenses</router-link></li>
          <li><router-link to="/settings">Settings</router-link></li>
          <li><router-link to="/contact">Contact</router-link></li></ul></div>
      </div>
    </div> -->

    <div class="container footer-bottom">
      <p>{{ t('footer.disclaimer') }}</p>
      <p>{{ t('footer.copyright') }}</p>
      <div class="social-icons">
        <a href="#"><img src="/icons/X-logo.png" alt="X" /></a>
        <a href="#"><img src="/icons/Linkedin-logo.png" alt="LinkedIn" /></a>
        <a href="#"><img src="/icons/facebook-logo.png" alt="Facebook" /></a>
        <a href="#"><img src="/icons/github-logo.png" alt="GitHub" /></a>
      </div>
    </div>
  </footer>
</template>

<script>
import { useLanguage } from '@/composables/useLanguage'

export default { 
  name: 'AppFooter',
  setup() {
    const { t } = useLanguage()
    return { t }
  }
}
</script>

<style scoped>
.footer {
  background: var(--card-bg);
  color: var(--text);
}

.footer-bottom {
  color: var(--text);
}

/* 手机端响应式设计 */
@media (max-width: 768px) {
  .container {
    padding-left: 30px !important;
    padding-right: 30px !important;
  }
  
  .footer-top {
    flex-direction: column;
    gap: 24px;
  }
  
  .footer-links {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding-left: 30px !important;
    padding-right: 30px !important;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .footer-brand {
    text-align: center;
  }
  
  .footer-tagline {
    font-size: 14px;
  }
}
</style>
