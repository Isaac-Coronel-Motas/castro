"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { SalidaEquipo, CreateSalidaEquipoRequest, UpdateSalidaEquipoRequest } from "@/lib/types/servicios-tecnicos"
import { PackageCheck, Calendar, User, Building, Phone, MapPin, Truck, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface SalidaEquipoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSalidaEquipoRequest | UpdateSalidaEquipoRequest) => Promise<void>
  salida?: SalidaEquipo | null
  mode: 'create' | 'edit' | 'view'
}

export function SalidaEquipoModal({ isOpen, onClose, onSave, salida, mode }: SalidaEquipoModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateSalidaEquipoRequest>({
    fecha_salida: new Date().toISOString().split('T')[0],
    estado: 'pendiente_notificacion',
    metodo_entrega: 'retiro_taller',
    observaciones: '',
    usuario_id: user?.usuario_id || 0,
    sucursal_id: 0,
    orden_servicio_id: 0,
    cliente_id: 0,
    direccion_entrega: '',
    telefono_contacto: '',
    costo_envio: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (salida && mode !== 'create') {
        setFormData({
          fecha_salida: salida.fecha_salida,
          estado: salida.estado,
          metodo_entrega: salida.metodo_entrega,
          observaciones: salida.observaciones || '',
          usuario_id: salida.usuario_id || 0,
          sucursal_id: salida.sucursal_id || 0,
          orden_servicio_id: salida.orden_servicio_id || 0,
          cliente_id: salida.cliente_id || 0,
          direccion_entrega: salida.direccion_entrega || '',
          telefono_contacto: salida.telefono_contacto || '',
          costo_envio: salida.costo_envio || 0
        })
      }
    }
  }, [isOpen, salida, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar órdenes de servicio completadas
      const ordenesRes = await fetch('/api/servicios/ordenes-servicio?estado=completada')
      const ordenesData = await ordenesRes.json()
      if (ordenesData.success) {
        setOrdenesServicio(ordenesData.data)
      }

      // Cargar clientes
      const clientesRes = await fetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
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

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.orden_servicio_id) {
      newErrors.orden_servicio_id = 'La orden de servicio es requerida'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.fecha_salida) {
      newErrors.fecha_salida = 'La fecha de salida es requerida'
    }

    if (formData.metodo_entrega === 'entrega_domicilio' || formData.metodo_entrega === 'envio_courier') {
      if (!formData.direccion_entrega) {
        newErrors.direccion_entrega = 'La dirección de entrega es requerida'
      }
      if (!formData.telefono_contacto) {
        newErrors.telefono_contacto = 'El teléfono de contacto es requerido'
      }
    }

    if (formData.metodo_entrega === 'envio_courier' && (!formData.costo_envio || formData.costo_envio <= 0)) {
      newErrors.costo_envio = 'El costo de envío es requerido'
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
        : { ...formData, salida_equipo_id: salida?.salida_equipo_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando salida de equipo:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente_notificacion': 'bg-yellow-500 text-white',
      'cliente_notificado': 'bg-blue-500 text-white',
      'listo_retiro': 'bg-green-500 text-white',
      'retirado': 'bg-gray-500 text-white',
      'entrega_domicilio': 'bg-purple-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'pendiente_notificacion': 'Pendiente Notificación',
      'cliente_notificado': 'Cliente Notificado',
      'listo_retiro': 'Listo para Retiro',
      'retirado': 'Retirado',
      'entrega_domicilio': 'Entrega a Domicilio'
    }
    return labels[estado] || estado
  }

  const getMetodoEntregaColor = (metodo: string) => {
    const colores: { [key: string]: string } = {
      'retiro_taller': 'bg-blue-500 text-white',
      'entrega_domicilio': 'bg-purple-500 text-white',
      'envio_courier': 'bg-orange-500 text-white'
    }
    return colores[metodo] || 'bg-muted text-muted-foreground'
  }

  const getMetodoEntregaLabel = (metodo: string) => {
    const labels: { [key: string]: string } = {
      'retiro_taller': 'Retiro en Taller',
      'entrega_domicilio': 'Entrega a Domicilio',
      'envio_courier': 'Envío por Courier'
    }
    return labels[metodo] || metodo
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Salida de Equipo' : 
               mode === 'edit' ? 'Editar Salida de Equipo' : 
               'Ver Salida de Equipo'}
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
                  <PackageCheck className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_salida">Fecha de Salida</Label>
                    <Input
                      id="fecha_salida"
                      type="date"
                      value={formData.fecha_salida || ''}
                      onChange={(e) => handleInputChange('fecha_salida', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_salida ? 'border-red-500' : ''}
                    />
                    {errors.fecha_salida && (
                      <p className="text-sm text-red-500">{errors.fecha_salida}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(value) => handleInputChange('estado', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente_notificacion">Pendiente Notificación</SelectItem>
                        <SelectItem value="cliente_notificado">Cliente Notificado</SelectItem>
                        <SelectItem value="listo_retiro">Listo para Retiro</SelectItem>
                        <SelectItem value="retirado">Retirado</SelectItem>
                        <SelectItem value="entrega_domicilio">Entrega a Domicilio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="metodo_entrega">Método de Entrega</Label>
                    <Select
                      value={formData.metodo_entrega}
                      onValueChange={(value) => handleInputChange('metodo_entrega', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="retiro_taller">Retiro en Taller</SelectItem>
                        <SelectItem value="entrega_domicilio">Entrega a Domicilio</SelectItem>
                        <SelectItem value="envio_courier">Envío por Courier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sucursal_id">Sucursal</Label>
                    <Select
                      value={formData.sucursal_id?.toString()}
                      onValueChange={(value) => handleInputChange('sucursal_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.sucursal_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar sucursal" />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursales.map((sucursal) => (
                          <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id.toString()}>
                            {sucursal.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sucursal_id && (
                      <p className="text-sm text-red-500">{errors.sucursal_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orden_servicio_id">Orden de Servicio</Label>
                    <Select
                      value={formData.orden_servicio_id?.toString()}
                      onValueChange={(value) => handleInputChange('orden_servicio_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.orden_servicio_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar orden" />
                      </SelectTrigger>
                      <SelectContent>
                        {ordenesServicio.map((orden) => (
                          <SelectItem key={orden.orden_servicio_id} value={orden.orden_servicio_id.toString()}>
                            #{orden.nro_orden || orden.orden_servicio_id} - {orden.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.orden_servicio_id && (
                      <p className="text-sm text-red-500">{errors.orden_servicio_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente</Label>
                    <Select
                      value={formData.cliente_id?.toString()}
                      onValueChange={(value) => handleInputChange('cliente_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.cliente_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clientes.map((cliente) => (
                          <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()}>
                            {cliente.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cliente_id && (
                      <p className="text-sm text-red-500">{errors.cliente_id}</p>
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
                    placeholder="Observaciones sobre la salida del equipo..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información de Entrega */}
            {(formData.metodo_entrega === 'entrega_domicilio' || formData.metodo_entrega === 'envio_courier') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Información de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="direccion_entrega">Dirección de Entrega</Label>
                      <Textarea
                        id="direccion_entrega"
                        value={formData.direccion_entrega || ''}
                        onChange={(e) => handleInputChange('direccion_entrega', e.target.value)}
                        disabled={mode === 'view'}
                        placeholder="Dirección completa de entrega..."
                        rows={3}
                        className={errors.direccion_entrega ? 'border-red-500' : ''}
                      />
                      {errors.direccion_entrega && (
                        <p className="text-sm text-red-500">{errors.direccion_entrega}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono_contacto">Teléfono de Contacto</Label>
                      <Input
                        id="telefono_contacto"
                        type="tel"
                        value={formData.telefono_contacto || ''}
                        onChange={(e) => handleInputChange('telefono_contacto', e.target.value)}
                        disabled={mode === 'view'}
                        placeholder="Número de teléfono..."
                        className={errors.telefono_contacto ? 'border-red-500' : ''}
                      />
                      {errors.telefono_contacto && (
                        <p className="text-sm text-red-500">{errors.telefono_contacto}</p>
                      )}
                    </div>

                    {formData.metodo_entrega === 'envio_courier' && (
                      <div className="space-y-2">
                        <Label htmlFor="costo_envio">Costo de Envío</Label>
                        <Input
                          id="costo_envio"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.costo_envio || ''}
                          onChange={(e) => handleInputChange('costo_envio', parseFloat(e.target.value) || 0)}
                          disabled={mode === 'view'}
                          placeholder="0.00"
                          className={errors.costo_envio ? 'border-red-500' : ''}
                        />
                        {errors.costo_envio && (
                          <p className="text-sm text-red-500">{errors.costo_envio}</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Resumen de la Salida
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={getEstadoColor(formData.estado)}>
                      {getEstadoLabel(formData.estado)}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Método de Entrega</p>
                    <Badge className={getMetodoEntregaColor(formData.metodo_entrega)}>
                      {getMetodoEntregaLabel(formData.metodo_entrega)}
                    </Badge>
                  </div>
                  {formData.costo_envio > 0 && (
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Costo de Envío</p>
                      <p className="text-lg font-bold text-foreground">
                        ₡{formData.costo_envio.toLocaleString()}
                      </p>
                    </div>
                  )}
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
