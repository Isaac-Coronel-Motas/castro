"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { PresupuestoProveedor, CreatePresupuestoProveedorRequest, UpdatePresupuestoProveedorRequest } from "@/lib/types/compras"
import { FileCheck, Calendar, User, Building, Percent, DollarSign } from "lucide-react"

interface PresupuestoProveedorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePresupuestoProveedorRequest | UpdatePresupuestoProveedorRequest) => Promise<void>
  presupuesto?: PresupuestoProveedor | null
  mode: 'create' | 'edit' | 'view'
}

export function PresupuestoProveedorModal({ isOpen, onClose, onSave, presupuesto, mode }: PresupuestoProveedorModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreatePresupuestoProveedorRequest>({
    usuario_id: user?.usuario_id || 0,
    proveedor_id: 0,
    estado: 'nuevo',
    observaciones: '',
    monto_presu_prov: 0,
    valido_hasta: '',
    descuento: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [proveedores, setProveedores] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadProveedores()
      if (presupuesto && mode !== 'create') {
        setFormData({
          usuario_id: presupuesto.usuario_id,
          proveedor_id: presupuesto.proveedor_id || 0,
          estado: presupuesto.estado,
          observaciones: presupuesto.observaciones || '',
          monto_presu_prov: presupuesto.monto_presu_prov,
          fecha_presupuesto: presupuesto.fecha_presupuesto,
          valido_hasta: presupuesto.valido_hasta || '',
          descuento: presupuesto.descuento || 0
        })
      }
    }
  }, [isOpen, presupuesto, mode])

  const loadProveedores = async () => {
    try {
      const response = await fetch('/api/referencias/proveedores')
      const data = await response.json()
      if (data.success) {
        setProveedores(data.data)
      }
    } catch (error) {
      console.error('Error cargando proveedores:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido'
    }

    if (formData.monto_presu_prov !== undefined && formData.monto_presu_prov < 0) {
      newErrors.monto_presu_prov = 'El monto no puede ser negativo'
    }

    if (formData.descuento !== undefined && (formData.descuento < 0 || formData.descuento > 100)) {
      newErrors.descuento = 'El descuento debe estar entre 0 y 100'
    }

    if (formData.valido_hasta && formData.fecha_presupuesto) {
      const fechaInicio = new Date(formData.fecha_presupuesto)
      const fechaFin = new Date(formData.valido_hasta)
      if (fechaFin <= fechaInicio) {
        newErrors.valido_hasta = 'La fecha de validez debe ser posterior a la fecha del presupuesto'
      }
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
      const dataToSave = mode === 'create' 
        ? formData 
        : { ...formData, presu_prov_id: presupuesto?.presu_prov_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando presupuesto:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMontoConDescuento = () => {
    if (formData.monto_presu_prov && formData.descuento) {
      return formData.monto_presu_prov - (formData.monto_presu_prov * formData.descuento / 100)
    }
    return formData.monto_presu_prov || 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Presupuesto Proveedor' : 
               mode === 'edit' ? 'Editar Presupuesto Proveedor' : 
               'Ver Presupuesto Proveedor'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_presupuesto">Fecha del Presupuesto</Label>
                    <Input
                      id="fecha_presupuesto"
                      type="date"
                      value={formData.fecha_presupuesto || ''}
                      onChange={(e) => handleInputChange('fecha_presupuesto', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_presupuesto ? 'border-red-500' : ''}
                    />
                    {errors.fecha_presupuesto && (
                      <p className="text-sm text-red-500">{errors.fecha_presupuesto}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => handleInputChange('estado', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.estado ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nuevo">Nuevo</SelectItem>
                        <SelectItem value="enviado">Enviado</SelectItem>
                        <SelectItem value="recibido">Recibido</SelectItem>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                        <SelectItem value="vencido">Vencido</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proveedor_id">Proveedor</Label>
                    <Select
                      value={formData.proveedor_id?.toString()}
                      onValueChange={(value) => handleInputChange('proveedor_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.proveedor_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                      <SelectContent>
                        {proveedores.map((proveedor) => (
                          <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                            {proveedor.nombre_proveedor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.proveedor_id && (
                      <p className="text-sm text-red-500">{errors.proveedor_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valido_hasta">Válido Hasta</Label>
                    <Input
                      id="valido_hasta"
                      type="date"
                      value={formData.valido_hasta || ''}
                      onChange={(e) => handleInputChange('valido_hasta', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.valido_hasta ? 'border-red-500' : ''}
                    />
                    {errors.valido_hasta && (
                      <p className="text-sm text-red-500">{errors.valido_hasta}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_presu_prov">Monto del Presupuesto</Label>
                    <Input
                      id="monto_presu_prov"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_presu_prov || ''}
                      onChange={(e) => handleInputChange('monto_presu_prov', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                      className={errors.monto_presu_prov ? 'border-red-500' : ''}
                    />
                    {errors.monto_presu_prov && (
                      <p className="text-sm text-red-500">{errors.monto_presu_prov}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descuento">Descuento (%)</Label>
                    <Input
                      id="descuento"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.descuento || ''}
                      onChange={(e) => handleInputChange('descuento', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                      className={errors.descuento ? 'border-red-500' : ''}
                    />
                    {errors.descuento && (
                      <p className="text-sm text-red-500">{errors.descuento}</p>
                    )}
                  </div>
                </div>

                {/* Resumen de Montos */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto Original:</span>
                    <span className="font-medium">₡{(formData.monto_presu_prov || 0).toLocaleString()}</span>
                  </div>
                  {formData.descuento && formData.descuento > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Descuento ({formData.descuento}%):</span>
                      <span className="font-medium text-red-600">
                        -₡{((formData.monto_presu_prov || 0) * formData.descuento / 100).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Monto Final:</span>
                    <span className="font-bold text-lg">₡{calculateMontoConDescuento().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            {mode !== 'view' && (
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            )}

            {mode === 'view' && (
              <div className="flex justify-end">
                <Button type="button" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
