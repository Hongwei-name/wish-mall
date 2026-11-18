<script setup>
import { computed, onMounted, ref } from 'vue'
import { Pause, Play } from '@lucide/vue'
import { useRoute, useRouter } from 'vue-router'
import AuthPanel from '@/modules/auth/AuthPanel.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import '@/modules/auth/auth-page.css'
import '@/modules/auth/auth-page-layout.css'

const route = useRoute()
const router = useRouter()
const video = ref(null)
const paused = ref(false)
const videoFailed = ref(false)
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const initialMode = computed(() => (route.query.reset === '1' ? 'reset' : 'login'))
function toggleVideo() {
  if (!video.value || videoFailed.value) return
  if (video.value.paused)
    video.value.play().catch(() => {
      videoFailed.value = true
    })
  else video.value.pause()
}
function handleAuthenticated() {
  const target = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/auth')) {
    router.replace(target)
    return
  }
  router.replace({ name: 'profile' })
}
onMounted(() => {
  if (reducedMotion.matches) video.value?.pause()
})
</script>

<template>
  <div class="auth-page">
    <header class="auth-topbar">
      <a class="wordmark" href="/auth" aria-label="如你所愿商城首页"
        ><span class="logo-symbol"><AccountIcon name="sparkle" /></span
        ><span>如你所愿</span></a
      >
    </header>
    <main>
      <div class="auth-layout">
        <section class="story-panel" aria-label="如你所愿商城">
          <video
            ref="video"
            class="story-video"
            :autoplay="!reducedMotion.matches"
            muted
            loop
            playsinline
            aria-hidden="true"
            @play="paused = false"
            @pause="paused = true"
            @error="videoFailed = true"
          >
            <source
              src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
              type="video/mp4"
              @error="videoFailed = true"
            />
          </video>
          <div class="story-shade"></div>
          <div class="wish-sculpture" aria-hidden="true">
            <div class="sculpture-ring"></div>
            <div class="glass-cube"><AccountIcon name="sparkle" /></div>
          </div>
          <button
            v-if="!videoFailed"
            class="video-toggle"
            type="button"
            :aria-label="paused ? '播放背景视频' : '暂停背景视频'"
            @click="toggleVideo"
          >
            <Play v-if="paused" :size="17" aria-hidden="true" />
            <Pause v-else :size="17" aria-hidden="true" />
          </button>
        </section>
        <section id="wish-login" class="form-area" aria-label="账户登录与注册">
          <AuthPanel :initial-mode="initialMode" @authenticated="handleAuthenticated" />
        </section>
      </div>
    </main>
  </div>
</template>
