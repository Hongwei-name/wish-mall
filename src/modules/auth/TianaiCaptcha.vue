<script setup>
import { nextTick, onBeforeUnmount, ref } from 'vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'

const emit = defineEmits(['verified', 'error'])
const host = ref(null)
const isOpen = ref(false)
let captcha
let loaded = false

function loadStyle() {
  if (document.querySelector('link[data-tianai-captcha]')) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = '/tac/tac/css/tac.css'
  link.dataset.tianaiCaptcha = 'true'
  document.head.append(link)
}

function loadScript() {
  if (window.TAC) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-tianai-captcha]')
    if (existing) {
      existing.addEventListener('load', resolve, { once: true })
      existing.addEventListener('error', reject, { once: true })
      return
    }
    const script = document.createElement('script')
    script.src = '/tac/tac/js/tac.min.js'
    script.dataset.tianaiCaptcha = 'true'
    script.onload = resolve
    script.onerror = reject
    document.head.append(script)
  })
}

async function open() {
  try {
    isOpen.value = true
    loadStyle()
    if (!loaded) {
      await loadScript()
      loaded = true
    }
    await nextTick()
    captcha?.destroyWindow?.()
    captcha = new window.TAC(
      {
        requestCaptchaDataUrl: '/api/auth/captcha/gen?type=SLIDER',
        validCaptchaUrl: '/api/auth/captcha/check',
        bindEl: '#tianai-captcha-host',
        validSuccess: (response, _captchaData, instance) => {
          instance.destroyWindow()
          isOpen.value = false
          emit('verified', response.data.id)
        },
        validFail: (response, _captchaData, instance) => {
          emit('error', response.msg || '滑块验证失败，请重试')
          instance.reloadCaptcha()
        },
      },
      {
        logoUrl: null,
        moveTrackMaskBgColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--brand-soft')
          .trim(),
        moveTrackMaskBorderColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--brand')
          .trim(),
        i18n: { slider_title: '拖动滑块完成验证' },
      },
    )
    captcha.init()
  } catch {
    isOpen.value = false
    emit('error', '验证码组件加载失败，请稍后重试')
  }
}

function close() {
  captcha?.destroyWindow?.()
  captcha = undefined
  isOpen.value = false
}

onBeforeUnmount(close)
defineExpose({ open })
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="captcha-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="图形验证"
      @click.self="close"
    >
      <div class="captcha-dialog">
        <div class="captcha-dialog__header">
          <p>安全验证</p>
          <button type="button" aria-label="关闭图形验证" @click="close">
            <AccountIcon name="close" />
          </button>
        </div>
        <div id="tianai-captcha-host" ref="host" class="tianai-captcha-host" />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.captcha-overlay {
  position: fixed;
  z-index: 1000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 24px;
  background: color-mix(in srgb, var(--slate-900) 40%, transparent);
  backdrop-filter: blur(4px);
}

.captcha-dialog {
  width: min(100%, 350px);
  overflow: hidden;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  background: var(--surface);
  box-shadow: 0 24px 70px var(--shadow);
}

.captcha-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 48px;
  padding: 0 12px 0 16px;
  border-bottom: 1px solid var(--border);
}

.captcha-dialog__header p {
  margin: 0;
  color: var(--text);
  font-size: 14px;
  font-weight: 700;
}

.captcha-dialog__header button {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
}
.captcha-dialog__header button svg {
  width: 18px;
  height: 18px;
  transition: transform 0.18s ease;
}
.captcha-dialog__header button:hover svg {
  transform: scale(1.08);
}
@media (prefers-reduced-motion: reduce) {
  .captcha-dialog__header button:hover svg {
    transform: none;
  }
}

.captcha-dialog__header button:hover {
  background: var(--surface-raised);
  color: var(--text);
}
.tianai-captcha-host {
  display: grid;
  justify-content: center;
  padding: 16px;
}
.tianai-captcha-host :deep(#tianai-captcha-box) {
  position: static;
}

@media (max-width: 380px) {
  .captcha-overlay {
    padding: 12px;
  }
  .tianai-captcha-host {
    padding: 12px 4px;
    transform: scale(0.92);
    transform-origin: top center;
  }
  .captcha-dialog {
    min-height: 330px;
  }
}
</style>
