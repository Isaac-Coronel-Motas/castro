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
import { Reclamo, CreateReclamoRequest, UpdateReclamoRequest } from "@/lib/types/servicios-tecnicos"
import { MessageSquare, Calendar, User, Building, AlertTriangle, Clock, CheckCircle, XCircle, Star } from "lucide-react"

interface ReclamoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateReclamoRequest | UpdateReclamoRequest) => Promise<void>
  reclamo?: Reclamo | null
  mode: 'create' | 'edit' | 'view'
}

export function ReclamoModal({ isOpen, onClose, onSave, reclamo, mode }: ReclamoModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateReclamoRequest>({
    fecha_reclamo: new Date().toISOString().split('T')[0],
    tipo_reclamo: 'garantia',
    descripcion: '',
    estado: 'abierto',
    prioridad: 'media',
    observaciones: '',
    usuario_id: user?.usuario_id || 0,
    sucursal_id: 0,
    cliente_id: 0,
    orden_servicio_id: 0,
    tecnico_asignado_id: 0,
    fecha_resolucion: '',
    solucion_aplicada: '',
    satisfaccion_cliente: 0,
    costo_resolucion: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (reclamo && mode !== 'create') {
        setFormData({
          fecha_reclamo: reclamo.fecha_reclamo,
          tipo_reclamo: reclamo.tipo_reclamo,
          descripcion: reclamo.descripcion,
          estado: reclamo.estado,
          prioridad: reclamo.prioridad,
          observaciones: reclamo.observaciones || '',
          usuario_id: reclamo.usuario_id || 0,
          sucursal_id: reclamo.sucursal_id || 0,
          cliente_id: reclamo.cliente_id || 0,
          orden_servicio_id: reclamo.orden_servicio_id || 0,
          tecnico_asignado_id: reclamo.tecnico_asignado_id || 0,
          fecha_resolucion: reclamo.fecha_resolucion || '',
          solucion_aplicada: reclamo.solucion_aplicada || '',
          satisfaccion_cliente: reclamo.satisfaccion_cliente || 0,
          costo_resolucion: reclamo.costo_resolucion || 0
        })
      }
    }
  }, [isOpen, reclamo, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar clientes
      const clientesRes = await fetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar órdenes de servicio
      const ordenesRes = await fetch('/api/servicios/ordenes-servicio')
      const ordenesData = await ordenesRes.json()
      if (ordenesData.success) {
        setOrdenesServicio(ordenesData.data)
      }

      // Cargar técnicos
      const tecnicosRes = await fetch('/api/usuarios?rol=tecnico')
      const tecnicosData = await tecnicosRes.json()
      if (tecnicosData.success) {
        setTecnicos(tecnicosData.data)
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

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción del reclamo es requerida'
    }

    if (!formData.fecha_reclamo) {
      newErrors.fecha_reclamo = 'La fecha del reclamo es requerida'
    }

    if (formData.estado === 'resuelto' || formData.estado === 'cerrado') {
      if (!formData.fecha_resolucion) {
        newErrors.fecha_resolucion = 'La fecha de resolución es requerida'
      }
      if (!formData.solucion_aplicada) {
        newErrors.solucion_aplicada = 'La solución aplicada es requerida'
      }
    }

    if (formData.estado === 'resuelto' && formData.satisfaccion_cliente <= 0) {
      newErrors.satisfaccion_cliente = 'La satisfacción del cliente es requerida'
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
        : { ...formData, reclamo_id: reclamo?.reclamo_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando reclamo:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'abierto': 'bg-red-500 text-white',
      'en_proceso': 'bg-blue-500 text-white',
      'resuelto': 'bg-green-500 text-white',
      'cerrado': 'bg-gray-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'abierto': 'Abierto',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    }
    return labels[estado] || estado
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      'alta': 'bg-red-500 text-white',
      'media': 'bg-yellow-500 text-white',
      'baja': 'bg-green-500 text-white'
    }
    return colores[prioridad] || 'bg-muted text-muted-foreground'
  }

  const getPrioridadLabel = (prioridad: string) => {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
  }

  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      'garantia': 'bg-purple-500 text-white',
      'calidad_servicio': 'bg-blue-500 text-white',
      'tiempo_entrega': 'bg-orange-500 text-white',
      'atencion_cliente': 'bg-pink-500 text-white'
    }
    return colores[tipo] || 'bg-muted text-muted-foreground'
  }

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      'garantia': 'Garantía',
      'calidad_servicio': 'Calidad Servicio',
      'tiempo_entrega': 'Tiempo Entrega',
      'atencion_cliente': 'Atención Cliente'
    }
    return labels[tipo] || tipo
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Reclamo' : 
               mode === 'edit' ? 'Editar Reclamo' : 
               'Ver Reclamo'}
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
                  <MessageSquare className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_reclamo">Fecha del Reclamo</Label>
                    <Input
                      id="fecha_reclamo"
                      type="date"
                      value={formData.fecha_reclamo || ''}
                      onChange={(e) => handleInputChange('fecha_reclamo', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_reclamo ? 'border-red-500' : ''}
                    />
                    {errors.fecha_reclamo && (
                      <p className="text-sm text-red-500">{errors.fecha_reclamo}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_reclamo">Tipo de Reclamo</Label>
                    <Select
                      value={formData.tipo_reclamo}
                      onValueChange={(value) => handleInputChange('tipo_reclamo', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="garantia">Garantía</SelectItem>
                        <SelectItem value="calidad_servicio">Calidad Servicio</SelectItem>
                        <SelectItem value="tiempo_entrega">Tiempo Entrega</SelectItem>
                        <SelectItem value="atencion_cliente">Atención Cliente</SelectItem>
                      </SelectContent>
                    </Select>
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
                        <SelectItem value="abierto">Abierto</SelectItem>
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="resuelto">Resuelto</SelectItem>
                        <SelectItem value="cerrado">Cerrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad</Label>
                    <Select
                      value={formData.prioridad}
                      onValueChange={(value) => handleInputChange('prioridad', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
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

                  <div className="space-y-2">
                    <Label htmlFor="orden_servicio_id">Orden de Servicio</Label>
                    <Select
                      value={formData.orden_servicio_id?.toString()}
                      onValueChange={(value) => handleInputChange('orden_servicio_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar orden" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin orden asociada</SelectItem>
                        {ordenesServicio.map((orden) => (
                          <SelectItem key={orden.orden_servicio_id} value={orden.orden_servicio_id.toString()}>
                            #{orden.nro_orden || orden.orden_servicio_id} - {orden.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tecnico_asignado_id">Técnico Asignado</Label>
                    <Select
                      value={formData.tecnico_asignado_id?.toString()}
                      onValueChange={(value) => handleInputChange('tecnico_asignado_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin técnico asignado</SelectItem>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id.toString()}>
                            {tecnico.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción del Reclamo</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion || ''}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Describa el reclamo del cliente..."
                    rows={4}
                    className={errors.descripcion ? 'border-red-500' : ''}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500">{errors.descripcion}</p>
                  )}
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

            {/* Información de Resolución */}
            {(formData.estado === 'resuelto' || formData.estado === 'cerrado') && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Información de Resolución
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fecha_resolucion">Fecha de Resolución</Label>
                      <Input
                        id="fecha_resolucion"
                        type="date"
                        value={formData.fecha_resolucion || ''}
                        onChange={(e) => handleInputChange('fecha_resolucion', e.target.value)}
                        disabled={mode === 'view'}
                        className={errors.fecha_resolucion ? 'border-red-500' : ''}
                      />
                      {errors.fecha_resolucion && (
                        <p className="text-sm text-red-500">{errors.fecha_resolucion}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costo_resolucion">Costo de Resolución</Label>
                      <Input
                        id="costo_resolucion"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.costo_resolucion || ''}
                        onChange={(e) => handleInputChange('costo_resolucion', parseFloat(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solucion_aplicada">Solución Aplicada</Label>
                    <Textarea
                      id="solucion_aplicada"
                      value={formData.solucion_aplicada || ''}
                      onChange={(e) => handleInputChange('solucion_aplicada', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="Describa la solución aplicada..."
                      rows={4}
                      className={errors.solucion_aplicada ? 'border-red-500' : ''}
                    />
                    {errors.solucion_aplicada && (
                      <p className="text-sm text-red-500">{errors.solucion_aplicada}</p>
                    )}
                  </div>

                  {formData.estado === 'resuelto' && (
                    <div className="space-y-2">
                      <Label>Satisfacción del Cliente</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Button
                            key={star}
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleInputChange('satisfaccion_cliente', star)}
                            disabled={mode === 'view'}
                            className="p-1 h-auto"
                          >
                            <Star
                              className={`h-6 w-6 ${
                                star <= (formData.satisfaccion_cliente || 0)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </Button>
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          ({formData.satisfaccion_cliente || 0}/5)
                        </span>
                      </div>
                      {errors.satisfaccion_cliente && (
                        <p className="text-sm text-red-500">{errors.satisfaccion_cliente}</p>
                      )}
                    </div>
                  )}
                </CardContent>
            </Card>

            {/* Resumen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Resumen del Reclamo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge className={getEstadoColor(formData.estado)}>
                      {getEstadoLabel(formData.estado)}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Prioridad</p>
                    <Badge className={getPrioridadColor(formData.prioridad)}>
                      {getPrioridadLabel(formData.prioridad)}
                    </Badge>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <Badge className={getTipoColor(formData.tipo_reclamo)}>
                      {getTipoLabel(formData.tipo_reclamo)}
                    </Badge>
                  </div>
                  {formData.satisfaccion_cliente > 0 && (
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Satisfacción</p>
                      {renderStars(formData.satisfaccion_cliente)}
                    </div>
                  )}
                </div>
                {formData.costo_resolucion > 0 && (
                  <div className="mt-4 flex justify-end">
                    <div className="text-right space-y-2">
                      <p className="text-lg font-medium">
                        Costo de Resolución: ₡{formData.costo_resolucion.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
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
