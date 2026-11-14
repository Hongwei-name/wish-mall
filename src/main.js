import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setAuthTokenProvider } from '@/api/http'
import { useAuthStore } from '@/stores/auth'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
setAuthTokenProvider(() => useAuthStore(pinia).token)
app.use(router)

app.mount('#app')
