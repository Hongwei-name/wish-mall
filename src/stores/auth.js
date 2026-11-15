import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import {
  fetchCurrentUser,
  logout as logoutRequest,
  updateProfile as updateProfileRequest,
  uploadAvatar as uploadAvatarRequest,
} from '@/modules/auth/api'

const TOKEN_KEY = 'wish-mall.auth-token'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(sessionStorage.getItem(TOKEN_KEY) || '')
  const user = ref(null)
  const initialized = ref(false)
  let sessionPromise = null

  const isAuthenticated = computed(() => Boolean(token.value))

  function persistToken(nextToken) {
    token.value = nextToken
    if (nextToken) sessionStorage.setItem(TOKEN_KEY, nextToken)
    else sessionStorage.removeItem(TOKEN_KEY)
  }

  function setToken(nextToken) {
    persistToken(nextToken)
    user.value = null
    initialized.value = false
    sessionPromise = null
  }

  function setSession(nextToken, nextUser) {
    persistToken(nextToken)
    user.value = nextUser
    initialized.value = true
    sessionPromise = null
  }

  function clearSession() {
    persistToken('')
    user.value = null
    initialized.value = true
    sessionPromise = null
  }

  /**
   * 用 /auth/me 校验 Token 与实际用户状态；401/403 时清理会话。
   * 同一时刻只允许一个校验请求，避免路由守卫重复调用。
   */
  async function ensureSession() {
    if (!token.value) {
      initialized.value = true
      user.value = null
      return false
    }
    if (initialized.value && user.value) return true
    if (sessionPromise) return sessionPromise

    sessionPromise = fetchCurrentUser()
      .then((data) => {
        user.value = data
        initialized.value = true
        return true
      })
      .catch((error) => {
        if (error.code === 401 || error.code === 403) {
          clearSession()
          return false
        }
        initialized.value = true
        return false
      })
      .finally(() => {
        sessionPromise = null
      })

    return sessionPromise
  }

  async function logout() {
    if (token.value) {
      try {
        await logoutRequest()
      } catch {
        // 网络异常也要清理本地会话
      }
    }
    clearSession()
  }

  async function saveProfile(payload) {
    const nextUser = await updateProfileRequest(payload)
    user.value = nextUser
    return nextUser
  }

  async function uploadAvatar(file) {
    const nextUser = await uploadAvatarRequest(file)
    user.value = nextUser
    return nextUser
  }

  return {
    token,
    user,
    initialized,
    isAuthenticated,
    setToken,
    setSession,
    clearSession,
    ensureSession,
    logout,
    saveProfile,
    uploadAvatar,
  }
})
