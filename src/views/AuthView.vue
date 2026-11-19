<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthPanel from '@/modules/auth/AuthPanel.vue'

const route = useRoute()
const router = useRouter()
const initialMode = computed(() => (route.query.reset === '1' ? 'reset' : 'login'))
function handleAuthenticated() {
  const target = typeof route.query.redirect === 'string' ? route.query.redirect : ''
  if (target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/auth')) {
    router.replace(target)
    return
  }
  router.replace({ name: 'profile' })
}
</script>

<template>
  <!-- shadcn-vue login-01 page layout. -->
  <main class="shadcn-auth flex min-h-svh w-full items-center justify-center bg-background p-6 text-foreground md:p-10">
    <div class="w-full max-w-sm">
      <AuthPanel :initial-mode="initialMode" @authenticated="handleAuthenticated" />
    </div>
  </main>
</template>
