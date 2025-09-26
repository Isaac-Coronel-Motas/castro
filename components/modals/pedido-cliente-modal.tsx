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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PedidoCliente, PedidoFormData, ProductoDisponible, Cliente } from "@/lib/types/pedidos-clientes"
import { Plus, Minus, Trash2, Search, Package, DollarSign, User } from "lucide-react"

interface PedidoClienteModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (pedido: PedidoFormData) => Promise<boolean>
  pedido?: PedidoCliente | null
  mode: 'create' | 'edit' | 'view'
}

export function PedidoClienteModal({ 
  isOpen, 
  onClose, 
  onSave, 
  pedido, 
  mode 
}: PedidoClienteModalProps) {
  const [formData, setFormData] = useState<PedidoFormData>({
    cliente_id: 0,
    fecha_venta: new Date().toISOString().split('T')[0],
    estado: 'abierto',
    tipo_documento: 'Pedido',
    observaciones: '',
    productos: []
  })

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<ProductoDisponible[]>([])
  const [productosFiltrados, setProductosFiltrados] = useState<ProductoDisponible[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadClientes()
      loadProductos()
      
      if (pedido && mode !== 'create') {
        setFormData({
          cliente_id: pedido.cliente_id,
          fecha_venta: pedido.fecha_venta,
          estado: pedido.estado,
          tipo_documento: pedido.tipo_documento,
          observaciones: '',
          productos: pedido.productos?.map(p => ({
            producto_id: p.producto_id,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario
          })) || []
        })
      } else {
        setFormData({
          cliente_id: 0,
          fecha_venta: new Date().toISOString().split('T')[0],
          estado: 'abierto',
          tipo_documento: 'Pedido',
          observaciones: '',
          productos: []
        })
      }
    }
  }, [isOpen, pedido, mode])

  // Filtrar productos
  useEffect(() => {
    if (searchTerm) {
      const filtered = productos.filter(p => 
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.codigo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setProductosFiltrados(filtered)
    } else {
      setProductosFiltrados(productos.slice(0, 20)) // Mostrar solo los primeros 20
    }
  }, [searchTerm, productos])

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/referencias/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const loadProductos = async () => {
    try {
      const response = await fetch('/api/ventas/productos-disponibles')
      if (response.ok) {
        const data = await response.json()
        setProductos(data.data || [])
      }
    } catch (error) {
      console.error('Error al cargar productos:', error)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.fecha_venta) {
      newErrors.fecha_venta = 'La fecha es requerida'
    }

    if (formData.productos.length === 0) {
      newErrors.productos = 'Debe agregar al menos un producto'
    }

    formData.productos.forEach((producto, index) => {
      if (producto.cantidad <= 0) {
        newErrors[`producto_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (producto.precio_unitario <= 0) {
        newErrors[`producto_${index}_precio`] = 'El precio debe ser mayor a 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      const success = await onSave(formData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar pedido:', error)
    } finally {
      setLoading(false)
    }
  }

  const addProducto = (producto: ProductoDisponible) => {
    const existingIndex = formData.productos.findIndex(p => p.producto_id === producto.producto_id)
    
    if (existingIndex >= 0) {
      // Incrementar cantidad del producto existente
      const newProductos = [...formData.productos]
      newProductos[existingIndex].cantidad += 1
      setFormData({ ...formData, productos: newProductos })
    } else {
      // Agregar nuevo producto
      setFormData({
        ...formData,
        productos: [
          ...formData.productos,
          {
            producto_id: producto.producto_id,
            cantidad: 1,
            precio_unitario: producto.precio_venta
          }
        ]
      })
    }
  }

  const removeProducto = (index: number) => {
    const newProductos = formData.productos.filter((_, i) => i !== index)
    setFormData({ ...formData, productos: newProductos })
  }

  const updateProductoCantidad = (index: number, cantidad: number) => {
    const newProductos = [...formData.productos]
    newProductos[index].cantidad = cantidad
    setFormData({ ...formData, productos: newProductos })
  }

  const updateProductoPrecio = (index: number, precio: number) => {
    const newProductos = [...formData.productos]
    newProductos[index].precio_unitario = precio
    setFormData({ ...formData, productos: newProductos })
  }

  const getTotal = () => {
    return formData.productos.reduce((total, producto) => {
      return total + (producto.cantidad * producto.precio_unitario)
    }, 0)
  }

  const getProductoNombre = (productoId: number) => {
    const producto = productos.find(p => p.producto_id === productoId)
    return producto?.nombre || 'Producto no encontrado'
  }

  const getClienteNombre = (clienteId: number) => {
    const cliente = clientes.find(c => c.cliente_id === clienteId)
    return cliente?.nombre || 'Cliente no encontrado'
  }

  const isReadOnly = mode === 'view'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Nuevo Pedido de Cliente'}
            {mode === 'edit' && 'Editar Pedido de Cliente'}
            {mode === 'view' && 'Ver Pedido de Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full overflow-y-auto">
          {/* Información del Pedido */}
          <div className="xl:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="cliente_id">Cliente *</Label>
                  <Select
                    value={formData.cliente_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: parseInt(value) })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
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
                  <Label htmlFor="fecha_venta">Fecha *</Label>
                  <Input
                    id="fecha_venta"
                    type="date"
                    value={formData.fecha_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                    disabled={isReadOnly}
                  />
                  {errors.fecha_venta && (
                    <p className="text-sm text-red-500 mt-1">{errors.fecha_venta}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo_documento">Tipo de Documento</Label>
                  <Select
                    value={formData.tipo_documento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pedido">Pedido</SelectItem>
                      <SelectItem value="Presupuesto">Presupuesto</SelectItem>
                      <SelectItem value="Factura">Factura</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: 'abierto' | 'cerrado' | 'cancelado') => 
                      setFormData({ ...formData, estado: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    disabled={isReadOnly}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumen del Pedido */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>Cliente:</span>
                  <span className="font-medium">{getClienteNombre(formData.cliente_id)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Productos:</span>
                  <span className="font-medium">{formData.productos.length}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Productos */}
          <div className="xl:col-span-2 space-y-4">
            {/* Lista de Productos Agregados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                {formData.productos.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay productos agregados</p>
                ) : (
                  <div className="space-y-3">
                    {formData.productos.map((producto, index) => (
                      <div key={index} className="border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{getProductoNombre(producto.producto_id)}</h4>
                          </div>
                          {!isReadOnly && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeProducto(index)}
                              className="ml-2"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Cantidad</Label>
                            {!isReadOnly ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateProductoCantidad(index, Math.max(1, producto.cantidad - 1))}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  value={producto.cantidad}
                                  onChange={(e) => updateProductoCantidad(index, parseInt(e.target.value) || 1)}
                                  className="w-16 text-center h-8"
                                  min="1"
                                />
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateProductoCantidad(index, producto.cantidad + 1)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">{producto.cantidad}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Precio Unitario</Label>
                            {!isReadOnly ? (
                              <Input
                                type="number"
                                value={producto.precio_unitario}
                                onChange={(e) => updateProductoPrecio(index, parseFloat(e.target.value) || 0)}
                                className="mt-1 h-8"
                                step="0.01"
                                min="0"
                              />
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">${producto.precio_unitario.toFixed(2)}</p>
                            )}
                          </div>
                          
                          <div>
                            <Label className="text-sm font-medium text-gray-700">Subtotal</Label>
                            <p className="text-sm font-semibold text-gray-900 mt-1">
                              ${(producto.cantidad * producto.precio_unitario).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.productos && (
                  <p className="text-sm text-red-500 mt-2">{errors.productos}</p>
                )}
              </CardContent>
            </Card>

            {/* Buscar y Agregar Productos */}
            {!isReadOnly && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Agregar Productos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    <ScrollArea className="h-80">
                      <div className="space-y-3">
                        {productosFiltrados.map((producto) => (
                          <div key={producto.producto_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Package className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{producto.nombre}</span>
                                  <Badge variant={producto.estado_color as any} className="text-xs">
                                    {producto.estado_stock}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Código:</span>
                                    <p>{producto.codigo || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Categoría:</span>
                                    <p>{producto.nombre_categoria}</p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Stock:</span>
                                    <p className={producto.stock > 0 ? 'text-green-600' : 'text-red-600'}>
                                      {producto.stock}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium">Precio:</span>
                                    <p className="flex items-center gap-1 text-green-600 font-semibold">
                                      <DollarSign className="h-3 w-3" />
                                      {producto.precio_venta.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => addProducto(producto)}
                                disabled={producto.stock === 0}
                                className="ml-4"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Agregar
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
