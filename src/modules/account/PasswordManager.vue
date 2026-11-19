<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import TianaiCaptcha from '@/modules/auth/TianaiCaptcha.vue'
import { changePassword, resetPassword, sendSmsCode } from '@/modules/auth/api'
import { validateCode, validateConfirmPassword, validateNewPassword } from '@/modules/auth/validation'

const authStore = useAuthStore()

const boundPhone = computed(() => authStore.user?.phone || '')
const maskedPhone = computed(() => {
  const phone = boundPhone.value
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '未绑定'
})

// 更改密码
const changeOpen = ref(false)
const changeForm = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const changeErrors = reactive({ oldPassword: '', newPassword: '', confirmPassword: '' })
const changeFeedback = reactive({ type: '', message: '' })
const changing = ref(false)

// 忘记密码
const forgotOpen = ref(false)
const forgotForm = reactive({ code: '', newPassword: '', confirmPassword: '' })
const forgotErrors = reactive({ code: '', newPassword: '', confirmPassword: '' })
const forgotFeedback = reactive({ type: '', message: '' })
const resetting = ref(false)
const sending = ref(false)
const cooldown = ref(0)
const captcha = ref(null)
let cooldownTimer
let closeTimer

function openChange() {
  Object.assign(changeForm, { oldPassword: '', newPassword: '', confirmPassword: '' })
  Object.assign(changeErrors, { oldPassword: '', newPassword: '', confirmPassword: '' })
  changeFeedback.type = ''
  changeFeedback.message = ''
  changeOpen.value = true
}

function closeChange() {
  changeOpen.value = false
}

function openForgot() {
  changeOpen.value = false
  Object.assign(forgotForm, { code: '', newPassword: '', confirmPassword: '' })
  Object.assign(forgotErrors, { code: '', newPassword: '', confirmPassword: '' })
  forgotFeedback.type = ''
  forgotFeedback.message = ''
  clearInterval(cooldownTimer)
  cooldown.value = 0
  forgotOpen.value = true
}

function closeForgot() {
  forgotOpen.value = false
}

function validateChangeField(field) {
  if (field === 'oldPassword') changeErrors.oldPassword = changeForm.oldPassword ? '' : '请输入旧密码'
  else if (field === 'newPassword') changeErrors.newPassword = validateNewPassword(changeForm.newPassword)
  else if (field === 'confirmPassword')
    changeErrors.confirmPassword = validateConfirmPassword(changeForm.newPassword, changeForm.confirmPassword)
  return !changeErrors[field]
}

async function submitChange() {
  if (changing.value) return
  changeFeedback.type = ''
  changeFeedback.message = ''
  const oldOk = validateChangeField('oldPassword')
  const newOk = validateChangeField('newPassword')
  const confirmOk = validateChangeField('confirmPassword')
  if (!oldOk || !newOk || !confirmOk) return

  changing.value = true
  try {
    await changePassword({ oldPassword: changeForm.oldPassword, newPassword: changeForm.newPassword })
    changeFeedback.type = 'success'
    changeFeedback.message = '密码已更新'
    closeTimer = window.setTimeout(closeChange, 1200)
  } catch (error) {
    changeFeedback.type = 'error'
    changeFeedback.message = error.message || '更改失败，请稍后重试'
  } finally {
    changing.value = false
  }
}

function validateForgotField(field) {
  if (field === 'code') forgotErrors.code = validateCode(forgotForm.code)
  else if (field === 'newPassword') forgotErrors.newPassword = validateNewPassword(forgotForm.newPassword)
  else if (field === 'confirmPassword')
    forgotErrors.confirmPassword = validateConfirmPassword(forgotForm.newPassword, forgotForm.confirmPassword)
  return !forgotErrors[field]
}

function openCaptcha() {
  if (sending.value || cooldown.value) return
  forgotFeedback.type = ''
  forgotFeedback.message = ''
  captcha.value?.open()
}

function onCaptchaError(message) {
  forgotFeedback.type = 'error'
  forgotFeedback.message = message || '验证失败，请重试'
}

async function handleCaptchaVerified(captchaId) {
  if (sending.value) return
  sending.value = true
  forgotFeedback.type = ''
  forgotFeedback.message = ''
  try {
    await sendSmsCode({ phone: boundPhone.value, captchaId, scene: 'reset-password' })
    forgotFeedback.type = 'success'
    forgotFeedback.message = `验证码已发送至 ${maskedPhone.value}`
    cooldown.value = 60
    clearInterval(cooldownTimer)
    cooldownTimer = window.setInterval(() => {
      cooldown.value -= 1
      if (cooldown.value <= 0) clearInterval(cooldownTimer)
    }, 1000)
  } catch (error) {
    forgotFeedback.type = 'error'
    forgotFeedback.message = error.message || '发送失败，请稍后重试'
  } finally {
    sending.value = false
  }
}

async function submitForgot() {
  if (resetting.value) return
  forgotFeedback.type = ''
  forgotFeedback.message = ''
  const codeOk = validateForgotField('code')
  const newOk = validateForgotField('newPassword')
  const confirmOk = validateForgotField('confirmPassword')
  if (!codeOk || !newOk || !confirmOk) return

  resetting.value = true
  try {
    await resetPassword({ phone: boundPhone.value, code: forgotForm.code, newPassword: forgotForm.newPassword })
    forgotFeedback.type = 'success'
    forgotFeedback.message = '密码已重置'
    closeTimer = window.setTimeout(closeForgot, 1200)
  } catch (error) {
    forgotFeedback.type = 'error'
    forgotFeedback.message = error.message || '重置失败，请稍后重试'
  } finally {
    resetting.value = false
  }
}

function onKeydown(event) {
  if (event.key !== 'Escape') return
  changeOpen.value = false
  forgotOpen.value = false
}

watch(
  () => changeOpen.value || forgotOpen.value,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  clearInterval(cooldownTimer)
  clearTimeout(closeTimer)
  document.body.style.overflow = ''
})
</script>

<template>
  <section class="account-panel settings-panel" aria-labelledby="settings-security-title">
    <header class="panel-heading"><h2 id="settings-security-title">账户安全</h2></header>
    <dl class="settings-list">
      <div class="settings-row settings-row--action">
        <dt>登录密码</dt>
        <dd>
          <span class="security-state">已设置</span>
          <button class="settings-action" type="button" @click="openChange">
            更改密码 <AccountIcon name="arrow" />
          </button>
        </dd>
      </div>
    </dl>
  </section>

  <Teleport to="body">
    <div v-if="changeOpen" class="pw-overlay" role="dialog" aria-modal="true" aria-labelledby="pw-change-title" @click.self="closeChange">
      <div class="pw-dialog">
        <button class="pw-close" type="button" aria-label="关闭" @click="closeChange"><AccountIcon name="close" /></button>
        <h2 id="pw-change-title">更改密码</h2>
        <form class="pw-form" novalidate @submit.prevent="submitChange">
          <label class="pw-field">
            <span class="pw-label">旧密码</span>
            <input
              v-model="changeForm.oldPassword"
              type="password"
              autocomplete="current-password"
              placeholder="请输入旧密码"
              autofocus
              :aria-invalid="!!changeErrors.oldPassword"
              @blur="validateChangeField('oldPassword')"
              @input="changeErrors.oldPassword = ''"
            />
            <small v-if="changeErrors.oldPassword" class="pw-error">{{ changeErrors.oldPassword }}</small>
          </label>
          <label class="pw-field">
            <span class="pw-label">新密码</span>
            <input
              v-model="changeForm.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="8-64 位，含字母和数字"
              :aria-invalid="!!changeErrors.newPassword"
              @blur="validateChangeField('newPassword')"
              @input="changeErrors.newPassword = ''"
            />
            <small v-if="changeErrors.newPassword" class="pw-error">{{ changeErrors.newPassword }}</small>
          </label>
          <label class="pw-field">
            <span class="pw-label">确认新密码</span>
            <input
              v-model="changeForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="再次输入新密码"
              :aria-invalid="!!changeErrors.confirmPassword"
              @blur="validateChangeField('confirmPassword')"
              @input="changeErrors.confirmPassword = ''"
            />
            <small v-if="changeErrors.confirmPassword" class="pw-error">{{ changeErrors.confirmPassword }}</small>
          </label>

          <p v-if="changeFeedback.message" class="pw-feedback" :class="changeFeedback.type" role="status">
            {{ changeFeedback.message }}
          </p>

          <div class="pw-actions">
            <button class="pw-link" type="button" @click="openForgot">忘记密码？</button>
            <button class="pw-secondary" type="button" @click="closeChange">取消</button>
            <button class="pw-primary" type="submit" :disabled="changing">{{ changing ? '提交中…' : '确认更改' }}</button>
          </div>
        </form>
      </div>
    </div>

    <div v-if="forgotOpen" class="pw-overlay" role="dialog" aria-modal="true" aria-labelledby="pw-forgot-title" @click.self="closeForgot">
      <div class="pw-dialog">
        <button class="pw-close" type="button" aria-label="关闭" @click="closeForgot"><AccountIcon name="close" /></button>
        <h2 id="pw-forgot-title">忘记密码</h2>
        <p class="pw-step">验证手机号后设置新的登录密码。</p>
        <form class="pw-form" novalidate @submit.prevent="submitForgot">
          <label class="pw-field">
            <span class="pw-label">手机号</span>
            <input :value="maskedPhone" type="tel" readonly />
          </label>
          <div class="pw-field">
            <span class="pw-label">短信验证码</span>
            <div class="pw-code-row">
              <input
                v-model.trim="forgotForm.code"
                inputmode="numeric"
                maxlength="6"
                placeholder="6 位验证码"
                autofocus
                :aria-invalid="!!forgotErrors.code"
                @blur="validateForgotField('code')"
                @input="forgotErrors.code = ''"
              />
              <button class="pw-code-btn" type="button" :disabled="sending || cooldown > 0" @click="openCaptcha">
                {{ cooldown ? `${cooldown}s` : sending ? '发送中' : '获取验证码' }}
              </button>
            </div>
            <small v-if="forgotErrors.code" class="pw-error">{{ forgotErrors.code }}</small>
          </div>
          <label class="pw-field">
            <span class="pw-label">新密码</span>
            <input
              v-model="forgotForm.newPassword"
              type="password"
              autocomplete="new-password"
              placeholder="8-64 位，含字母和数字"
              :aria-invalid="!!forgotErrors.newPassword"
              @blur="validateForgotField('newPassword')"
              @input="forgotErrors.newPassword = ''"
            />
            <small v-if="forgotErrors.newPassword" class="pw-error">{{ forgotErrors.newPassword }}</small>
          </label>
          <label class="pw-field">
            <span class="pw-label">确认新密码</span>
            <input
              v-model="forgotForm.confirmPassword"
              type="password"
              autocomplete="new-password"
              placeholder="再次输入新密码"
              :aria-invalid="!!forgotErrors.confirmPassword"
              @blur="validateForgotField('confirmPassword')"
              @input="forgotErrors.confirmPassword = ''"
            />
            <small v-if="forgotErrors.confirmPassword" class="pw-error">{{ forgotErrors.confirmPassword }}</small>
          </label>

          <p v-if="forgotFeedback.message" class="pw-feedback" :class="forgotFeedback.type" role="status">
            {{ forgotFeedback.message }}
          </p>

          <div class="pw-actions">
            <button class="pw-secondary" type="button" @click="closeForgot">取消</button>
            <button class="pw-primary" type="submit" :disabled="resetting">{{ resetting ? '提交中…' : '重设密码' }}</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>

  <TianaiCaptcha ref="captcha" @verified="handleCaptchaVerified" @error="onCaptchaError" />
</template>

<style scoped>
.pw-overlay {
  position: fixed;
  z-index: 900;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: color-mix(in srgb, var(--text) 30%, transparent);
  backdrop-filter: blur(7px);
}
.pw-dialog {
  position: relative;
  width: min(420px, 100%);
  max-height: calc(100dvh - 48px);
  padding: 32px 28px 28px;
  overflow: auto;
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  color: var(--text);
  background: var(--surface);
  backdrop-filter: blur(28px);
  box-shadow:
    inset 0 1px white,
    0 28px 100px color-mix(in srgb, var(--brand-strong) 22%, transparent);
}
.pw-close {
  position: absolute;
  top: 16px;
  right: 16px;
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 50%;
  background: var(--glass);
  color: var(--brand-ink);
  cursor: pointer;
  font: inherit;
}
.pw-close:hover {
  background: var(--brand-soft);
}
.pw-close svg {
  width: 19px;
  height: 19px;
}
h2 {
  margin: 0 0 8px;
  font-size: 22px;
}
.pw-step {
  margin: 0 0 18px;
  color: var(--muted);
  font-size: 13px;
}
.pw-form {
  display: grid;
  gap: 14px;
}
.pw-field {
  display: grid;
  gap: 6px;
}
.pw-label {
  color: var(--muted);
  font-size: 12px;
}
.pw-field input {
  height: 42px;
  width: 100%;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--glass);
  color: var(--text);
  font: inherit;
  font-size: 13px;
}
.pw-field input:focus {
  outline: none;
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--brand-soft);
}
.pw-field input[readonly] {
  color: var(--muted);
  background: var(--brand-soft);
  cursor: default;
}
.pw-field input[aria-invalid='true'] {
  border-color: #d6455d;
}
.pw-error {
  color: #d6455d;
  font-size: 12px;
}
.pw-feedback {
  margin: 0;
  font-size: 12px;
}
.pw-feedback.error {
  color: #d6455d;
}
.pw-feedback.success {
  color: var(--brand-ink);
}
.pw-code-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
}
.pw-code-btn {
  min-width: 96px;
  border: 1px solid var(--brand);
  border-radius: 10px;
  background: var(--brand-soft);
  color: var(--brand-ink);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.pw-code-btn:disabled {
  opacity: 0.55;
  cursor: default;
}
.pw-code-btn:hover:not(:disabled) {
  background: var(--brand);
  color: white;
}
.pw-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  align-items: center;
  margin-top: 6px;
}
.pw-link {
  margin-right: auto;
  padding: 0;
  border: 0;
  background: none;
  color: var(--brand-ink);
  cursor: pointer;
  font: inherit;
  font-size: 12px;
}
.pw-link:hover {
  color: var(--brand-strong);
  text-decoration: underline;
}
.pw-secondary,
.pw-primary {
  min-height: 42px;
  padding: 0 18px;
  border-radius: 11px;
  cursor: pointer;
  font: inherit;
  font-size: 13px;
}
.pw-secondary {
  border: 1px solid var(--border);
  background: var(--glass);
  color: var(--text);
}
.pw-secondary:hover {
  background: var(--brand-soft);
}
.pw-primary {
  border: 0;
  background: var(--brand);
  color: white;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--brand) 20%, transparent);
}
.pw-primary:hover {
  background: var(--brand-strong);
}
.pw-primary:disabled,
.pw-secondary:disabled {
  opacity: 0.55;
  cursor: default;
}
button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 3px;
}
@media (prefers-reduced-motion: reduce) {
  .pw-close,
  .pw-code-btn,
  .pw-secondary,
  .pw-primary,
  .pw-link {
    transition: none;
  }
}
</style>