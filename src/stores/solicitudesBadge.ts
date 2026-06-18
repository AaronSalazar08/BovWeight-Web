import { defineStore } from 'pinia'
import { ref } from 'vue'
import { solicitudesApi } from '@/api/solicitudes'
import { solicitudesVetApi } from '@/api/solicitudesVet'

export const useSolicitudesBadgeStore = defineStore('solicitudesBadge', () => {
  const pendingCount = ref(0)
  const pendingVetCount = ref(0)

  async function refresh() {
    try {
      const [reg, vet] = await Promise.all([
        solicitudesApi.pendientes(),
        solicitudesVetApi.pendientes(),
      ])
      pendingCount.value = reg.data.length
      pendingVetCount.value = vet.data.length
    } catch {
      // silently fail — badges son informativos
    }
  }

  return { pendingCount, pendingVetCount, refresh }
})
