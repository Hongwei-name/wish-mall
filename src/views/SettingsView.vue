<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AccountSidebar from '@/modules/account/AccountSidebar.vue'
import AccountPageHeader from '@/modules/account/AccountPageHeader.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import '@/modules/account/account.css'
import '@/modules/account/account-subpage.css'

const router = useRouter()
const authStore = useAuthStore()

const nickname = computed(() => authStore.user?.nickname || '未设置')
const maskedPhone = computed(() => {
  const phone = authStore.user?.phone || ''
  return phone.length === 11 ? `${phone.slice(0, 3)}****${phone.slice(-4)}` : '未绑定'
})

function resetPassword() {
  router.push({ name: 'auth', query: { reset: '1' } })
}
</script>

<template>
  <div class="wish-account account-subpage">
    <AccountSidebar />
    <main id="account-content" class="account-main" tabindex="-1">
      <AccountPageHeader section="账户设置" />
      <div class="dashboard-content">
        <section class="welcome-heading" aria-labelledby="settings-title"><h1 id="settings-title">账户设置</h1></section>

        <section class="account-panel settings-panel" aria-labelledby="settings-info-title">
          <header class="panel-heading"><h2 id="settings-info-title">账户信息</h2></header>
          <dl class="settings-list">
            <div class="settings-row"><dt>昵称</dt><dd>{{ nickname }}</dd></div>
            <div class="settings-row"><dt>手机号</dt><dd>{{ maskedPhone }}</dd></div>
          </dl>
        </section>

        <section class="account-panel settings-panel" aria-labelledby="settings-security-title">
          <header class="panel-heading"><h2 id="settings-security-title">账户安全</h2></header>
          <dl class="settings-list">
            <div class="settings-row settings-row--action"><dt>登录密码</dt><dd><span class="security-state">已设置</span><button class="settings-action" type="button" @click="resetPassword">重设密码 <AccountIcon name="arrow" /></button></dd></div>
          </dl>
        </section>
      </div>
    </main>
  </div>
</template>