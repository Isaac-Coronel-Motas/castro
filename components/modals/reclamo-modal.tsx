'use client'

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
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { Reclamo, CreateReclamoRequest } from "@/lib/types/servicios-tecnicos"
import { MessageSquare, Calendar, User, Building, AlertTriangle, Clock, CheckCircle, XCircle } from "lucide-react"

interface ReclamoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateReclamoRequest & { reclamo_id?: number }) => Promise<void>
  reclamo?: Reclamo | null
  mode: 'create' | 'edit' | 'view'
}

export function ReclamoModal({ isOpen, onClose, onSave, reclamo, mode }: ReclamoModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateReclamoRequest>({
    cliente_id: 0,
    orden_servicio_id: 0,
    recibido_por: user?.usuario_id || 0,
    gestionado_por: 0,
    descripcion: '',
    resolucion: '',
    fecha_resolucion: '',
    observaciones: '',
    estado: 'pendiente'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [clientes, setClientes] = useState<any[]>([])
  const [ordenesServicio, setOrdenesServicio] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (reclamo && mode !== 'create') {
        setFormData({
          cliente_id: reclamo.cliente_id,
          orden_servicio_id: reclamo.orden_servicio_id || 0,
          recibido_por: reclamo.recibido_por,
          gestionado_por: reclamo.gestionado_por || 0,
          descripcion: reclamo.descripcion,
          resolucion: reclamo.resolucion || '',
          fecha_resolucion: reclamo.fecha_resolucion || '',
          observaciones: reclamo.observaciones || '',
          estado: reclamo.estado
        })
      }
    }
  }, [isOpen, reclamo, mode])

  const loadInitialData = async () => {
    try {
      // Cargar clientes
      const clientesRes = await authenticatedFetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar órdenes de servicio
      const ordenesRes = await authenticatedFetch('/api/servicios/ordenes-servicio')
      const ordenesData = await ordenesRes.json()
      if (ordenesData.success) {
        setOrdenesServicio(ordenesData.data)
      }

      // Cargar técnicos
      const tecnicosRes = await authenticatedFetch('/api/usuarios')
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

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.descripcion) {
      newErrors.descripcion = 'La descripción del reclamo es requerida'
    }

    if (!formData.recibido_por) {
      newErrors.recibido_por = 'El usuario que recibe es requerido'
    }

    if (formData.estado === 'resuelto') {
      if (!formData.resolucion) {
        newErrors.resolucion = 'La resolución es requerida'
      }
      if (!formData.fecha_resolucion) {
        newErrors.fecha_resolucion = 'La fecha de resolución es requerida'
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
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error al guardar reclamo:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-yellow-500 text-white',
      'en_verificacion': 'bg-blue-500 text-white',
      'resuelto': 'bg-green-500 text-white',
      'rechazado': 'bg-red-500 text-white',
      'anulado': 'bg-gray-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_verificacion': 'En Verificación',
      'resuelto': 'Resuelto',
      'rechazado': 'Rechazado',
      'anulado': 'Anulado'
    }
    return labels[estado] || estado
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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
            {/* Información básica */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Información del Reclamo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="descripcion">Descripción del Reclamo *</Label>
                  <Textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleInputChange('descripcion', e.target.value)}
                    placeholder="Describa detalladamente el reclamo..."
                    disabled={mode === 'view'}
                    className={errors.descripcion ? 'border-red-500' : ''}
                    rows={4}
                  />
                  {errors.descripcion && (
                    <p className="text-sm text-red-500 mt-1">{errors.descripcion}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cliente_id">Cliente *</Label>
                    <Select
                      value={formData.cliente_id.toString()}
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
                      <p className="text-sm text-red-500 mt-1">{errors.cliente_id}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="orden_servicio_id">Orden de Servicio</Label>
                    <Select
                      value={formData.orden_servicio_id?.toString() || '0'}
                      onValueChange={(value) => handleInputChange('orden_servicio_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar orden (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin orden específica</SelectItem>
                        {ordenesServicio.map((orden) => (
                          <SelectItem key={orden.orden_servicio_id} value={orden.orden_servicio_id.toString()}>
                            #{orden.orden_servicio_id} - {orden.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Asignación */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Asignación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recibido_por">Recibido por *</Label>
                    <Select
                      value={formData.recibido_por.toString()}
                      onValueChange={(value) => handleInputChange('recibido_por', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.recibido_por ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id.toString()}>
                            {tecnico.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.recibido_por && (
                      <p className="text-sm text-red-500 mt-1">{errors.recibido_por}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="gestionado_por">Gestionado por</Label>
                    <Select
                      value={formData.gestionado_por?.toString() || '0'}
                      onValueChange={(value) => handleInputChange('gestionado_por', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin asignar</SelectItem>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id.toString()}>
                            {tecnico.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado y resolución */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Estado y Resolución
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="estado">Estado del Reclamo</Label>
                  <Select
                    value={formData.estado || 'pendiente'}
                    onValueChange={(value) => handleInputChange('estado', value)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className={errors.estado ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_verificacion">En Verificación</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                      <SelectItem value="anulado">Anulado</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.estado && (
                    <p className="text-sm text-red-500 mt-1">{errors.estado}</p>
                  )}
                </div>

                {formData.estado === 'resuelto' && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fecha_resolucion">Fecha de Resolución *</Label>
                      <Input
                        id="fecha_resolucion"
                        type="date"
                        value={formData.fecha_resolucion || ''}
                        onChange={(e) => handleInputChange('fecha_resolucion', e.target.value)}
                        disabled={mode === 'view'}
                        className={errors.fecha_resolucion ? 'border-red-500' : ''}
                      />
                      {errors.fecha_resolucion && (
                        <p className="text-sm text-red-500 mt-1">{errors.fecha_resolucion}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="resolucion">Resolución *</Label>
                      <Textarea
                        id="resolucion"
                        value={formData.resolucion || ''}
                        onChange={(e) => handleInputChange('resolucion', e.target.value)}
                        placeholder="Describa la resolución..."
                        disabled={mode === 'view'}
                        className={errors.resolucion ? 'border-red-500' : ''}
                        rows={3}
                      />
                      {errors.resolucion && (
                        <p className="text-sm text-red-500 mt-1">{errors.resolucion}</p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Observaciones */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Observaciones Adicionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    placeholder="Observaciones adicionales..."
                    disabled={mode === 'view'}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Botones de acción */}
            {mode !== 'view' && (
              <div className="flex justify-end gap-3">
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