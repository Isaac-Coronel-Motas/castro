import { useAuth } from '@/contexts/auth-context'

export function useAuthenticatedFetch() {
  const { token } = useAuth()

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!token) {
      throw new Error('No hay token de autenticación')
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }

    return fetch(url, {
      ...options,
      headers
    })
  }

  return { authenticatedFetch, token }
}
