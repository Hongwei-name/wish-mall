<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const activeNav = ref('个人中心')
const showMenu = ref(false)
const notice = ref('')

const orderStatuses = [
  { label: '待付款', count: 1, icon: 'M6 7h12l-1 13H7L6 7Zm3 0V5a3 3 0 0 1 6 0v2' },
  { label: '待发货', count: 2, icon: 'M3 6h11v11H3V6Zm11 4h4l3 3v4h-7v-7Zm-8 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm11 0a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z' },
  { label: '待收货', count: 0, icon: 'M4 8 12 4l8 4-8 4-8-4Zm2 3v6l6 3 6-3v-6' },
  { label: '待评价', count: 3, icon: 'M12 3 15 9l6 .9-4.5 4.4 1 6.2L12 17.6 6.5 20.5l1-6.2L3 9.9 9 9l3-6Z' },
  { label: '退款/售后', count: 0, icon: 'M4 7h11a5 5 0 0 1 0 10H8m0 0 3-3m-3 3 3 3M7 4 4 7l3 3' },
]

const assets = [
  { value: '8', label: '优惠券' },
  { value: '1,280', label: '积分' },
  { value: '¥ 56.80', label: '账户余额' },
  { value: '24', label: '商品收藏' },
]

const services = [
  { label: '收货地址', detail: '管理常用地址', icon: 'M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Zm0-9a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z' },
  { label: '账户安全', detail: '密码与绑定', icon: 'M12 3 20 7v5c0 5-3.4 8-8 9-4.6-1-8-4-8-9V7l8-4Zm-3 9 2 2 4-5' },
  { label: '消息中心', detail: '2 条新消息', icon: 'M5 18h14l-2-3V9a5 5 0 0 0-10 0v6l-2 3Zm5 2h4' },
  { label: '客户服务', detail: '帮助与反馈', icon: 'M4 13v-2a8 8 0 0 1 16 0v2M4 13h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2Z' },
]

const recentOrders = [
  { id: '202611040018', name: '北欧原木床头灯', spec: '暖光 · 胡桃木色', price: '¥ 239.00', status: '待付款', action: '立即付款', tone: 'warning' },
  { id: '202611020076', name: '轻量通勤双肩包', spec: '森林绿 · 20L', price: '¥ 329.00', status: '待发货', action: '查看订单', tone: 'success' },
]

function showPlaceholder(label) {
  notice.value = `${label}功能将在对应业务模块接入后开放`
  window.setTimeout(() => {
    notice.value = ''
  }, 2600)
}

function signOut() {
  authStore.clearSession()
  router.replace({ name: 'auth' })
}
</script>

<template>
  <div class="account-page">
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="#" aria-label="WISH MALL 首页" @click.prevent="showPlaceholder('商城首页')">
          <span class="brand-mark">W</span><span>WISH MALL</span>
        </a>
        <nav aria-label="商城主导航">
          <button v-for="item in ['商城首页', '全部商品', '我的订单', '个人中心']" :key="item" :class="{ active: activeNav === item }" @click="activeNav = item; item !== '个人中心' && showPlaceholder(item)">{{ item }}</button>
        </nav>
        <div class="header-actions">
          <button class="icon-button" aria-label="购物车" @click="showPlaceholder('购物车')">
            <svg viewBox="0 0 24 24"><path d="M3 4h2l2 11h10l2-8H6M9 20h.01M17 20h.01" /></svg><span class="dot">2</span>
          </button>
          <div class="user-menu">
            <button class="avatar-button" :aria-expanded="showMenu" @click="showMenu = !showMenu"><span>愿</span><span class="desktop-name">心愿用户</span><svg viewBox="0 0 24 24"><path d="m8 10 4 4 4-4" /></svg></button>
            <div v-if="showMenu" class="menu-popover">
              <button @click="showPlaceholder('账户设置'); showMenu = false">账户设置</button>
              <button class="danger" @click="signOut">退出登录</button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="account-shell">
      <section class="profile-hero">
        <div class="profile-main">
          <div class="large-avatar">愿</div>
          <div>
            <div class="welcome-line"><h1>下午好，心愿用户</h1><span class="member-badge">绿意会员</span></div>
            <p>把喜欢的生活，一件件带回家。</p>
            <div class="profile-meta"><span>138****8888</span><i></i><span>会员成长值 1,280 / 2,000</span></div>
          </div>
        </div>
        <button class="secondary-button" @click="showPlaceholder('编辑资料')">编辑资料</button>
        <div class="growth" aria-label="会员成长进度"><span style="width: 64%"></span></div>
      </section>

      <div class="content-grid">
        <div class="main-column">
          <section class="panel orders-panel">
            <header class="section-header"><div><p class="eyebrow">ORDER CENTER</p><h2>我的订单</h2></div><button @click="showPlaceholder('全部订单')">查看全部 <span>→</span></button></header>
            <div class="order-statuses">
              <button v-for="item in orderStatuses" :key="item.label" @click="showPlaceholder(item.label)">
                <span class="status-icon"><svg viewBox="0 0 24 24"><path :d="item.icon" /></svg><b v-if="item.count">{{ item.count }}</b></span><span>{{ item.label }}</span>
              </button>
            </div>
          </section>

          <section class="panel recent-panel">
            <header class="section-header"><div><p class="eyebrow">RECENT ORDERS</p><h2>近期订单</h2></div></header>
            <div class="recent-list">
              <article v-for="(order, index) in recentOrders" :key="order.id" class="order-item">
                <div class="product-thumb" :class="`thumb-${index + 1}`"><svg viewBox="0 0 64 64"><path v-if="index === 0" d="M23 48h18M28 48l2-23h4l2 23M19 25h26L39 10H25L19 25Z" /><path v-else d="M19 25c0-8 5-13 13-13s13 5 13 13v25H19V25Zm6 0h14M26 23v-3a6 6 0 0 1 12 0v3" /></svg></div>
                <div class="product-info"><small>订单号 {{ order.id }}</small><h3>{{ order.name }}</h3><p>{{ order.spec }}</p></div>
                <div class="order-price"><strong>{{ order.price }}</strong><span :class="order.tone">{{ order.status }}</span></div>
                <button class="order-action" :class="{ primary: index === 0 }" @click="showPlaceholder(order.action)">{{ order.action }}</button>
              </article>
            </div>
          </section>
        </div>

        <aside class="side-column">
          <section class="panel assets-panel">
            <header class="section-header"><div><p class="eyebrow">MY ASSETS</p><h2>我的资产</h2></div></header>
            <div class="asset-grid"><button v-for="item in assets" :key="item.label" @click="showPlaceholder(item.label)"><strong>{{ item.value }}</strong><span>{{ item.label }}</span></button></div>
          </section>
          <section class="panel services-panel">
            <header class="section-header"><div><p class="eyebrow">SERVICES</p><h2>常用服务</h2></div></header>
            <div class="service-list">
              <button v-for="item in services" :key="item.label" @click="showPlaceholder(item.label)"><span class="service-icon"><svg viewBox="0 0 24 24"><path :d="item.icon" /></svg></span><span><strong>{{ item.label }}</strong><small>{{ item.detail }}</small></span><b>›</b></button>
            </div>
          </section>
        </aside>
      </div>
    </main>
    <Transition name="toast"><p v-if="notice" class="toast" role="status">{{ notice }}</p></Transition>
  </div>
</template>

<style scoped>
.account-page { min-height: 100vh; background: var(--page); color: var(--text); }
button, a { -webkit-tap-highlight-color: transparent; }
.topbar { position: sticky; top: 0; z-index: 20; border-bottom: 1px solid var(--border); background: var(--pastel-petal); }
.topbar-inner { display: flex; width: min(1180px, calc(100% - 40px)); height: 72px; margin: 0 auto; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; color: var(--text); font-size: 13px; font-weight: 800; letter-spacing: .05em; text-decoration: none; }
.brand-mark { display: grid; width: 32px; height: 32px; place-items: center; border-radius: 5px; background: var(--brand); color: var(--on-brand); font-size: 15px; }
nav { display: flex; align-self: stretch; gap: 6px; }
nav button { position: relative; padding: 0 16px; border: 0; background: none; color: var(--muted); cursor: pointer; font-size: 14px; }
nav button::after { position: absolute; right: 16px; bottom: 0; left: 16px; height: 2px; background: var(--brand); content: ''; opacity: 0; transform: scaleX(.4); transition: .2s ease; }
nav button:hover, nav button.active { color: var(--text); }
nav button.active::after { opacity: 1; transform: scaleX(1); }
.header-actions { display: flex; align-items: center; gap: 14px; }
.icon-button, .avatar-button { border: 0; background: none; color: var(--text); cursor: pointer; }
.icon-button { position: relative; display: grid; width: 38px; height: 38px; place-items: center; border-radius: 6px; }
.icon-button:hover { background: var(--surface); }
.icon-button svg { width: 21px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
.dot { position: absolute; top: 2px; right: 1px; display: grid; width: 17px; height: 17px; place-items: center; border: 2px solid var(--page); border-radius: 50%; background: var(--blushed-brick); font-size: 9px; font-weight: 800; }
.user-menu { position: relative; }
.avatar-button { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; }
.avatar-button > span:first-child { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid var(--border-strong); border-radius: 50%; background: var(--surface-raised); color: var(--brand); }
.avatar-button svg { width: 14px; fill: none; stroke: currentColor; stroke-width: 2; }
.menu-popover { position: absolute; top: 46px; right: 0; display: grid; width: 150px; padding: 6px; border: 1px solid var(--border); border-radius: 7px; background: var(--surface); box-shadow: 0 16px 40px var(--shadow); }
.menu-popover button { padding: 10px 12px; border: 0; border-radius: 4px; background: none; color: var(--text); cursor: pointer; text-align: left; }
.menu-popover button:hover { background: var(--surface-raised); }
.menu-popover .danger { color: var(--danger); }
.account-shell { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 34px 0 56px; }
.profile-hero { position: relative; display: flex; min-height: 178px; padding: 30px 32px; align-items: center; justify-content: space-between; overflow: hidden; border: 1px solid var(--border); border-radius: 9px; background: linear-gradient(118deg, var(--pastel-petal), var(--baby-pink), var(--thistle)); }
.profile-hero::after { position: absolute; top: -100px; right: -35px; width: 260px; height: 260px; border: 1px solid var(--sky-blue); border-radius: 50%; box-shadow: 0 0 0 42px var(--icy-blue), 0 0 0 84px var(--sky-blue); content: ''; }
.profile-main { position: relative; z-index: 1; display: flex; align-items: center; gap: 22px; }
.large-avatar { display: grid; width: 86px; height: 86px; flex: 0 0 auto; place-items: center; border: 1px solid var(--border-strong); border-radius: 50%; background: linear-gradient(145deg, var(--icy-blue), var(--sky-blue)); color: var(--thistle); box-shadow: 0 0 0 7px var(--pastel-petal); font-size: 29px; font-weight: 800; }
.welcome-line { display: flex; align-items: center; gap: 12px; }
.welcome-line h1 { margin: 0; font-size: clamp(24px, 3vw, 31px); line-height: 1.2; }
.member-badge { padding: 5px 9px; border: 1px solid var(--sky-blue); border-radius: 4px; background: var(--brand-soft); color: var(--thistle); font-size: 11px; font-weight: 800; }
.profile-main p { margin: 10px 0; color: var(--muted); font-size: 14px; }
.profile-meta { display: flex; align-items: center; gap: 10px; color: var(--thistle); font-size: 12px; }
.profile-meta i { width: 3px; height: 3px; border-radius: 50%; background: var(--border-strong); }
.secondary-button { position: relative; z-index: 1; min-height: 40px; padding: 0 17px; border: 1px solid var(--border-strong); border-radius: 5px; background: var(--icy-blue); color: var(--text); cursor: pointer; font-size: 13px; font-weight: 700; }
.secondary-button:hover { border-color: var(--brand); color: var(--brand); }
.growth { position: absolute; right: 0; bottom: 0; left: 0; height: 3px; background: var(--pastel-petal); }
.growth span { display: block; height: 100%; background: linear-gradient(90deg, var(--hunter-green), var(--brand)); }
.content-grid { display: grid; grid-template-columns: minmax(0, 1.65fr) minmax(300px, .85fr); gap: 18px; margin-top: 18px; align-items: start; }
.main-column, .side-column { display: grid; gap: 18px; }
.panel { border: 1px solid var(--border); border-radius: 9px; background: var(--surface); }
.section-header { display: flex; min-height: 78px; padding: 18px 22px; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--border); }
.eyebrow { margin: 0 0 4px; color: var(--brand); font-size: 9px; font-weight: 800; letter-spacing: .17em; }
.section-header h2 { margin: 0; font-size: 18px; }
.section-header > button { border: 0; background: none; color: var(--muted); cursor: pointer; font-size: 12px; }
.section-header > button:hover { color: var(--brand); }
.section-header > button span { margin-left: 4px; }
.order-statuses { display: grid; grid-template-columns: repeat(5, 1fr); padding: 23px 14px 25px; }
.order-statuses button { display: grid; gap: 9px; place-items: center; border: 0; border-right: 1px solid var(--border); background: none; color: var(--muted); cursor: pointer; font-size: 12px; }
.order-statuses button:last-child { border-right: 0; }
.order-statuses button:hover { color: var(--brand); }
.status-icon { position: relative; display: grid; width: 38px; height: 38px; place-items: center; }
.status-icon svg, .service-icon svg { width: 25px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.45; }
.status-icon b { position: absolute; top: -3px; right: -3px; display: grid; min-width: 18px; height: 18px; padding: 0 4px; place-items: center; border: 2px solid var(--surface); border-radius: 9px; background: var(--blushed-brick); color: white; font-size: 9px; }
.recent-list { padding: 0 22px; }
.order-item { display: grid; grid-template-columns: 66px minmax(0, 1fr) 100px 88px; gap: 14px; padding: 19px 0; align-items: center; border-bottom: 1px solid var(--border); }
.order-item:last-child { border-bottom: 0; }
.product-thumb { display: grid; width: 62px; height: 62px; place-items: center; border: 1px solid var(--border); border-radius: 6px; background: var(--icy-blue); }
.product-thumb svg { width: 46px; fill: none; stroke: var(--thistle); stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.4; }
.thumb-2 { background: var(--sky-blue); }
.product-info { min-width: 0; }
.product-info small { color: var(--thistle); font-size: 10px; }
.product-info h3 { margin: 6px 0 4px; overflow: hidden; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.product-info p { margin: 0; color: var(--muted); font-size: 11px; }
.order-price { display: grid; gap: 6px; justify-items: end; }
.order-price strong { font-size: 13px; }
.order-price span { font-size: 11px; }
.order-price .warning { color: var(--baby-pink); }
.order-price .success { color: var(--brand); }
.order-action { min-height: 34px; border: 1px solid var(--border-strong); border-radius: 4px; background: transparent; color: var(--text); cursor: pointer; font-size: 11px; }
.order-action:hover { border-color: var(--brand); color: var(--brand); }
.order-action.primary { border-color: var(--brand); background: var(--brand); color: var(--on-brand); font-weight: 800; }
.asset-grid { display: grid; grid-template-columns: 1fr 1fr; padding: 8px 12px 14px; }
.asset-grid button { display: grid; gap: 6px; min-height: 84px; place-content: center; border: 0; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); background: none; color: var(--text); cursor: pointer; }
.asset-grid button:nth-child(2n) { border-right: 0; }
.asset-grid button:nth-last-child(-n+2) { border-bottom: 0; }
.asset-grid strong { color: var(--brand); font-size: 19px; }
.asset-grid span { color: var(--muted); font-size: 11px; }
.service-list { padding: 5px 10px 10px; }
.service-list button { display: grid; width: 100%; grid-template-columns: 42px 1fr auto; gap: 10px; padding: 12px; align-items: center; border: 0; border-radius: 5px; background: none; color: var(--text); cursor: pointer; text-align: left; }
.service-list button:hover { background: var(--surface-raised); }
.service-icon { display: grid; width: 38px; height: 38px; place-items: center; border: 1px solid var(--border); border-radius: 5px; color: var(--brand); }
.service-icon svg { width: 19px; }
.service-list button > span:nth-child(2) { display: grid; gap: 4px; }
.service-list strong { font-size: 13px; }
.service-list small { color: var(--muted); font-size: 10px; }
.service-list b { color: var(--thistle); font-size: 19px; font-weight: 400; }
.toast { position: fixed; z-index: 30; right: 24px; bottom: 24px; margin: 0; padding: 13px 16px; border: 1px solid var(--border-strong); border-radius: 6px; background: var(--pastel-petal); color: var(--text); box-shadow: 0 14px 40px var(--thistle); font-size: 12px; }
.toast-enter-active, .toast-leave-active { transition: .2s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
@media (max-width: 860px) {
  nav { display: none; }
  .content-grid { grid-template-columns: 1fr; }
  .side-column { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 620px) {
  .topbar-inner, .account-shell { width: min(100% - 28px, 1180px); }
  .topbar-inner { height: 62px; }
  .desktop-name { display: none; }
  .account-shell { padding-top: 18px; }
  .profile-hero { min-height: 0; padding: 24px 20px 28px; align-items: flex-start; }
  .profile-main { align-items: flex-start; gap: 14px; }
  .large-avatar { width: 62px; height: 62px; font-size: 22px; }
  .welcome-line { display: grid; gap: 7px; justify-items: start; }
  .profile-main p { margin: 8px 0; }
  .profile-meta { display: grid; gap: 3px; }
  .profile-meta i { display: none; }
  .secondary-button { position: absolute; top: 18px; right: 16px; min-height: 34px; padding: 0 10px; }
  .order-statuses { grid-template-columns: repeat(5, minmax(62px, 1fr)); overflow-x: auto; padding-right: 0; padding-left: 0; }
  .order-statuses button { min-width: 68px; }
  .side-column { grid-template-columns: 1fr; }
  .order-item { grid-template-columns: 56px minmax(0, 1fr) auto; }
  .product-thumb { width: 54px; height: 54px; }
  .product-thumb svg { width: 38px; }
  .order-price { grid-row: 2; grid-column: 2; justify-items: start; }
  .order-action { grid-row: 1 / span 2; grid-column: 3; padding: 0 10px; }
  .toast { right: 14px; bottom: 14px; left: 14px; text-align: center; }
}
@media (max-width: 420px) {
  .brand > span:last-child { display: none; }
  .profile-hero { padding-top: 72px; }
  .secondary-button { top: 20px; left: 20px; right: auto; }
  .welcome-line h1 { font-size: 23px; }
  .recent-list { padding: 0 15px; }
  .section-header { padding: 16px 17px; }
}
</style>
