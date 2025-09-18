"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Cliente, ClienteFormData } from "@/lib/types/referencias"
import { X, Save, User, Mail, Phone, MapPin, CreditCard, CheckCircle, XCircle } from "lucide-react"

interface ClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (cliente: Partial<Cliente>) => Promise<boolean>
  cliente?: Cliente | null
  title: string
}

interface FormErrors {
  nombre?: string
  email?: string
  telefono?: string
  ruc?: string
}

export function ClienteModal({ isOpen, onClose, onSave, cliente, title }: ClienteModalProps) {
  const [formData, setFormData] = useState<ClienteFormData>({
    nombre: "",
    direccion: "",
    ruc: "",
    telefono: "",
    email: "",
    estado: "activo",
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cliente) {
      setFormData({
        nombre: cliente.nombre || "",
        direccion: cliente.direccion || "",
        ruc: cliente.ruc || "",
        telefono: cliente.telefono || "",
        email: cliente.email || "",
        estado: cliente.estado || "activo",
      })
    } else {
      setFormData({
        nombre: "",
        direccion: "",
        ruc: "",
        telefono: "",
        email: "",
        estado: "activo",
      })
    }
    setErrors({})
  }, [cliente, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre del cliente es requerido"
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
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
    try {
      const clienteData: Partial<Cliente> = {
        nombre: formData.nombre.trim(),
        direccion: formData.direccion.trim() || null,
        ruc: formData.ruc.trim() || null,
        telefono: formData.telefono.trim() || null,
        email: formData.email.trim() || null,
        estado: formData.estado,
      }

      const success = await onSave(clienteData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar cliente:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ClienteFormData, value: any) => {
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
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div>
                <Label htmlFor="nombre">Nombre del Cliente *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => handleInputChange("nombre", e.target.value)}
                    placeholder="Ingresa el nombre del cliente"
                    className={`pl-10 ${errors.nombre ? "border-red-500" : ""}`}
                  />
                </div>
                {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
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

              <div>
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={formData.estado}
                  onValueChange={(value) => handleInputChange("estado", value as 'activo' | 'inactivo')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Activo
                      </div>
                    </SelectItem>
                    <SelectItem value="inactivo">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-600" />
                        Inactivo
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Información de Contacto */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información de Contacto</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="cliente@ejemplo.com"
                      className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
