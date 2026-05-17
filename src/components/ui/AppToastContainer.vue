<template>
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100">
    <TransitionGroup name="toast">
      <div
        v-for="notification in notifications.notifications"
        :key="notification.id"
        class="toast show align-items-center border-0 mb-2"
        :class="`text-bg-${notification.type}`"
        role="alert"
        aria-live="assertive"
      >
        <div class="d-flex">
          <div class="toast-body d-flex align-items-center gap-2">
            <i :class="iconFor(notification.type)" class="fs-5"></i>
            {{ notification.message }}
          </div>
          <button
            type="button"
            class="btn-close btn-close-white me-2 m-auto"
            aria-label="Cerrar"
            @click="notifications.remove(notification.id)"
          ></button>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '@/stores/notifications'
import type { NotificationType } from '@/types'

const notifications = useNotificationsStore()

function iconFor(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    success: 'bi bi-check-circle-fill',
    danger: 'bi bi-x-circle-fill',
    warning: 'bi bi-exclamation-triangle-fill',
    info: 'bi bi-info-circle-fill',
  }
  return icons[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
