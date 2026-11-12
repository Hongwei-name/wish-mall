<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthPanel from '@/modules/auth/AuthPanel.vue'

const router = useRouter()
const video = ref(null)
const captions = ref(true)
const paused = ref(false)
function toggleVideo() {
  if (!video.value) return
  if (video.value.paused) video.value.play().catch(() => {})
  else video.value.pause()
}
function handleAuthenticated() { router.replace({ name: 'profile' }) }
</script>

<template>
  <div class="auth-page">
    <header class="auth-topbar">
      <a class="wordmark" href="/auth" aria-label="如你所愿商城"><span class="logo-symbol">w<span>✦</span></span><span>如你所愿<small>WISH MALL</small></span></a>
      <span class="header-note">每一份喜欢，都值得被认真对待 <span>✦</span></span>
    </header>
    <main class="auth-layout">
      <aside class="story-panel" aria-label="品牌故事">
        <video ref="video" class="story-video" autoplay muted loop playsinline aria-hidden="true" @play="paused = false" @pause="paused = true"><source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4" /></video>
        <div class="story-shade"></div>
        <div class="story-top"><span class="pill">A LITTLE WISH, A BETTER DAY</span><span>生活的灵感，在这里发生</span></div>
        <div class="story-copy">
          <span class="tiny-star" aria-hidden="true">✦</span>
          <p class="story-kicker">让心愿，照进日常</p>
          <h1>生活的美好，<br />恰好<span>如你所愿。</span></h1>
          <p v-if="captions" class="story-caption">从一件心动好物开始，<br />慢慢收集属于你的理想生活。</p>
        </div>
        <div class="story-bottom"><div class="editorial-card"><span class="card-icon">✧</span><div><b>为你的日常，多一点心动</b><small>发现好物 · 收藏灵感 · 留住喜欢</small></div><span aria-hidden="true">↗</span></div><div class="video-controls"><span>THE EVERYDAY COLLECTION</span><div><button type="button" :aria-pressed="!captions" @click="captions = !captions">{{ captions ? '关闭字幕' : '显示字幕' }}</button><button type="button" :aria-label="paused ? '播放背景视频' : '暂停背景视频'" @click="toggleVideo">{{ paused ? '▷' : 'Ⅱ' }}</button></div></div></div>
      </aside>
      <section class="form-area" aria-label="账户登录与注册"><div class="form-intro"><span class="intro-line"></span> YOUR WISH STARTS HERE</div><AuthPanel @authenticated="handleAuthenticated" /><p class="secure-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 8 4v5c0 5-8 9-8 9s-8-4-8-9V7l8-4Z M8 12l3 3 5-6" /></svg>安全连接，让每一次登录都安心</p></section>
    </main>
    <footer class="auth-footer"><span>© {{ new Date().getFullYear() }} 如你所愿 WISH MALL</span><span>好物有温度，生活有心意。</span></footer>
  </div>
</template>

<style scoped>
.auth-page { min-height: 100svh; padding: 0 4%; background: var(--surface); }
.auth-topbar { height: 100px; display: flex; align-items: center; justify-content: space-between; max-width: 1440px; margin: auto; }
.wordmark { display: flex; gap: 12px; align-items: center; color: var(--text); text-decoration: none; font-weight: 750; font-size: 20px; line-height: 1.3; }
.wordmark small { display: block; margin-top: 4px; font-size: 9px; letter-spacing: .24em; font-weight: 500; }
.logo-symbol { position: relative; display: grid; width: 43px; height: 43px; place-items: center; border-radius: 14px; background: var(--brand); color: white; font-size: 32px; font-family: Georgia, serif; }
.logo-symbol span { position: absolute; right: 4px; top: 0; font-size: 16px; color: var(--pastel-petal); }
.header-note { color: var(--muted); font-size: 12px; }.header-note > span { margin-left: 18px; color: var(--brand); }
.auth-layout { display: grid; grid-template-columns: 1.1fr 1fr; min-height: 650px; max-width: 1440px; margin: auto; }
.story-panel { position: relative; display: flex; flex-direction: column; min-width: 0; padding: 36px; overflow: hidden; border-radius: 28px; background: linear-gradient(145deg, #e8d7ee, #d7e4f6); }
.story-video, .story-shade { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.story-video { opacity: .24; filter: saturate(.35); }.story-shade { background: linear-gradient(125deg, rgb(237 222 244 / 90%), rgb(220 230 248 / 65%)); }
.story-top, .story-copy, .story-bottom { position: relative; }.story-top { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; font-size: 10px; color: #574866; }
.pill { padding: 7px 12px; border: 1px solid rgb(105 81 138 / 22%); border-radius: 30px; font-size: 9px; letter-spacing: .09em; }
.story-copy { margin: auto 0; padding: 40px 5%; }.tiny-star { display: block; color: var(--brand); font-size: 40px; line-height: 1; }.story-kicker { margin: 25px 0 16px; font-size: 13px; letter-spacing: .15em; color: #574866; }
h1 { margin: 0; font-size: clamp(32px, 3.5vw, 56px); font-weight: 650; line-height: 1.45; letter-spacing: -.04em; }h1 span { color: var(--brand); }.story-caption { margin: 20px 0 0; font-size: 14px; line-height: 1.9; color: #574866; }
.editorial-card { display: flex; align-items: center; gap: 16px; padding: 20px; border: 1px solid rgb(255 255 255 / 65%); background: rgb(255 255 255 / 45%); border-radius: 18px; }.card-icon { display: grid; width: 44px; height: 44px; flex-shrink: 0; place-items: center; background: var(--surface); color: var(--brand); border-radius: 14px; font-size: 30px; }.editorial-card b { font-size: 13px; font-weight: 600; }.editorial-card small { display: block; margin-top: 5px; color: #574866; font-size: 11px; }.editorial-card > span:last-child { margin-left: auto; color: var(--brand); }
.video-controls { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 22px; color: #574866; font-size: 9px; letter-spacing: .08em; }.video-controls button { border: 0; background: transparent; padding: 5px 8px; color: #574866; font-size: 11px; }
.form-area { container-type: inline-size; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 32px 14%; }.form-intro { display: flex; align-items: center; gap: 9px; width: 100%; max-width: 400px; margin-bottom: 22px; color: var(--muted); font-size: 9px; letter-spacing: .16em; }.intro-line { width: 22px; height: 1px; background: var(--brand); }.secure-note { display: flex; align-items: center; gap: 6px; margin: 24px 0 0; color: var(--muted); font-size: 11px; }.secure-note svg { width: 14px; fill: none; stroke: currentColor; stroke-width: 1.5; }
.auth-footer { display: flex; justify-content: space-between; gap: 12px; max-width: 1440px; padding: 28px 0; margin: auto; font-size: 10px; color: var(--muted); }
@media (max-width: 900px) { .auth-layout { grid-template-columns: 1fr 1fr; }.story-panel { padding: 24px; }.form-area { padding: 30px 9%; }.story-top > span:last-child { display: none; } }
@media (max-width: 650px) { .auth-page { padding: 0 20px; }.auth-topbar { height: 84px; }.header-note { display: none; }.auth-layout { grid-template-columns: 1fr; min-height: auto; }.story-panel { min-height: 240px; border-radius: 20px; }.story-copy { padding: 15px 0; }.tiny-star, .story-caption, .story-bottom, .story-kicker { display: none; }h1 { font-size: 30px; margin-top: 15px; }h1 br { display: none; }.form-area { padding: 36px 8px; }.auth-footer { border-top: 1px solid var(--border); flex-wrap: wrap; padding: 20px 0; } }
</style>
