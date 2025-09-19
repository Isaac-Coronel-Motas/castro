"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Proveedor, ProveedorFormData } from "@/lib/types/referencias"
import { X, Save, Building, Mail, Phone, MapPin, CreditCard } from "lucide-react"

interface ProveedorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (proveedor: Partial<Proveedor>) => Promise<{ success: boolean; errors?: any[] }>
  proveedor?: Proveedor | null
  title: string
}

interface FormErrors {
  nombre_proveedor?: string
  correo?: string
  telefono?: string
  ruc?: string
}

export function ProveedorModal({ isOpen, onClose, onSave, proveedor, title }: ProveedorModalProps) {
  const [formData, setFormData] = useState<ProveedorFormData>({
    nombre_proveedor: "",
    correo: "",
    telefono: "",
    ruc: "",
    direccion: "",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre_proveedor: proveedor.nombre_proveedor || "",
        correo: proveedor.correo || "",
        telefono: proveedor.telefono || "",
        ruc: proveedor.ruc || "",
        direccion: proveedor.direccion || "",
      })
    } else {
      setFormData({
        nombre_proveedor: "",
        correo: "",
        telefono: "",
        ruc: "",
        direccion: "",
      })
    }
    setErrors({})
  }, [proveedor, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre_proveedor.trim()) {
      newErrors.nombre_proveedor = "El nombre del proveedor es requerido"
    } else if (formData.nombre_proveedor.length < 2) {
      newErrors.nombre_proveedor = "El nombre debe tener al menos 2 caracteres"
    }

    if (formData.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      newErrors.correo = "El email no es válido"
    }

    if (formData.telefono && !/^[\d\s\-\+\(\)]+$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono no es válido"
    }

    if (formData.ruc && !/^[\d\-]+$/.test(formData.ruc)) {
      newErrors.ruc = "El RUC debe contener solo números y guiones"
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
      const proveedorData: Partial<Proveedor> = {
        nombre_proveedor: formData.nombre_proveedor.trim(),
        correo: formData.correo.trim() || null,
        telefono: formData.telefono.trim() || null,
        ruc: formData.ruc.trim() || null,
        direccion: formData.direccion.trim() || null,
      }

      const result = await onSave(proveedorData)
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
      console.error("Error al guardar proveedor:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProveedorFormData, value: any) => {
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
            <Building className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div>
                <Label htmlFor="nombre_proveedor">Nombre del Proveedor *</Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre_proveedor"
                    value={formData.nombre_proveedor}
                    onChange={(e) => handleInputChange("nombre_proveedor", e.target.value)}
                    placeholder="Ingresa el nombre del proveedor"
                    className={`pl-10 ${errors.nombre_proveedor ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre_proveedor && <p className="text-red-500 text-sm mt-1">{errors.nombre_proveedor}</p>}
              </div>

              <div>
                <Label htmlFor="ruc">RUC</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="ruc"
                    value={formData.ruc}
                    onChange={(e) => handleInputChange("ruc", e.target.value)}
                    placeholder="12345678-9"
                    className={`pl-10 ${errors.ruc ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.ruc && <p className="text-red-500 text-sm mt-1">{errors.ruc}</p>}
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="correo">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="correo"
                      type="email"
                      value={formData.correo}
                      onChange={(e) => handleInputChange("correo", e.target.value)}
                      placeholder="proveedor@ejemplo.com"
                      className={`pl-10 ${errors.correo ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.correo && <p className="text-red-500 text-sm mt-1">{errors.correo}</p>}
                </div>

                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                      placeholder="0981234567"
                      className={`pl-10 ${errors.telefono ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange("direccion", e.target.value)}
                    placeholder="Ingresa la dirección completa"
                    rows={3}
                    className="pl-10"
                  />
                </div>
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
