<template>
  <div>
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        <h5 class="fw-bold mb-1">Gestión de Usuarios</h5>
        <p class="text-muted small mb-0">Administre las cuentas del sistema</p>
      </div>
      <button class="btn btn-primary d-flex align-items-center gap-2" @click="openCreateModal">
        <i class="bi bi-person-plus"></i>
        Crear usuario
      </button>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-header bg-white border-bottom py-3">
        <div class="input-group" style="max-width: 320px">
          <span class="input-group-text bg-white">
            <i class="bi bi-search text-secondary"></i>
          </span>
          <input
            v-model="searchQuery"
            type="search"
            class="form-control border-start-0"
            placeholder="Buscar por nombre o correo..."
            @input="debouncedSearch"
          />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th class="ps-4">Nombre</th>
              <th>Correo</th>
              <th>Tipo de usuario</th>
              <th>Registrado</th>
              <th class="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="5" class="text-center py-5 text-muted">
                <div class="spinner-border spinner-border-sm me-2"></div>
                Cargando usuarios...
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="5" class="text-center py-5 text-muted">
                <i class="bi bi-people fs-3 d-block mb-2"></i>
                No se encontraron usuarios.
              </td>
            </tr>
            <tr v-for="user in users" v-else :key="user.id">
              <td class="ps-4">
                <div class="d-flex align-items-center gap-2">
                  <div
                    class="avatar bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center fw-semibold"
                    style="width: 36px; height: 36px; font-size: 0.85rem"
                  >
                    {{ initials(user.nombre) }}
                  </div>
                  <span class="fw-medium">{{ user.nombre }}</span>
                </div>
              </td>
              <td class="text-muted">{{ user.correo }}</td>
              <td>
                <StatusBadge :estado="user.tipo" />
              </td>
              <td class="text-muted small">{{ formatDate(user.creado_en) }}</td>
              <td class="text-end pe-4">
                <div class="d-flex justify-content-end gap-2">
                  <button
                    class="btn btn-sm btn-outline-secondary"
                    title="Editar usuario"
                    @click="openEditModal(user)"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    title="Eliminar usuario"
                    :disabled="user.id === authStore.user?.id"
                    @click="openDeleteDialog(user)"
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

    <!-- Create / Edit Modal -->
    <BaseModal v-model="showModal" :title="editingUser ? 'Editar usuario' : 'Crear usuario'" size="md">
      <form id="user-form" @submit.prevent="handleSubmit">
        <div v-if="!editingUser" class="alert alert-info py-2 small mb-3">
          <i class="bi bi-envelope me-1"></i>
          Se enviará un correo de bienvenida con las credenciales de acceso.
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Nombre completo</label>
          <input
            v-model="form.nombre"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formErrors.nombre }"
            placeholder="Ej: Juan Pérez"
            required
          />
          <div v-if="formErrors.nombre" class="invalid-feedback">{{ formErrors.nombre }}</div>
        </div>
        <div class="mb-3">
          <label class="form-label fw-medium">Correo electrónico</label>
          <input
            v-model="form.correo"
            type="email"
            class="form-control"
            :class="{ 'is-invalid': formErrors.correo }"
            placeholder="correo@ejemplo.com"
            required
          />
          <div v-if="formErrors.correo" class="invalid-feedback">{{ formErrors.correo }}</div>
        </div>
        <div v-if="!editingUser" class="mb-3">
          <label class="form-label fw-medium">Tipo de usuario</label>
          <select v-model="form.tipo_nombre" class="form-select" required>
            <option value="" disabled>Seleccione un tipo</option>
            <option value="Administrador">Administrador</option>
            <option value="Ganadero">Ganadero</option>
            <option value="Veterinario">Veterinario</option>
          </select>
        </div>
        <div v-else class="mb-3">
          <label class="form-label fw-medium">Tipo de usuario</label>
          <input type="text" class="form-control" :value="form.tipo_nombre" disabled />
          <div class="form-text">El tipo de usuario no se puede cambiar una vez creada la cuenta.</div>
        </div>
        <div v-if="!editingUser" class="mb-3">
          <label class="form-label fw-medium">Contraseña temporal</label>
          <input
            v-model="form.contrasena"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': formErrors.contrasena }"
            placeholder="Mínimo 8 caracteres"
            required
          />
          <div v-if="formErrors.contrasena" class="invalid-feedback">{{ formErrors.contrasena }}</div>
        </div>

        <div v-if="submitError" class="alert alert-danger py-2 small">{{ submitError }}</div>
      </form>
      <template #footer>
        <button class="btn btn-secondary" @click="showModal = false">Cancelar</button>
        <button
          type="submit"
          form="user-form"
          class="btn btn-primary"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
          {{ editingUser ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirm -->
    <ConfirmDialog
      v-model="showDeleteDialog"
      title="Eliminar usuario"
      :message="`¿Está seguro de eliminar a ${deletingUser?.nombre}? Esta acción no se puede deshacer.`"
      confirm-label="Eliminar"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import type { User } from '@/types'
import { usersApi } from '@/api/users'
import { useAuthStore } from '@/stores/auth'
import { useNotificationsStore } from '@/stores/notifications'
import BaseModal from '@/components/ui/BaseModal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'

const authStore = useAuthStore()
const notifications = useNotificationsStore()

const users = ref<User[]>([])
const isLoading = ref(true)
const searchQuery = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const editingUser = ref<User | null>(null)
const deletingUser = ref<User | null>(null)
const isSubmitting = ref(false)
const submitError = ref('')

const form = reactive({
  nombre: '',
  correo: '',
  tipo_nombre: '',
  contrasena: '',
})

const formErrors = reactive({ nombre: '', correo: '', contrasena: '' })

let searchTimeout: ReturnType<typeof setTimeout> | null = null

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadUsers, 400)
}

function initials(nombre: string): string {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-CR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function resetForm() {
  form.nombre = ''
  form.correo = ''
  form.tipo_nombre = ''
  form.contrasena = ''
  formErrors.nombre = ''
  formErrors.correo = ''
  formErrors.contrasena = ''
  submitError.value = ''
}

function openCreateModal() {
  editingUser.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(user: User) {
  editingUser.value = user
  resetForm()
  form.nombre = user.nombre
  form.correo = user.correo
  form.tipo_nombre = user.tipo
  showModal.value = true
}

function openDeleteDialog(user: User) {
  deletingUser.value = user
  showDeleteDialog.value = true
}

async function loadUsers() {
  isLoading.value = true
  try {
    const response = await usersApi.list(searchQuery.value || undefined)
    users.value = response.data
  } finally {
    isLoading.value = false
  }
}

function validateForm(): boolean {
  let valid = true
  formErrors.nombre = ''
  formErrors.correo = ''
  formErrors.contrasena = ''

  if (!form.nombre.trim()) {
    formErrors.nombre = 'El nombre es requerido.'
    valid = false
  }
  if (!form.correo) {
    formErrors.correo = 'El correo es requerido.'
    valid = false
  }
  if (!editingUser.value && !form.contrasena) {
    formErrors.contrasena = 'La contraseña es requerida.'
    valid = false
  }
  if (!editingUser.value && form.contrasena && form.contrasena.length < 8) {
    formErrors.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validateForm()) return
  isSubmitting.value = true
  submitError.value = ''

  try {
    if (editingUser.value) {
      await usersApi.update(editingUser.value.id, {
        nombre: form.nombre,
        correo: form.correo,
      })
      notifications.success('Usuario actualizado correctamente.')
    } else {
      await usersApi.create({
        nombre: form.nombre,
        correo: form.correo,
        tipo_nombre: form.tipo_nombre,
        contrasena: form.contrasena,
      })
      notifications.success('Usuario creado. Se enviaron las credenciales de acceso por correo.')
    }
    showModal.value = false
    loadUsers()
  } catch (err: any) {
    const status = err?.response?.status
    const data = err?.response?.data
    if (status === 422 && data?.errors?.correo) {
      formErrors.correo = data.errors.correo[0]
    } else if (status === 409 && data?.message) {
      formErrors.correo = data.message
    } else {
      submitError.value = data?.message ?? 'Error al procesar la solicitud.'
    }
  } finally {
    isSubmitting.value = false
  }
}

async function handleDelete() {
  if (!deletingUser.value) return
  try {
    await usersApi.destroy(deletingUser.value.id)
    notifications.success('Usuario eliminado correctamente.')
    showDeleteDialog.value = false
    loadUsers()
  } catch (err: any) {
    notifications.error(err?.response?.data?.message ?? 'No se pudo eliminar el usuario.')
  }
}

onMounted(loadUsers)
</script>
