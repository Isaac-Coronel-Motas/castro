"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { OrdenServicio, CreateOrdenServicioRequest, UpdateOrdenServicioRequest } from "@/lib/types/servicios-tecnicos"
import { ClipboardList, Plus, Trash2, Wrench, Package } from "lucide-react"

interface OrdenServicioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateOrdenServicioRequest | UpdateOrdenServicioRequest) => Promise<void>
  orden?: OrdenServicio | null
  mode: 'create' | 'edit' | 'view'
}

export function OrdenServicioModal({ isOpen, onClose, onSave, orden, mode }: OrdenServicioModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateOrdenServicioRequest>({
    fecha_solicitud: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    observaciones: '',
    tecnico_id: 0,
    presu_serv_id: 0,
    forma_cobro_id: 0,
    servicios: [],
    productos: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [servicios, setServicios] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [presupuestos, setPresupuestos] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [formasCobro, setFormasCobro] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (orden && mode !== 'create') {
        setFormData({
          fecha_solicitud: orden.fecha_solicitud,
          estado: orden.estado,
          observaciones: orden.observaciones || '',
          tecnico_id: orden.tecnico_id || 0,
          presu_serv_id: orden.presu_serv_id || 0,
          forma_cobro_id: orden.forma_cobro_id || 0,
          servicios: orden.servicios?.map(s => ({
            servicio_id: s.servicio_id,
            cantidad: s.cantidad,
            precio_unitario: s.precio_unitario
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

      // Cargar presupuestos aprobados
      const presupuestosRes = await authenticatedFetch('/api/servicios/presupuestos?estado=aprobado')
      const presupuestosData = await presupuestosRes.json()
      if (presupuestosData.success) {
        setPresupuestos(presupuestosData.data)
      }

      // Cargar formas de cobro
      const formasCobroRes = await authenticatedFetch('/api/referencias/formas-cobro')
      const formasCobroData = await formasCobroRes.json()
      if (formasCobroData.success) {
        setFormasCobro(formasCobroData.data)
      }

      // Cargar técnicos (usuarios con rol técnico)
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

  const addServicio = () => {
    setFormData(prev => ({
      ...prev,
      servicios: [...(prev.servicios || []), {
        servicio_id: 0,
        cantidad: 1,
        precio_unitario: 0
      }]
    }))
  }

  const removeServicio = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios?.filter((_, i) => i !== index) || []
    }))
  }

  const updateServicio = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      servicios: prev.servicios?.map((servicio, i) => 
        i === index ? { ...servicio, [field]: value } : servicio
      ) || []
    }))
  }

  const addProducto = () => {
    setFormData(prev => ({
      ...prev,
      productos: [...(prev.productos || []), {
        producto_id: 0,
        cantidad: 1,
        precio_unitario: 0
      }]
    }))
  }

  const removeProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos?.filter((_, i) => i !== index) || []
    }))
  }

  const updateProducto = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos?.map((producto, i) => 
        i === index ? { ...producto, [field]: value } : producto
      ) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    console.log('Validando formulario...')
    console.log('tecnico_id:', formData.tecnico_id)
    console.log('servicios:', formData.servicios)

    if (!formData.tecnico_id) {
      newErrors.tecnico_id = 'El técnico es requerido'
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

    console.log('Errores encontrados:', newErrors)
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('handleSubmit llamado')
    console.log('formData:', formData)
    
    if (!validateForm()) {
      console.log('Validación falló')
      return
    }

    console.log('Validación pasó, guardando...')
    setLoading(true)
    try {
      await onSave(formData)
      console.log('onSave completado')
    } catch (error) {
      console.error('Error guardando orden de servicio:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalServicios = () => {
    return formData.servicios?.reduce((total, servicio) => 
      total + (servicio.cantidad * servicio.precio_unitario), 0) || 0
  }

  const calculateTotalProductos = () => {
    return formData.productos?.reduce((total, producto) => 
      total + (producto.cantidad * producto.precio_unitario), 0) || 0
  }

  const calculateTotalGeneral = () => {
    return calculateTotalServicios() + calculateTotalProductos()
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
                    <Label htmlFor="fecha_solicitud">Fecha de Solicitud</Label>
                    <Input
                      id="fecha_solicitud"
                      type="date"
                      value={formData.fecha_solicitud || ''}
                      onChange={(e) => handleInputChange('fecha_solicitud', e.target.value)}
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
                        <SelectItem value="en_proceso">En Proceso</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Label htmlFor="presu_serv_id">Presupuesto</Label>
                    <Select
                      value={formData.presu_serv_id?.toString()}
                      onValueChange={(value) => handleInputChange('presu_serv_id', parseInt(value))}
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

                  <div className="space-y-2">
                    <Label htmlFor="forma_cobro_id">Forma de Cobro</Label>
                    <Select
                      value={formData.forma_cobro_id?.toString()}
                      onValueChange={(value) => handleInputChange('forma_cobro_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar forma de cobro" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin forma de cobro</SelectItem>
                        {formasCobro.map((forma) => (
                          <SelectItem key={forma.forma_cobro_id} value={forma.forma_cobro_id.toString()}>
                            {forma.nombre}
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
                    placeholder="Observaciones adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

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
                              onValueChange={(value) => updateServicio(index, 'servicio_id', parseInt(value))}
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
                              onChange={(e) => updateServicio(index, 'cantidad', parseInt(e.target.value) || 0)}
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
                              onChange={(e) => updateServicio(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
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
                          Total Servicios: ${calculateTotalServicios().toLocaleString()}
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
                              onValueChange={(value) => updateProducto(index, 'producto_id', parseInt(value))}
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
                              onChange={(e) => updateProducto(index, 'cantidad', parseInt(e.target.value) || 0)}
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
                              onChange={(e) => updateProducto(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
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
                          Total Productos: ${calculateTotalProductos().toLocaleString()}
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

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Resumen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mt-4 flex justify-end">
                  <div className="text-right space-y-2">
                    <p className="text-lg font-medium">
                      Total General: ${calculateTotalGeneral().toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

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