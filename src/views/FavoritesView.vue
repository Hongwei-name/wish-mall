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
      <AccountPageHeader section="我的收藏" />
      <div class="dashboard-content">
        <section class="account-panel account-empty-panel" aria-label="我的收藏">
          <div class="order-empty" role="status">
            <div class="empty-illustration" aria-hidden="true">
              <span class="empty-orbit"></span><AccountIcon name="heart" /><span class="empty-spark"
                >✧</span
              >
            </div>
            <h3>暂无收藏</h3>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
