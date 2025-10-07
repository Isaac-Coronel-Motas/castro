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
import { TransferenciaStock, CreateTransferenciaStockRequest, UpdateTransferenciaStockRequest, TransferenciaStockDetalle } from "@/lib/types/compras-adicionales"
import { Package, Calendar, User, Warehouse, Plus, Trash2, ArrowRightLeft, Truck } from "lucide-react"

interface TransferenciaStockModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateTransferenciaStockRequest | UpdateTransferenciaStockRequest) => Promise<void>
  transferencia?: TransferenciaStock | null
  mode: 'create' | 'edit' | 'view'
}

export function TransferenciaStockModal({ isOpen, onClose, onSave, transferencia, mode }: TransferenciaStockModalProps) {
  const { user } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateTransferenciaStockRequest>({
    usuario_id: user?.usuario_id || 0,
    almacen_origen_id: 0,
    almacen_destino_id: 0,
    estado: 'pendiente',
    motivo: '',
    detalles: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [stockDisponible, setStockDisponible] = useState<{ [key: number]: number }>({})

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (transferencia && mode !== 'create') {
        setFormData({
          usuario_id: transferencia.usuario_id,
          almacen_origen_id: transferencia.almacen_origen_id,
          almacen_destino_id: transferencia.almacen_destino_id,
          estado: transferencia.estado,
          motivo: transferencia.motivo || '',
          fecha: transferencia.fecha,
          detalles: []
        })
      }
    }
  }, [isOpen, transferencia, mode])

  const loadInitialData = async () => {
    try {
      console.log('🔍 Cargando datos iniciales para transferencias...')
      
      // Cargar almacenes
      const almacenesRes = await authenticatedFetch.authenticatedFetch('/api/compras/referencias/almacenes')
      const almacenesData = await almacenesRes.json()
      console.log('📡 Respuesta almacenes:', almacenesRes.status, almacenesData.success ? almacenesData.data?.length : 'error')
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }

      // Cargar productos
      const productosRes = await authenticatedFetch.authenticatedFetch('/api/compras/referencias/productos')
      const productosData = await productosRes.json()
      console.log('📡 Respuesta productos:', productosRes.status, productosData.success ? productosData.data?.length : 'error')
      if (productosData.success) {
        setProductos(productosData.data)
      }

      console.log('✅ Datos iniciales cargados exitosamente')
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error)
    }
  }

  const loadStockDisponible = async (almacenId: number) => {
    try {
      // Por ahora, usar el stock de los productos directamente
      // En una implementación real, esto vendría de una API de stock por almacén
      const stockMap: { [key: number]: number } = {}
      productos.forEach((producto) => {
        stockMap[producto.producto_id] = producto.stock || 0
      })
      setStockDisponible(stockMap)
    } catch (error) {
      console.error('Error cargando stock:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Si cambia el almacén de origen, cargar stock disponible
    if (field === 'almacen_origen_id' && value) {
      loadStockDisponible(value)
    }
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleDetalleChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles?.map((detalle, i) => 
        i === index ? { ...detalle, [field]: value } : detalle
      ) || []
    }))
  }

  const addDetalle = () => {
    setFormData(prev => ({
      ...prev,
      detalles: [
        ...(prev.detalles || []),
        {
          producto_id: 0,
          cantidad: 0,
          observaciones: ''
        }
      ]
    }))
  }

  const removeDetalle = (index: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles?.filter((_, i) => i !== index) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.almacen_origen_id) {
      newErrors.almacen_origen_id = 'El almacén de origen es requerido'
    }

    if (!formData.almacen_destino_id) {
      newErrors.almacen_destino_id = 'El almacén de destino es requerido'
    }

    if (formData.almacen_origen_id === formData.almacen_destino_id) {
      newErrors.almacen_destino_id = 'El almacén de destino debe ser diferente al de origen'
    }

    if (!formData.detalles || formData.detalles.length === 0) {
      newErrors.detalles = 'Debe agregar al menos un producto'
    }

    formData.detalles?.forEach((detalle, index) => {
      if (!detalle.producto_id) {
        newErrors[`detalle_${index}_producto`] = 'El producto es requerido'
      }
      if (!detalle.cantidad || detalle.cantidad <= 0) {
        newErrors[`detalle_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      
      // Verificar stock disponible
      if (detalle.producto_id && formData.almacen_origen_id) {
        const stockDisponibleProducto = stockDisponible[detalle.producto_id] || 0
        if (detalle.cantidad > stockDisponibleProducto) {
          newErrors[`detalle_${index}_cantidad`] = `Stock insuficiente. Disponible: ${stockDisponibleProducto}`
        }
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
        : { ...formData, transferencia_id: transferencia?.transferencia_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando transferencia:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalItems = () => {
    return formData.detalles?.length || 0
  }

  const calculateTotalCantidad = () => {
    return formData.detalles?.reduce((total, detalle) => total + (detalle.cantidad || 0), 0) || 0
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-secondary text-secondary-foreground',
      'enviada': 'bg-chart-1 text-white',
      'recibida': 'bg-green-500 text-white',
      'cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const etiquetas: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'enviada': 'Enviada',
      'recibida': 'Recibida',
      'cancelada': 'Cancelada'
    }
    return etiquetas[estado] || estado
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Transferencia de Stock' : 
               mode === 'edit' ? 'Editar Transferencia de Stock' : 
               'Ver Transferencia de Stock'}
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
                  <ArrowRightLeft className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha de la Transferencia</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha || ''}
                      onChange={(e) => handleInputChange('fecha', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha ? 'border-red-500' : ''}
                    />
                    {errors.fecha && (
                      <p className="text-sm text-red-500">{errors.fecha}</p>
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
                        <SelectItem value="enviada">Enviada</SelectItem>
                        <SelectItem value="recibida">Recibida</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="almacen_origen_id">Almacén de Origen</Label>
                    <Select
                      value={formData.almacen_origen_id?.toString()}
                      onValueChange={(value) => handleInputChange('almacen_origen_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.almacen_origen_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar almacén de origen" />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenes.map((almacen) => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.almacen_origen_id && (
                      <p className="text-sm text-red-500">{errors.almacen_origen_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="almacen_destino_id">Almacén de Destino</Label>
                    <Select
                      value={formData.almacen_destino_id?.toString()}
                      onValueChange={(value) => handleInputChange('almacen_destino_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.almacen_destino_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar almacén de destino" />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenes.map((almacen) => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.almacen_destino_id && (
                      <p className="text-sm text-red-500">{errors.almacen_destino_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo">Motivo de la Transferencia</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo || ''}
                    onChange={(e) => handleInputChange('motivo', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Motivo de la transferencia..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la Transferencia */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos a Transferir
                  </CardTitle>
                  {mode !== 'view' && (
                    <Button type="button" onClick={addDetalle} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Producto
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {formData.detalles && formData.detalles.length > 0 ? (
                  <div className="space-y-4">
                    {formData.detalles.map((detalle, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Producto {index + 1}</h4>
                          {mode !== 'view' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDetalle(index)}
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
                              value={detalle.producto_id?.toString()}
                              onValueChange={(value) => handleDetalleChange(index, 'producto_id', parseInt(value))}
                              disabled={mode === 'view'}
                            >
                              <SelectTrigger className={errors[`detalle_${index}_producto`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Seleccionar producto" />
                              </SelectTrigger>
                              <SelectContent>
                                {productos.map((producto) => (
                                  <SelectItem key={producto.producto_id} value={producto.producto_id.toString()}>
                                    {producto.nombre_producto}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`detalle_${index}_producto`] && (
                              <p className="text-sm text-red-500">{errors[`detalle_${index}_producto`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={detalle.cantidad || ''}
                              onChange={(e) => handleDetalleChange(index, 'cantidad', parseFloat(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              className={errors[`detalle_${index}_cantidad`] ? 'border-red-500' : ''}
                              placeholder="Cantidad a transferir..."
                            />
                            {errors[`detalle_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`detalle_${index}_cantidad`]}</p>
                            )}
                            {detalle.producto_id && formData.almacen_origen_id && (
                              <p className="text-xs text-muted-foreground">
                                Stock disponible: {stockDisponible[detalle.producto_id] || 0}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Input
                              type="text"
                              value={detalle.observaciones || ''}
                              onChange={(e) => handleDetalleChange(index, 'observaciones', e.target.value)}
                              disabled={mode === 'view'}
                              placeholder="Observaciones del producto..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total de productos: {calculateTotalItems()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total de cantidad: {calculateTotalCantidad()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos agregados</p>
                    {mode !== 'view' && (
                      <Button type="button" onClick={addDetalle} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Producto
                      </Button>
                    )}
                  </div>
                )}

                {errors.detalles && (
                  <p className="text-sm text-red-500 mt-2">{errors.detalles}</p>
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
