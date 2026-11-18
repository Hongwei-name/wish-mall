<script setup>
// 小愿聊天抽屉：fetch-SSE、历史分页（从新到旧、向上加载）、5 秒空闲检测、Markdown 渲染与断流重试。
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { Bot, RefreshCw, Send, X } from '@lucide/vue'
import { useAuthStore } from '@/stores/auth'
import MarkdownMessage from './MarkdownMessage.vue'
import { listMessages, streamChat } from './api'
import './assistant.css'

const props = defineProps({
  open: { type: Boolean, default: false },
})
const emit = defineEmits(['update:open'])
const authStore = useAuthStore()

const STREAM_INTERRUPT = '[STREAM_INTERRUPT]'
const STREAM_ERROR = '[ERROR]服务异常'
const INACTIVITY_TIMEOUT = 5000
const PAGE_SIZE = 20
const CONVERSATION_KEY = 'wish-mall.assistant-conversation-id'

const messages = ref([])
const draft = ref('')
const input = ref(null)
const list = ref(null)
const panel = ref(null)
const loadingMore = ref(false)

let abortController
let inactivityTimer
let returnFocus
let previousOverflow = ''
let previousPadding = ''
let sequence = 0
let stickToBottom = true
let nextCursor = null
let hasMore = false
let initialized = false

function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0
    const value = char === 'x' ? random : (random & 0x3) | 0x8
    return value.toString(16)
  })
}

// 会话 id 按登录用户隔离，避免同一浏览器换账号后复用他人会话。
function conversationStorageKey() {
  return `${CONVERSATION_KEY}:${authStore.user?.id ?? 'guest'}`
}

function readStoredConversationId() {
  try {
    return localStorage.getItem(conversationStorageKey()) || ''
  } catch {
    return ''
  }
}

function storeConversationId(id) {
  try {
    localStorage.setItem(conversationStorageKey(), id)
  } catch {
    // 隐私模式下忽略
  }
}

const conversationId = ref('')
let conversationOwnerKey = ''

function ensureConversationId() {
  const key = conversationStorageKey()
  if (conversationOwnerKey !== key) {
    conversationOwnerKey = key
    conversationId.value = ''
  }
  if (!conversationId.value) {
    conversationId.value = readStoredConversationId() || createUuid()
    storeConversationId(conversationId.value)
  }
  return conversationId.value
}

const streaming = computed(() => messages.value.some((message) => message.isStreaming))
const canSend = computed(() => draft.value.trim().length > 0 && !streaming.value)

function addMessage(role, extra = {}) {
  messages.value.push({
    id: `local-${++sequence}`,
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

function toMessage(row) {
  const isUser = row.role === 'user'
  return {
    id: row.id || `db-${row.createdAt}-${row.role}`,
    role: isUser ? 'user' : 'ai',
    text: isUser ? row.content : '',
    fullMd: isUser ? '' : row.content,
    isInterrupt: false,
    isStreaming: false,
    retryText: '',
  }
}

function addGreeting() {
  messages.value = [
    {
      id: 'greeting',
      role: 'ai',
      text: '',
      fullMd: '你好，我是小愿。',
      isInterrupt: false,
      isStreaming: false,
    },
  ]
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
  if (element.scrollTop <= 40) loadOlder()
}

async function loadLatest() {
  initialized = true
  try {
    ensureConversationId()
    const page = await listMessages(conversationId.value, PAGE_SIZE)
    nextCursor = page?.nextCursor || null
    hasMore = Boolean(page?.hasMore)
    const items = Array.isArray(page?.items) ? [...page.items].reverse() : []
    if (items.length) {
      messages.value = items.map(toMessage)
    } else {
      addGreeting()
    }
  } catch (error) {
    if (error?.code === 404) {
      // 旧会话不属于当前用户：换一个新的会话 id。
      conversationId.value = createUuid()
      storeConversationId(conversationId.value)
    }
    addGreeting()
  }
  await nextTick()
  scrollToBottom(true)
}

async function loadOlder() {
  if (loadingMore.value || !hasMore || !nextCursor) return
  loadingMore.value = true
  const element = list.value
  const previousHeight = element?.scrollHeight ?? 0
  try {
    const page = await listMessages(conversationId.value, PAGE_SIZE, nextCursor)
    nextCursor = page?.nextCursor || null
    hasMore = Boolean(page?.hasMore)
    const items = Array.isArray(page?.items) ? [...page.items].reverse() : []
    if (items.length) {
      messages.value = [...items.map(toMessage), ...messages.value]
      await nextTick()
      // 向上追加内容后补偿滚动位置，避免视口跳动。
      if (element) element.scrollTop += element.scrollHeight - previousHeight
    }
  } catch {
    hasMore = false
  } finally {
    loadingMore.value = false
  }
}

function clearInactivityTimer() {
  if (!inactivityTimer) return
  clearTimeout(inactivityTimer)
  inactivityTimer = undefined
}

function closeStream() {
  clearInactivityTimer()
  if (abortController) {
    abortController.abort()
    abortController = undefined
  }
}

function armInactivityTimer(aiMessage) {
  clearInactivityTimer()
  inactivityTimer = setTimeout(() => {
    if (!aiMessage.isStreaming) return
    interruptStream(aiMessage)
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

  abortController = streamChat(
    {
      message: question,
      conversationId: ensureConversationId(),
      requestId: createUuid(),
    },
    {
      onMeta(id) {
        // 服务端可能因旧 id 属于其他账号而重建会话，这里同步并持久化新 id。
        if (id && id !== conversationId.value) {
          conversationId.value = id
          storeConversationId(id)
        }
      },
      onChunk(chunk) {
        if (!aiMessage.isStreaming) return
        armInactivityTimer(aiMessage)

        if (chunk === STREAM_INTERRUPT || chunk === STREAM_ERROR) {
          interruptStream(aiMessage)
          return
        }
        aiMessage.fullMd += chunk
        scrollToBottom()
      },
      onPing() {
        if (aiMessage.isStreaming) armInactivityTimer(aiMessage)
      },
      onDone() {
        if (aiMessage.isStreaming) finishStream(aiMessage)
      },
      onError() {
        if (aiMessage.isStreaming) interruptStream(aiMessage)
      },
    },
  )
  armInactivityTimer(aiMessage)
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
      if (!initialized) {
        await loadLatest()
      }
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
              v-if="loadingMore"
              class="assistant-typing assistant-history-loading"
              role="status"
              aria-label="加载更早消息"
            >
              <i></i><i></i><i></i>
            </div>

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
