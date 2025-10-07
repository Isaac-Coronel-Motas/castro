"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { OrdenCompra, CreateOrdenCompraRequest, UpdateOrdenCompraRequest } from "@/lib/types/compras"
import { ShoppingBag, Calendar, User, Building, Warehouse, DollarSign, Truck, Package } from "lucide-react"

interface OrdenCompraModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrdenCompraRequest | UpdateOrdenCompraRequest) => Promise<void>
  orden?: OrdenCompra | null
  mode: 'create' | 'edit' | 'view'
}

export function OrdenCompraModal({ isOpen, onClose, onSave, orden, mode }: OrdenCompraModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateOrdenCompraRequest>({
    proveedor_id: 0,
    usuario_id: user?.usuario_id || 0,
    estado: 'pendiente',
    observaciones: '',
    monto_oc: 0,
    fecha_entrega: '',
    prioridad: 'media'
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [proveedores, setProveedores] = useState<any[]>([])
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (orden && mode !== 'create') {
        setFormData({
          proveedor_id: orden.proveedor_id,
          usuario_id: orden.usuario_id,
          presu_prov_id: orden.presu_prov_id,
          estado: orden.estado,
          observaciones: orden.observaciones || '',
          monto_oc: orden.monto_oc,
          fecha_orden: orden.fecha_orden,
          fecha_entrega: orden.fecha_entrega || '',
          prioridad: orden.prioridad || 'media',
          almacen_id: orden.almacen_id
        })
      }
    }
  }, [isOpen, orden, mode])

  const loadInitialData = async () => {
    try {
      // Cargar proveedores
      const proveedoresRes = await authenticatedFetch('/api/referencias/proveedores')
      const proveedoresData = await proveedoresRes.json()
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
      }

      // Cargar presupuestos
      const presupuestosRes = await authenticatedFetch('/api/compras/presupuestos')
      const presupuestosData = await presupuestosRes.json()
      if (presupuestosData.success) {
        setPresupuestos(presupuestosData.data)
      }

      // Cargar almacenes
      const almacenesRes = await authenticatedFetch('/api/referencias/almacenes')
      const almacenesData = await almacenesRes.json()
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
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

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido'
    }

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (formData.monto_oc !== undefined && formData.monto_oc < 0) {
      newErrors.monto_oc = 'El monto no puede ser negativo'
    }

    if (formData.fecha_entrega && formData.fecha_orden) {
      const fechaOrden = new Date(formData.fecha_orden)
      const fechaEntrega = new Date(formData.fecha_entrega)
      if (fechaEntrega <= fechaOrden) {
        newErrors.fecha_entrega = 'La fecha de entrega debe ser posterior a la fecha de la orden'
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
        : { ...formData, orden_compra_id: orden?.orden_compra_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando orden:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200'
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'baja': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  const getPrioridadLabel = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'Alta'
      case 'media': return 'Media'
      case 'baja': return 'Baja'
      default: return prioridad
    }
  }

  const calculateProgreso = () => {
    if (!formData.fecha_orden || !formData.fecha_entrega) return 0
    
    const fechaInicio = new Date(formData.fecha_orden)
    const fechaFin = new Date(formData.fecha_entrega)
    const hoy = new Date()
    
    const totalDias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    const diasTranscurridos = Math.ceil((hoy.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))
    
    if (totalDias <= 0) return 100
    if (diasTranscurridos <= 0) return 0
    
    return Math.min(Math.round((diasTranscurridos / totalDias) * 100), 100)
  }

  const calculateDiasRestantes = () => {
    if (!formData.fecha_entrega) return 0
    
    const fechaEntrega = new Date(formData.fecha_entrega)
    const hoy = new Date()
    
    return Math.ceil((fechaEntrega.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  }

  if (!isOpen) return null

  const progreso = calculateProgreso()
  const diasRestantes = calculateDiasRestantes()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Orden de Compra' : 
               mode === 'edit' ? 'Editar Orden de Compra' : 
               'Ver Orden de Compra'}
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
                  <ShoppingBag className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_orden">Fecha de la Orden</Label>
                    <Input
                      id="fecha_orden"
                      type="date"
                      value={formData.fecha_orden || ''}
                      onChange={(e) => handleInputChange('fecha_orden', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_orden ? 'border-red-500' : ''}
                    />
                    {errors.fecha_orden && (
                      <p className="text-sm text-red-500">{errors.fecha_orden}</p>
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
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobada">Aprobada</SelectItem>
                        <SelectItem value="rechazada">Rechazada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
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
                    <Label htmlFor="presu_prov_id">Presupuesto</Label>
                    <Select
                      value={formData.presu_prov_id?.toString() || 'no-presupuesto'}
                      onValueChange={(value) => handleInputChange('presu_prov_id', value && value !== 'no-presupuesto' ? parseInt(value) : undefined)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar presupuesto (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-presupuesto">Sin presupuesto</SelectItem>
                        {presupuestos.map((presupuesto) => (
                          <SelectItem key={presupuesto.presu_prov_id} value={presupuesto.presu_prov_id.toString()}>
                            {presupuesto.nro_comprobante} - {presupuesto.proveedor_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="almacen_id">Almacén</Label>
                    <Select
                      value={formData.almacen_id?.toString() || 'no-almacen'}
                      onValueChange={(value) => handleInputChange('almacen_id', value && value !== 'no-almacen' ? parseInt(value) : undefined)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar almacén (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-almacen">Sin almacén</SelectItem>
                        {almacenes.map((almacen) => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
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

            {/* Información Financiera y Entrega */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera y Entrega
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_oc">Monto de la Orden</Label>
                    <Input
                      id="monto_oc"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_oc || ''}
                      onChange={(e) => handleInputChange('monto_oc', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                      className={errors.monto_oc ? 'border-red-500' : ''}
                    />
                    {errors.monto_oc && (
                      <p className="text-sm text-red-500">{errors.monto_oc}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_entrega">Fecha de Entrega</Label>
                    <Input
                      id="fecha_entrega"
                      type="date"
                      value={formData.fecha_entrega || ''}
                      onChange={(e) => handleInputChange('fecha_entrega', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_entrega ? 'border-red-500' : ''}
                    />
                    {errors.fecha_entrega && (
                      <p className="text-sm text-red-500">{errors.fecha_entrega}</p>
                    )}
                  </div>
                </div>

                {/* Información de Progreso */}
                {formData.fecha_orden && formData.fecha_entrega && (
                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Progreso de la Orden</span>
                      <span className="text-sm font-medium">{progreso}%</span>
                    </div>
                    <Progress value={progreso} className="h-2" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Días restantes: {diasRestantes}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getPrioridadColor(formData.prioridad || 'media')}>
                          {getPrioridadLabel(formData.prioridad || 'media')}
                        </Badge>
                      </div>
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
