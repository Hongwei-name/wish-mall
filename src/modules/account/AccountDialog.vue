<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import AccountIcon from './AccountIcon.vue'

const props = defineProps({ title: { type: String, default: '' } })
const emit = defineEmits(['close'])
const dialog = ref(null)
let returnFocus = null

watch(
  () => props.title,
  async (title) => {
    if (title) {
      returnFocus = document.activeElement
      await nextTick()
      if (props.title && dialog.value && !dialog.value.open) dialog.value.showModal()
    } else {
      dialog.value?.close()
      returnFocus?.focus?.()
    }
  },
)
function close() {
  emit('close')
}
function backdrop(event) {
  if (event.target === dialog.value) close()
}
onBeforeUnmount(() => {
  dialog.value?.close()
  returnFocus?.focus?.()
})
</script>

<template>
  <dialog
    ref="dialog"
    class="account-dialog"
    aria-labelledby="account-dialog-title"
    @cancel.prevent="close"
    @click="backdrop"
  >
    <div class="dialog-body">
      <button class="dialog-close" aria-label="关闭对话框" @click="close">
        <AccountIcon name="close" />
      </button>
      <span class="dialog-symbol"><AccountIcon name="sparkle" /></span>
      <h2 id="account-dialog-title">{{ title }}</h2>
      <button class="primary-button" autofocus @click="close">我知道了</button>
    </div>
  </dialog>
</template>

<style scoped>
.account-dialog {
  width: min(420px, calc(100% - 32px));
  max-height: calc(100dvh - 48px);
  padding: 0;
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
.account-dialog::backdrop {
  background: color-mix(in srgb, var(--text) 30%, transparent);
  backdrop-filter: blur(7px);
}
.dialog-body {
  position: relative;
  padding: 36px;
}
.dialog-close {
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
}
.dialog-close:hover {
  background: var(--brand-soft);
}
svg {
  width: 21px;
  height: 21px;
}
.dialog-symbol {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 24px;
  place-items: center;
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  background: var(--brand-soft);
  color: var(--brand-ink);
  box-shadow:
    inset 0 1px white,
    0 8px 20px color-mix(in srgb, var(--brand) 12%, transparent);
}
h2 {
  margin: 12px 0 24px;
  font-size: 24px;
}
.primary-button {
  min-height: 44px;
  width: 100%;
  border: 0;
  border-radius: 12px;
  background: var(--brand);
  color: white;
  cursor: pointer;
  font: inherit;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--brand) 20%, transparent);
}
.primary-button:hover {
  background: var(--brand-strong);
}
button {
  transition:
    background 0.18s ease,
    box-shadow 0.18s ease;
}
button:focus-visible {
  outline: 3px solid var(--brand-strong);
  outline-offset: 4px;
}
@media (prefers-reduced-motion: reduce) {
  button {
    transition: none;
  }
}
</style>
