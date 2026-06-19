<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h5 class="fw-bold mb-1">Ganado</h5>
        <p class="text-muted small mb-0">
          <span v-if="fincaActual">
            Mostrando el ganado de la finca <strong>{{ fincaActual.nombre }}</strong>
          </span>
          <span v-else>Listado completo de todos los animales registrados</span>
        </p>
      </div>
      <RouterLink
        v-if="fincaActual"
        :to="{ name: 'ganado' }"
        class="btn btn-outline-secondary d-flex align-items-center gap-2"
      >
        <i class="bi bi-arrow-left"></i>
        Ver todo el ganado
      </RouterLink>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Arete</th>
              <th>Nombre</th>
              <th>Sexo</th>
              <th>Raza</th>
              <th>Finca</th>
              <th>Estado de salud</th>
              <th>Estado comercial</th>
              <th class="text-end pe-4">Peso (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="8" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Cargando ganado...
              </td>
            </tr>
            <tr v-else-if="ganado.length === 0">
              <td colspan="8" class="text-center py-5 text-muted">
                <i class="bi bi-clipboard-x fs-3 d-block mb-2"></i>
                No hay animales registrados{{ fincaActual ? ' en esta finca' : '' }}.
              </td>
            </tr>
            <tr v-for="animal in ganado" v-else :key="animal.id">
              <td class="ps-4 fw-medium">{{ animal.arete }}</td>
              <td>{{ animal.nombre || '—' }}</td>
              <td>{{ animal.sexo || '—' }}</td>
              <td class="text-muted small">{{ animal.raza }}</td>
              <td>
                <span v-if="animal.finca" class="text-dark">{{ animal.finca.nombre }}</span>
                <span v-else class="text-muted fst-italic small">—</span>
              </td>
              <td>
                <span v-if="animal.estado_salud" class="badge bg-success bg-opacity-10 text-success">
                  {{ animal.estado_salud.nombre }}
                </span>
                <span v-else class="text-muted fst-italic small">Sin estado</span>
              </td>
              <td>
                <span v-if="animal.estado_comercial" class="badge bg-info bg-opacity-10 text-info">
                  {{ animal.estado_comercial.nombre }}
                </span>
                <span v-else class="text-muted fst-italic small">Sin estado</span>
              </td>
              <td class="text-end pe-4">
                {{ animal.peso_kg != null ? `${animal.peso_kg} kg` : '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Ganado, Finca } from '@/types'
import { ganadoApi } from '@/api/ganado'
import { fincasApi } from '@/api/fincas'
import { useNotificationsStore } from '@/stores/notifications'

const route = useRoute()
const notifications = useNotificationsStore()

const ganado = ref<Ganado[]>([])
const isLoading = ref(true)
const fincaActual = ref<Finca | null>(null)

const fincaId = computed(() => {
  const raw = route.query.finca_id
  const parsed = Number(raw)
  return raw && !Number.isNaN(parsed) ? parsed : null
})

async function loadGanado() {
  isLoading.value = true
  try {
    const response = await ganadoApi.list(fincaId.value ?? undefined)
    ganado.value = response.data
  } catch (err: any) {
    notifications.error(err?.response?.data?.message ?? 'No se pudo cargar el ganado.')
  } finally {
    isLoading.value = false
  }
}

async function loadFincaActual() {
  if (!fincaId.value) {
    fincaActual.value = null
    return
  }
  try {
    const response = await fincasApi.show(fincaId.value)
    fincaActual.value = response.data
  } catch {
    fincaActual.value = null
  }
}

watch(
  fincaId,
  () => {
    loadFincaActual()
    loadGanado()
  },
  { immediate: true },
)
</script>
