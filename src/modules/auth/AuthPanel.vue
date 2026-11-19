<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import { Button } from '@/components/ui/button'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/components/ui/field'
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
const usePassword = computed(
  () => !isRegister.value && !isReset.value && loginMethod.value === 'password',
)
const needsCode = computed(() => isRegister.value || isReset.value || loginMethod.value === 'sms')
const needsPassword = computed(
  () => isRegister.value || isReset.value || loginMethod.value === 'password',
)
const showConfirm = computed(() => isRegister.value || isReset.value)
const heading = computed(() => (isReset.value ? '重设密码' : isRegister.value ? '创建账户' : '登录'))
const passwordLabel = computed(() => (isReset.value ? '新密码' : '密码'))
const actionText = computed(() => (isReset.value ? '重设密码' : isRegister.value ? '注册' : '登录'))
const smsScene = computed(() =>
  isReset.value ? 'reset-password' : isRegister.value ? 'register' : 'login',
)

function clearFeedback() {
  feedback.type = ''
  feedback.message = ''
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key] = ''
  })
}

function clearPasswordErrors() {
  fieldErrors.password = ''
  fieldErrors.confirmPassword = ''
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
    fieldErrors.password =
      isRegister.value || isReset.value
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
  <div class="flex flex-col gap-6">
    <Card>
      <CardHeader>
        <CardTitle id="auth-heading">{{ heading }}{{ !isRegister && !isReset ? '你的账户' : '' }}</CardTitle>
        <CardDescription>{{ isReset ? '通过短信验证码设置新密码' : isRegister ? '输入手机号和密码，创建你的账户' : '输入手机号和密码，登录你的账户' }}</CardDescription>
      </CardHeader>
      <CardContent>
        <form novalidate :aria-busy="submitting" aria-labelledby="auth-heading" @submit.prevent="submit">
          <FieldGroup>
            <Field>
              <FieldLabel for="auth-phone">手机号</FieldLabel>
              <Input id="auth-phone" v-model.trim="form.phone" type="tel" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="请输入手机号" :aria-invalid="!!fieldErrors.phone" :aria-describedby="fieldErrors.phone ? 'phone-error' : undefined" @blur="validateField('phone')" @input="fieldErrors.phone = ''" />
              <p v-if="fieldErrors.phone" id="phone-error" role="alert" class="text-sm text-destructive">{{ fieldErrors.phone }}</p>
            </Field>
            <Field v-if="needsPassword">
              <div class="flex items-center">
                <FieldLabel for="auth-password">{{ passwordLabel }}</FieldLabel>
                <button v-if="usePassword" type="button" class="ml-auto text-sm underline-offset-4 hover:underline" @click="startReset">忘记密码？</button>
              </div>
              <div class="relative">
                <Input id="auth-password" v-model="form.password" :type="showPassword ? 'text' : 'password'" :autocomplete="isRegister || isReset ? 'new-password' : 'current-password'" class="pr-10" :aria-invalid="!!fieldErrors.password" :aria-describedby="fieldErrors.password ? 'password-error' : undefined" @blur="validateField('password')" @input="clearPasswordErrors" />
                <Button type="button" variant="ghost" size="icon" class="absolute right-0 top-0" :aria-label="showPassword ? '隐藏密码' : '显示密码'" :aria-pressed="showPassword" @click="showPassword = !showPassword"><AccountIcon name="eye" class="size-4" /></Button>
              </div>
              <FieldDescription v-if="isRegister || isReset">8–64 位，包含字母和数字。</FieldDescription>
              <p v-if="fieldErrors.password" id="password-error" role="alert" class="text-sm text-destructive">{{ fieldErrors.password }}</p>
            </Field>
            <Field v-if="showConfirm">
              <FieldLabel for="auth-confirm-password">确认密码</FieldLabel>
              <Input id="auth-confirm-password" v-model="form.confirmPassword" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" :aria-invalid="!!fieldErrors.confirmPassword" :aria-describedby="fieldErrors.confirmPassword ? 'confirm-password-error' : undefined" @blur="validateField('confirmPassword')" @input="fieldErrors.confirmPassword = ''" />
              <p v-if="fieldErrors.confirmPassword" id="confirm-password-error" role="alert" class="text-sm text-destructive">{{ fieldErrors.confirmPassword }}</p>
            </Field>
            <Field v-if="needsCode">
              <FieldLabel for="auth-code">短信验证码</FieldLabel>
              <div class="flex gap-2">
                <Input id="auth-code" v-model.trim="form.code" inputmode="numeric" autocomplete="one-time-code" maxlength="6" class="min-w-0" :aria-invalid="!!fieldErrors.code" :aria-describedby="fieldErrors.code ? 'code-error' : undefined" @blur="validateField('code')" @input="fieldErrors.code = ''" />
                <Button type="button" variant="outline" :disabled="sending || cooldown > 0" @click="openCaptcha">{{ cooldown ? `${cooldown}s` : sending ? '发送中' : '获取验证码' }}</Button>
              </div>
              <p v-if="fieldErrors.code" id="code-error" role="alert" class="text-sm text-destructive">{{ fieldErrors.code }}</p>
            </Field>
            <Field v-if="isRegister" orientation="horizontal">
              <Checkbox id="auth-agreement" v-model="agreed" />
              <Label for="auth-agreement" class="text-sm leading-normal">我已阅读并同意
                <button type="button" class="underline underline-offset-4" @click.prevent="showUnavailable('用户协议暂未发布')">用户协议</button>和
                <button type="button" class="underline underline-offset-4" @click.prevent="showUnavailable('隐私政策暂未发布')">隐私政策</button>
              </Label>
            </Field>
            <p v-if="feedback.message" :role="feedback.type === 'error' ? 'alert' : 'status'" class="text-sm" :class="feedback.type === 'error' ? 'text-destructive' : 'text-muted-foreground'">{{ feedback.message }}</p>
            <Field>
              <Button type="submit" :disabled="submitting">{{ submitting ? '正在处理…' : actionText }}</Button>
              <Button v-if="!isRegister && !isReset" type="button" variant="outline" @click="switchLoginMethod(usePassword ? 'sms' : 'password')">{{ usePassword ? '使用验证码登录' : '使用密码登录' }}</Button>
              <FieldDescription class="text-center">
                <template v-if="isReset"><button type="button" class="underline underline-offset-4" @click="backToLogin">返回登录</button></template>
                <template v-else-if="isRegister">已有账户？ <button type="button" class="underline underline-offset-4" @click="switchAccountMode('login')">登录</button></template>
                <template v-else>还没有账户？ <button type="button" class="underline underline-offset-4" @click="switchAccountMode('register')">注册</button></template>
              </FieldDescription>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
    <TianaiCaptcha ref="captcha" @verified="handleCaptchaVerified" @error="showUnavailable($event, 'error')" />
  </div>
</template>
