<script setup>
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import TianaiCaptcha from './TianaiCaptcha.vue'
import { loginWithPassword, loginWithSms, registerWithSms, sendSmsCode } from './api'
import { validateCode, validatePassword, validatePhone } from './validation'
const emit = defineEmits(['authenticated'])
const authStore = useAuthStore()
const captcha = ref(null)
const accountMode = ref('login')
const loginMethod = ref('password')
const showPassword = ref(false)
const agreed = ref(false)
const form = reactive({ phone: '', password: '', code: '' })
const fieldErrors = reactive({ phone: '', password: '', code: '' })
const feedback = reactive({ type: '', message: '' })
const submitting = ref(false)
const sending = ref(false)
const cooldown = ref(0)
let cooldownTimer
const isRegister = computed(() => accountMode.value === 'register')
const usePassword = computed(() => !isRegister.value && loginMethod.value === 'password')
const needsCode = computed(() => isRegister.value || loginMethod.value === 'sms')
const needsPassword = computed(() => isRegister.value || loginMethod.value === 'password')
const actionText = computed(() => isRegister.value ? '创建心愿账户' : '登录，开启心愿之旅')
function clearFeedback() {
  feedback.type = ''; feedback.message = ''
  Object.keys(fieldErrors).forEach(key => fieldErrors[key] = '')
}
function switchAccountMode(mode) { accountMode.value = mode; clearFeedback() }
function switchLoginMethod(method) { loginMethod.value = method; clearFeedback() }
function validateField(field) {
  const validators = { phone: validatePhone, password: validatePassword, code: validateCode }
  fieldErrors[field] = validators[field](form[field])
  return !fieldErrors[field]
}
function validateForm() {
  const phoneValid = validateField('phone')
  const passwordValid = !needsPassword.value || validateField('password')
  const codeValid = !needsCode.value || validateField('code')
  if (isRegister.value && !agreed.value) { showUnavailable('请先阅读并同意用户协议和隐私政策', 'error'); return false }
  return phoneValid && passwordValid && codeValid
}
function openCaptcha() {
  if (sending.value || cooldown.value || !validateField('phone')) return
  clearFeedback(); captcha.value?.open()
}
async function handleCaptchaVerified(captchaId) {
  if (sending.value) return
  sending.value = true; clearFeedback()
  try {
    await sendSmsCode({ phone: form.phone, captchaId })
    feedback.type = 'success'
    feedback.message = `验证码已发送至 ${form.phone.slice(0, 3)}****${form.phone.slice(-4)}`
    cooldown.value = 60; clearInterval(cooldownTimer)
    cooldownTimer = window.setInterval(() => { cooldown.value -= 1; if (cooldown.value <= 0) clearInterval(cooldownTimer) }, 1000)
  } catch (error) { showUnavailable(error.message, 'error') }
  finally { sending.value = false }
}
function showUnavailable(message, type = 'notice') { feedback.type = type; feedback.message = message }
async function submit() {
  if (submitting.value) return
  clearFeedback(); if (!validateForm()) return
  submitting.value = true
  try {
    let data
    if (isRegister.value) data = await registerWithSms({ phone: form.phone, code: form.code, password: form.password })
    else if (usePassword.value) data = await loginWithPassword({ phone: form.phone, password: form.password })
    else data = await loginWithSms({ phone: form.phone, code: form.code })
    if (!data?.token) throw new Error('登录响应缺少凭证，请重试')
    authStore.setToken(data.token); emit('authenticated')
  } catch (error) { showUnavailable(error.message, 'error') }
  finally { submitting.value = false }
}
onBeforeUnmount(() => clearInterval(cooldownTimer))
</script>

<template>
  <section class="auth-panel" aria-labelledby="auth-heading">
    <div class="account-switch" aria-label="账户操作">
      <button type="button" :aria-pressed="!isRegister" :class="{ active: !isRegister }" @click="switchAccountMode('login')">登录</button>
      <button type="button" :aria-pressed="isRegister" :class="{ active: isRegister }" @click="switchAccountMode('register')">注册</button>
    </div>
    <header class="auth-heading"><h1 id="auth-heading">{{ isRegister ? '初次见面，心愿生活家' : '欢迎回来，好久不见' }}</h1><p>{{ isRegister ? '创建账户，让每一份喜欢都有归处。' : '登录如你所愿，继续你的美好日常。' }}</p></header>
    <div v-if="!isRegister" class="method-switch" aria-label="登录方式">
      <button type="button" :aria-pressed="usePassword" :class="{ active: usePassword }" @click="switchLoginMethod('password')">密码登录</button>
      <button type="button" :aria-pressed="!usePassword" :class="{ active: !usePassword }" @click="switchLoginMethod('sms')">验证码登录</button>
    </div>
    <form class="auth-form" novalidate :aria-busy="submitting" @submit.prevent="submit">
      <label class="field"><span class="field-label">手机号</span><span class="input-shell" :class="{ invalid: fieldErrors.phone }"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7V3Zm4 15h2" /></svg><input v-model.trim="form.phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入 11 位手机号" :aria-invalid="!!fieldErrors.phone" :aria-describedby="fieldErrors.phone ? 'phone-error' : undefined" @blur="validateField('phone')" @input="fieldErrors.phone = ''" /></span><small v-if="fieldErrors.phone" id="phone-error" class="field-error">{{ fieldErrors.phone }}</small></label>
      <div v-if="needsPassword" class="field"><div class="field-label-row"><label for="auth-password">密码</label><button v-if="usePassword" type="button" @click="showUnavailable('找回密码功能暂未开放，可尝试使用验证码登录')">忘记密码？</button></div><span class="input-shell" :class="{ invalid: fieldErrors.password }"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v11H5V10Zm7 4v3" /></svg><input id="auth-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="isRegister ? 'new-password' : 'current-password'" placeholder="至少 8 个字符" :aria-invalid="!!fieldErrors.password" :aria-describedby="fieldErrors.password ? 'password-error' : undefined" @blur="validateField('password')" @input="fieldErrors.password = ''" /><button class="visibility-button" type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg></button></span><small v-if="fieldErrors.password" id="password-error" class="field-error">{{ fieldErrors.password }}</small></div>
      <div v-if="needsCode" class="field"><label class="field-label" for="auth-code">短信验证码</label><span class="code-row"><span class="input-shell" :class="{ invalid: fieldErrors.code }"><input id="auth-code" v-model.trim="form.code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位验证码" :aria-invalid="!!fieldErrors.code" :aria-describedby="fieldErrors.code ? 'code-error' : undefined" @blur="validateField('code')" @input="fieldErrors.code = ''" /></span><button class="code-button" type="button" :disabled="sending || cooldown > 0" @click="openCaptcha">{{ cooldown ? `${cooldown}s` : sending ? '发送中' : '获取验证码' }}</button></span><small v-if="fieldErrors.code" id="code-error" class="field-error">{{ fieldErrors.code }}</small></div>
      <div v-if="isRegister" class="agreement"><input id="auth-agreement" v-model="agreed" type="checkbox" /><span><label for="auth-agreement">我已阅读并同意</label> <button type="button" @click="showUnavailable('用户协议暂未发布')">《用户协议》</button>与<button type="button" @click="showUnavailable('隐私政策暂未发布')">《隐私政策》</button></span></div>
      <p v-if="feedback.message" class="feedback" :class="feedback.type" :role="feedback.type === 'error' ? 'alert' : 'status'">{{ feedback.message }}</p>
      <button class="submit-button" type="submit" :disabled="submitting"><span v-if="submitting" class="spinner" aria-hidden="true"></span>{{ submitting ? '正在处理…' : actionText }}</button>
    </form>
    <p class="switch-hint">{{ isRegister ? '已经有账户？' : '还没有账户？' }}<button type="button" @click="switchAccountMode(isRegister ? 'login' : 'register')">{{ isRegister ? '直接登录' : '免费注册' }}</button></p>
    <TianaiCaptcha ref="captcha" @verified="handleCaptchaVerified" @error="showUnavailable($event, 'error')" />
  </section>
</template>
<style scoped src="./auth-panel.css"></style>
