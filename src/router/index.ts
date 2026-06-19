import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/',
      component: () => import('@/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'usuarios',
          name: 'usuarios',
          component: () => import('@/views/users/UsersView.vue'),
        },
        {
          path: 'solicitudes',
          name: 'solicitudes',
          component: () => import('@/views/solicitudes/SolicitudesView.vue'),
        },
        {
          path: 'fincas',
          name: 'fincas',
          component: () => import('@/views/fincas/FincasView.vue'),
        },
        {
          path: 'ganado',
          name: 'ganado',
          component: () => import('@/views/ganado/GanadoView.vue'),
        },
        {
          path: 'solicitudes-veterinario',
          name: 'solicitudes-veterinario',
          component: () => import('@/views/solicitudes-vet/SolicitudesVetView.vue'),
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchCurrentUser()
    } catch {
      await authStore.logout()
      return { name: 'login' }
    }
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.meta.requiresGuest && authStore.isAuthenticated) {
    return { name: 'dashboard' }
  }
})

export default router
