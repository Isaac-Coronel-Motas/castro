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
import { SolicitudServicio, CreateSolicitudServicioRequest, UpdateSolicitudServicioRequest, SolicitudServicioDetalle } from "@/lib/types/servicios-tecnicos"
import { FileText, Calendar, User, Building, MapPin, Plus, Trash2, Wrench, Clock } from "lucide-react"

interface SolicitudServicioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSolicitudServicioRequest | UpdateSolicitudServicioRequest) => Promise<void>
  solicitud?: SolicitudServicio | null
  mode: 'create' | 'edit' | 'view'
}

export function SolicitudServicioModal({ isOpen, onClose, onSave, solicitud, mode }: SolicitudServicioModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateSolicitudServicioRequest>({
    cliente_id: 0,
    direccion: '',
    sucursal_id: 0,
    descripcion_problema: '',
    recepcionado_por: user?.usuario_id || 0,
    fecha_programada: '',
    estado_solicitud: 'Pendiente',
    observaciones: '',
    ciudad_id: 0,
    tipo_atencion: 'Visita',
    servicios: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [clientes, setClientes] = useState<any[]>([])
  const [sucursales, setSucursales] = useState<any[]>([])
  const [ciudades, setCiudades] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (solicitud && mode !== 'create') {
        setFormData({
          cliente_id: solicitud.cliente_id,
          direccion: solicitud.direccion,
          sucursal_id: solicitud.sucursal_id,
          descripcion_problema: solicitud.descripcion_problema || '',
          recepcionado_por: solicitud.recepcionado_por,
          fecha_programada: solicitud.fecha_programada || '',
          estado_solicitud: solicitud.estado_solicitud,
          observaciones: solicitud.observaciones || '',
          ciudad_id: solicitud.ciudad_id || 0,
          tipo_atencion: solicitud.tipo_atencion,
          servicios: solicitud.servicios?.map(s => ({
            servicio_id: s.servicio_id,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario || 0,
            observaciones: s.observaciones || ''
          })) || []
        })
      }
    }
  }, [isOpen, solicitud, mode])

  const loadInitialData = async () => {
    try {
      // Cargar clientes
      const clientesRes = await fetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar ciudades
      const ciudadesRes = await fetch('/api/referencias/ciudades')
      const ciudadesData = await ciudadesRes.json()
      if (ciudadesData.success) {
        setCiudades(ciudadesData.data)
      }

      // Cargar servicios
      const serviciosRes = await fetch('/api/referencias/servicios')
      const serviciosData = await serviciosRes.json()
      if (serviciosData.success) {
        setServicios(serviciosData.data)
      }

      // Cargar usuarios
      const usuariosRes = await fetch('/api/usuarios')
      const usuariosData = await usuariosRes.json()
      if (usuariosData.success) {
        setUsuarios(usuariosData.data)
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

  const addServicio = () => {
    setFormData(prev => ({
      ...prev,
      servicios: [
        ...(prev.servicios || []),
        {
          servicio_id: 0,
          cantidad: 1,
          precio_unitario: 0,
          observaciones: ''
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es requerida'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.recepcionado_por) {
      newErrors.recepcionado_por = 'El usuario que recibe es requerido'
    }

    if (formData.fecha_programada && isNaN(Date.parse(formData.fecha_programada))) {
      newErrors.fecha_programada = 'La fecha programada no es válida'
    }

    formData.servicios?.forEach((servicio, index) => {
      if (!servicio.servicio_id) {
        newErrors[`servicio_${index}_servicio`] = 'El servicio es requerido'
      }
      if (!servicio.cantidad || servicio.cantidad <= 0) {
        newErrors[`servicio_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
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
        : { ...formData, solicitud_id: solicitud?.solicitud_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando solicitud:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalServicios = () => {
    return formData.servicios?.length || 0
  }

  const calculateMontoTotal = () => {
    return formData.servicios?.reduce((total, servicio) => {
      const subtotal = (servicio.cantidad || 0) * (servicio.precio_unitario || 0)
      return total + subtotal
    }, 0) || 0
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'Pendiente': 'bg-secondary text-secondary-foreground',
      'Asignada': 'bg-chart-1 text-white',
      'En proceso': 'bg-chart-2 text-white',
      'Finalizada': 'bg-green-500 text-white',
      'Cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Solicitud de Servicio' : 
               mode === 'edit' ? 'Editar Solicitud de Servicio' : 
               'Ver Solicitud de Servicio'}
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
                  <FileText className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            {cliente.nombre_cliente}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.cliente_id && (
                      <p className="text-sm text-red-500">{errors.cliente_id}</p>
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
                    <Label htmlFor="tipo_atencion">Tipo de Atención</Label>
                    <Select
                      value={formData.tipo_atencion}
                      onValueChange={(value) => handleInputChange('tipo_atencion', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visita">Visita</SelectItem>
                        <SelectItem value="Recepcion">Recepción</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_solicitud">Estado</Label>
                    <Select
                      value={formData.estado_solicitud}
                      onValueChange={(value) => handleInputChange('estado_solicitud', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Asignada">Asignada</SelectItem>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Finalizada">Finalizada</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_programada">Fecha Programada</Label>
                    <Input
                      id="fecha_programada"
                      type="datetime-local"
                      value={formData.fecha_programada || ''}
                      onChange={(e) => handleInputChange('fecha_programada', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_programada ? 'border-red-500' : ''}
                    />
                    {errors.fecha_programada && (
                      <p className="text-sm text-red-500">{errors.fecha_programada}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ciudad_id">Ciudad</Label>
                    <Select
                      value={formData.ciudad_id?.toString()}
                      onValueChange={(value) => handleInputChange('ciudad_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ciudad" />
                      </SelectTrigger>
                      <SelectContent>
                        {ciudades.map((ciudad) => (
                          <SelectItem key={ciudad.ciudad_id} value={ciudad.ciudad_id.toString()}>
                            {ciudad.nombre_ciudad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <Textarea
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => handleInputChange('direccion', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Dirección completa del cliente..."
                    rows={3}
                    className={errors.direccion ? 'border-red-500' : ''}
                  />
                  {errors.direccion && (
                    <p className="text-sm text-red-500">{errors.direccion}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion_problema">Descripción del Problema</Label>
                  <Textarea
                    id="descripcion_problema"
                    value={formData.descripcion_problema || ''}
                    onChange={(e) => handleInputChange('descripcion_problema', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Describe el problema reportado por el cliente..."
                    rows={4}
                  />
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

            {/* Servicios Solicitados */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Servicios Solicitados
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
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Input
                              type="text"
                              value={servicio.observaciones || ''}
                              onChange={(e) => handleServicioChange(index, 'observaciones', e.target.value)}
                              disabled={mode === 'view'}
                              placeholder="Observaciones del servicio..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total de servicios: {calculateTotalServicios()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Monto total: ₡{calculateMontoTotal().toLocaleString()}
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
              </CardContent>
            </Card>

            {/* Información de Usuario */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Información de Usuario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="recepcionado_por">Recepcionado por</Label>
                  <Select
                    value={formData.recepcionado_por?.toString()}
                    onValueChange={(value) => handleInputChange('recepcionado_por', parseInt(value))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className={errors.recepcionado_por ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.usuario_id} value={usuario.usuario_id.toString()}>
                          {usuario.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recepcionado_por && (
                    <p className="text-sm text-red-500">{errors.recepcionado_por}</p>
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
