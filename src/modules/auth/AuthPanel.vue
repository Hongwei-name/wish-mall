<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import TianaiCaptcha from './TianaiCaptcha.vue'
import { loginWithPassword, loginWithSms, registerWithSms, resetPassword, sendSmsCode } from './api'
import {
  validateCode,
  validateConfirmPassword,
  validateNewPassword,
  validatePassword,
  validatePhone,
} from './validation'

const emit = defineEmits(['authenticated'])
const props = defineProps({
  initialMode: { type: String, default: 'login' },
})
const authStore = useAuthStore()
const captcha = ref(null)
const accountMode = ref('login')
const loginMethod = ref('password')
const showPassword = ref(false)
const agreed = ref(false)
const form = reactive({ phone: '', password: '', confirmPassword: '', code: '' })
const fieldErrors = reactive({ phone: '', password: '', confirmPassword: '', code: '' })
const feedback = reactive({ type: '', message: '' })
const submitting = ref(false)
const sending = ref(false)
const cooldown = ref(0)
let cooldownTimer

const isRegister = computed(() => accountMode.value === 'register')
const isReset = computed(() => accountMode.value === 'reset')
const usePassword = computed(() => !isRegister.value && !isReset.value && loginMethod.value === 'password')
const needsCode = computed(() => isRegister.value || isReset.value || loginMethod.value === 'sms')
const needsPassword = computed(() => isRegister.value || isReset.value || loginMethod.value === 'password')
const showConfirm = computed(() => isRegister.value || isReset.value)
const heading = computed(() => isReset.value ? '重设心愿密码' : isRegister.value ? '初次见面，心愿生活家' : '欢迎回来，好久不见')
const subheading = computed(() => isReset.value ? '验证手机号后设置新密码。' : isRegister.value ? '创建账户，让每一份喜欢都有归处。' : '登录如你所愿，继续你的美好日常。')
const passwordLabel = computed(() => isReset.value ? '新密码' : '密码')
const actionText = computed(() => isReset.value ? '重设密码' : isRegister.value ? '创建心愿账户' : '登录，开启心愿之旅')
const smsScene = computed(() => isReset.value ? 'reset-password' : isRegister.value ? 'register' : 'login')

function clearFeedback() {
  feedback.type = ''
  feedback.message = ''
  Object.keys(fieldErrors).forEach((key) => { fieldErrors[key] = '' })
}

function clearSecrets() {
  form.password = ''
  form.confirmPassword = ''
  form.code = ''
  agreed.value = false
}

function switchAccountMode(mode) {
  accountMode.value = mode
  loginMethod.value = 'password'
  clearFeedback()
  clearSecrets()
}

function switchLoginMethod(method) {
  loginMethod.value = method
  clearFeedback()
  clearSecrets()
}

function startReset() {
  accountMode.value = 'reset'
  loginMethod.value = 'password'
  clearFeedback()
  clearSecrets()
}

function backToLogin() {
  accountMode.value = 'login'
  loginMethod.value = 'password'
  clearFeedback()
  clearSecrets()
}

function validateField(field) {
  if (field === 'phone') fieldErrors.phone = validatePhone(form.phone)
  else if (field === 'code') fieldErrors.code = validateCode(form.code)
  else if (field === 'password') {
    fieldErrors.password = (isRegister.value || isReset.value)
      ? validateNewPassword(form.password)
      : validatePassword(form.password)
  } else if (field === 'confirmPassword') {
    fieldErrors.confirmPassword = validateConfirmPassword(form.password, form.confirmPassword)
  }
  return !fieldErrors[field]
}

function validateForm() {
  const phoneValid = validateField('phone')
  const passwordValid = !needsPassword.value || validateField('password')
  const confirmValid = !showConfirm.value || validateField('confirmPassword')
  const codeValid = !needsCode.value || validateField('code')
  if (isRegister.value && !agreed.value) {
    showUnavailable('请先阅读并同意用户协议和隐私政策', 'error')
    return false
  }
  return phoneValid && passwordValid && confirmValid && codeValid
}

function openCaptcha() {
  if (sending.value || cooldown.value || !validateField('phone')) return
  clearFeedback()
  captcha.value?.open()
}

async function handleCaptchaVerified(captchaId) {
  if (sending.value) return
  sending.value = true
  clearFeedback()
  try {
    await sendSmsCode({ phone: form.phone, captchaId, scene: smsScene.value })
    feedback.type = 'success'
    feedback.message = `验证码已发送至 ${form.phone.slice(0, 3)}****${form.phone.slice(-4)}`
    cooldown.value = 60
    clearInterval(cooldownTimer)
    cooldownTimer = window.setInterval(() => {
      cooldown.value -= 1
      if (cooldown.value <= 0) clearInterval(cooldownTimer)
    }, 1000)
  } catch (error) {
    showUnavailable(error.message, 'error')
  } finally {
    sending.value = false
  }
}

function showUnavailable(message, type = 'notice') {
  feedback.type = type
  feedback.message = message
}

async function submit() {
  if (submitting.value) return
  clearFeedback()
  if (!validateForm()) return
  submitting.value = true
  try {
    if (isReset.value) {
      await resetPassword({ phone: form.phone, code: form.code, newPassword: form.password })
      accountMode.value = 'login'
      loginMethod.value = 'password'
      form.password = ''
      form.confirmPassword = ''
      form.code = ''
      feedback.type = 'success'
      feedback.message = '密码已重置，请使用新密码登录'
      return
    }

    let data
    if (isRegister.value) {
      data = await registerWithSms({ phone: form.phone, code: form.code, password: form.password })
    } else if (usePassword.value) {
      data = await loginWithPassword({ phone: form.phone, password: form.password })
    } else {
      data = await loginWithSms({ phone: form.phone, code: form.code })
    }
    if (!data?.token) throw new Error('登录响应缺少凭证，请重试')

    authStore.setToken(data.token)
    const valid = await authStore.ensureSession()
    if (!valid) {
      authStore.clearSession()
      throw new Error('登录状态校验失败，请重试')
    }
    emit('authenticated')
  } catch (error) {
    showUnavailable(error.message, 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (props.initialMode === 'reset') {
    startReset()
    form.phone = authStore.user?.phone || ''
  } else if (props.initialMode === 'register') {
    switchAccountMode('register')
  }
})

onBeforeUnmount(() => clearInterval(cooldownTimer))
</script>

<template>
  <section class="auth-panel" aria-labelledby="auth-heading">
    <div v-if="!isReset" class="account-switch" aria-label="账户操作">
      <button type="button" :aria-pressed="accountMode === 'login'" :class="{ active: accountMode === 'login' }" @click="switchAccountMode('login')">登录</button>
      <button type="button" :aria-pressed="accountMode === 'register'" :class="{ active: accountMode === 'register' }" @click="switchAccountMode('register')">注册</button>
    </div>
    <header class="auth-heading">
      <h1 id="auth-heading">{{ heading }}</h1>
      <p>{{ subheading }}</p>
    </header>
    <div v-if="!isRegister && !isReset" class="method-switch" aria-label="登录方式">
      <button type="button" :aria-pressed="usePassword" :class="{ active: usePassword }" @click="switchLoginMethod('password')">密码登录</button>
      <button type="button" :aria-pressed="!usePassword" :class="{ active: !usePassword }" @click="switchLoginMethod('sms')">验证码登录</button>
    </div>
    <form class="auth-form" novalidate :aria-busy="submitting" @submit.prevent="submit">
      <label class="field">
        <span class="field-label">手机号</span>
        <span class="input-shell" :class="{ invalid: fieldErrors.phone }">
          <AccountIcon name="phone" />
          <input v-model.trim="form.phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入 11 位手机号" :aria-invalid="!!fieldErrors.phone" :aria-describedby="fieldErrors.phone ? 'phone-error' : undefined" @blur="validateField('phone')" @input="fieldErrors.phone = ''" />
        </span>
        <small v-if="fieldErrors.phone" id="phone-error" class="field-error">{{ fieldErrors.phone }}</small>
      </label>

      <div v-if="needsPassword" class="field">
        <div class="field-label-row">
          <label for="auth-password">{{ passwordLabel }}</label>
          <button v-if="usePassword" type="button" @click="startReset">忘记密码？</button>
        </div>
        <span class="input-shell" :class="{ invalid: fieldErrors.password }">
          <AccountIcon name="lock" />
          <input id="auth-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="isRegister || isReset ? 'new-password' : 'current-password'" :placeholder="isRegister || isReset ? '8-64 位，含字母和数字' : '请输入密码'" :aria-invalid="!!fieldErrors.password" :aria-describedby="fieldErrors.password ? 'password-error' : undefined" @blur="validateField('password')" @input="fieldErrors.password = ''; fieldErrors.confirmPassword = ''" />
          <button class="visibility-button" type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><AccountIcon name="eye" /></button>
        </span>
        <small v-if="fieldErrors.password" id="password-error" class="field-error">{{ fieldErrors.password }}</small>
      </div>

      <div v-if="showConfirm" class="field">
        <label class="field-label" for="auth-confirm-password">确认密码</label>
        <span class="input-shell" :class="{ invalid: fieldErrors.confirmPassword }">
          <AccountIcon name="lock" />
          <input id="auth-confirm-password" v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="再次输入密码" :aria-invalid="!!fieldErrors.confirmPassword" :aria-describedby="fieldErrors.confirmPassword ? 'confirm-password-error' : undefined" @blur="validateField('confirmPassword')" @input="fieldErrors.confirmPassword = ''" />
        </span>
        <small v-if="fieldErrors.confirmPassword" id="confirm-password-error" class="field-error">{{ fieldErrors.confirmPassword }}</small>
      </div>

      <div v-if="needsCode" class="field">
        <label class="field-label" for="auth-code">短信验证码</label>
        <span class="code-row">
          <span class="input-shell" :class="{ invalid: fieldErrors.code }">
            <input id="auth-code" v-model.trim="form.code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位验证码" :aria-invalid="!!fieldErrors.code" :aria-describedby="fieldErrors.code ? 'code-error' : undefined" @blur="validateField('code')" @input="fieldErrors.code = ''" />
          </span>
          <button class="code-button" type="button" :disabled="sending || cooldown > 0" @click="openCaptcha">{{ cooldown ? `${cooldown}s` : sending ? '发送中' : '获取验证码' }}</button>
        </span>
        <small v-if="fieldErrors.code" id="code-error" class="field-error">{{ fieldErrors.code }}</small>
      </div>

      <div v-if="isRegister" class="agreement">
        <input id="auth-agreement" v-model="agreed" type="checkbox" />
        <span><label for="auth-agreement">我已阅读并同意</label> <button type="button" @click="showUnavailable('用户协议暂未发布')">《用户协议》</button>与<button type="button" @click="showUnavailable('隐私政策暂未发布')">《隐私政策》</button></span>
      </div>

      <p v-if="feedback.message" class="feedback" :class="feedback.type" :role="feedback.type === 'error' ? 'alert' : 'status'">{{ feedback.message }}</p>
      <button class="submit-button" type="submit" :disabled="submitting"><span v-if="submitting" class="spinner" aria-hidden="true"></span>{{ submitting ? '正在处理…' : actionText }}</button>
    </form>
    <p v-if="isReset" class="switch-hint"><button type="button" @click="backToLogin">返回登录</button></p>
    <p v-else class="switch-hint">{{ isRegister ? '已经有账户？' : '还没有账户？' }}<button type="button" @click="switchAccountMode(isRegister ? 'login' : 'register')">{{ isRegister ? '直接登录' : '免费注册' }}</button></p>
    <TianaiCaptcha ref="captcha" @verified="handleCaptchaVerified" @error="showUnavailable($event, 'error')" />
  </section>
</template>
<style scoped src="./auth-panel.css"></style>
