<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountSidebar from '@/modules/account/AccountSidebar.vue'
import AccountPageHeader from '@/modules/account/AccountPageHeader.vue'
import AccountIcon from '@/modules/account/AccountIcon.vue'
import { orderStatuses, resolveOrderStatus } from '@/modules/account/order-statuses'
import '@/modules/account/account.css'
import '@/modules/account/account-subpage.css'

const route = useRoute()
const router = useRouter()

const activeStatus = computed(() => {
  const value = typeof route.query.status === 'string' ? route.query.status : 'all'
  return resolveOrderStatus(value)
})

function selectStatus(key) {
  if (key === activeStatus.value.key) return
  router.replace({ name: 'orders', query: key === 'all' ? {} : { status: key } })
}
</script>

<template>
  <div class="wish-account account-subpage">
    <AccountSidebar />
    <main id="account-content" class="account-main" tabindex="-1">
      <AccountPageHeader section="我的订单" />
      <div class="dashboard-content">
        <section class="welcome-heading" aria-labelledby="orders-title"><h1 id="orders-title">我的订单</h1></section>
        <section class="account-panel" aria-label="订单筛选与列表">
          <div class="order-filters" role="group" aria-label="按订单状态筛选">
            <button v-for="status in orderStatuses" :key="status.key" type="button" :class="{ 'is-selected': activeStatus.key === status.key }" :aria-pressed="activeStatus.key === status.key" @click="selectStatus(status.key)">
              <AccountIcon :name="status.icon" />
              <span>{{ status.label }}</span>
            </button>
          </div>
          <div class="order-empty" role="status" aria-live="polite">
            <div class="empty-illustration" aria-hidden="true"><span class="empty-orbit"></span><AccountIcon name="bag" /><span class="empty-spark">✧</span></div>
            <h3>暂无订单</h3>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>
