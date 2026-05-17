<template>
  <span class="badge" :class="variantClass">{{ label }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{ estado: string }>()

const map: Record<string, { label: string; variant: string }> = {
  Pendiente: { label: 'Pendiente', variant: 'warning text-dark' },
  Aprobado: { label: 'Aprobado', variant: 'success' },
  Rechazado: { label: 'Rechazado', variant: 'danger' },
  Administrador: { label: 'Administrador', variant: 'primary' },
  Ganadero: { label: 'Ganadero', variant: 'success' },
  Veterinario: { label: 'Veterinario', variant: 'info text-dark' },
}

const resolved = computed(() => map[props.estado] ?? { label: props.estado, variant: 'secondary' })
const variantClass = computed(() => `bg-${resolved.value.variant}`)
const label = computed(() => resolved.value.label)
</script>
