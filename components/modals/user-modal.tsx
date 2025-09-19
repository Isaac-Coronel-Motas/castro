"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Usuario, Rol } from "@/lib/types/auth"
import { X, Save, User, Mail, Lock, Shield } from "lucide-react"

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (user: Partial<Usuario>) => Promise<{ success: boolean; errors?: any[] }>
  user?: Usuario | null
  roles: Rol[]
  title: string
}

interface FormData {
  nombre: string
  email: string
  username: string
  password: string
  confirmPassword: string
  rol_id: number | null
  activo: boolean
}

interface FormErrors {
  nombre?: string
  email?: string
  username?: string
  password?: string
  confirmPassword?: string
  rol_id?: string
}

export function UserModal({ isOpen, onClose, onSave, user, roles, title }: UserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    rol_id: null,
    activo: true,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        nombre: user.nombre || "",
        email: user.email || "",
        username: user.username || "",
        password: "",
        confirmPassword: "",
        rol_id: user.rol_id || null,
        activo: user.activo ?? true,
      })
    } else {
      setFormData({
        nombre: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
        rol_id: null,
        activo: true,
      })
    }
    setErrors({})
  }, [user, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.username.trim()) {
      newErrors.username = "El nombre de usuario es requerido"
    } else if (formData.username.length < 3) {
      newErrors.username = "El nombre de usuario debe tener al menos 3 caracteres"
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = "El nombre de usuario solo puede contener letras, números y guiones bajos"
    }

    if (!user && !formData.password) {
      newErrors.password = "La contraseña es requerida"
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres"
    }

    if (!user && !formData.confirmPassword) {
      newErrors.confirmPassword = "Confirma la contraseña"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (!formData.rol_id) {
      newErrors.rol_id = "Selecciona un rol"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({}) // Limpiar errores previos
    try {
      const userData: Partial<Usuario> = {
        nombre: formData.nombre.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        rol_id: formData.rol_id!,
        activo: formData.activo,
      }

      if (formData.password) {
        userData.password = formData.password
      }

      const result = await onSave(userData)
      if (result.success) {
        onClose()
      } else if (result.errors) {
        // Mapear errores de la API a errores del formulario
        const apiErrors: FormErrors = {}
        result.errors.forEach((error: any) => {
          if (error.field && error.message) {
            apiErrors[error.field as keyof FormErrors] = error.message
          }
        })
        setErrors(apiErrors)
      }
    } catch (error) {
      console.error("Error al guardar usuario:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ingresa el nombre completo"
                    className={errors.nombre ? "border-red-500" : ""}
                  />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
              </div>
            </div>

            {/* Información de Acceso */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información de Acceso</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Nombre de Usuario *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="nombre_usuario"
                      className={`pl-10 ${errors.username ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username}</p>}
                </div>

                <div>
                  <Label htmlFor="rol_id">Rol *</Label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select
                      value={formData.rol_id?.toString() || ""}
                      onValueChange={(value) => handleInputChange("rol_id", parseInt(value))}
                    >
                      <SelectTrigger className={`pl-10 ${errors.rol_id ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Selecciona un rol" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((rol) => (
                          <SelectItem key={rol.rol_id} value={rol.rol_id.toString()}>
                            {rol.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.rol_id && <p className="text-red-500 text-sm mt-1">{errors.rol_id}</p>}
                </div>
              </div>

              {!user && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className={`pl-10 ${errors.password ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Repite la contraseña"
                        className={`pl-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Estado</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => handleInputChange("activo", checked)}
                />
                <Label htmlFor="activo">Usuario activo</Label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
