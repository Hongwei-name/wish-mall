import { createRouter, createWebHistory } from 'vue-router'
import AuthView from '@/views/AuthView.vue'
import UserProfileView from '@/views/UserProfileView.vue'
import OrdersView from '@/views/OrdersView.vue'
import FavoritesView from '@/views/FavoritesView.vue'
import AddressesView from '@/views/AddressesView.vue'
import SettingsView from '@/views/SettingsView.vue'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/profile' },
    { path: '/auth', name: 'auth', component: AuthView },
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/orders',
      name: 'orders',
      component: OrdersView,
      meta: { requiresAuth: true },
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: FavoritesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/addresses',
      name: 'addresses',
      component: AddressesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth) {
    const valid = await authStore.ensureSession()
    if (!valid) return { name: 'auth', query: { redirect: to.fullPath } }
  }

  if (to.name === 'auth' && authStore.isAuthenticated && to.query.reset !== '1') {
    const valid = await authStore.ensureSession()
    if (valid) return { name: 'profile' }
    authStore.clearSession()
  }
})

export default router
