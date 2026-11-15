// 小愿 AI 消息的 Markdown 渲染组件。 // 模型返回 GFM Markdown；这里只做 Markdown→HTML 与 XSS
清洗，不改写文本语义。
<script setup>
import { computed } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps({
  source: { type: String, default: '' },
})

const html = computed(() => {
  const rendered = marked.parse(props.source || '', {
    async: false,
    gfm: true,
    breaks: true,
  })
  return DOMPurify.sanitize(typeof rendered === 'string' ? rendered : '')
})
</script>

<template>
  <div class="assistant-markdown" v-html="html"></div>
</template>
