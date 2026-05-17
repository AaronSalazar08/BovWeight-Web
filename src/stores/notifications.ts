import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Notification, NotificationType } from '@/types'

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([])

  function add(message: string, type: NotificationType = 'info') {
    const id = crypto.randomUUID()
    notifications.value.push({ id, type, message })
    setTimeout(() => remove(id), 4000)
  }

  function remove(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id)
  }

  const success = (message: string) => add(message, 'success')
  const error = (message: string) => add(message, 'danger')
  const warning = (message: string) => add(message, 'warning')
  const info = (message: string) => add(message, 'info')

  return { notifications, add, remove, success, error, warning, info }
})
