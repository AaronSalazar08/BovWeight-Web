<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h5 class="fw-bold mb-1">Gestión de Fincas</h5>
        <p class="text-muted small mb-0">Administre fincas y sus asignaciones</p>
      </div>
      <button class="btn btn-primary d-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-plus-lg"></i>
        Nueva finca
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Nombre</th>
              <th>Ubicación</th>
              <th>Ganadero</th>
              <th>Veterinario</th>
              <th>Ganado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Cargando fincas...
              </td>
            </tr>
            <tr v-else-if="fincas.length === 0">
              <td colspan="6" class="text-center py-5 text-muted">
                <i class="bi bi-house fs-3 d-block mb-2"></i>
                No hay fincas registradas.
              </td>
            </tr>
            <tr v-for="finca in fincas" v-else :key="finca.id">
              <td class="ps-4 fw-medium">{{ finca.nombre }}</td>
              <td class="text-muted small">{{ finca.ubicacion }}</td>
              <td>
                <span v-if="finca.ganadero" class="text-dark">{{ finca.ganadero.nombre }}</span>
                <span v-else class="text-muted fst-italic small">Sin asignar</span>
              </td>
              <td>
                <span v-if="finca.veterinario" class="text-dark">{{ finca.veterinario.nombre }}</span>
                <span v-else class="text-muted fst-italic small">Sin asignar</span>
              </td>
              <td>
                <RouterLink
                  :to="{ name: 'ganado', query: { finca_id: finca.id } }"
                  class="d-flex align-items-center gap-2 text-decoration-none"
                >
                  <span class="badge bg-secondary bg-opacity-10 text-secondary">{{ finca.total_ganado }}</span>
                  <span class="small">Ver ganado</span>
                </RouterLink>
              </td>
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-1">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    title="Editar finca"
                    @click="openEditModal(finca)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-success"
                    title="Asignar ganadero"
                    @click="openAsignarGanaderoModal(finca)"
                  >
                    <i class="bi bi-person-fill"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-info"
                    title="Asignar veterinario"
                    @click="openAsignarVeterinarioModal(finca)"
                  >
                    <i class="bi bi-heart-pulse"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    title="Eliminar finca"
                    @click="openDeleteDialog(finca)"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal crear / editar finca -->
    <BaseModal v-model="showModal" :title="editingFinca ? 'Editar finca' : 'Nueva finca'" size="md">
      <form id="finca-form" @submit.prevent="handleSubmit">
        <div class="mb-3">
          <label class="form-label fw-medium">Nombre</label>
          <input
            v-model="form.nombre"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.nombre }"
            placeholder="Ej: Finca La Esperanza"
            required
          />
          <div v-if="formErrors.nombre" class="invalid-feedback">{{ formErrors.nombre }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Ubicación</label>
          <input
            v-model="form.ubicacion"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.ubicacion }"
            placeholder="Ej: San José, Costa Rica"
            required
          />
          <div v-if="formErrors.ubicacion" class="invalid-feedback">{{ formErrors.ubicacion }}</div>
        </div>
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label fw-medium">Área (ha)</label>
            <input
              v-model.number="form.area"
              type="number"
              min="0"
              step="0.01"
              class="form-control"
              :class="{ 'is-invalid': formErrors.area }"
              required
            />
            <div v-if="formErrors.area" class="invalid-feedback">{{ formErrors.area }}</div>
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label fw-medium">Número de finca</label>
            <input
              v-model="form.numero_finca"
              type="text"
              class="form-control"
              :class="{ 'is-invalid': formErrors.numero_finca }"
              required
            />
            <div v-if="formErrors.numero_finca" class="invalid-feedback">{{ formErrors.numero_finca }}</div>
          </div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Ganadero</label>
          <select v-model.number="form.usuario_id" class="form-select">
            <option :value="null">Sin asignar</option>
            <option v-for="g in ganaderos" :key="g.id" :value="g.id">{{ g.nombre }} — {{ g.correo }}</option>
          </select>
        </div>
        <div v-if="submitError" class="alert alert-danger py-2 small">{{ submitError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
        <button type="submit" form="finca-form" class="btn btn-primary" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
          {{ editingFinca ? 'Guardar cambios' : 'Crear finca' }}
        </button>
      </template>
    </BaseModal>

    <!-- Modal asignar ganadero -->
    <BaseModal v-model="showGanaderoModal" title="Asignar ganadero" size="sm">
      <div class="mb-3">
        <label class="form-label fw-medium">Ganadero</label>
        <select v-model.number="selectedGanaderoId" class="form-select">
          <option :value="null">Sin asignar</option>
          <option v-for="g in ganaderos" :key="g.id" :value="g.id">{{ g.nombre }} — {{ g.correo }}</option>
        </select>
      </div>
      <div v-if="assignError" class="alert alert-danger py-2 small">{{ assignError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showGanaderoModal = false">Cancelar</button>
        <button class="btn btn-success" :disabled="isAssigning" @click="handleAsignarGanadero">
          <span v-if="isAssigning" class="spinner-border spinner-border-sm me-1"></span>
          Guardar
        </button>
      </template>
    </BaseModal>

    <!-- Modal asignar veterinario -->
    <BaseModal v-model="showVeterinarioModal" title="Asignar veterinario" size="sm">
      <div class="mb-3">
        <label class="form-label fw-medium">Veterinario</label>
        <select v-model.number="selectedVeterinarioId" class="form-select">
          <option :value="null">Sin asignar</option>
          <option v-for="v in veterinarios" :key="v.id" :value="v.id">{{ v.nombre }} — {{ v.correo }}</option>
        </select>
      </div>
      <div v-if="assignError" class="alert alert-danger py-2 small">{{ assignError }}</div>
      <template #footer>
        <button class="btn btn-secondary" @click="showVeterinarioModal = false">Cancelar</button>
        <button class="btn btn-info text-white" :disabled="isAssigning" @click="handleAsignarVeterinario">
          <span v-if="isAssigning" class="spinner-border spinner-border-sm me-1"></span>
          Guardar
        </button>
      </template>
    </BaseModal>

    <!-- Confirm delete -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Eliminar finca"
      :message="`¿Está seguro de eliminar la finca '${deletingFinca?.nombre}'? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { Finca, UsuarioCatalogo } from '@/types'
import { fincasApi } from '@/api/fincas'
import { catalogosApi } from '@/api/catalogos'
import { useNotificationsStore } from '@/stores/notifications'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const notifications = useNotificationsStore()

const fincas = ref<Finca[]>([])
const ganaderos = ref<UsuarioCatalogo[]>([])
const veterinarios = ref<UsuarioCatalogo[]>([])
const isLoading = ref(true)
const showModal = ref(false)
const showDeleteDialog = ref(false)
const showGanaderoModal = ref(false)
const showVeterinarioModal = ref(false)
const editingFinca = ref<Finca | null>(null)
const deletingFinca = ref<Finca | null>(null)
const targetFinca = ref<Finca | null>(null)
const isSubmitting = ref(false)
const isAssigning = ref(false)
const submitError = ref('')
const assignError = ref('')
const selectedGanaderoId = ref<number | null>(null)
const selectedVeterinarioId = ref<number | null>(null)

const form = reactive({
  nombre: '',
  ubicacion: '',
  area: 0,
  numero_finca: '',
  usuario_id: null as number | null,
})

const formErrors = reactive({
  nombre: '',
  ubicacion: '',
  area: '',
  numero_finca: '',
})

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetForm() {
  form.nombre = ''
  form.ubicacion = ''
  form.area = 0
  form.numero_finca = ''
  form.usuario_id = null
  formErrors.nombre = ''
  formErrors.ubicacion = ''
  formErrors.area = ''
  formErrors.numero_finca = ''
  submitError.value = ''
}

function openCreateModal() {
  editingFinca.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(finca: Finca) {
  editingFinca.value = finca
  resetForm()
  form.nombre = finca.nombre
  form.ubicacion = finca.ubicacion
  form.area = finca.area
  form.numero_finca = finca.numero_finca
  form.usuario_id = finca.ganadero?.id ?? null
  showModal.value = true
}

function openDeleteDialog(finca: Finca) {
  deletingFinca.value = finca
  showDeleteDialog.value = true
}

function openAsignarGanaderoModal(finca: Finca) {
  targetFinca.value = finca
  selectedGanaderoId.value = finca.ganadero?.id ?? null
  assignError.value = ''
  showGanaderoModal.value = true
}

function openAsignarVeterinarioModal(finca: Finca) {
  targetFinca.value = finca
  selectedVeterinarioId.value = finca.veterinario?.id ?? null
  assignError.value = ''
  showVeterinarioModal.value = true
}

async function loadFincas() {
  isLoading.value = true
  try {
    const response = await fincasApi.list()
    fincas.value = response.data
  } finally {
    isLoading.value = false
  }
}

async function loadCatalogos() {
  const [g, v] = await Promise.all([catalogosApi.ganaderos(), catalogosApi.veterinarios()])
  ganaderos.value = g.data
  veterinarios.value = v.data
}

function validateForm(): boolean {
  let valid = true
  formErrors.nombre = ''
  formErrors.ubicacion = ''
  formErrors.area = ''
  formErrors.numero_finca = ''

  if (!form.nombre.trim()) { formErrors.nombre = 'El nombre es requerido.'; valid = false }
  if (!form.ubicacion.trim()) { formErrors.ubicacion = 'La ubicación es requerida.'; valid = false }
  if (form.area < 0) { formErrors.area = 'El área debe ser mayor o igual a cero.'; valid = false }
  if (!form.numero_finca.trim()) { formErrors.numero_finca = 'El número de finca es requerido.'; valid = false }
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    if (editingFinca.value) {
      await fincasApi.update(editingFinca.value.id, {
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        area: form.area,
        numero_finca: form.numero_finca,
        usuario_id: form.usuario_id,
      })
      notifications.success('Finca actualizada correctamente.')
    } else {
      await fincasApi.create({
        nombre: form.nombre,
        ubicacion: form.ubicacion,
        area: form.area,
        numero_finca: form.numero_finca,
        usuario_id: form.usuario_id,
      })
      notifications.success('Finca creada correctamente.')
    }
    showModal.value = false
    loadFincas()
  } catch (err: any) {
    const status = err?.response?.status
    const data = err?.response?.data
    if (status === 409) {
      formErrors.numero_finca = data?.message ?? 'Número de finca ya existe.'
    } else if (status === 422 && data?.errors) {
      if (data.errors.numero_finca) formErrors.numero_finca = data.errors.numero_finca[0]
      if (data.errors.nombre) formErrors.nombre = data.errors.nombre[0]
    } else {
      submitError.value = data?.message ?? 'Error al procesar la solicitud.'
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handleAsignarGanadero() {
  if (!targetFinca.value) return
  isAssigning.value = true
  assignError.value = ''

  try {
    if (selectedGanaderoId.value) {
      await fincasApi.asignarGanadero(targetFinca.value.id, selectedGanaderoId.value)
    } else {
      await fincasApi.removerGanadero(targetFinca.value.id)
    }
    notifications.success('Ganadero actualizado correctamente.')
    showGanaderoModal.value = false
    loadFincas()
  } catch (err: any) {
    assignError.value = err?.response?.data?.message ?? 'Error al asignar ganadero.'
  } finally {
    isAssigning.value = false
  }
}

async function handleAsignarVeterinario() {
  if (!targetFinca.value) return
  isAssigning.value = true
  assignError.value = ''

  try {
    if (selectedVeterinarioId.value) {
      await fincasApi.asignarVeterinario(targetFinca.value.id, selectedVeterinarioId.value)
    } else {
      await fincasApi.removerVeterinario(targetFinca.value.id)
    }
    notifications.success('Veterinario actualizado correctamente.')
    showVeterinarioModal.value = false
    loadFincas()
  } catch (err: any) {
    assignError.value = err?.response?.data?.message ?? 'Error al asignar veterinario.'
  } finally {
    isAssigning.value = false
  }
}

async function handleDelete() {
  if (!deletingFinca.value) return
  try {
    await fincasApi.destroy(deletingFinca.value.id)
    notifications.success('Finca eliminada correctamente.')
    showDeleteDialog.value = false
    loadFincas()
  } catch (err: any) {
    notifications.error(err?.response?.data?.message ?? 'No se pudo eliminar la finca.')
  }
}

onMounted(() => {
  loadFincas()
  loadCatalogos()
})
</script>
