import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setAuthTokenProvider } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()
import bannerText from './assets/banner.txt?raw'
console.log(
  `%c${bannerText}`, 
  'color: #3b82f6; font-family: monospace; font-size: 14px; font-weight: bold;'
)
app.use(pinia)
setAuthTokenProvider(() => useAuthStore(pinia).token)
app.use(router)

app.mount('#app')
