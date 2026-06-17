<template>
  <div>
    <div class="mb-4">
      <h5 class="fw-bold mb-1">Solicitudes de Veterinario</h5>
      <p class="text-muted small mb-0">Gestione las solicitudes de asignación de veterinario enviadas por ganaderos</p>
    </div>

    <!-- Tabs de estado -->
    <ul class="nav nav-tabs mb-3">
      <li v-for="tab in tabs" :key="tab.value" class="nav-item">
        <button
          class="nav-link d-flex align-items-center gap-2"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="countByEstado(tab.value) > 0"
            class="badge"
            :class="tab.badgeClass"
          >
            {{ countByEstado(tab.value) }}
          </span>
        </button>
      </li>
    </ul>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Finca</th>
              <th>Ganadero</th>
              <th>Veterinario</th>
              <th>Correo</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="7" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Cargando solicitudes...
              </td>
            </tr>
            <tr v-else-if="filteredSolicitudes.length === 0">
              <td colspan="7" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                No hay solicitudes {{ activeTab !== 'todas' ? activeTab + 's' : '' }}.
              </td>
            </tr>
            <tr v-for="s in filteredSolicitudes" v-else :key="s.id">
              <td class="ps-4 fw-medium">{{ s.finca?.nombre ?? '—' }}</td>
              <td class="text-muted small">{{ s.ganadero?.nombre ?? '—' }}</td>
              <td>{{ s.veterinario?.nombre ?? '—' }}</td>
              <td class="text-muted small">{{ s.veterinario?.correo ?? '—' }}</td>
              <td class="text-muted small">{{ formatDate(s.creado_en) }}</td>
              <td>
                <StatusBadge :estado="s.estado" />
              </td>
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-1">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    title="Ver detalle"
                    @click="openDetailModal(s)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    v-if="s.estado === 'pendiente'"
                    class="btn btn-sm btn-outline-success"
                    title="Aprobar"
                    @click="handleRevisar(s, 'aprobar')"
                  >
                    <i class="bi bi-check-lg"></i>
                  </button>
                  <button
                    v-if="s.estado === 'pendiente'"
                    class="btn btn-sm btn-outline-danger"
                    title="Rechazar"
                    @click="handleRevisar(s, 'rechazar')"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal detalle -->
    <BaseModal v-model="showDetailModal" title="Detalle de solicitud" size="md">
      <div v-if="detailSolicitud" class="row g-3">
        <div class="col-6">
          <p class="text-muted small mb-0">Finca</p>
          <p class="fw-medium mb-0">{{ detailSolicitud.finca?.nombre ?? '—' }}</p>
        </div>
        <div class="col-6">
          <p class="text-muted small mb-0">Ganadero</p>
          <p class="fw-medium mb-0">{{ detailSolicitud.ganadero?.nombre ?? '—' }}</p>
        </div>
        <div class="col-12"><hr class="my-1" /></div>
        <div class="col-6">
          <p class="text-muted small mb-0">Veterinario</p>
          <p class="fw-medium mb-0">{{ detailSolicitud.veterinario?.nombre ?? '—' }}</p>
        </div>
        <div class="col-6">
          <p class="text-muted small mb-0">Correo veterinario</p>
          <p class="fw-medium mb-0">{{ detailSolicitud.veterinario?.correo ?? '—' }}</p>
        </div>
        <div class="col-6">
          <p class="text-muted small mb-0">Estado</p>
          <StatusBadge :estado="detailSolicitud.estado" />
        </div>
        <template v-if="detailSolicitud.aprobado_en">
          <div class="col-6">
            <p class="text-muted small mb-0">{{ detailSolicitud.estado === 'aprobado' ? 'Aprobado el' : 'Procesado el' }}</p>
            <p class="fw-medium mb-0">{{ formatDate(detailSolicitud.aprobado_en) }}</p>
          </div>
          <div v-if="detailSolicitud.aprobador" class="col-6">
            <p class="text-muted small mb-0">Por</p>
            <p class="fw-medium mb-0">{{ detailSolicitud.aprobador.nombre }}</p>
          </div>
        </template>
      </div>
      <template #footer>
        <button class="btn btn-secondary" @click="showDetailModal = false">Cerrar</button>
        <template v-if="detailSolicitud?.estado === 'pendiente'">
          <button class="btn btn-danger" :disabled="isRevisando" @click="handleRevisar(detailSolicitud!, 'rechazar')">
            Rechazar
          </button>
          <button class="btn btn-success" :disabled="isRevisando" @click="handleRevisar(detailSolicitud!, 'aprobar')">
            <span v-if="isRevisando" class="spinner-border spinner-border-sm me-1"></span>
            Aprobar
          </button>
        </template>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SolicitudVeterinario } from '@/types'
import { solicitudesVetApi } from '@/api/solicitudesVet'
import { useNotificationsStore } from '@/stores/notifications'
import BaseModal from '@/components/ui/BaseModal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const notifications = useNotificationsStore()

const solicitudes = ref<SolicitudVeterinario[]>([])
const isLoading = ref(true)
const isRevisando = ref(false)
const activeTab = ref<'pendiente' | 'aprobado' | 'rechazado' | 'todas'>('pendiente')
const showDetailModal = ref(false)
const detailSolicitud = ref<SolicitudVeterinario | null>(null)

const tabs = [
  { label: 'Pendientes', value: 'pendiente' as const, badgeClass: 'bg-warning text-dark' },
  { label: 'Aprobadas', value: 'aprobado' as const, badgeClass: 'bg-success' },
  { label: 'Rechazadas', value: 'rechazado' as const, badgeClass: 'bg-danger' },
  { label: 'Todas', value: 'todas' as const, badgeClass: 'bg-secondary' },
]

const filteredSolicitudes = computed(() => {
  if (activeTab.value === 'todas') return solicitudes.value
  return solicitudes.value.filter((s) => s.estado === activeTab.value)
})

function countByEstado(estado: string) {
  if (estado === 'todas') return solicitudes.value.length
  return solicitudes.value.filter((s) => s.estado === estado).length
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openDetailModal(s: SolicitudVeterinario) {
  detailSolicitud.value = s
  showDetailModal.value = true
}

async function loadSolicitudes() {
  isLoading.value = true
  try {
    const response = await solicitudesVetApi.list()
    solicitudes.value = response.data
  } finally {
    isLoading.value = false
  }
}

async function handleRevisar(s: SolicitudVeterinario, decision: 'aprobar' | 'rechazar') {
  isRevisando.value = true
  try {
    await solicitudesVetApi.revisar(s.id, decision)
    const msg = decision === 'aprobar'
      ? 'Solicitud aprobada. Veterinario asignado a la finca.'
      : 'Solicitud rechazada.'
    notifications.success(msg)
    showDetailModal.value = false
    await loadSolicitudes()
  } catch (err: any) {
    notifications.error(err?.response?.data?.message ?? 'Error al procesar la solicitud.')
  } finally {
    isRevisando.value = false
  }
}

onMounted(loadSolicitudes)
</script>
