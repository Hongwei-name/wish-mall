<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import AccountDialog from '@/modules/account/AccountDialog.vue'
import AccountSidebar from '@/modules/account/AccountSidebar.vue'
import '@/modules/account/account.css'

const authStore = useAuthStore()
const dialogTitle = ref('')

const nickname = computed(() => authStore.user?.nickname || '心愿生活家')
const avatar = computed(() => authStore.user?.avatar || '')

function showService(title) {
  dialogTitle.value = title
}

function userInitial() {
  return authStore.user?.nickname?.slice(0, 1) || authStore.user?.phone?.slice(-2) || '愿'
}
</script>

<template>
  <div class="wish-account">
    <AccountSidebar />
    <main id="account-content" class="account-main" tabindex="-1">
      <header class="account-topbar">
        <div class="breadcrumb">我的商城 <span>/</span> <strong>个人中心</strong></div>
        <nav aria-label="快捷导航">
          <button type="button" @click="showService('商城首页')">
            探索商城 <AccountIcon name="arrow" />
          </button>
          <button
            class="notification-button"
            type="button"
            aria-label="消息中心"
            @click="showService('消息中心')"
          >
            <AccountIcon name="bell" />
          </button>
          <span class="mini-avatar" aria-label="用户头像">
            <img v-if="avatar" :src="avatar" alt="头像" />
            <span v-else>{{ userInitial() }}</span>
          </span>
        </nav>
      </header>
      <div class="dashboard-content">
        <section class="welcome-heading" aria-labelledby="welcome-title">
          <h1 id="welcome-title">个人工作台</h1>
        </section>
        <section class="member-card" aria-labelledby="overview-title">
          <div class="member-content">
            <h2 id="overview-title">你好，{{ nickname }} ✦</h2>
            <p>欢迎回到你的个人空间。</p>
          </div>
          <div class="wish-art" aria-hidden="true">
            <div class="art-orbit"></div>
            <div class="art-card">
              <AccountIcon name="sparkle" /><span>WISH</span><small>good things ahead</small>
            </div>
            <span class="art-star">✧</span>
          </div>
        </section>
      </div>
    </main>
    <AccountDialog :title="dialogTitle" @close="dialogTitle = ''" />
  </div>
</template>
