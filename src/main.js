import './assets/main.css'

import { createApp } from 'vue'
import router from './router'
import App from './App.vue'

if (window.Kakao && !window.Kakao.isInitialized()) {
  window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY)
}
createApp(App).use(router).mount('#app')
