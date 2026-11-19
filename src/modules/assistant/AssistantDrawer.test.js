import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import vm from 'node:vm'
import { computed, nextTick, ref, watch } from 'vue'

const source = readFileSync(new URL('./AssistantDrawer.vue', import.meta.url), 'utf8')

function setup({ conversations, messages = async () => ({ items: [] }) }) {
  const calls = []
  const storage = new Map()
  const auth = { user: { id: 7 } }
  const script = source.match(/<script setup>([\s\S]*?)<\/script>/)[1]
    .replace(/^import .*$/gm, '')
  const context = vm.createContext({
    computed, nextTick, ref, watch,
    onBeforeUnmount() {},
    defineProps: () => ({ open: false }),
    defineEmits: () => () => {},
    useAuthStore: () => auth,
    localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) },
    listConversations: async () => { calls.push('conversations'); return conversations() },
    listMessages: async (...args) => { calls.push(args); return messages(...args) },
  })
  vm.runInContext(`${script}\nglobalThis.drawer = {
    loadLatest, messages, conversationId, loadingHistory, historyError, draft, canSend,
    invalidate: () => { ++historyVersion },
  }`, context)
  return { ...context.drawer, calls, storage }
}

test('会话列表 API 必须显式导入，避免运行时 ReferenceError 被吞掉', () => {
  assert.match(source, /import\s*\{[^}]*\blistConversations\b[^}]*\}\s*from '\.\/api'/)
})

test('新设备无本地缓存时加载账号最近会话及历史，并按时间正序展示', async () => {
  const drawer = setup({
    conversations: async () => ({ items: [{ id: 'server-conversation' }] }),
    messages: async () => ({ items: [
      { id: '2', role: 'assistant', content: '已有回答' },
      { id: '1', role: 'user', content: '以前的问题' },
    ] }),
  })
  await drawer.loadLatest()
  assert.equal(drawer.conversationId.value, 'server-conversation')
  assert.equal(drawer.messages.value[0].text, '以前的问题')
  assert.equal(drawer.messages.value[1].fullMd, '已有回答')
  assert.equal(drawer.storage.get('wish-mall.assistant-conversation-id:7'), 'server-conversation')
  assert.equal(drawer.calls[1][0], 'server-conversation')
})

test('加载失败显示错误并阻止发送，重试后恢复历史', async () => {
  let fail = true
  const drawer = setup({ conversations: async () => {
    if (fail) throw new Error('服务暂时不可用')
    return { items: [{ id: 'restored' }] }
  } })
  drawer.draft.value = '新问题'
  await drawer.loadLatest()
  assert.equal(drawer.historyError.value, '服务暂时不可用')
  assert.equal(drawer.canSend.value, false)
  assert.equal(drawer.loadingHistory.value, false)
  fail = false
  await drawer.loadLatest()
  assert.equal(drawer.historyError.value, '')
  assert.equal(drawer.conversationId.value, 'restored')
  assert.equal(drawer.canSend.value, true)
})

test('重新打开时可刷新为其他设备产生的最新会话', async () => {
  let id = 'first'
  const drawer = setup({ conversations: async () => ({ items: [{ id }] }) })
  await drawer.loadLatest()
  id = 'from-another-device'
  await drawer.loadLatest()
  assert.equal(drawer.conversationId.value, id)
})

test('账号切换使在途历史请求失效，旧响应不能回填', async () => {
  let resolve
  const drawer = setup({ conversations: () => new Promise((done) => { resolve = done }) })
  const pending = drawer.loadLatest()
  drawer.invalidate()
  resolve({ items: [{ id: 'old-account' }] })
  await pending
  assert.equal(drawer.conversationId.value, '')
  assert.equal(drawer.calls.length, 1)
})
