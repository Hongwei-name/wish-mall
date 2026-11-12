<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import AccountDialog from '@/modules/account/AccountDialog.vue'
import '@/modules/account/account.css'

const router = useRouter()
const authStore = useAuthStore()
const selectedStatus = ref('全部订单')
const dialogTitle = ref('')
const dialogMessage = ref('')
const ordersHeading = ref(null)
const statuses = [
  { label: '全部订单', icon: 'bag' },
  { label: '待付款', icon: 'wallet' },
  { label: '待发货', icon: 'box' },
  { label: '待收货', icon: 'truck' },
  { label: '待评价', icon: 'star' },
  { label: '退款 / 售后', icon: 'return' },
]
const services = [
  { label: '收货地址', detail: '让每一份心愿准确抵达', icon: 'pin', tone: 'pink' },
  { label: '我的收藏', detail: '为喜欢的好物留个位置', icon: 'heart', tone: 'purple' },
  { label: '优惠与积分', detail: '期待更多心意与惊喜', icon: 'wallet', tone: 'blue' },
  { label: '消息中心', detail: '不错过每一次重要通知', icon: 'bell', tone: 'purple' },
]
const emptyTitle = computed(() => selectedStatus.value === '全部订单' ? '你的心愿订单，将从这里开始' : `暂无法查询${selectedStatus.value}订单`)
const emptyDescription = computed(() => selectedStatus.value === '全部订单'
  ? '订单服务尚未接入，暂时无法获取你的订单。这里不会展示演示订单或虚构数量。'
  : `已切换至「${selectedStatus.value}」筛选。订单接口尚未接入，当前无法确认是否有此类订单。`)
function showService(title, message = '') {
  dialogTitle.value = title
  dialogMessage.value = message
}
function goToOrders() {
  selectedStatus.value = '全部订单'
  ordersHeading.value?.scrollIntoView({ behavior: 'auto', block: 'start' })
  ordersHeading.value?.focus({ preventScroll: true })
}
function signOut() {
  authStore.clearSession()
  router.replace({ name: 'auth' })
}
</script>

<template>
  <div class="wish-account">
    <a href="#account-content" class="skip-link">跳到主要内容</a>
    <aside class="account-sidebar">
      <a class="account-brand" href="#account-content" aria-label="如你所愿 WISH MALL 个人中心">
        <span class="brand-symbol"><AccountIcon name="sparkle" /></span>
        <span><strong>如你所愿</strong><small>WISH MALL</small></span>
      </a>
      <p class="sidebar-caption">MY LITTLE UNIVERSE</p>
      <nav class="sidebar-nav" aria-label="个人中心导航">
        <a href="#account-content" class="is-current" aria-current="page"><AccountIcon name="grid" /><span>个人工作台</span><i></i></a>
        <button @click="goToOrders"><AccountIcon name="bag" /><span>我的订单</span></button>
        <button @click="showService('我的收藏')"><AccountIcon name="heart" /><span>我的收藏</span></button>
        <button @click="showService('收货地址')"><AccountIcon name="pin" /><span>地址管理</span></button>
        <button @click="showService('账户设置')"><AccountIcon name="shield" /><span>账户设置</span></button>
      </nav>
      <div class="sidebar-bottom">
        <div class="sidebar-note"><AccountIcon name="sparkle" /><p>让日常多一点<br /><strong>如愿以偿。</strong></p><span>A LITTLE WISH, A BETTER DAY.</span></div>
        <button class="logout-button" @click="signOut"><AccountIcon name="logout" />退出登录</button>
      </div>
    </aside>
    <main id="account-content" class="account-main" tabindex="-1">
      <header class="account-topbar">
        <div class="breadcrumb">我的商城 <span>/</span> <strong>个人中心</strong></div>
        <nav aria-label="快捷导航">
          <button @click="showService('商城首页', '商城浏览功能正在准备中。')">探索商城 <AccountIcon name="arrow" /></button>
          <button class="notification-button" aria-label="消息中心（服务未接入）" @click="showService('消息中心')"><AccountIcon name="bell" /></button>
          <span class="mini-avatar" aria-label="默认用户头像">愿</span>
        </nav>
      </header>
      <div class="dashboard-content">
        <section class="welcome-heading" aria-labelledby="welcome-title"><div><p class="eyebrow">YOUR PERSONAL SPACE</p><h1 id="welcome-title">欢迎回来，心愿生活家<span> ✦</span></h1><p>把生活调成喜欢的样子，每个小心愿都值得被认真对待。</p></div><span class="welcome-tag"><i></i> 你的专属心愿空间</span></section>
        <div class="overview-grid">
          <section class="member-card" aria-labelledby="member-title">
            <div class="member-content"><span class="soft-label"><AccountIcon name="sparkle" /> MY WISH MEMBERSHIP</span><h2 id="member-title">每一份喜欢，都有回响。</h2><p>在这里，收藏灵感，也收藏生活的小确幸。</p><button class="light-button" @click="showService('我的会员', '会员身份、权益及成长值暂不可查询。')">了解会员权益 <AccountIcon name="arrow" /></button><span class="integration-note">会员服务未接入 · 暂无可用权益数据</span></div>
            <div class="wish-art" aria-hidden="true"><div class="art-orbit"></div><div class="art-card"><AccountIcon name="sparkle" /><span>WISH</span><small>good things ahead</small></div><span class="art-star">✧</span></div>
          </section>
          <section class="security-card" aria-labelledby="security-title"><div class="security-top"><span class="icon-tile"><AccountIcon name="shield" /></span><span class="subtle-label">当前会话已登录</span></div><h2 id="security-title">安心，是美好生活的底色</h2><p>账户资料与安全状态尚未接入，<br />暂无法查询绑定信息和安全等级。</p><button class="text-button" @click="showService('账户安全', '手机号绑定、密码与安全等级暂不可查询。')">查看账户安全 <AccountIcon name="arrow" /></button></section>
        </div>
        <div class="workspace-grid">
          <div class="workspace-primary">
            <section class="account-panel orders-panel" aria-labelledby="orders-title">
              <header class="panel-heading"><div><p class="eyebrow">A JOURNEY OF LITTLE WISHES</p><h2 id="orders-title" ref="ordersHeading" tabindex="-1">我的订单</h2></div><span class="unconnected-label">服务未接入</span></header>
              <div class="order-filters" role="group" aria-label="按订单状态筛选"><button v-for="status in statuses" :key="status.label" :class="{ 'is-selected': selectedStatus === status.label }" :aria-pressed="selectedStatus === status.label" @click="selectedStatus = status.label"><AccountIcon :name="status.icon" /><span>{{ status.label }}</span></button></div>
              <div class="order-empty" role="status" aria-live="polite" aria-atomic="true"><div class="empty-illustration" aria-hidden="true"><span class="empty-orbit"></span><AccountIcon name="bag" /><span class="empty-spark">✧</span></div><h3>{{ emptyTitle }}</h3><p>{{ emptyDescription }}</p><button class="outlined-button" @click="showService('探索心愿好物', '商品浏览与下单功能正在准备中。')">去发现心愿好物 <AccountIcon name="arrow" /></button></div>
              <footer class="orders-footer"><AccountIcon name="shield" /><span>只展示真实订单，不将未知数据标记为零。</span></footer>
            </section>
            <section class="account-panel services-panel" aria-labelledby="services-title"><header class="panel-heading"><div><p class="eyebrow">MADE FOR YOUR EVERYDAY</p><h2 id="services-title">常用服务</h2></div><span class="section-aside">小事，也为你用心</span></header><div class="services-grid"><button v-for="service in services" :key="service.label" @click="showService(service.label)"><span class="service-tile" :class="service.tone"><AccountIcon :name="service.icon" /></span><strong>{{ service.label }}</strong><small>{{ service.detail }}</small><span class="service-state">待接入 <span aria-hidden="true">↗</span></span></button></div></section>
          </div>
          <aside class="workspace-secondary" aria-label="帮助与服务说明"><section class="help-card"><span class="help-icon"><AccountIcon name="help" /></span><p class="eyebrow">WE ARE HERE FOR YOU</p><h2>有疑问？<br />我们愿意倾听。</h2><p>关于账户、订单或购物体验，<br />在这里找到下一步的方向。</p><button class="primary-button" @click="showService('帮助与客服', '在线客服和帮助中心暂未开放，尚不能提交咨询。')">帮助与客服 <AccountIcon name="arrow" /></button><small>客服通道尚未接入</small></section><section class="honesty-note"><span class="note-dot"></span><div><h3>关于这个工作台</h3><p>登录认证已可使用。个人资料、会员、订单及资产服务仍在准备中，暂不显示任何模拟账户数据。</p></div></section></aside>
        </div>
        <footer class="dashboard-footer"><span>如你所愿 · 让喜欢，成为日常</span><span>WISH MALL / YOUR WISH, OUR CARE</span></footer>
      </div>
    </main>
    <AccountDialog :title="dialogTitle" :message="dialogMessage" @close="dialogTitle = ''" />
  </div>
</template>
