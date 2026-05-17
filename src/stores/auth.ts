import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials } from '@/types'
import { authApi } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('auth_token'))

  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.tipo === 'Administrador')

  async function login(credentials: LoginCredentials) {
    const response = await authApi.login(credentials)
    const { token: newToken, usuario: loggedUser } = response.data
    token.value = newToken
    user.value = loggedUser
    localStorage.setItem('auth_token', newToken)
  }

  async function logout() {
    try {
      await authApi.logout()
    } finally {
      token.value = null
      user.value = null
      localStorage.removeItem('auth_token')
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) return
    const response = await authApi.me()
    user.value = response.data
  }

  return { user, token, isAuthenticated, isAdmin, login, logout, fetchCurrentUser }
})
