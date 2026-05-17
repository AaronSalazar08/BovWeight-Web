<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h5 class="fw-bold mb-1">Solicitudes de Registro</h5>
        <p class="text-muted small mb-0">Apruebe o rechace las solicitudes de nuevos usuarios</p>
      </div>
    </div>

    <!-- Tabs filtro -->
    <ul class="nav nav-tabs border-bottom mb-4">
      <li v-for="tab in tabs" :key="tab.key" class="nav-item">
        <button
          class="nav-link"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="badge ms-1" :class="tab.key === 'Pendiente' ? 'bg-warning text-dark' : 'bg-secondary'">
            {{ countByEstado(tab.key) }}
          </span>
        </button>
      </li>
    </ul>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Solicitante</th>
              <th>Correo</th>
              <th>Teléfono</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Cargando solicitudes...
              </td>
            </tr>
            <tr v-else-if="filteredSolicitudes.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                No hay solicitudes {{ activeTab === 'Pendiente' ? 'pendientes' : activeTab === 'Aprobado' ? 'aprobadas' : 'rechazadas' }}.
              </td>
            </tr>
            <tr v-for="sol in filteredSolicitudes" v-else :key="sol.id">
              <td class="ps-4">
                <p class="mb-0 fw-semibold">{{ sol.nombre }} {{ sol.apellidos }}</p>
              </td>
              <td class="text-muted">{{ sol.correo }}</td>
              <td class="text-muted">{{ sol.numero_celular }}</td>
              <td class="text-muted small">{{ formatDate(sol.creado_en) }}</td>
              <td>
                <StatusBadge :estado="sol.estado" />
              </td>
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    title="Ver detalle"
                    @click="openDetailModal(sol)"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <template v-if="sol.estado === 'Pendiente'">
                    <button
                      class="btn btn-sm btn-success"
                      title="Aprobar"
                      @click="openApproveModal(sol)"
                    >
                      <i class="bi bi-check-lg"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      title="Rechazar"
                      @click="openRejectModal(sol)"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail Modal -->
    <BaseModal v-model="showDetailModal" title="Detalle de solicitud" size="lg">
      <div v-if="selectedSolicitud">
        <div class="row g-3">
          <div class="col-md-6">
            <label class="text-muted small">Nombre completo</label>
            <p class="fw-semibold mb-0">{{ selectedSolicitud.nombre }} {{ selectedSolicitud.apellidos }}</p>
          </div>
          <div class="col-md-6">
            <label class="text-muted small">Correo electrónico</label>
            <p class="fw-semibold mb-0">{{ selectedSolicitud.correo }}</p>
          </div>
          <div class="col-md-6">
            <label class="text-muted small">Número de celular</label>
            <p class="fw-semibold mb-0">{{ selectedSolicitud.numero_celular }}</p>
          </div>
          <div class="col-md-6">
            <label class="text-muted small">Estado</label>
            <div>
              <StatusBadge :estado="selectedSolicitud.estado" />
            </div>
          </div>
          <div class="col-md-6">
            <label class="text-muted small">Fecha de solicitud</label>
            <p class="fw-semibold mb-0">{{ formatDate(selectedSolicitud.creado_en) }}</p>
          </div>
          <div v-if="selectedSolicitud.motivo_rechazo" class="col-12">
            <label class="text-muted small">Motivo de rechazo</label>
            <p class="fw-semibold mb-0 text-danger">{{ selectedSolicitud.motivo_rechazo }}</p>
          </div>
        </div>

        <div v-if="selectedSolicitud.estado === 'Pendiente'" class="d-flex gap-2 mt-4">
          <button
            class="btn btn-success d-flex align-items-center gap-2"
            @click="openApproveModal(selectedSolicitud)"
          >
            <i class="bi bi-check-circle"></i>
            Aprobar
          </button>
          <button
            class="btn btn-outline-danger d-flex align-items-center gap-2"
            @click="openRejectModal(selectedSolicitud)"
          >
            <i class="bi bi-x-circle"></i>
            Rechazar
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Approve Modal -->
    <BaseModal v-model="showApproveModal" title="Aprobar solicitud" size="sm">
      <form id="approve-form" @submit.prevent="handleApprove">
        <div class="alert alert-success py-2 small mb-3">
          <i class="bi bi-envelope-check me-1"></i>
          Se creará el usuario y se enviarán sus credenciales de acceso por correo.
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Tipo de usuario a asignar</label>
          <select v-model="approveType" class="form-select" required>
            <option value="Ganadero">Ganadero</option>
            <option value="Veterinario">Veterinario</option>
          </select>
        </div>
        <div v-if="actionError" class="alert alert-danger py-2 small mb-0">{{ actionError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showApproveModal = false">Cancelar</button>
        <button
          type="submit"
          form="approve-form"
          class="btn btn-success"
          :disabled="isActioning"
          @click.prevent="handleApprove"
        >
          <span v-if="isActioning" class="spinner-border spinner-border-sm me-1"></span>
          Confirmar aprobación
        </button>
      </template>
    </BaseModal>

    <!-- Reject Modal -->
    <BaseModal v-model="showRejectModal" title="Rechazar solicitud" size="sm">
      <form id="reject-form" @submit.prevent="handleReject">
        <div class="alert alert-warning py-2 small mb-3">
          <i class="bi bi-envelope-exclamation me-1"></i>
          Se notificará al solicitante por correo con el motivo indicado.
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Motivo de rechazo</label>
          <textarea
            v-model="rejectReason"
            class="form-control"
            :class="{ 'is-invalid': !rejectReason && rejectAttempted }"
            rows="3"
            placeholder="Ej: Documentación incompleta..."
            required
          ></textarea>
          <div v-if="!rejectReason && rejectAttempted" class="invalid-feedback">
            El motivo de rechazo es requerido.
          </div>
        </div>
        <div v-if="actionError" class="alert alert-danger py-2 small mb-0">{{ actionError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showRejectModal = false">Cancelar</button>
        <button
          type="submit"
          form="reject-form"
          class="btn btn-danger"
          :disabled="isActioning"
          @click.prevent="handleReject"
        >
          <span v-if="isActioning" class="spinner-border spinner-border-sm me-1"></span>
          Confirmar rechazo
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { SolicitudRegistro } from '@/types'
import { solicitudesApi } from '@/api/solicitudes'
import { useNotificationsStore } from '@/stores/notifications'
import BaseModal from '@/components/ui/BaseModal.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const notifications = useNotificationsStore()

const solicitudes = ref<SolicitudRegistro[]>([])
const isLoading = ref(true)
const isActioning = ref(false)
const activeTab = ref('Pendiente')
const selectedSolicitud = ref<SolicitudRegistro | null>(null)
const showDetailModal = ref(false)
const showApproveModal = ref(false)
const showRejectModal = ref(false)
const approveType = ref<'Ganadero' | 'Veterinario'>('Ganadero')
const rejectReason = ref('')
const rejectAttempted = ref(false)
const actionError = ref('')

const tabs = [
  { key: 'Pendiente', label: 'Pendientes' },
  { key: 'Aprobado', label: 'Aprobadas' },
  { key: 'Rechazado', label: 'Rechazadas' },
]

const filteredSolicitudes = computed(() =>
  solicitudes.value.filter((s) => s.estado === activeTab.value),
)

function countByEstado(estado: string): number {
  return solicitudes.value.filter((s) => s.estado === estado).length
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function openDetailModal(sol: SolicitudRegistro) {
  selectedSolicitud.value = sol
  showDetailModal.value = true
}

function openApproveModal(sol: SolicitudRegistro) {
  selectedSolicitud.value = sol
  approveType.value = 'Ganadero'
  actionError.value = ''
  showDetailModal.value = false
  showApproveModal.value = true
}

function openRejectModal(sol: SolicitudRegistro) {
  selectedSolicitud.value = sol
  rejectReason.value = ''
  rejectAttempted.value = false
  actionError.value = ''
  showDetailModal.value = false
  showRejectModal.value = true
}

async function loadSolicitudes() {
  isLoading.value = true
  try {
    const response = await solicitudesApi.list()
    solicitudes.value = response.data
  } finally {
    isLoading.value = false
  }
}

async function handleApprove() {
  if (!selectedSolicitud.value) return
  isActioning.value = true
  actionError.value = ''
  try {
    await solicitudesApi.revisar(selectedSolicitud.value.id, {
      decision: 'aprobar',
      tipo_usuario: approveType.value,
    })
    notifications.success('Solicitud aprobada. Se enviaron las credenciales de acceso al solicitante por correo.')
    showApproveModal.value = false
    activeTab.value = 'Aprobado'
    await loadSolicitudes()
  } catch (err: any) {
    const msg = err?.response?.data?.message
    if (err?.response?.status === 422 && msg) {
      actionError.value = msg
    } else {
      notifications.error(msg ?? 'No se pudo aprobar la solicitud.')
    }
  } finally {
    isActioning.value = false
  }
}

async function handleReject() {
  rejectAttempted.value = true
  if (!rejectReason.value.trim() || !selectedSolicitud.value) return

  isActioning.value = true
  actionError.value = ''
  try {
    await solicitudesApi.revisar(selectedSolicitud.value.id, {
      decision: 'rechazar',
      motivo: rejectReason.value,
    })
    notifications.success('Solicitud rechazada. Se notificó al solicitante por correo con el motivo indicado.')
    showRejectModal.value = false
    activeTab.value = 'Rechazado'
    await loadSolicitudes()
  } catch (err: any) {
    const msg = err?.response?.data?.message
    if (err?.response?.status === 422 && msg) {
      actionError.value = msg
    } else {
      notifications.error(msg ?? 'No se pudo rechazar la solicitud.')
    }
  } finally {
    isActioning.value = false
  }
}

onMounted(loadSolicitudes)
</script>
