import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import './assets/shadcn.css'
import App from './App.vue'
import router from './router'
import { setAuthTokenProvider } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
import bannerText from './assets/banner.txt?raw'
console.log(
  `%c${bannerText}`,
  'color: #3b82f6; font-family: monospace; font-size: 14px; font-weight: bold;',
)
app.use(pinia)
setAuthTokenProvider(() => {
  const authStore = useAuthStore()
  return authStore.token
})
app.use(router)

app.mount('#app')
