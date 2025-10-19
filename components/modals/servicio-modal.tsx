"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Servicio, ServicioFormData } from "@/lib/types/referencias"
import { X, Save, Settings, DollarSign, FileText } from "lucide-react"
import { useApi } from "@/hooks/use-api"

interface ServicioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (servicio: Partial<Servicio>) => Promise<boolean>
  servicio?: Servicio | null
  title: string
}

interface FormErrors {
  nombre?: string
  precio_base?: string
}

interface TipoServicio {
  tipo_serv_id: number
  descripcion: string
  nombre: string
  activo: boolean
}

export function ServicioModal({ isOpen, onClose, onSave, servicio, title }: ServicioModalProps) {
  const [formData, setFormData] = useState<ServicioFormData>({
    nombre: "",
    descripcion: "",
    precio_base: 0,
    tipo_serv_id: null,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  // Obtener tipos de servicio dinámicamente
  const {
    data: tiposServicio,
    loading: tiposLoading,
    error: tiposError
  } = useApi<TipoServicio>('/api/referencias/tipos-servicio/select')

  useEffect(() => {
    if (servicio) {
      setFormData({
        nombre: servicio.nombre || "",
        descripcion: servicio.descripcion || "",
        precio_base: servicio.precio_base || 0,
        tipo_serv_id: servicio.tipo_serv_id || null,
      })
    } else {
      setFormData({
        nombre: "",
        descripcion: "",
        precio_base: 0,
        tipo_serv_id: null,
      })
    }
    setErrors({})
  }, [servicio, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del servicio es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    } else if (formData.nombre.length > 50) {
      newErrors.nombre = "El nombre no puede exceder 50 caracteres"
    }

    if (formData.precio_base < 0) {
      newErrors.precio_base = "El precio no puede ser negativo"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const servicioData: Partial<Servicio> = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || null,
        precio_base: formData.precio_base,
        tipo_serv_id: formData.tipo_serv_id,
      }

      const success = await onSave(servicioData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar servicio:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ServicioFormData, value: any) => {
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
            <Settings className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Servicio */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información del Servicio</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre del Servicio *</Label>
                <div className="relative">
                  <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ej: Reparación de pantalla, Instalación de software"
                    className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
                <p className="text-gray-500 text-sm mt-1">
                  {formData.nombre.length}/50 caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange("descripcion", e.target.value)}
                    placeholder="Describe los detalles del servicio"
                    rows={3}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="precio_base">Precio Base</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="precio_base"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.precio_base}
                    onChange={(e) => handleInputChange("precio_base", parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`pl-10 ${errors.precio_base ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.precio_base && <p className="text-red-500 text-sm mt-1">{errors.precio_base}</p>}
              </div>

              <div>
                <Label htmlFor="tipo_serv_id">Tipo de Servicio</Label>
                <Select
                  value={formData.tipo_serv_id?.toString() || ""}
                  onValueChange={(value) => handleInputChange("tipo_serv_id", parseInt(value))}
                  disabled={tiposLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={
                      tiposLoading 
                        ? "Cargando tipos..." 
                        : tiposError 
                          ? "Error al cargar tipos" 
                          : "Selecciona un tipo de servicio"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposServicio && tiposServicio.length > 0 ? (
                      tiposServicio.map((tipo) => (
                        <SelectItem key={tipo.tipo_serv_id} value={tipo.tipo_serv_id.toString()}>
                          {tipo.descripcion}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        {tiposLoading ? "Cargando..." : "No hay tipos disponibles"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {tiposError && (
                  <p className="text-red-500 text-sm mt-1">
                    Error al cargar tipos de servicio: {tiposError}
                  </p>
                )}
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
