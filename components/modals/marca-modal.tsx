"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Marca, MarcaFormData } from "@/lib/types/referencias"
import { X, Save, Building } from "lucide-react"

interface MarcaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (marca: Partial<Marca>) => Promise<boolean>
  marca?: Marca | null
  title: string
}

interface FormErrors {
  descripcion?: string
}

export function MarcaModal({ isOpen, onClose, onSave, marca, title }: MarcaModalProps) {
  const [formData, setFormData] = useState<MarcaFormData>({
    descripcion: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (marca) {
      setFormData({
        descripcion: marca.descripcion || "",
      })
    } else {
      setFormData({
        descripcion: "",
      })
    }
    setErrors({})
  }, [marca, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = "La descripción de la marca es requerida"
    } else if (formData.descripcion.length < 2) {
      newErrors.descripcion = "La descripción debe tener al menos 2 caracteres"
    } else if (formData.descripcion.length > 100) {
      newErrors.descripcion = "La descripción no puede exceder 100 caracteres"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const marcaData: Partial<Marca> = {
        descripcion: formData.descripcion.trim(),
      }

      const success = await onSave(marcaData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar marca:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof MarcaFormData, value: any) => {
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
            <Building className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la Marca */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información de la Marca</h3>
              
              <div>
                <Label htmlFor="descripcion">Nombre de la Marca *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Ej: Samsung, Apple, HP, Dell"
                    className={`pl-10 ${errors.descripcion ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  {formData.descripcion.length}/100 caracteres
                </p>
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
