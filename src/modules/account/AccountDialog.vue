<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import AccountIcon from './AccountIcon.vue'

const props = defineProps({ title: { type: String, default: '' }, message: { type: String, default: '' } })
const emit = defineEmits(['close'])
const dialog = ref(null)
let returnFocus = null

watch(() => props.title, async (title) => {
  if (title) {
    returnFocus = document.activeElement
    await nextTick()
    if (props.title && dialog.value && !dialog.value.open) dialog.value.showModal()
  } else {
    dialog.value?.close()
    returnFocus?.focus?.()
  }
})
function close() { emit('close') }
function backdrop(event) { if (event.target === dialog.value) close() }
onBeforeUnmount(() => {
  dialog.value?.close()
  returnFocus?.focus?.()
})
</script>

<template>
  <dialog ref="dialog" class="account-dialog" aria-labelledby="account-dialog-title" aria-describedby="account-dialog-description" @cancel.prevent="close" @click="backdrop">
    <div class="dialog-body">
      <button class="dialog-close" aria-label="关闭对话框" @click="close"><AccountIcon name="close" /></button>
      <span class="dialog-symbol"><AccountIcon name="sparkle" /></span>
      <p class="eyebrow">COMING TO WISH MALL</p>
      <h2 id="account-dialog-title">{{ title }}</h2>
      <p id="account-dialog-description">{{ message }}该服务尚未接入后端，目前无法查询、修改或保存相关数据。</p>
      <button class="primary-button" autofocus @click="close">我知道了</button>
    </div>
  </dialog>
</template>

<style scoped>
.account-dialog { width: min(420px, calc(100% - 32px)); max-height: calc(100dvh - 48px); padding: 0; overflow: auto; border: 1px solid var(--border, #e8e1ee); border-radius: 24px; color: var(--text, #30283e); background: var(--surface, #fff); box-shadow: 0 28px 100px #30204030; }
.account-dialog::backdrop { background: #27213566; backdrop-filter: blur(5px); }
.dialog-body { position: relative; padding: 36px; }
.dialog-close { position: absolute; top: 16px; right: 16px; display: grid; width: 36px; height: 36px; place-items: center; border: 0; border-radius: 50%; background: var(--brand-soft, #f0eaf7); color: var(--brand, #69518a); cursor: pointer; }
svg { width: 21px; height: 21px; }
.dialog-symbol { display: grid; width: 58px; height: 58px; margin-bottom: 24px; place-items: center; border-radius: 18px; background: var(--brand-soft, #f0eaf7); color: var(--brand, #69518a); }
.eyebrow { font-size: 10px; letter-spacing: .13em; color: var(--brand, #69518a); }
h2 { margin: 12px 0; font-size: 24px; }
#account-dialog-description { margin-bottom: 28px; color: var(--muted, #756b80); font-size: 14px; line-height: 1.8; }
.primary-button { min-height: 44px; width: 100%; border: 0; border-radius: 12px; background: var(--brand, #69518a); color: #fff; cursor: pointer; font: inherit; }
button:focus-visible { outline: 3px solid var(--brand, #69518a); outline-offset: 4px; }
</style>
