<script setup>
import AccountSidebar from '@/modules/account/AccountSidebar.vue'
import AccountPageHeader from '@/modules/account/AccountPageHeader.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import '@/modules/account/account.css'
import '@/modules/account/account-subpage.css'
</script>

<template>
  <div class="wish-account account-subpage">
    <AccountSidebar />
    <main id="account-content" class="account-main" tabindex="-1">
      <AccountPageHeader section="地址管理" />
      <div class="dashboard-content">
        <section class="welcome-heading" aria-labelledby="addresses-title"><h1 id="addresses-title">地址管理</h1></section>
        <section class="account-panel account-empty-panel" aria-label="地址管理">
          <div class="order-empty" role="status">
            <div class="empty-illustration" aria-hidden="true"><span class="empty-orbit"></span><AccountIcon name="pin" /><span class="empty-spark">✧</span></div>
            <h3>暂无地址</h3>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
