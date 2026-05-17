<template>
  <BaseModal :model-value="modelValue" :title="title" size="sm" centered @update:model-value="emit('update:modelValue', $event)">
    <p class="mb-0">{{ message }}</p>
    <template #footer>
      <button class="btn btn-secondary" @click="emit('update:modelValue', false)">Cancelar</button>
      <button class="btn" :class="`btn-${confirmVariant}`" :disabled="loading" @click="handleConfirm">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1"></span>
        {{ confirmLabel }}
      </button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BaseModal from './BaseModal.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    message: string
    confirmLabel?: string
    confirmVariant?: string
  }>(),
  {
    title: 'Confirmar acción',
    confirmLabel: 'Confirmar',
    confirmVariant: 'danger',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const loading = ref(false)

async function handleConfirm() {
  loading.value = true
  emit('confirm')
  loading.value = false
}
</script>
