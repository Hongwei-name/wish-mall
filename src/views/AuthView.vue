<script setup>
import { useRouter } from 'vue-router'
import AuthPanel from '@/modules/auth/AuthPanel.vue'

const router = useRouter()

function handleAuthenticated() {
  router.replace({ name: 'profile' })
}
</script>

<template>
  <main class="auth-layout">
    <aside class="brand-panel" aria-label="WISH MALL">
      <div class="brand-lockup">
        <span class="brand-mark">W</span>
        <span>WISH MALL</span>
      </div>
      <div class="brand-copy">
        <p class="eyebrow">WISH FOR BETTER</p>
        <h2>把喜欢的生活，<br />一件件带回家。</h2>
        <p>精选好物、安心交易与完整售后，让每一次心愿都有回应。</p>
        <ul aria-label="商城服务保障">
          <li><span><svg viewBox="0 0 24 24"><path d="m7 12 3 3 7-7" /></svg></span><b>品质严选</b><small>严格筛选每一件商品</small></li>
          <li><span><svg viewBox="0 0 24 24"><path d="M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4Z" /></svg></span><b>安心支付</b><small>账户与交易安全保障</small></li>
          <li><span><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2-5.3M4 4v5h5" /></svg></span><b>无忧售后</b><small>便捷的退换货服务</small></li>
        </ul>
      </div>
      <footer><span>© 2026 WISH MALL</span><span>让好物不负期待</span></footer>
    </aside>

    <section class="content-panel">
      <AuthPanel @authenticated="handleAuthenticated" />
    </section>
  </main>
</template>

<style scoped>
.auth-layout {
  display: grid;
  min-height: 100vh;
  grid-template-columns: minmax(320px, 0.9fr) minmax(480px, 1.1fr);
  background: var(--page);
}

.brand-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 42px clamp(36px, 6vw, 88px);
  border-right: 1px solid var(--border);
  overflow: hidden;
  background: linear-gradient(145deg, var(--pastel-petal), var(--baby-pink), var(--thistle));
}
.brand-panel::before,
.brand-panel::after {
  position: absolute;
  border: 1px solid var(--icy-blue);
  border-radius: 50%;
  content: '';
}
.brand-panel::before {
  top: -180px;
  right: -210px;
  width: 520px;
  height: 520px;
  box-shadow: 0 0 0 70px var(--baby-pink), 0 0 0 140px var(--pastel-petal);
}
.brand-panel::after {
  bottom: -150px;
  left: -150px;
  width: 330px;
  height: 330px;
}

.brand-lockup {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--text);
  font-size: 13px;
  font-weight: 800;
}
.brand-mark {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border-radius: 5px;
  background: var(--brand);
  color: var(--on-brand);
}
.brand-copy {
  position: relative;
  z-index: 1;
  margin: auto 0;
  max-width: 410px;
}
.eyebrow {
  margin: 0 0 14px;
  color: var(--brand);
  font-size: 12px;
  font-weight: 800;
}
h2 {
  margin: 0;
  color: var(--text);
  font-size: 48px;
  line-height: 1.12;
}
.brand-copy > p:last-child {
  margin: 22px 0 0;
  max-width: 360px;
  color: var(--muted);
  font-size: 16px;
  line-height: 1.75;
}
.brand-copy ul {
  display: grid;
  gap: 14px;
  margin: 32px 0 0;
  padding: 0;
  list-style: none;
}
.brand-copy li {
  display: grid;
  grid-template-columns: 38px auto 1fr;
  gap: 10px;
  align-items: center;
}
.brand-copy li > span {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid var(--border-strong);
  border-radius: 5px;
  color: var(--brand);
}
.brand-copy li svg {
  width: 18px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}
.brand-copy li b {
  color: var(--text);
  font-size: 12px;
}
.brand-copy li small {
  color: var(--thistle);
  font-size: 11px;
}
footer {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  color: var(--thistle);
  font-size: 11px;
}

.content-panel {
  container-type: inline-size;
  display: grid;
  place-items: center;
  padding: 40px 24px;
  background: var(--page);
}
@media (max-width: 760px) {
  .auth-layout {
    grid-template-columns: 1fr;
  }
  .brand-panel {
    min-height: 220px;
    padding: 28px 24px;
    border-right: 0;
    border-bottom: 1px solid var(--border);
  }
  .brand-copy {
    margin: 38px 0 0;
  }
  .brand-copy h2 {
    font-size: 30px;
  }
  .brand-copy > p:last-child,
  .brand-copy ul,
  footer {
    display: none;
  }
  .content-panel {
    padding: 28px 16px;
  }
}
</style>
