<template>
  <div class="card border-0 shadow-sm h-100">
    <div class="card-body d-flex align-items-center gap-3">
      <div
        class="stat-icon d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
        :class="`bg-${variant} bg-opacity-10`"
        style="width: 52px; height: 52px"
      >
        <i :class="`bi ${icon} fs-4 text-${variant}`"></i>
      </div>
      <div>
        <p class="text-muted small mb-1">{{ title }}</p>
        <div v-if="loading" class="placeholder-glow">
          <span class="placeholder col-4"></span>
        </div>
        <h4 v-else class="mb-0 fw-bold">{{ value }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: number
  icon: string
  variant: string
  loading?: boolean
}>()
</script>
