<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal d-block" tabindex="-1" @click.self="emit('update:modelValue', false)">
        <div class="modal-dialog" :class="[`modal-${size}`, { 'modal-dialog-centered': centered }]">
          <div class="modal-content shadow">
            <div v-if="title" class="modal-header">
              <h5 class="modal-title">{{ title }}</h5>
              <button
                type="button"
                class="btn-close"
                aria-label="Cerrar"
                @click="emit('update:modelValue', false)"
              ></button>
            </div>
            <div class="modal-body">
              <slot />
            </div>
            <div v-if="$slots.footer" class="modal-footer">
              <slot name="footer" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <Transition name="fade">
      <div v-if="modelValue" class="modal-backdrop show"></div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: boolean
    title?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
    centered?: boolean
  }>(),
  { size: 'md', centered: true },
)

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
</script>

<style scoped>
.modal {
  background-color: transparent;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
