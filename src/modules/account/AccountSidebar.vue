<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import AssistantDrawer from '@/modules/assistant/AssistantDrawer.vue'
import '@/modules/account/account.css'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const assistantOpen = ref(false)

const navItems = [
  { name: 'profile', label: '个人工作台', icon: 'grid' },
  { name: 'orders', label: '我的订单', icon: 'bag' },
  { name: 'favorites', label: '我的收藏', icon: 'heart' },
  { name: 'addresses', label: '地址管理', icon: 'pin' },
  { name: 'settings', label: '账户设置', icon: 'shield' },
]

function isCurrent(name) {
  return route.name === name
}

async function signOut() {
  await authStore.logout()
  router.replace({ name: 'auth' })
}
</script>

<template>
  <a class="skip-link" href="#account-content">跳到主要内容</a>
  <aside class="account-sidebar">
    <a class="account-brand" href="#account-content" aria-label="如你所愿 WISH MALL 个人中心">
      <span class="brand-symbol"><AccountIcon name="sparkle" /></span>
      <span><strong>如你所愿</strong><small>WISH MALL</small></span>
    </a>
    <nav class="sidebar-nav" aria-label="个人中心导航">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="{ name: item.name }"
        :class="{ 'is-current': isCurrent(item.name) }"
        :aria-current="isCurrent(item.name) ? 'page' : undefined"
      >
        <AccountIcon :name="item.icon" />
        <span>{{ item.label }}</span>
        <i v-if="isCurrent(item.name)" aria-hidden="true"></i>
      </RouterLink>
    </nav>
    <div class="sidebar-bottom">
      <button
        class="sidebar-note"
        type="button"
        aria-haspopup="dialog"
        @click="assistantOpen = true"
      >
        <span class="assistant-head"
          ><span class="assistant-avatar"><AccountIcon name="bot" /></span
          ><span class="assistant-name">小愿</span></span
        >
        <span class="assistant-button">唤醒小愿</span>
      </button>
      <button class="logout-button" type="button" @click="signOut">
        <AccountIcon name="logout" />退出登录
      </button>
    </div>
    <AssistantDrawer v-model:open="assistantOpen" />
  </aside>
</template>

<style scoped>
.sidebar-nav a:hover {
  color: var(--brand-ink);
  background: var(--brand-soft);
}
</style>
