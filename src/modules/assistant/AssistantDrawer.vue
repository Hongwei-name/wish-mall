<script setup>
// 小愿聊天抽屉：EventSource SSE、5 秒空闲检测、Markdown 渲染与断流重试。
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Bot, RefreshCw, Send, X } from '@lucide/vue'
import MarkdownMessage from './MarkdownMessage.vue'
import './assistant.css'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])

const STREAM_INTERRUPT = '[STREAM_INTERRUPT]'
const STREAM_ERROR = '[ERROR]服务异常'
const INACTIVITY_TIMEOUT = 5000

const messages = ref([])
const draft = ref('')
const input = ref(null)
const list = ref(null)
const panel = ref(null)

let eventSource
let inactivityTimer
let returnFocus
let previousOverflow = ''
let previousPadding = ''
let sequence = 0
let stickToBottom = true

const conversationId =
  globalThis.crypto?.randomUUID?.() ?? `wish-${Date.now()}-${Math.random().toString(16).slice(2)}`
const streaming = computed(() => messages.value.some((message) => message.isStreaming))
const canSend = computed(() => draft.value.trim().length > 0 && !streaming.value)

function addMessage(role, extra = {}) {
  messages.value.push({
    id: ++sequence,
    role,
    text: '',
    fullMd: '',
    isInterrupt: false,
    isStreaming: false,
    ...extra,
  })
  // 返回数组中的响应式代理，流式追加才能触发视图更新。
  return messages.value[messages.value.length - 1]
}

function scrollToBottom(force = false) {
  if (!list.value || (!force && !stickToBottom)) return
  nextTick(() => {
    if (list.value) list.value.scrollTop = list.value.scrollHeight
  })
}

function onScroll() {
  const element = list.value
  if (!element) return
  stickToBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80
}

function clearInactivityTimer() {
  if (!inactivityTimer) return
  clearTimeout(inactivityTimer)
  inactivityTimer = undefined
}

function closeStream() {
  clearInactivityTimer()
  if (eventSource) {
    eventSource.close()
    eventSource = undefined
  }
}

function armInactivityTimer(aiMessage) {
  clearInactivityTimer()
  inactivityTimer = setTimeout(() => {
    if (!aiMessage.isStreaming) return
    aiMessage.isStreaming = false
    aiMessage.isInterrupt = true
    closeStream()
  }, INACTIVITY_TIMEOUT)
}

function finishStream(aiMessage) {
  aiMessage.isStreaming = false
  closeStream()
}

function interruptStream(aiMessage) {
  aiMessage.isStreaming = false
  aiMessage.isInterrupt = true
  closeStream()
}

function startStream(question, aiMessage) {
  closeStream()
  aiMessage.fullMd = ''
  aiMessage.isInterrupt = false
  aiMessage.isStreaming = true
  aiMessage.retryText = question
  stickToBottom = true
  scrollToBottom(true)

  const url =
    `/api/assistant/chat?message=${encodeURIComponent(question)}` +
    `&conversationId=${encodeURIComponent(conversationId)}`
  const source = new EventSource(url)
  eventSource = source
  armInactivityTimer(aiMessage)

  source.onmessage = (event) => {
    if (!aiMessage.isStreaming) return
    armInactivityTimer(aiMessage)

    const chunk = event.data
    if (chunk === STREAM_INTERRUPT || chunk === STREAM_ERROR) {
      interruptStream(aiMessage)
      return
    }
    aiMessage.fullMd += chunk
    scrollToBottom()
  }

  source.addEventListener('done', () => {
    if (aiMessage.isStreaming) finishStream(aiMessage)
  })

  // 后端心跳：上游 TLS 握手/重试可能超过 5 秒，收到 ping 后重置空闲计时。
  source.addEventListener('ping', () => {
    if (aiMessage.isStreaming) armInactivityTimer(aiMessage)
  })

  source.onerror = () => {
    if (aiMessage.isStreaming) interruptStream(aiMessage)
  }
}

function send() {
  const text = draft.value.trim()
  if (!text || streaming.value) return
  draft.value = ''
  addMessage('user', { text })
  const aiMessage = addMessage('ai', { retryText: text })
  startStream(text, aiMessage)
}

function regenerate(aiMessage) {
  if (streaming.value || !aiMessage.retryText) return
  startStream(aiMessage.retryText, aiMessage)
}

function close() {
  emit('update:open', false)
}

function onKeydown(event) {
  if (!props.open) return
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }
  if (event.key !== 'Tab' || !panel.value) return
  const focusable = [
    ...panel.value.querySelectorAll(
      'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.offsetParent !== null)
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function lockScroll() {
  previousOverflow = document.body.style.overflow
  previousPadding = document.body.style.paddingRight
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`
}

function unlockScroll() {
  document.body.style.overflow = previousOverflow
  document.body.style.paddingRight = previousPadding
}

watch(
  () => props.open,
  async (open) => {
    if (open) {
      returnFocus = document.activeElement
      lockScroll()
      window.addEventListener('keydown', onKeydown)
      if (!messages.value.length) addMessage('ai', { fullMd: '你好，我是小愿。' })
      await nextTick()
      input.value?.focus()
      scrollToBottom(true)
    } else {
      closeStream()
      messages.value.forEach((message) => {
        if (!message.isStreaming) return
        message.isStreaming = false
        message.isInterrupt = true
      })
      window.removeEventListener('keydown', onKeydown)
      unlockScroll()
      returnFocus?.focus?.()
    }
  },
)

onBeforeUnmount(() => {
  closeStream()
  window.removeEventListener('keydown', onKeydown)
  unlockScroll()
})
</script>

<template>
  <Teleport to="body">
    <Transition name="assistant-fade">
      <div v-if="open" class="assistant-overlay" @click.self="close">
        <aside
          ref="panel"
          class="assistant-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="assistant-title"
        >
          <header class="assistant-header">
            <div class="assistant-heading">
              <span class="assistant-badge">
                <Bot :size="18" :stroke-width="2" aria-hidden="true" />
              </span>
              <h2 id="assistant-title">小愿</h2>
            </div>
            <button type="button" class="assistant-close" aria-label="关闭小愿" @click="close">
              <X :size="18" :stroke-width="2" aria-hidden="true" />
            </button>
          </header>

          <div
            ref="list"
            class="assistant-messages"
            aria-live="polite"
            aria-atomic="false"
            @scroll="onScroll"
          >
            <div
              v-for="message in messages"
              :key="message.id"
              class="assistant-message"
              :class="message.role"
            >
              <template v-if="message.role === 'ai'">
                <span class="assistant-message-avatar">
                  <Bot :size="15" :stroke-width="2" aria-hidden="true" />
                </span>
                <div class="assistant-message-body">
                  <div class="assistant-bubble">
                    <MarkdownMessage :source="message.fullMd" />
                    <span
                      v-if="message.isStreaming && !message.fullMd"
                      class="assistant-typing"
                      aria-label="小愿正在输入"
                    >
                      <i></i><i></i><i></i>
                    </span>
                  </div>
                  <button
                    v-if="message.isInterrupt"
                    type="button"
                    class="assistant-retry"
                    :disabled="streaming"
                    aria-label="重新生成"
                    @click="regenerate(message)"
                  >
                    <RefreshCw :size="14" :stroke-width="2" aria-hidden="true" />
                  </button>
                </div>
              </template>
              <div v-else class="assistant-bubble assistant-user-bubble">{{ message.text }}</div>
            </div>
          </div>

          <form class="assistant-composer" @submit.prevent="send">
            <input
              ref="input"
              v-model="draft"
              type="text"
              placeholder="输入消息"
              autocomplete="off"
              maxlength="2000"
              aria-label="输入消息"
            />
            <button type="submit" class="assistant-send" :disabled="!canSend" aria-label="发送消息">
              <Send :size="18" :stroke-width="2" aria-hidden="true" />
            </button>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>
