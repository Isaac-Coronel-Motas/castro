"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Rol } from "@/lib/types/auth"
import { X, Save, Shield, FileText } from "lucide-react"

interface RoleModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (role: Partial<Rol>) => Promise<boolean>
  role?: Rol | null
  title: string
}

interface FormData {
  nombre: string
  descripcion: string
  activo: boolean
}

interface FormErrors {
  nombre?: string
  descripcion?: string
}

export function RoleModal({ isOpen, onClose, onSave, role, title }: RoleModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    descripcion: "",
    activo: true,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (role) {
      setFormData({
        nombre: role.nombre || "",
        descripcion: role.descripcion || "",
        activo: role.activo ?? true,
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        activo: true,
      })
    }
    setErrors({})
  }, [role, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del rol es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres"
    }

    if (formData.descripcion && formData.descripcion.length > 255) {
      newErrors.descripcion = "La descripción no puede exceder 255 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const roleData: Partial<Rol> = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        activo: formData.activo,
      }

      const success = await onSave(roleData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar rol:", error)
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
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Rol */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información del Rol</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre del Rol *</Label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ej: Administrador, Técnico, Vendedor"
                    className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Describe las responsabilidades y permisos de este rol"
                    rows={3}
                    className={`pl-10 ${errors.descripcion ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  {formData.descripcion.length}/255 caracteres
                </p>
              </div>
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
                <Label htmlFor="activo">Rol activo</Label>
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
