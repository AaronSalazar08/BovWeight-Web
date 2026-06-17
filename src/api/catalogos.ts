import type { UsuarioCatalogo } from '@/types'
import client from './client'

export const catalogosApi = {
  ganaderos: () => client.get<UsuarioCatalogo[]>('/catalogos/ganaderos'),
  veterinarios: () => client.get<UsuarioCatalogo[]>('/catalogos/veterinarios'),
}
