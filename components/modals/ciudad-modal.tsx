"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Ciudad, CiudadFormData } from "@/lib/types/referencias"
import { X, Save, MapPin } from "lucide-react"

interface CiudadModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ciudad?: Ciudad | null
  mode: 'create' | 'edit' | 'view'
  onSave: (data: CiudadFormData) => Promise<void>
}

interface FormErrors {
  nombre?: string
}

export function CiudadModal({ 
  open, 
  onOpenChange, 
  ciudad, 
  mode, 
  onSave 
}: CiudadModalProps) {
  const [formData, setFormData] = useState<CiudadFormData>({
    nombre: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (ciudad) {
      setFormData({
        nombre: ciudad.nombre || "",
      })
    } else {
      setFormData({
        nombre: "",
      })
    }
    setErrors({})
  }, [ciudad, open])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre de la ciudad es requerido'
    } else if (formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error guardando ciudad:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CiudadFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const isReadOnly = mode === 'view'

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${open ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      <div className="relative bg-background rounded-lg shadow-lg w-full max-w-md mx-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-semibold">
              {mode === 'create' && 'Nueva Ciudad'}
              {mode === 'edit' && 'Editar Ciudad'}
              {mode === 'view' && 'Ver Ciudad'}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Información Básica */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                  <MapPin className="h-4 w-4" />
                  Información de la Ciudad
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombre">
                    Nombre de la Ciudad *
                  </Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ej: Asunción, Ciudad del Este, Encarnación..."
                    disabled={isReadOnly}
                    className={errors.nombre ? 'border-red-500' : ''}
                  />
                  {errors.nombre && (
                    <p className="text-sm text-red-500">{errors.nombre}</p>
                  )}
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                {!isReadOnly && (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Guardando...' : 'Guardar'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
