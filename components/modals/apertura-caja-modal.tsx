"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AperturaCierreCaja, CreateAperturaCierreCajaRequest } from "@/lib/types/ventas"
import { X, Save, DollarSign, Calendar, Clock } from "lucide-react"

interface Caja {
  caja_id: number;
  nro_caja: string;
  sucursal_nombre: string;
}

interface AperturaCajaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (apertura: CreateAperturaCierreCajaRequest) => Promise<boolean>
  cajas: Caja[]
  title: string
}

interface FormErrors {
  caja_id?: string
  monto_apertura?: string
}

export function AperturaCajaModal({ isOpen, onClose, onSave, cajas, title }: AperturaCajaModalProps) {
  const [formData, setFormData] = useState<CreateAperturaCierreCajaRequest>({
    caja_id: 0,
    monto_apertura: 0,
    fecha_apertura: new Date().toISOString().split('T')[0],
    estado: 'abierta'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setFormData({
        caja_id: 0,
        monto_apertura: 0,
        fecha_apertura: new Date().toISOString().split('T')[0],
        estado: 'abierta'
      })
      setErrors({})
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.caja_id || formData.caja_id === 0) {
      newErrors.caja_id = "Debe seleccionar una caja"
    }

    if (!formData.monto_apertura || formData.monto_apertura <= 0) {
      newErrors.monto_apertura = "El monto de apertura debe ser mayor a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CreateAperturaCierreCajaRequest, value: any) => {
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const success = await onSave(formData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar apertura de caja:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-blue-600" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="caja_id">Caja *</Label>
            <div className="relative">
              <Select
                value={formData.caja_id?.toString() || ""}
                onValueChange={(value) => handleInputChange("caja_id", parseInt(value))}
              >
                <SelectTrigger className={`${errors.caja_id ? "border-red-500" : ""}`}>
                  <SelectValue placeholder="Selecciona una caja" />
                </SelectTrigger>
                <SelectContent>
                  {cajas.map((caja) => (
                    <SelectItem key={caja.caja_id} value={caja.caja_id.toString()}>
                      {caja.nro_caja} - {caja.sucursal_nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.caja_id && <p className="text-red-500 text-sm mt-1">{errors.caja_id}</p>}
          </div>

          <div>
            <Label htmlFor="fecha_apertura">Fecha de Apertura</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="fecha_apertura"
                type="date"
                value={formData.fecha_apertura || ""}
                onChange={(e) => handleInputChange("fecha_apertura", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="monto_apertura">Monto de Apertura *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="monto_apertura"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_apertura || ""}
                onChange={(e) => handleInputChange("monto_apertura", parseFloat(e.target.value) || 0)}
                className={`pl-10 ${errors.monto_apertura ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
            </div>
            {errors.monto_apertura && <p className="text-red-500 text-sm mt-1">{errors.monto_apertura}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Abrir Caja
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
