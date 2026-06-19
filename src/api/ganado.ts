import type { Ganado } from '@/types'
import client from './client'

export const ganadoApi = {
  list: (fincaId?: number) =>
    client.get<Ganado[]>('/ganado', { params: fincaId ? { finca_id: fincaId } : {} }),
}
