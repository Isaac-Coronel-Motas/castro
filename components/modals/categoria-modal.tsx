"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Save, Tag, FileText } from "lucide-react"

interface Categoria {
  categoria_id: number;
  nombre_categoria: string;
  estado: boolean;
  productos_count?: number;
}

interface CategoriaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (categoria: Partial<Categoria>) => Promise<boolean>
  categoria?: Categoria | null
  title: string
}

interface FormData {
  nombre: string
  activo: boolean
}

interface FormErrors {
  nombre?: string
}

export function CategoriaModal({ isOpen, onClose, onSave, categoria, title }: CategoriaModalProps) {
  const [formData, setFormData] = useState<FormData>({
    nombre: "",
    activo: true,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre_categoria || "",
        activo: categoria.estado ?? true,
      })
    } else {
      setFormData({
        nombre: "",
        activo: true,
      })
    }
    setErrors({})
  }, [categoria, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre de la categoría es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = "El nombre no puede exceder 100 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const categoriaData: Partial<Categoria> = {
        nombre_categoria: formData.nombre.trim(),
        estado: formData.activo,
      }

      const success = await onSave(categoriaData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar categoría:", error)
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
            <Tag className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Categoría */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información de la Categoría</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre de la Categoría *</Label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ej: Electrónicos, Ropa, Hogar"
                    className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
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
                <Label htmlFor="activo">Categoría activa</Label>
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
