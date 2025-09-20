"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AperturaCierreCaja } from "@/lib/types/ventas"
import { X, Save, DollarSign, Calculator, Clock } from "lucide-react"

interface CierreCajaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (aperturaId: number, montoCierre: number, observaciones?: string) => Promise<boolean>
  apertura: AperturaCierreCaja | null
  title: string
}

interface FormErrors {
  monto_cierre?: string
}

export function CierreCajaModal({ isOpen, onClose, onSave, apertura, title }: CierreCajaModalProps) {
  const [formData, setFormData] = useState({
    monto_cierre: 0,
    observaciones: ""
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && apertura) {
      // Calcular monto teórico (monto inicial + ventas + cobros)
      const montoTeorico = (apertura.monto_apertura || 0) + 
                          (apertura.total_ventas || 0) + 
                          (apertura.total_cobros || 0)
      
      setFormData({
        monto_cierre: montoTeorico,
        observaciones: ""
      })
      setErrors({})
    }
  }, [isOpen, apertura])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.monto_cierre || formData.monto_cierre < 0) {
      newErrors.monto_cierre = "El monto de cierre debe ser mayor o igual a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: string, value: any) => {
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
    if (!validateForm() || !apertura) {
      return
    }

    setLoading(true)
    try {
      const success = await onSave(
        apertura.apertura_cierre_id, 
        formData.monto_cierre, 
        formData.observaciones
      )
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error al cerrar caja:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !apertura) return null

  const montoTeorico = (apertura.monto_apertura || 0) + 
                      (apertura.total_ventas || 0) + 
                      (apertura.total_cobros || 0)
  
  const diferencia = formData.monto_cierre - montoTeorico

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-lg mx-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-red-600" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Información de la caja */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Información de la Caja</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Caja:</span>
                <p className="font-medium">{apertura.caja_nro}</p>
              </div>
              <div>
                <span className="text-gray-600">Sucursal:</span>
                <p className="font-medium">{apertura.sucursal_nombre}</p>
              </div>
              <div>
                <span className="text-gray-600">Fecha Apertura:</span>
                <p className="font-medium">{apertura.fecha_apertura}</p>
              </div>
              <div>
                <span className="text-gray-600">Monto Inicial:</span>
                <p className="font-medium">₡{apertura.monto_apertura?.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Resumen de movimientos */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Resumen de Movimientos</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Ventas:</span>
                <p className="font-medium">₡{(apertura.total_ventas || 0).toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Cobros:</span>
                <p className="font-medium">₡{(apertura.total_cobros || 0).toFixed(2)}</p>
              </div>
              <div className="col-span-2">
                <span className="text-gray-600">Monto Teórico:</span>
                <p className="font-medium text-lg">₡{montoTeorico.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Monto de cierre */}
          <div>
            <Label htmlFor="monto_cierre">Monto de Cierre *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="monto_cierre"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_cierre || ""}
                onChange={(e) => handleInputChange("monto_cierre", parseFloat(e.target.value) || 0)}
                className={`pl-10 ${errors.monto_cierre ? "border-red-500" : ""}`}
                placeholder="0.00"
              />
            </div>
            {errors.monto_cierre && <p className="text-red-500 text-sm mt-1">{errors.monto_cierre}</p>}
          </div>

          {/* Diferencia */}
          {formData.monto_cierre !== montoTeorico && (
            <div className={`p-3 rounded-lg ${diferencia >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2">
                <Calculator className={`h-4 w-4 ${diferencia >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                <span className={`font-medium ${diferencia >= 0 ? 'text-green-800' : 'text-red-800'}`}>
                  Diferencia: ₡{diferencia.toFixed(2)}
                </span>
              </div>
              <p className={`text-sm mt-1 ${diferencia >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {diferencia >= 0 ? 'Sobrante' : 'Faltante'}
              </p>
            </div>
          )}

          {/* Observaciones */}
          <div>
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones}
              onChange={(e) => handleInputChange("observaciones", e.target.value)}
              placeholder="Observaciones sobre el cierre de caja..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={loading} variant="destructive">
              {loading ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Cerrando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Cerrar Caja
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
