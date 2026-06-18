<template>
  <nav
    class="sidebar d-flex flex-column"
    :class="{ 'sidebar--collapsed': isCollapsed }"
  >
    <div class="sidebar__brand d-flex align-items-center gap-2 px-3 py-4">
      <i class="bi bi-bar-chart-fill text-primary fs-4"></i>
      <span class="sidebar__brand-name fw-bold text-white fs-5">BovWeight CR</span>
    </div>

    <ul class="nav nav-pills flex-column flex-grow-1 px-2 gap-1">
      <li class="nav-item">
        <RouterLink :to="{ name: 'dashboard' }" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-speedometer2 fs-5"></i>
          <span class="sidebar__label">Dashboard</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'usuarios' }" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-people fs-5"></i>
          <span class="sidebar__label">Usuarios</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'solicitudes' }" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-person-check fs-5"></i>
          <span class="sidebar__label">Solicitudes</span>
          <span v-if="pendingCount > 0" class="badge bg-warning text-dark ms-auto">
            {{ pendingCount }}
          </span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'fincas' }" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-house fs-5"></i>
          <span class="sidebar__label">Fincas</span>
        </RouterLink>
      </li>
      <li class="nav-item">
        <RouterLink :to="{ name: 'solicitudes-veterinario' }" class="nav-link d-flex align-items-center gap-2">
          <i class="bi bi-heart-pulse fs-5"></i>
          <span class="sidebar__label">Solic. Veterinario</span>
          <span v-if="pendingVetCount > 0" class="badge bg-warning text-dark ms-auto">
            {{ pendingVetCount }}
          </span>
        </RouterLink>
      </li>
    </ul>

    <div class="sidebar__footer px-3 py-3 border-top border-secondary">
      <div class="d-flex align-items-center gap-2">
        <i class="bi bi-person-circle fs-5 text-secondary"></i>
        <div v-if="!isCollapsed" class="overflow-hidden">
          <p class="mb-0 text-white text-truncate small fw-semibold">{{ authStore.user?.nombre }}</p>
          <p class="mb-0 text-secondary text-truncate" style="font-size: 0.7rem">
            {{ authStore.user?.tipo }}
          </p>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useSolicitudesBadgeStore } from '@/stores/solicitudesBadge'

defineProps<{ isCollapsed: boolean }>()

const authStore = useAuthStore()
const badgeStore = useSolicitudesBadgeStore()
const { pendingCount, pendingVetCount } = storeToRefs(badgeStore)

onMounted(() => badgeStore.refresh())
</script>

<style scoped>
.sidebar {
  width: 240px;
  min-height: 100vh;
  background-color: #1a1f2e;
  transition: width 0.25s ease;
  flex-shrink: 0;
}

.sidebar--collapsed {
  width: 68px;
}

.sidebar--collapsed .sidebar__brand-name,
.sidebar--collapsed .sidebar__label {
  display: none;
}

.sidebar__brand {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.nav-link {
  color: rgba(255, 255, 255, 0.65);
  border-radius: 8px;
  padding: 0.6rem 0.75rem;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.nav-link:hover {
  color: #fff;
  background-color: rgba(255, 255, 255, 0.08);
}

.nav-link.router-link-active {
  color: #fff;
  background-color: rgba(13, 110, 253, 0.25);
}
</style>
