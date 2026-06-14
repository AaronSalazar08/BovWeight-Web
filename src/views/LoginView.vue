<template>
  <div class="login-page d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="login-card card shadow-sm border-0" style="width: 420px">
      <div class="card-body p-5">
        <div class="text-center mb-4">
          <i class="bi bi-bar-chart-fill text-primary" style="font-size: 2.5rem"></i>
          <h4 class="fw-bold mt-2 mb-0">BovWeight CR</h4>
          <p class="text-muted small mt-1">Panel de Administración</p>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label for="correo" class="form-label fw-medium">Correo electrónico</label>
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-envelope text-secondary"></i>
              </span>
              <input
                id="correo"
                v-model="form.correo"
                type="email"
                class="form-control"
                :class="{ 'is-invalid': errors.correo }"
                placeholder="admin@bovweight.cr"
                autocomplete="email"
                required
              />
              <div v-if="errors.correo" class="invalid-feedback">{{ errors.correo }}</div>
            </div>
          </div>

          <div class="mb-4">
            <label for="contrasena" class="form-label fw-medium">Contraseña</label>
            <div class="input-group">
              <span class="input-group-text bg-white">
                <i class="bi bi-lock text-secondary"></i>
              </span>
                <input
                id="contrasena"
                v-model="form.contrasena"
                :type="showPassword ? 'text' : 'password'"
                class="form-control"
                :class="{ 'is-invalid': errors.contrasena }"
                placeholder="••••••••"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="input-group-text bg-white border-start-0"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" class="text-secondary"></i>
              </button>
              <div v-if="errors.contrasena" class="invalid-feedback">{{ errors.contrasena }}</div>
            </div>
          </div>

          <div v-if="loginError" class="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
            <i class="bi bi-exclamation-triangle-fill"></i>
            <span class="small">{{ loginError }}</span>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100 fw-semibold"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
            Iniciar sesión
          </button>
        </form>

        <p class="text-center text-muted small mt-4 mb-0">
          <i class="bi bi-shield-lock me-1"></i>
          Acceso exclusivo para administradores
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({ correo: '', contrasena: '' })
const errors = reactive({ correo: '', contrasena: '' })
const loginError = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

function validateForm(): boolean {
  errors.correo = ''
  errors.contrasena = ''
  let valid = true

  if (!form.correo) {
    errors.correo = 'El correo es requerido.'
    valid = false
  }
  if (!form.contrasena) {
    errors.contrasena = 'La contraseña es requerida.'
    valid = false
  }
  return valid
}

async function handleLogin() {
  if (!validateForm()) return
  isLoading.value = true
  loginError.value = ''

  try {
    await authStore.login({ correo: form.correo, contrasena: form.contrasena })
    router.push({ name: 'dashboard' })
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401 || status === 422) {
      loginError.value = 'Credenciales incorrectas. Verifique su correo y contraseña.'
    } else {
      loginError.value = 'Error al conectar con el servidor. Intente de nuevo.'
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%);
}
</style>
