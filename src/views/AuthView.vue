<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthPanel from '@/modules/auth/AuthPanel.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import '@/modules/auth/auth-page.css'
import '@/modules/auth/auth-page-layout.css'

const route = useRoute()
const router = useRouter()
const video = ref(null)
const captions = ref(true)
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
        ><span>如你所愿<small>WISH MALL</small></span></a
      >
      <nav aria-label="页面导航">
        <a class="nav-login" href="#wish-login">我的账户 <AccountIcon name="arrow" /></a>
      </nav>
    </header>
    <main>
      <div class="auth-layout">
        <section class="story-panel" aria-labelledby="story-title">
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
          <div class="mist-orb" aria-hidden="true"></div>
          <div class="story-copy">
            <span class="story-kicker"><i></i> 心之所向，如你所愿</span>
            <h1 id="story-title">让喜欢，<br />慢慢成为<span>日常。</span></h1>
            <p v-if="captions" class="story-caption">
              一份心动，一点灵感。<br />在这里，遇见生活刚刚好的模样。
            </p>
          </div>
          <div class="wish-sculpture" aria-hidden="true">
            <div class="sculpture-ring"></div>
            <div class="glass-cube"><AccountIcon name="sparkle" /><span>wish.</span></div>
            <span class="floating-spark">✦</span
            ><span class="sculpture-caption">little things, lovely days.</span>
          </div>
          <div class="story-bottom">
            <span>美好，正在发生 <span aria-hidden="true">✦</span></span>
            <div class="video-controls">
              <button type="button" :aria-pressed="captions" @click="captions = !captions">
                {{ captions ? '字幕 开' : '字幕 关' }}</button
              ><button
                type="button"
                :disabled="videoFailed"
                :aria-label="paused ? '播放背景视频' : '暂停背景视频'"
                @click="toggleVideo"
              >
                {{ videoFailed ? '静态背景' : paused ? '播放 ▷' : '暂停 Ⅱ' }}
              </button>
            </div>
          </div>
        </section>
        <section id="wish-login" class="form-area" aria-label="账户登录与注册">
          <div class="form-emblem" aria-hidden="true"><AccountIcon name="sparkle" /></div>
          <AuthPanel :initial-mode="initialMode" @authenticated="handleAuthenticated" />
          <p class="secure-note"><AccountIcon name="shield" />安全连接，安心开启每一天</p>
        </section>
      </div>
    </main>
  </div>
</template>
