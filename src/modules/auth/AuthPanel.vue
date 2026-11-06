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
const actionText = computed(() => (isRegister.value ? '创建账户' : '登录'))

function clearFeedback() {
  feedback.type = ''
  feedback.message = ''
  Object.keys(fieldErrors).forEach((key) => (fieldErrors[key] = ''))
}

function switchAccountMode(nextMode) {
  accountMode.value = nextMode
  clearFeedback()
}

function switchLoginMethod(nextMethod) {
  loginMethod.value = nextMethod
  clearFeedback()
}

function validateField(field) {
  const validators = {
    phone: () => validatePhone(form.phone),
    password: () => validatePassword(form.password),
    code: () => validateCode(form.code),
  }
  fieldErrors[field] = validators[field]()
  return !fieldErrors[field]
}

function validateForm() {
  const phoneValid = validateField('phone')
  const passwordValid = !needsPassword.value || validateField('password')
  const codeValid = !needsCode.value || validateField('code')
  if (isRegister.value && !agreed.value) {
    feedback.type = 'error'
    feedback.message = '请先阅读并同意用户协议和隐私政策'
    return false
  }
  return phoneValid && passwordValid && codeValid
}

function openCaptcha() {
  if (!validateField('phone')) return
  clearFeedback()
  captcha.value?.open()
}

async function handleCaptchaVerified(captchaId) {
  sending.value = true
  clearFeedback()
  try {
    await sendSmsCode({ phone: form.phone, captchaId })
    feedback.type = 'success'
    feedback.message = `验证码已发送至 ${form.phone.slice(0, 3)}****${form.phone.slice(-4)}`
    startCooldown()
  } catch (requestError) {
    feedback.type = 'error'
    feedback.message = requestError.message
  } finally {
    sending.value = false
  }
}

function startCooldown() {
  cooldown.value = 60
  clearInterval(cooldownTimer)
  cooldownTimer = window.setInterval(() => {
    cooldown.value -= 1
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

function showUnavailable(message) {
  feedback.type = 'notice'
  feedback.message = message
}

async function submit() {
  clearFeedback()
  if (!validateForm()) return
  submitting.value = true
  try {
    let data
    if (isRegister.value) data = await registerWithSms({ phone: form.phone, code: form.code, password: form.password })
    else if (usePassword.value) data = await loginWithPassword({ phone: form.phone, password: form.password })
    else data = await loginWithSms({ phone: form.phone, code: form.code })
    authStore.setToken(data.token)
    emit('authenticated')
  } catch (requestError) {
    feedback.type = 'error'
    feedback.message = requestError.message
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => clearInterval(cooldownTimer))
</script>

<template>
  <section class="auth-panel" aria-labelledby="auth-heading">
    <div class="account-switch" role="tablist" aria-label="账户操作">
      <button type="button" role="tab" :aria-selected="!isRegister" :class="{ active: !isRegister }" @click="switchAccountMode('login')">登录</button>
      <button type="button" role="tab" :aria-selected="isRegister" :class="{ active: isRegister }" @click="switchAccountMode('register')">注册</button>
    </div>
    <header class="auth-heading">
      <p class="eyebrow">{{ isRegister ? 'JOIN WISH MALL' : 'WELCOME BACK' }}</p>
      <h1 id="auth-heading">{{ isRegister ? '创建你的账户' : '欢迎回来' }}</h1>
      <p>{{ isRegister ? '注册账户，收藏喜欢的商品并随时查看订单。' : '登录后继续查看订单、收藏与账户权益。' }}</p>
    </header>
    <div v-if="!isRegister" class="method-switch" role="tablist" aria-label="登录方式">
      <button type="button" role="tab" :aria-selected="loginMethod === 'password'" :class="{ active: loginMethod === 'password' }" @click="switchLoginMethod('password')">密码登录</button>
      <button type="button" role="tab" :aria-selected="loginMethod === 'sms'" :class="{ active: loginMethod === 'sms' }" @click="switchLoginMethod('sms')">验证码登录</button>
    </div>
    <form class="auth-form" novalidate @submit.prevent="submit">
      <label class="field">
        <span class="field-label">手机号</span>
        <span class="input-shell" :class="{ invalid: fieldErrors.phone }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h10v18H7V3Zm4 15h2" /></svg>
          <input v-model.trim="form.phone" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入 11 位手机号" aria-label="手机号" @blur="validateField('phone')" @input="fieldErrors.phone = ''" />
        </span>
        <small v-if="fieldErrors.phone" class="field-error">{{ fieldErrors.phone }}</small>
      </label>
      <label v-if="needsPassword" class="field">
        <span class="field-label-row"><span>密码</span><button v-if="usePassword" type="button" @click="showUnavailable('找回密码功能将在账户安全模块开放')">忘记密码？</button></span>
        <span class="input-shell" :class="{ invalid: fieldErrors.password }">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V8a5 5 0 0 1 10 0v2M5 10h14v11H5V10Zm7 4v3" /></svg>
          <input v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="isRegister ? 'new-password' : 'current-password'" placeholder="至少 8 个字符" aria-label="密码" @blur="validateField('password')" @input="fieldErrors.password = ''" />
          <button class="visibility-button" type="button" :aria-label="showPassword ? '隐藏密码' : '显示密码'" @click="showPassword = !showPassword"><svg viewBox="0 0 24 24"><path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" /></svg></button>
        </span>
        <small v-if="fieldErrors.password" class="field-error">{{ fieldErrors.password }}</small>
      </label>
      <label v-if="needsCode" class="field">
        <span class="field-label">短信验证码</span>
        <span class="code-row">
          <span class="input-shell" :class="{ invalid: fieldErrors.code }">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16v12H4V6Zm0 2 8 5 8-5" /></svg>
            <input v-model.trim="form.code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="6 位验证码" aria-label="短信验证码" @blur="validateField('code')" @input="fieldErrors.code = ''" />
          </span>
          <button class="code-button" type="button" :disabled="sending || cooldown > 0" @click="openCaptcha">{{ cooldown ? `${cooldown}s` : sending ? '发送中' : '获取验证码' }}</button>
        </span>
        <small v-if="fieldErrors.code" class="field-error">{{ fieldErrors.code }}</small>
      </label>
      <label v-if="isRegister" class="agreement">
        <input v-model="agreed" type="checkbox" />
        <span>我已阅读并同意 <button type="button" @click="showUnavailable('用户协议暂未发布')">《用户协议》</button> 与 <button type="button" @click="showUnavailable('隐私政策暂未发布')">《隐私政策》</button></span>
      </label>
      <p v-if="feedback.message" class="feedback" :class="feedback.type" :role="feedback.type === 'error' ? 'alert' : 'status'">
        <svg v-if="feedback.type === 'error'" viewBox="0 0 24 24"><path d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01" /></svg>
        <svg v-else viewBox="0 0 24 24"><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-4-9 2.5 2.5L16 9" /></svg>
        {{ feedback.message }}
      </p>
      <button class="submit-button" type="submit" :disabled="submitting"><span v-if="submitting" class="spinner" aria-hidden="true"></span>{{ submitting ? '正在处理...' : actionText }}</button>
    </form>
    <p class="switch-hint">{{ isRegister ? '已经有账户？' : '还没有账户？' }}<button type="button" @click="switchAccountMode(isRegister ? 'login' : 'register')">{{ isRegister ? '直接登录' : '免费注册' }}</button></p>
    <TianaiCaptcha ref="captcha" @verified="handleCaptchaVerified" @error="feedback.type = 'error'; feedback.message = $event" />
  </section>
</template>

<style scoped>
.auth-panel { width: min(100%, 460px); padding: clamp(26px, 4vw, 42px); border: 1px solid var(--border); border-radius: 10px; background: var(--surface); box-shadow: 0 26px 70px var(--shadow); }
.account-switch { display: flex; gap: 24px; margin-bottom: 32px; border-bottom: 1px solid var(--border); }
.account-switch button { position: relative; padding: 0 1px 13px; border: 0; background: none; color: var(--muted); cursor: pointer; font: inherit; font-size: 14px; font-weight: 700; }
.account-switch button::after { position: absolute; right: 0; bottom: -1px; left: 0; height: 2px; background: var(--brand); content: ''; opacity: 0; transform: scaleX(.4); transition: .2s ease; }
.account-switch button.active { color: var(--text); }
.account-switch button.active::after { opacity: 1; transform: scaleX(1); }
.auth-heading { margin-bottom: 24px; }
.eyebrow { margin: 0 0 8px; color: var(--brand); font-size: 9px; font-weight: 800; letter-spacing: .17em; }
h1 { margin: 0; color: var(--text); font-size: clamp(27px, 4vw, 34px); line-height: 1.15; }
.auth-heading > p:last-child { margin: 11px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
.method-switch { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border: 1px solid var(--border); border-radius: 6px; background: var(--input); }
.method-switch button { min-height: 37px; border: 0; border-radius: 4px; background: transparent; color: var(--muted); cursor: pointer; font: inherit; font-size: 12px; }
.method-switch button.active { background: var(--surface-raised); color: var(--text); box-shadow: 0 1px 3px var(--shadow); }
.auth-form { display: grid; gap: 17px; margin-top: 23px; }
.field { display: grid; gap: 7px; }
.field-label, .field-label-row { color: var(--text); font-size: 12px; font-weight: 700; }
.field-label-row { display: flex; align-items: center; justify-content: space-between; }
.field-label-row button, .agreement button, .switch-hint button { padding: 0; border: 0; background: none; color: var(--brand); cursor: pointer; font: inherit; }
.field-label-row button { font-size: 11px; font-weight: 600; }
.input-shell { display: flex; min-height: 47px; padding: 0 13px; align-items: center; gap: 10px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--input); transition: border-color .18s, box-shadow .18s; }
.input-shell:focus-within { border-color: var(--brand); box-shadow: 0 0 0 3px var(--brand-soft); }
.input-shell.invalid { border-color: var(--danger); }
.input-shell > svg { width: 18px; flex: 0 0 auto; fill: none; stroke: var(--muted); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.input-shell input { width: 100%; min-width: 0; padding: 0; border: 0; outline: 0; background: transparent; color: var(--text); font: inherit; font-size: 14px; }
.input-shell input::placeholder { color: var(--muted); }
.visibility-button { display: grid; width: 28px; height: 28px; flex: 0 0 auto; place-items: center; border: 0; border-radius: 4px; background: none; color: var(--muted); cursor: pointer; }
.visibility-button:hover { background: var(--surface-raised); color: var(--text); }
.visibility-button svg { width: 18px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
.field-error { color: var(--danger); font-size: 11px; line-height: 1.3; }
.code-row { display: grid; grid-template-columns: minmax(0,1fr) 108px; gap: 8px; }
.code-button { border: 1px solid var(--border-strong); border-radius: 6px; background: var(--surface-raised); color: var(--brand); cursor: pointer; font: inherit; font-size: 12px; font-weight: 700; }
.code-button:hover:not(:disabled) { border-color: var(--brand); }
.code-button:disabled, .submit-button:disabled { cursor: not-allowed; opacity: .58; }
.agreement { display: flex; align-items: flex-start; gap: 9px; color: var(--muted); font-size: 11px; line-height: 1.55; }
.agreement input { width: 15px; height: 15px; margin: 1px 0 0; flex: 0 0 auto; accent-color: var(--brand); }
.agreement button { font-size: inherit; }
.feedback { display: flex; margin: -2px 0 0; padding: 10px 11px; align-items: flex-start; gap: 8px; border: 1px solid var(--border); border-radius: 5px; background: var(--input); color: var(--muted); font-size: 11px; line-height: 1.45; }
.feedback svg { width: 15px; flex: 0 0 auto; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.feedback.error { border-color: #dfb4a9; background: var(--danger-soft); color: var(--danger); }
.feedback.success { border-color: #b8cebd; background: var(--success-soft); color: var(--success); }
.submit-button { display: flex; min-height: 48px; align-items: center; justify-content: center; gap: 9px; border: 0; border-radius: 6px; background: var(--brand); color: var(--on-brand); cursor: pointer; font: inherit; font-size: 14px; font-weight: 800; transition: background .18s, transform .18s; }
.submit-button:hover:not(:disabled) { background: var(--brand-strong); }
.submit-button:active:not(:disabled) { transform: translateY(1px); }
.spinner { width: 15px; height: 15px; border: 2px solid #d9d7ce; border-top-color: var(--brand); border-radius: 50%; animation: spin .7s linear infinite; }
.switch-hint { margin: 22px 0 0; color: var(--muted); font-size: 12px; text-align: center; }
.switch-hint button { margin-left: 5px; font-weight: 700; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
@container (max-width: 390px) { .auth-panel { padding: 24px 18px; border-radius: 8px; } .account-switch { margin-bottom: 26px; } .code-row { grid-template-columns: minmax(0,1fr) 96px; } }
</style>
