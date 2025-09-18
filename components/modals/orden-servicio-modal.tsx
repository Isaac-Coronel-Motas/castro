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
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { OrdenServicio, CreateOrdenServicioRequest, UpdateOrdenServicioRequest, OrdenServicioDetalle, OrdenServicioProductoDetalle } from "@/lib/types/servicios-tecnicos"
import { ClipboardList, Calendar, User, Building, Plus, Trash2, Wrench, Package, Clock, AlertCircle, CheckCircle, Play, Pause } from "lucide-react"

interface OrdenServicioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrdenServicioRequest | UpdateOrdenServicioRequest) => Promise<void>
  orden?: OrdenServicio | null
  mode: 'create' | 'edit' | 'view'
}

export function OrdenServicioModal({ isOpen, onClose, onSave, orden, mode }: OrdenServicioModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateOrdenServicioRequest>({
    fecha_orden: new Date().toISOString().split('T')[0],
    estado: 'iniciada',
    progreso: 0,
    prioridad: 'media',
    fecha_estimada: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    observaciones: '',
    tecnico_id: 0,
    sucursal_id: 0,
    presupuesto_id: 0,
    cliente_id: 0,
    servicios: [],
    productos: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (orden && mode !== 'create') {
        setFormData({
          fecha_orden: orden.fecha_orden,
          estado: orden.estado,
          progreso: orden.progreso,
          prioridad: orden.prioridad,
          fecha_estimada: orden.fecha_estimada || '',
          observaciones: orden.observaciones || '',
          tecnico_id: orden.tecnico_id || 0,
          sucursal_id: orden.sucursal_id || 0,
          presupuesto_id: orden.presupuesto_id || 0,
          cliente_id: orden.cliente_id || 0,
          servicios: orden.servicios?.map(s => ({
            servicio_id: s.servicio_id,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario,
            estado_servicio: s.estado_servicio || 'pendiente'
          })) || [],
          productos: orden.productos?.map(p => ({
            producto_id: p.producto_id,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario
          })) || []
        })
      }
    }
  }, [isOpen, orden, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar servicios
      const serviciosRes = await fetch('/api/referencias/servicios')
      const serviciosData = await serviciosRes.json()
      if (serviciosData.success) {
        setServicios(serviciosData.data)
      }

      // Cargar productos
      const productosRes = await fetch('/api/referencias/productos')
      const productosData = await productosRes.json()
      if (productosData.success) {
        setProductos(productosData.data)
      }

      // Cargar presupuestos aprobados
      const presupuestosRes = await fetch('/api/servicios/presupuestos?estado=aprobado')
      const presupuestosData = await presupuestosRes.json()
      if (presupuestosData.success) {
        setPresupuestos(presupuestosData.data)
      }

      // Cargar clientes
      const clientesRes = await fetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar técnicos (usuarios con rol técnico)
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

  const handleServicioChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios?.map((servicio, i) => 
        i === index ? { ...servicio, [field]: value } : servicio
      ) || []
    }))
  }

  const handleProductoChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos?.map((producto, i) => 
        i === index ? { ...producto, [field]: value } : producto
      ) || []
    }))
  }

  const addServicio = () => {
    setFormData(prev => ({
      ...prev,
      servicios: [
        ...(prev.servicios || []),
        {
          servicio_id: 0,
          cantidad: 1,
          precio_unitario: 0,
          estado_servicio: 'pendiente'
        }
      ]
    }))
  }

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      productos: [
        ...(prev.productos || []),
        {
          producto_id: 0,
          cantidad: 1,
          precio_unitario: 0
        }
      ]
    }))
  }

  const removeServicio = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios?.filter((_, i) => i !== index) || []
    }))
  }

  const removeProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos?.filter((_, i) => i !== index) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.tecnico_id) {
      newErrors.tecnico_id = 'El técnico es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.fecha_estimada) {
      newErrors.fecha_estimada = 'La fecha estimada es requerida'
    }

    if (formData.fecha_orden && formData.fecha_estimada && formData.fecha_orden >= formData.fecha_estimada) {
      newErrors.fecha_estimada = 'La fecha estimada debe ser posterior a la fecha de orden'
    }

    if (formData.progreso < 0 || formData.progreso > 100) {
      newErrors.progreso = 'El progreso debe estar entre 0 y 100'
    }

    if (!formData.servicios || formData.servicios.length === 0) {
      newErrors.servicios = 'Debe agregar al menos un servicio'
    }

    formData.servicios?.forEach((servicio, index) => {
      if (!servicio.servicio_id) {
        newErrors[`servicio_${index}_servicio`] = 'El servicio es requerido'
      }
      if (!servicio.cantidad || servicio.cantidad <= 0) {
        newErrors[`servicio_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (!servicio.precio_unitario || servicio.precio_unitario <= 0) {
        newErrors[`servicio_${index}_precio`] = 'El precio unitario debe ser mayor a 0'
      }
    })

    formData.productos?.forEach((producto, index) => {
      if (!producto.producto_id) {
        newErrors[`producto_${index}_producto`] = 'El producto es requerido'
      }
      if (!producto.cantidad || producto.cantidad <= 0) {
        newErrors[`producto_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (!producto.precio_unitario || producto.precio_unitario <= 0) {
        newErrors[`producto_${index}_precio`] = 'El precio unitario debe ser mayor a 0'
      }
    })

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
        : { ...formData, orden_servicio_id: orden?.orden_servicio_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando orden de servicio:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalServicios = () => {
    return formData.servicios?.reduce((total, servicio) => {
      return total + ((servicio.cantidad || 0) * (servicio.precio_unitario || 0))
    }, 0) || 0
  }

  const calculateTotalProductos = () => {
    return formData.productos?.reduce((total, producto) => {
      return total + ((producto.cantidad || 0) * (producto.precio_unitario || 0))
    }, 0) || 0
  }

  const calculateTotalGeneral = () => {
    return calculateTotalServicios() + calculateTotalProductos()
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'iniciada': 'bg-blue-500 text-white',
      'en_proceso': 'bg-yellow-500 text-white',
      'pausada': 'bg-orange-500 text-white',
      'completada': 'bg-green-500 text-white',
      'cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'iniciada': 'Iniciada',
      'en_proceso': 'En Proceso',
      'pausada': 'Pausada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    }
    return labels[estado] || estado
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      'urgente': 'bg-red-500 text-white',
      'alta': 'bg-orange-500 text-white',
      'media': 'bg-yellow-500 text-white',
      'baja': 'bg-green-500 text-white'
    }
    return colores[prioridad] || 'bg-muted text-muted-foreground'
  }

  const getPrioridadLabel = (prioridad: string) => {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
  }

  const getProgresoColor = (progreso: number) => {
    if (progreso >= 80) return 'bg-green-500'
    if (progreso >= 50) return 'bg-yellow-500'
    if (progreso >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Orden de Servicio' : 
               mode === 'edit' ? 'Editar Orden de Servicio' : 
               'Ver Orden de Servicio'}
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
                  <ClipboardList className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_orden">Fecha de Orden</Label>
                    <Input
                      id="fecha_orden"
                      type="date"
                      value={formData.fecha_orden || ''}
                      onChange={(e) => handleInputChange('fecha_orden', e.target.value)}
                      disabled={mode === 'view'}
                    />
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
                        <SelectItem value="iniciada">Iniciada</SelectItem>
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="pausada">Pausada</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="progreso">Progreso (%)</Label>
                    <div className="space-y-2">
                      <Input
                        id="progreso"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.progreso || ''}
                        onChange={(e) => handleInputChange('progreso', parseInt(e.target.value) || 0)}
                        disabled={mode === 'view'}
                        className={errors.progreso ? 'border-red-500' : ''}
                      />
                      <Progress 
                        value={formData.progreso || 0} 
                        className="h-2"
                      />
                    </div>
                    {errors.progreso && (
                      <p className="text-sm text-red-500">{errors.progreso}</p>
                    )}
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
                        <SelectItem value="urgente">Urgente</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="media">Media</SelectItem>
                        <SelectItem value="baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_estimada">Fecha Estimada</Label>
                    <Input
                      id="fecha_estimada"
                      type="date"
                      value={formData.fecha_estimada || ''}
                      onChange={(e) => handleInputChange('fecha_estimada', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_estimada ? 'border-red-500' : ''}
                    />
                    {errors.fecha_estimada && (
                      <p className="text-sm text-red-500">{errors.fecha_estimada}</p>
                    )}
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
                    <Label htmlFor="tecnico_id">Técnico Asignado</Label>
                    <Select
                      value={formData.tecnico_id?.toString()}
                      onValueChange={(value) => handleInputChange('tecnico_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.tecnico_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id.toString()}>
                            {tecnico.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tecnico_id && (
                      <p className="text-sm text-red-500">{errors.tecnico_id}</p>
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
                    <Label htmlFor="presupuesto_id">Presupuesto</Label>
                    <Select
                      value={formData.presupuesto_id?.toString()}
                      onValueChange={(value) => handleInputChange('presupuesto_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar presupuesto" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin presupuesto</SelectItem>
                        {presupuestos.map((presupuesto) => (
                          <SelectItem key={presupuesto.presu_serv_id} value={presupuesto.presu_serv_id.toString()}>
                            #{presupuesto.nro_presupuesto || presupuesto.presu_serv_id} - {presupuesto.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Observaciones de la orden de servicio..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Servicios */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Servicios
                  </CardTitle>
                  {mode !== 'view' && (
                    <Button type="button" onClick={addServicio} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Servicio
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {formData.servicios && formData.servicios.length > 0 ? (
                  <div className="space-y-4">
                    {formData.servicios.map((servicio, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Servicio {index + 1}</h4>
                          {mode !== 'view' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeServicio(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Servicio</Label>
                            <Select
                              value={servicio.servicio_id?.toString()}
                              onValueChange={(value) => handleServicioChange(index, 'servicio_id', parseInt(value))}
                              disabled={mode === 'view'}
                            >
                              <SelectTrigger className={errors[`servicio_${index}_servicio`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Seleccionar servicio" />
                              </SelectTrigger>
                              <SelectContent>
                                {servicios.map((serv) => (
                                  <SelectItem key={serv.servicio_id} value={serv.servicio_id.toString()}>
                                    {serv.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`servicio_${index}_servicio`] && (
                              <p className="text-sm text-red-500">{errors[`servicio_${index}_servicio`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              value={servicio.cantidad || ''}
                              onChange={(e) => handleServicioChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                              disabled={mode === 'view'}
                              className={errors[`servicio_${index}_cantidad`] ? 'border-red-500' : ''}
                            />
                            {errors[`servicio_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`servicio_${index}_cantidad`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Precio Unitario</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={servicio.precio_unitario || ''}
                              onChange={(e) => handleServicioChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              className={errors[`servicio_${index}_precio`] ? 'border-red-500' : ''}
                            />
                            {errors[`servicio_${index}_precio`] && (
                              <p className="text-sm text-red-500">{errors[`servicio_${index}_precio`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Estado del Servicio</Label>
                            <Select
                              value={servicio.estado_servicio || 'pendiente'}
                              onValueChange={(value) => handleServicioChange(index, 'estado_servicio', value)}
                              disabled={mode === 'view'}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pendiente">Pendiente</SelectItem>
                                <SelectItem value="en_proceso">En Proceso</SelectItem>
                                <SelectItem value="completado">Completado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total servicios: ₡{calculateTotalServicios().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay servicios agregados</p>
                    {mode !== 'view' && (
                      <Button type="button" onClick={addServicio} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Servicio
                      </Button>
                    )}
                  </div>
                )}

                {errors.servicios && (
                  <p className="text-sm text-red-500 mt-2">{errors.servicios}</p>
                )}
              </CardContent>
            </Card>

            {/* Productos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos
                  </CardTitle>
                  {mode !== 'view' && (
                    <Button type="button" onClick={addProducto} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {formData.productos && formData.productos.length > 0 ? (
                  <div className="space-y-4">
                    {formData.productos.map((producto, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Producto {index + 1}</h4>
                          {mode !== 'view' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProducto(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Producto</Label>
                            <Select
                              value={producto.producto_id?.toString()}
                              onValueChange={(value) => handleProductoChange(index, 'producto_id', parseInt(value))}
                              disabled={mode === 'view'}
                            >
                              <SelectTrigger className={errors[`producto_${index}_producto`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {productos.map((prod) => (
                                  <SelectItem key={prod.producto_id} value={prod.producto_id.toString()}>
                                    {prod.nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`producto_${index}_producto`] && (
                              <p className="text-sm text-red-500">{errors[`producto_${index}_producto`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              value={producto.cantidad || ''}
                              onChange={(e) => handleProductoChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                              disabled={mode === 'view'}
                              className={errors[`producto_${index}_cantidad`] ? 'border-red-500' : ''}
                            />
                            {errors[`producto_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`producto_${index}_cantidad`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Precio Unitario</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={producto.precio_unitario || ''}
                              onChange={(e) => handleProductoChange(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              className={errors[`producto_${index}_precio`] ? 'border-red-500' : ''}
                            />
                            {errors[`producto_${index}_precio`] && (
                              <p className="text-sm text-red-500">{errors[`producto_${index}_precio`]}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total productos: ₡{calculateTotalProductos().toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos agregados</p>
                    {mode !== 'view' && (
                      <Button type="button" onClick={addProducto} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Producto
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resumen Total */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Resumen de la Orden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <p className="text-sm text-muted-foreground">Progreso General</p>
                    <div className="mt-2">
                      <Progress value={formData.progreso || 0} className="h-3" />
                      <p className="text-lg font-bold mt-2">{formData.progreso || 0}%</p>
                    </div>
                  </div>
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
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="text-right space-y-2">
                    <p className="text-lg font-medium">
                      Total General: ₡{calculateTotalGeneral().toLocaleString()}
                    </p>
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
