<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h5 class="fw-bold mb-1">Bienvenido, {{ authStore.user?.nombre }}</h5>
        <p class="text-muted small mb-0">Resumen del sistema BovWeight CR</p>
      </div>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Total de Usuarios"
          :value="stats.totalUsuarios"
          icon="bi-people-fill"
          variant="primary"
          :loading="isLoading"
        />
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Solicitudes Pendientes"
          :value="stats.solicitudesPendientes"
          icon="bi-person-check-fill"
          variant="warning"
          :loading="isLoading"
        />
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Solicitudes Aprobadas"
          :value="stats.solicitudesAprobadas"
          icon="bi-check-circle-fill"
          variant="success"
          :loading="isLoading"
        />
      </div>
      <div class="col-12 col-sm-6 col-xl-3">
        <StatCard
          title="Solicitudes Rechazadas"
          :value="stats.solicitudesRechazadas"
          icon="bi-x-circle-fill"
          variant="danger"
          :loading="isLoading"
        />
      </div>
    </div>

    <div class="alert alert-warning d-flex align-items-start gap-2 mb-4" role="note">
      <i class="bi bi-exclamation-triangle-fill mt-1 flex-shrink-0"></i>
      <div>
        <strong>Aviso legal:</strong> Los resultados de estimación de peso generados por BovWeight CR son
        aproximaciones basadas en análisis fotográfico y <strong>no sustituyen mediciones oficiales</strong>.
        No deben utilizarse como base para transacciones comerciales legales.
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-bottom d-flex align-items-center justify-content-between py-3">
        <h6 class="mb-0 fw-semibold">Solicitudes de registro pendientes</h6>
        <RouterLink :to="{ name: 'solicitudes' }" class="btn btn-sm btn-outline-primary">
          Ver todas
        </RouterLink>
      </div>
      <div class="card-body p-0">
        <div v-if="isLoading" class="text-center py-5 text-muted">
          <div class="spinner-border spinner-border-sm me-2"></div>
          Cargando...
        </div>
        <div v-else-if="pendingSolicitudes.length === 0" class="text-center py-5 text-muted">
          <i class="bi bi-inbox fs-3 d-block mb-2"></i>
          No hay solicitudes pendientes.
        </div>
        <ul v-else class="list-group list-group-flush">
          <li
            v-for="sol in pendingSolicitudes"
            :key="sol.id"
            class="list-group-item d-flex align-items-center gap-3 py-3 px-4"
          >
            <i class="bi bi-person-circle fs-4 text-secondary"></i>
            <div class="flex-grow-1 overflow-hidden">
              <p class="mb-0 fw-semibold text-truncate">{{ sol.nombre }} {{ sol.apellidos }}</p>
              <p class="mb-0 text-muted small text-truncate">{{ sol.correo }}</p>
            </div>
            <span class="text-muted small text-nowrap">{{ formatDate(sol.creado_en) }}</span>
            <RouterLink :to="{ name: 'solicitudes' }" class="btn btn-sm btn-outline-secondary">
              Revisar
            </RouterLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { usersApi } from '@/api/users'
import { solicitudesApi } from '@/api/solicitudes'
import type { SolicitudRegistro } from '@/types'
import StatCard from '@/components/ui/StatCard.vue'

const authStore = useAuthStore()
const isLoading = ref(true)
const pendingSolicitudes = ref<SolicitudRegistro[]>([])

const stats = ref({
  totalUsuarios: 0,
  solicitudesPendientes: 0,
  solicitudesAprobadas: 0,
  solicitudesRechazadas: 0,
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

onMounted(async () => {
  try {
    const [usersRes, allSolRes, pendingRes] = await Promise.all([
      usersApi.list(),
      solicitudesApi.list(),
      solicitudesApi.pendientes(),
    ])

    stats.value.totalUsuarios = usersRes.data.length
    stats.value.solicitudesPendientes = pendingRes.data.length

    const all = allSolRes.data
    stats.value.solicitudesAprobadas = all.filter((s) => s.estado === 'Aprobado').length
    stats.value.solicitudesRechazadas = all.filter((s) => s.estado === 'Rechazado').length

    pendingSolicitudes.value = pendingRes.data.slice(0, 5)
  } finally {
    isLoading.value = false
  }
})
</script>
