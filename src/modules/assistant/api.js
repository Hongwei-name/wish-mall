import { authToken, request } from '@/api/http'

/**
 * 会话列表，从新到旧分页。
 */
export function listConversations(limit = 20, cursor) {
  const query = new URLSearchParams({ limit: String(limit) })
  if (cursor) query.set('cursor', cursor)
  return request(`/api/assistant/conversations?${query.toString()}`)
}

/**
 * 消息列表，从新到旧分页；cursor 为上一页返回的 nextCursor。
 */
export function listMessages(conversationId, limit = 20, cursor) {
  const query = new URLSearchParams({ limit: String(limit) })
  if (cursor) query.set('cursor', cursor)
  return request(
    `/api/assistant/conversations/${encodeURIComponent(conversationId)}/messages?${query.toString()}`,
  )
}

/**
 * fetch-SSE 流式对话：POST + Bearer，返回 AbortController 供中断。
 *
 * 事件协议：默认 message 分片、done 结束、ping 心跳；
 * onChunk 收到的是纯文本分片，控制标记由调用方判断。
 */
export function streamChat({ message, conversationId, requestId }, callbacks = {}) {
  const controller = new AbortController()
  const token = authToken()

  fetch('/api/assistant/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ message, conversationId, requestId }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        let payload = null
        try {
          payload = await response.json()
        } catch {
          // 响应不是 JSON 时忽略
        }
        callbacks.onError?.(
          new Error(payload?.message || `请求失败（${response.status}）`),
          payload?.code || response.status,
        )
        return
      }
      if (!response.body) {
        callbacks.onError?.(new Error('当前浏览器不支持流式响应'))
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let sawDone = false

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const frames = buffer.split(/\r?\n\r?\n/)
        buffer = frames.pop() || ''
        for (const frame of frames) {
          if (!frame.trim()) continue
          if (readFrame(frame, callbacks)) sawDone = true
        }
      }

      if (buffer.trim() && readFrame(buffer, callbacks)) sawDone = true
      if (!sawDone) callbacks.onError?.(new Error('连接中断'))
    })
    .catch((error) => {
      if (error?.name === 'AbortError') return
      callbacks.onError?.(error)
    })

  return controller
}

/**
 * 解析单个 SSE 帧，返回是否为 done 事件。
 */
function readFrame(frame, callbacks) {
  let eventName = 'message'
  const dataLines = []

  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith(':')) continue
    if (line.startsWith('event:')) {
      eventName = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).replace(/^ /, ''))
    }
  }

  if (eventName === 'done') {
    callbacks.onDone?.()
    return true
  }
  if (eventName === 'ping') {
    callbacks.onPing?.()
    return false
  }
  if (eventName === 'meta') {
    callbacks.onMeta?.(dataLines.join('\n'))
    return false
  }

  const data = dataLines.join('\n')
  if (data) callbacks.onChunk?.(data)
  return false
}