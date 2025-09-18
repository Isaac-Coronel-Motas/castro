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
import { PedidoCompra, CreatePedidoCompraRequest, UpdatePedidoCompraRequest, PedidoCompraDetalle } from "@/lib/types/compras"
import { Plus, Trash2, Package, Calendar, User, Building, Warehouse } from "lucide-react"

interface PedidoCompraModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePedidoCompraRequest | UpdatePedidoCompraRequest) => Promise<void>
  pedido?: PedidoCompra | null
  mode: 'create' | 'edit' | 'view'
}

export function PedidoCompraModal({ isOpen, onClose, onSave, pedido, mode }: PedidoCompraModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreatePedidoCompraRequest>({
    usuario_id: user?.usuario_id || 0,
    sucursal_id: 1,
    almacen_id: 1,
    estado: 'pendiente',
    comentario: '',
    detalles: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (pedido && mode !== 'create') {
        setFormData({
          usuario_id: pedido.usuario_id,
          sucursal_id: pedido.sucursal_id,
          almacen_id: pedido.almacen_id,
          estado: pedido.estado,
          comentario: pedido.comentario || '',
          fecha_pedido: pedido.fecha_pedido,
          detalles: []
        })
      }
    }
  }, [isOpen, pedido, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar almacenes
      const almacenesRes = await fetch('/api/almacenes')
      const almacenesData = await almacenesRes.json()
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }

      // Cargar productos
      const productosRes = await fetch('/api/referencias/productos')
      const productosData = await productosRes.json()
      if (productosData.success) {
        setProductos(productosData.data)
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
          cantidad: 1,
          precio_unitario: 0,
          subtotal: 0
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

  const calculateSubtotal = (cantidad: number, precio: number) => {
    return cantidad * precio
  }

  const calculateTotal = () => {
    return formData.detalles?.reduce((total, detalle) => total + (detalle.subtotal || 0), 0) || 0
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.almacen_id) {
      newErrors.almacen_id = 'El almacén es requerido'
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
        : { ...formData, pedido_compra_id: pedido?.pedido_compra_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Pedido de Compra' : 
               mode === 'edit' ? 'Editar Pedido de Compra' : 
               'Ver Pedido de Compra'}
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
                  <Package className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_pedido">Fecha del Pedido</Label>
                    <Input
                      id="fecha_pedido"
                      type="date"
                      value={formData.fecha_pedido || ''}
                      onChange={(e) => handleInputChange('fecha_pedido', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_pedido ? 'border-red-500' : ''}
                    />
                    {errors.fecha_pedido && (
                      <p className="text-sm text-red-500">{errors.fecha_pedido}</p>
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
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado}</p>
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
                    <Label htmlFor="almacen_id">Almacén</Label>
                    <Select
                      value={formData.almacen_id?.toString()}
                      onValueChange={(value) => handleInputChange('almacen_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.almacen_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar almacén" />
                      </SelectTrigger>
                      <SelectContent>
                        {almacenes.map((almacen) => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.almacen_id && (
                      <p className="text-sm text-red-500">{errors.almacen_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comentario">Comentarios</Label>
                  <Textarea
                    id="comentario"
                    value={formData.comentario || ''}
                    onChange={(e) => handleInputChange('comentario', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Comentarios adicionales..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles del Pedido */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos
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

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Producto</Label>
                            <Select
                              value={detalle.producto_id?.toString()}
                              onValueChange={(value) => {
                                const producto = productos.find(p => p.producto_id === parseInt(value))
                                handleDetalleChange(index, 'producto_id', parseInt(value))
                                if (producto) {
                                  handleDetalleChange(index, 'precio_unitario', producto.precio_venta || 0)
                                  handleDetalleChange(index, 'subtotal', calculateSubtotal(detalle.cantidad, producto.precio_venta || 0))
                                }
                              }}
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
                              min="1"
                              value={detalle.cantidad || ''}
                              onChange={(e) => {
                                const cantidad = parseInt(e.target.value) || 0
                                handleDetalleChange(index, 'cantidad', cantidad)
                                handleDetalleChange(index, 'subtotal', calculateSubtotal(cantidad, detalle.precio_unitario || 0))
                              }}
                              disabled={mode === 'view'}
                              className={errors[`detalle_${index}_cantidad`] ? 'border-red-500' : ''}
                            />
                            {errors[`detalle_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`detalle_${index}_cantidad`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Precio Unitario</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={detalle.precio_unitario || ''}
                              onChange={(e) => {
                                const precio = parseFloat(e.target.value) || 0
                                handleDetalleChange(index, 'precio_unitario', precio)
                                handleDetalleChange(index, 'subtotal', calculateSubtotal(detalle.cantidad, precio))
                              }}
                              disabled={mode === 'view'}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Subtotal</Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={detalle.subtotal || ''}
                              disabled
                              className="bg-muted"
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          Total: ₡{calculateTotal().toLocaleString()}
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
