<script setup>
import { useAuthStore } from '@/stores/auth'

defineProps({
  section: { type: String, required: true },
})

const authStore = useAuthStore()

function userInitial() {
  return authStore.user?.nickname?.slice(0, 1) || authStore.user?.phone?.slice(-2) || '愿'
}
</script>

<template>
  <header class="account-topbar">
    <h1 class="page-title">{{ section }}</h1>
    <nav aria-label="快捷导航">
      <span class="mini-avatar" aria-label="用户头像">
        <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" alt="头像" />
        <span v-else>{{ userInitial() }}</span>
      </span>
    </nav>
  </header>
</template>

<style scoped>
.page-title {
  margin: 0;
  color: var(--text);
  font-size: 15px;
  font-weight: 600;
}
</style>
