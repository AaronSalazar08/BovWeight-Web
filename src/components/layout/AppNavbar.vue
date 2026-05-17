<template>
  <header class="app-navbar d-flex align-items-center px-4 py-2 bg-white border-bottom shadow-sm">
    <button
      class="btn btn-link text-secondary p-0 me-3"
      aria-label="Alternar menú lateral"
      @click="emit('toggle-sidebar')"
    >
      <i class="bi bi-list fs-4"></i>
    </button>

    <h6 class="mb-0 text-dark fw-semibold">{{ pageTitle }}</h6>

    <div class="ms-auto d-flex align-items-center gap-3">
      <div class="dropdown">
        <button
          class="btn btn-link text-secondary p-0 d-flex align-items-center gap-2 text-decoration-none"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i class="bi bi-person-circle fs-5"></i>
          <span class="small d-none d-md-inline">{{ authStore.user?.nombre }}</span>
          <i class="bi bi-chevron-down small"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end shadow-sm">
          <li>
            <span class="dropdown-item-text small text-muted">
              {{ authStore.user?.correo }}
            </span>
          </li>
          <li><hr class="dropdown-divider" /></li>
          <li>
            <button class="dropdown-item text-danger d-flex align-items-center gap-2" @click="handleLogout">
              <i class="bi bi-box-arrow-right"></i>
              Cerrar sesión
            </button>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'

const emit = defineEmits<{ 'toggle-sidebar': [] }>()

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const notifications = useNotificationsStore()

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  usuarios: 'Gestión de Usuarios',
  solicitudes: 'Solicitudes de Registro',
}

const pageTitle = computed(() => pageTitles[route.name as string] ?? 'BovWeight CR Admin')

async function handleLogout() {
  await authStore.logout()
  notifications.success('Sesión cerrada correctamente.')
  router.push({ name: 'login' })
}
</script>

<style scoped>
.app-navbar {
  height: 58px;
}
</style>
