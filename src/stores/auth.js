import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const TOKEN_KEY = 'wish-mall.auth-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem(TOKEN_KEY) || '')
  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(nextToken) {
    token.value = nextToken
    sessionStorage.setItem(TOKEN_KEY, nextToken)
  }

  function clearSession() {
    token.value = ''
    sessionStorage.removeItem(TOKEN_KEY)
  }

  return { token, isAuthenticated, setToken, clearSession }
})
