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
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { PresupuestoServicio, CreatePresupuestoServicioRequest, UpdatePresupuestoServicioRequest, PresupuestoServicioDetalle, PresupuestoServicioProductoDetalle } from "@/lib/types/servicios-tecnicos"
import { FileText, Calendar, User, Building, Plus, Trash2, Wrench, Package, DollarSign } from "lucide-react"

interface PresupuestoServicioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePresupuestoServicioRequest | UpdatePresupuestoServicioRequest) => Promise<void>
  presupuesto?: PresupuestoServicio | null
  mode: 'create' | 'edit' | 'view'
}

export function PresupuestoServicioModal({ isOpen, onClose, onSave, presupuesto, mode }: PresupuestoServicioModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreatePresupuestoServicioRequest>({
    fecha_presupuesto: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    monto_presu_ser: 0,
    observaciones: '',
    descuento_id: 0,
    usuario_id: user?.usuario_id || 0,
    sucursal_id: 0,
    promocion_id: 0,
    diagnostico_id: 0,
    cliente_id: 0,
    valido_desde: new Date().toISOString().split('T')[0],
    valido_hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    tipo_presu: 'con_diagnostico',
    servicios: [],
    productos: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [servicios, setServicios] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [diagnosticos, setDiagnosticos] = useState<any[]>([])
  const [promociones, setPromociones] = useState<any[]>([])
  const [descuentos, setDescuentos] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (presupuesto && mode !== 'create') {
        setFormData({
          fecha_presupuesto: presupuesto.fecha_presupuesto,
          estado: presupuesto.estado,
          monto_presu_ser: presupuesto.monto_presu_ser,
          observaciones: presupuesto.observaciones || '',
          descuento_id: presupuesto.descuento_id || 0,
          usuario_id: presupuesto.usuario_id || 0,
          sucursal_id: presupuesto.sucursal_id || 0,
          promocion_id: presupuesto.promocion_id || 0,
          diagnostico_id: presupuesto.diagnostico_id || 0,
          cliente_id: presupuesto.cliente_id || 0,
          valido_desde: presupuesto.valido_desde || '',
          valido_hasta: presupuesto.valido_hasta || '',
          tipo_presu: presupuesto.tipo_presu,
          servicios: presupuesto.servicios?.map(s => ({
            servicio_id: s.servicio_id,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario
          })) || [],
          productos: presupuesto.productos?.map(p => ({
            producto_id: p.producto_id,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario
          })) || []
        })
      }
    }
  }, [isOpen, presupuesto, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await authenticatedFetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar servicios
      const serviciosRes = await authenticatedFetch('/api/referencias/servicios')
      const serviciosData = await serviciosRes.json()
      if (serviciosData.success) {
        setServicios(serviciosData.data)
      }

      // Cargar productos
      const productosRes = await authenticatedFetch('/api/referencias/productos')
      const productosData = await productosRes.json()
      if (productosData.success) {
        setProductos(productosData.data)
      }

      // Cargar diagnósticos completados
      const diagnosticosRes = await authenticatedFetch('/api/servicios/diagnosticos?estado_diagnostico=Completado')
      const diagnosticosData = await diagnosticosRes.json()
      if (diagnosticosData.success) {
        setDiagnosticos(diagnosticosData.data)
      }

      // Cargar promociones (API no disponible por ahora)
      setPromociones([])

      // Cargar descuentos (API no disponible por ahora)
      setDescuentos([])

      // Cargar usuarios
      const usuariosRes = await authenticatedFetch('/api/usuarios')
      const usuariosData = await usuariosRes.json()
      if (usuariosData.success) {
        setUsuarios(usuariosData.data)
      }

      // Cargar clientes
      const clientesRes = await authenticatedFetch('/api/referencias/clientes')
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
          precio_unitario: 0
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

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (formData.tipo_presu === 'con_diagnostico' && !formData.diagnostico_id) {
      newErrors.diagnostico_id = 'El diagnóstico es requerido para presupuestos con diagnóstico'
    }

    if (!formData.valido_desde) {
      newErrors.valido_desde = 'La fecha de inicio de validez es requerida'
    }

    if (!formData.valido_hasta) {
      newErrors.valido_hasta = 'La fecha de fin de validez es requerida'
    }

    if (formData.valido_desde && formData.valido_hasta && formData.valido_desde >= formData.valido_hasta) {
      newErrors.valido_hasta = 'La fecha de fin debe ser posterior a la fecha de inicio'
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
        : { ...formData, presu_serv_id: presupuesto?.presu_serv_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando presupuesto:', error)
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
      'pendiente': 'bg-secondary text-secondary-foreground',
      'aprobado': 'bg-green-500 text-white',
      'rechazado': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Presupuesto de Servicio' : 
               mode === 'edit' ? 'Editar Presupuesto de Servicio' : 
               'Ver Presupuesto de Servicio'}
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
                    <Label htmlFor="fecha_presupuesto">Fecha del Presupuesto</Label>
                    <Input
                      id="fecha_presupuesto"
                      type="date"
                      value={formData.fecha_presupuesto || ''}
                      onChange={(e) => handleInputChange('fecha_presupuesto', e.target.value)}
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
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
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
                    <Label htmlFor="usuario_id">Usuario</Label>
                    <Select
                      value={formData.usuario_id?.toString()}
                      onValueChange={(value) => handleInputChange('usuario_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.usuario_id ? 'border-red-500' : ''}>
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
                    {errors.usuario_id && (
                      <p className="text-sm text-red-500">{errors.usuario_id}</p>
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
                    <Label htmlFor="tipo_presu">Tipo de Presupuesto</Label>
                    <Select
                      value={formData.tipo_presu}
                      onValueChange={(value) => handleInputChange('tipo_presu', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="con_diagnostico">Con Diagnóstico</SelectItem>
                        <SelectItem value="sin_diagnostico">Sin Diagnóstico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="diagnostico_id">Diagnóstico</Label>
                    <Select
                      value={formData.diagnostico_id?.toString()}
                      onValueChange={(value) => handleInputChange('diagnostico_id', parseInt(value))}
                      disabled={mode === 'view' || formData.tipo_presu === 'sin_diagnostico'}
                    >
                      <SelectTrigger className={errors.diagnostico_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar diagnóstico" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin diagnóstico</SelectItem>
                        {diagnosticos.map((diagnostico) => (
                          <SelectItem key={diagnostico.diagnostico_id} value={diagnostico.diagnostico_id.toString()}>
                            #{diagnostico.diagnostico_id} - {diagnostico.tecnico_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.diagnostico_id && (
                      <p className="text-sm text-red-500">{errors.diagnostico_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="valido_desde">Válido Desde</Label>
                    <Input
                      id="valido_desde"
                      type="date"
                      value={formData.valido_desde || ''}
                      onChange={(e) => handleInputChange('valido_desde', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.valido_desde ? 'border-red-500' : ''}
                    />
                    {errors.valido_desde && (
                      <p className="text-sm text-red-500">{errors.valido_desde}</p>
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
                    placeholder="Observaciones del presupuesto..."
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

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                    {prod.nombre_producto}
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
                  <DollarSign className="h-5 w-5" />
                  Resumen Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end">
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
