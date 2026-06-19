<template>
  <BaseModal v-model="isOpen" :title="title" size="sm" @update:model-value="(v) => !v && reset()">
    <!-- Paso 1: confirmar envío de código -->
    <div v-if="step === 'confirm'">
      <p class="text-muted small">
        Te enviaremos un código de verificación de 6 dígitos a tu correo
        <strong>{{ correo }}</strong> para confirmar el cambio de contraseña.
      </p>
      <div v-if="errorMsg" class="alert alert-danger py-2 small">{{ errorMsg }}</div>
    </div>

    <!-- Paso 2: verificar código -->
    <form v-else-if="step === 'code'" id="otp-form" @submit.prevent="handleVerifyOtp">
      <p class="text-muted small">
        Ingresa el código de 6 dígitos enviado a <strong>{{ correo }}</strong>.
        Vence en {{ tiempoFormateado }}.
      </p>
      <input
        v-model="codigo"
        type="text"
        inputmode="numeric"
        maxlength="6"
        class="form-control text-center"
        style="font-size: 1.5rem; letter-spacing: 0.5rem"
        placeholder="000000"
        :disabled="expirado"
        autofocus
      />
      <div v-if="errorMsg" class="alert alert-danger py-2 small mt-3">{{ errorMsg }}</div>
      <div v-if="expirado" class="alert alert-warning py-2 small mt-3">El código ha expirado.</div>
      <button
        type="button"
        class="btn btn-link btn-sm px-0 mt-2"
        :disabled="resendCooldown > 0 || isResending"
        @click="handleResend"
      >
        {{ resendCooldown > 0 ? `Reenviar código en ${resendCooldown}s` : 'Reenviar código' }}
      </button>
    </form>

    <!-- Paso 3: nueva contraseña -->
    <form v-else-if="step === 'password'" id="password-form" @submit.prevent="handleResetPassword">
      <div class="mb-3">
        <label class="form-label fw-medium">Nueva contraseña</label>
        <input
          v-model="form.contrasena"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': formErrors.contrasena }"
          placeholder="••••••••"
        />
        <div v-if="formErrors.contrasena" class="invalid-feedback">{{ formErrors.contrasena }}</div>
        <div class="form-text">Mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.</div>
      </div>
      <div class="mb-3">
        <label class="form-label fw-medium">Confirmar contraseña</label>
        <input
          v-model="form.confirmacion"
          type="password"
          class="form-control"
          :class="{ 'is-invalid': formErrors.confirmacion }"
          placeholder="••••••••"
        />
        <div v-if="formErrors.confirmacion" class="invalid-feedback">{{ formErrors.confirmacion }}</div>
      </div>
      <div v-if="errorMsg" class="alert alert-danger py-2 small">{{ errorMsg }}</div>
    </form>

    <!-- Paso 4: éxito -->
    <div v-else class="text-center py-3">
      <i class="bi bi-check-circle-fill text-success fs-1 d-block mb-3"></i>
      <p class="mb-0">Tu contraseña se actualizó correctamente.</p>
    </div>

    <template #footer>
      <template v-if="step === 'confirm'">
        <button class="btn btn-secondary" @click="close">Cancelar</button>
        <button class="btn btn-primary" :disabled="isLoading" @click="handleSendOtp">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
          Enviar código
        </button>
      </template>
      <template v-else-if="step === 'code'">
        <button class="btn btn-secondary" @click="close">Cancelar</button>
        <button type="submit" form="otp-form" class="btn btn-primary" :disabled="isLoading || codigo.length !== 6 || expirado">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
          Verificar
        </button>
      </template>
      <template v-else-if="step === 'password'">
        <button class="btn btn-secondary" @click="close">Cancelar</button>
        <button type="submit" form="password-form" class="btn btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-1"></span>
          Guardar contraseña
        </button>
      </template>
      <template v-else>
        <button class="btn btn-primary" @click="close">Cerrar</button>
      </template>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onUnmounted } from 'vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { authApi } from '@/api/auth'

const props = defineProps<{ modelValue: boolean; correo: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/

type Step = 'confirm' | 'code' | 'password' | 'done'
const step = ref<Step>('confirm')
const isLoading = ref(false)
const isResending = ref(false)
const errorMsg = ref('')
const codigo = ref('')
const resetToken = ref('')

const form = reactive({ contrasena: '', confirmacion: '' })
const formErrors = reactive({ contrasena: '', confirmacion: '' })

const resendCooldown = ref(60)
const secondsLeft = ref(120)
let cooldownTimer: ReturnType<typeof setInterval> | null = null
let expiryTimer: ReturnType<typeof setInterval> | null = null

const expirado = computed(() => secondsLeft.value <= 0)
const tiempoFormateado = computed(() => {
  const m = Math.floor(secondsLeft.value / 60)
  const s = secondsLeft.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const title = computed(() => {
  if (step.value === 'confirm') return 'Cambiar contraseña'
  if (step.value === 'code') return 'Verificar código'
  if (step.value === 'password') return 'Nueva contraseña'
  return 'Contraseña actualizada'
})

function limpiarTimers() {
  if (cooldownTimer) clearInterval(cooldownTimer)
  if (expiryTimer) clearInterval(expiryTimer)
}

function iniciarTimers() {
  limpiarTimers()
  resendCooldown.value = 60
  secondsLeft.value = 120
  cooldownTimer = setInterval(() => {
    if (resendCooldown.value > 0) resendCooldown.value--
  }, 1000)
  expiryTimer = setInterval(() => {
    if (secondsLeft.value > 0) secondsLeft.value--
  }, 1000)
}

function reset() {
  limpiarTimers()
  step.value = 'confirm'
  isLoading.value = false
  isResending.value = false
  errorMsg.value = ''
  codigo.value = ''
  resetToken.value = ''
  form.contrasena = ''
  form.confirmacion = ''
  formErrors.contrasena = ''
  formErrors.confirmacion = ''
}

function close() {
  isOpen.value = false
}

async function handleSendOtp() {
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authApi.sendOtp(props.correo)
    step.value = 'code'
    iniciarTimers()
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'No se pudo enviar el código.'
  } finally {
    isLoading.value = false
  }
}

async function handleResend() {
  if (resendCooldown.value > 0) return
  isResending.value = true
  errorMsg.value = ''
  try {
    await authApi.sendOtp(props.correo)
    codigo.value = ''
    iniciarTimers()
  } catch {
    errorMsg.value = 'No se pudo reenviar el código.'
  } finally {
    isResending.value = false
  }
}

async function handleVerifyOtp() {
  if (codigo.value.length !== 6 || expirado.value) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    const { data } = await authApi.verifyOtp(props.correo, codigo.value)
    resetToken.value = data.token
    limpiarTimers()
    step.value = 'password'
  } catch (err: any) {
    errorMsg.value = err?.response?.data?.message ?? 'Código inválido o expirado.'
  } finally {
    isLoading.value = false
  }
}

function validatePasswordForm(): boolean {
  let valid = true
  formErrors.contrasena = ''
  formErrors.confirmacion = ''

  if (!form.contrasena) {
    formErrors.contrasena = 'La contraseña es requerida.'
    valid = false
  } else if (!PASSWORD_REGEX.test(form.contrasena)) {
    formErrors.contrasena = 'Debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 carácter especial.'
    valid = false
  }

  if (!form.confirmacion) {
    formErrors.confirmacion = 'Confirma la contraseña.'
    valid = false
  } else if (form.contrasena !== form.confirmacion) {
    formErrors.confirmacion = 'Las contraseñas no coinciden.'
    valid = false
  }

  return valid
}

async function handleResetPassword() {
  if (!validatePasswordForm()) return
  isLoading.value = true
  errorMsg.value = ''
  try {
    await authApi.resetPassword({
      token: resetToken.value,
      correo: props.correo,
      contrasena: form.contrasena,
      contrasena_confirmation: form.confirmacion,
    })
    step.value = 'done'
  } catch (err: any) {
    const status = err?.response?.status
    errorMsg.value =
      status === 422
        ? 'El código ya expiró o no es válido. Solicita uno nuevo.'
        : err?.response?.data?.message ?? 'No se pudo actualizar la contraseña.'
  } finally {
    isLoading.value = false
  }
}

onUnmounted(limpiarTimers)
</script>
