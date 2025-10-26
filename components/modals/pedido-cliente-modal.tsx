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
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
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
  const { token } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  
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

  // Cargar datos completos del pedido
  const loadPedidoCompleto = async (ventaId: number) => {
    if (!token) return

    try {
      console.log('🔍 Cargando pedido completo desde API:', ventaId)
      const response = await authenticatedFetch(`/api/ventas/pedidos-clientes/${ventaId}`)
      
      if (response.ok) {
        const data = await response.json()
        
          if (data.success && data.data) {
          console.log('✅ Datos del pedido cargados:', data.data)
          setFormData({
            cliente_id: data.data.cliente_id,
            fecha_venta: data.data.fecha_venta,
            estado: data.data.estado,
            tipo_documento: data.data.tipo_documento,
            observaciones: data.data.observaciones || '',
            productos: data.data.productos?.map((p: any) => ({
              producto_id: p.producto_id,
              cantidad: Number(p.cantidad),
              precio_unitario: Number(p.precio_unitario)
            })) || []
          })
        }
      }
    } catch (error) {
      console.error('❌ Error cargando pedido completo:', error)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadClientes()
      loadProductos()
      
      if (pedido && mode !== 'create') {
        console.log('🔍 Cargando datos del pedido:', pedido)
        // Cargar datos completos desde la API
        loadPedidoCompleto(pedido.venta_id)
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
  }, [isOpen, pedido, mode, token])

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
    if (!token) {
      console.error('No hay token de autenticación')
      return
    }
    
    try {
      const response = await authenticatedFetch('/api/referencias/clientes')
      if (response.ok) {
        const data = await response.json()
        setClientes(data.data || [])
      } else {
        console.error('Error al cargar clientes:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Error al cargar clientes:', error)
    }
  }

  const loadProductos = async () => {
    if (!token) {
      console.error('No hay token de autenticación')
      return
    }
    
    try {
      const response = await authenticatedFetch('/api/ventas/productos-disponibles')
      if (response.ok) {
        const data = await response.json()
        setProductos(data.data || [])
      } else {
        console.error('Error al cargar productos:', response.status, response.statusText)
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
      const cantidad = Number(producto.cantidad) || 0
      const precio = Number(producto.precio_unitario) || 0
      
      if (cantidad <= 0) {
        newErrors[`producto_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (precio <= 0) {
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
      const cantidad = Number(producto.cantidad) || 0
      const precio = Number(producto.precio_unitario) || 0
      return total + (cantidad * precio)
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
      <DialogContent className="max-w-6xl w-full h-[95vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold">
            {mode === 'create' && 'Nuevo Pedido de Cliente'}
            {mode === 'edit' && 'Editar Pedido de Cliente'}
            {mode === 'view' && 'Ver Pedido de Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-8 px-1">
          {/* Información del Pedido */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="cliente_id" className="text-sm font-medium">Cliente *</Label>
                  <Select
                    value={formData.cliente_id.toString()}
                    onValueChange={(value) => setFormData({ ...formData, cliente_id: parseInt(value) })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="mt-2">
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
                  <Label htmlFor="fecha_venta" className="text-sm font-medium">Fecha *</Label>
                  <Input
                    id="fecha_venta"
                    type="date"
                    value={formData.fecha_venta}
                    onChange={(e) => setFormData({ ...formData, fecha_venta: e.target.value })}
                    disabled={isReadOnly}
                    className="mt-2"
                  />
                  {errors.fecha_venta && (
                    <p className="text-sm text-red-500 mt-1">{errors.fecha_venta}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="tipo_documento" className="text-sm font-medium">Tipo de Documento</Label>
                  <Select
                    value={formData.tipo_documento}
                    onValueChange={(value) => setFormData({ ...formData, tipo_documento: value })}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="mt-2">
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
                  <Label htmlFor="estado" className="text-sm font-medium">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: 'abierto' | 'cerrado' | 'cancelado') => 
                      setFormData({ ...formData, estado: value })
                    }
                    disabled={isReadOnly}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2 lg:col-span-3">
                  <Label htmlFor="observaciones" className="text-sm font-medium">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    disabled={isReadOnly}
                    placeholder="Observaciones adicionales sobre el pedido..."
                    className="mt-2 min-h-[100px] resize-y"
                    rows={4}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Productos del Pedido */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Productos del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              {formData.productos.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">No hay productos agregados</p>
                  <p className="text-gray-400 text-sm">Agregue productos desde la sección de búsqueda</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {formData.productos.map((producto, index) => (
                    <div key={index} className="border rounded-lg p-6 bg-white hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-lg">{getProductoNombre(producto.producto_id)}</h4>
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Cantidad</Label>
                          {!isReadOnly ? (
                            <Input
                              type="number"
                              value={producto.cantidad || ''}
                              onChange={(e) => updateProductoCantidad(index, parseInt(e.target.value) || 1)}
                              className="mt-2"
                              min="1"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-2">{producto.cantidad}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Precio Unitario</Label>
                          {!isReadOnly ? (
                            <Input
                              type="number"
                              value={producto.precio_unitario || ''}
                              onChange={(e) => updateProductoPrecio(index, parseFloat(e.target.value) || 0)}
                              className="mt-2"
                              min="0"
                            />
                          ) : (
                            <p className="text-sm text-gray-600 mt-2">${(Number(producto.precio_unitario) || 0).toFixed(2)}</p>
                          )}
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Subtotal</Label>
                          <p className="text-sm font-semibold text-gray-900 mt-2">
                            ${((Number(producto.cantidad) || 0) * (Number(producto.precio_unitario) || 0)).toFixed(2)}
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

          {/* Agregar Productos */}
          {!isReadOnly && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-semibold flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Agregar Productos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <Input
                      placeholder="Buscar productos por nombre o código..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12 text-base"
                    />
                  </div>

                  <ScrollArea className="h-80 border rounded-lg">
                    <div className="space-y-3 p-4">
                      {productosFiltrados.map((producto) => (
                        <div key={producto.producto_id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <h4 className="font-medium text-gray-900">{producto.nombre}</h4>
                                <Badge variant={producto.stock > 0 ? "default" : "destructive"}>
                                  {producto.stock > 0 ? 'Disponible' : 'Sin Stock'}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
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
                                    ${(Number(producto.precio_venta) || 0).toFixed(2)}
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

          {/* Resumen del Pedido */}
          <Card className="bg-gray-50">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Resumen del Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Cliente</p>
                  <p className="text-lg font-semibold text-gray-900">{getClienteNombre(formData.cliente_id)}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Productos</p>
                  <p className="text-lg font-semibold text-gray-900">{formData.productos.length}</p>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-green-600">${getTotal().toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botones de Acción - Fijos en la parte inferior */}
        <div className="flex-shrink-0 flex justify-end gap-4 pt-4 border-t bg-white px-6 py-4">
          <Button variant="outline" onClick={onClose} className="h-11 px-6">
            Cancelar
          </Button>
          {!isReadOnly && (
            <Button onClick={handleSubmit} disabled={loading} className="h-11 px-8">
              {loading ? 'Guardando...' : 'Guardar Pedido'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
