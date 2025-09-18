"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LoginRequest, LoginResponse, Usuario } from "@/lib/types/auth"

interface User {
  usuario_id: number
  nombre: string
  username: string
  email: string
  rol_id: number
  rol_nombre: string
  activo: boolean
  is_2fa_enabled: boolean
  sucursales: Array<{ sucursal_id: number; nombre: string }>
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (username: string, password: string, rememberMe?: boolean) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem("user")
    const savedToken = localStorage.getItem("token")
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser))
        setToken(savedToken)
      } catch (error) {
        console.error("Error parsing saved user data:", error)
        localStorage.removeItem("user")
        localStorage.removeItem("token")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    setIsLoading(true)

    try {
      const loginRequest: LoginRequest = {
        username,
        password,
        remember_me: rememberMe
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      })

      const data: LoginResponse = await response.json()

      if (data.success && data.data) {
        const { usuario, token: authToken } = data.data
        
        const userData: User = {
          usuario_id: usuario.usuario_id,
          nombre: usuario.nombre,
          username: usuario.username,
          email: usuario.email,
          rol_id: usuario.rol_id,
          rol_nombre: usuario.rol_nombre || 'Usuario',
          activo: usuario.activo,
          is_2fa_enabled: usuario.is_2fa_enabled,
          sucursales: usuario.sucursales || []
        }

        setUser(userData)
        setToken(authToken)
        
        // Guardar en localStorage
        localStorage.setItem("user", JSON.stringify(userData))
        localStorage.setItem("token", authToken)
        
        setIsLoading(false)
        router.push("/dashboard")
        return true
      } else {
        console.error("Login failed:", data.message)
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Login error:", error)
      setIsLoading(false)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simular registro (en producción esto sería una llamada a API)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const userData: User = {
      id: Date.now().toString(),
      username,
      email,
      role: "Usuario",
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    setIsLoading(false)
    router.push("/dashboard")
    return true
  }

  const logout = async () => {
    try {
      // Llamar a la API de logout si hay token
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      }
    } catch (error) {
      console.error("Logout API error:", error)
    } finally {
      // Limpiar estado local independientemente del resultado de la API
      setUser(null)
      setToken(null)
      localStorage.removeItem("user")
      localStorage.removeItem("token")
      router.push("/")
    }
  }

  return <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
