"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Minus, Trash2, Calculator, User, CreditCard, Package, Calendar } from "lucide-react"
import { useCreateVenta } from "@/hooks/use-ventas"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface Producto {
  producto_id: number
  nombre_producto: string
  cod_product: string
  precio_costo: number
  precio_venta: number
  stock: number
  categoria_nombre: string
}

interface Cliente {
  cliente_id: number
  nombre: string
  telefono: string
  email: string
  ruc: string
}

interface FormaCobro {
  forma_cobro_id: number
  nombre: string
  activo: boolean
}

interface Caja {
  caja_id: number
  nro_caja: string
  sucursal_nombre: string
  activo: boolean
}

interface ProductoVenta {
  producto_id: number
  nombre_producto: string
  cod_product: string
  cantidad: number
  precio_unitario: number
  descuento: number
  subtotal: number
}

interface NuevaVentaData {
  cliente_id?: number
  caja_id?: number
  forma_cobro_id?: number
  tipo_documento?: string
  condicion_pago: string
  observaciones?: string
  productos: ProductoVenta[]
  monto_gravada_5: number
  monto_gravada_10: number
  monto_exenta: number
  monto_iva: number
  monto_venta: number
}

export function ModalNuevaVenta({ onVentaCreated }: { onVentaCreated?: () => void }) {
  const { token } = useAuth()
  const { createVenta, loading: creatingVenta, error: createError } = useCreateVenta()
  
  // Estados para datos del formulario
  const [formData, setFormData] = useState<NuevaVentaData>({
    condicion_pago: 'contado',
    productos: [],
    monto_gravada_5: 0,
    monto_gravada_10: 0,
    monto_exenta: 0,
    monto_iva: 0,
    monto_venta: 0
  })

  // Estados para datos de referencia
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [formasCobro, setFormasCobro] = useState<FormaCobro[]>([])
  const [cajas, setCajas] = useState<Caja[]>([])
  
  // Estados de carga
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [loadingProductos, setLoadingProductos] = useState(false)
  const [loadingFormasCobro, setLoadingFormasCobro] = useState(false)
  const [loadingCajas, setLoadingCajas] = useState(false)
  
  // Estados del modal
  const [isOpen, setIsOpen] = useState(false)
  const [searchCliente, setSearchCliente] = useState("")
  const [searchProducto, setSearchProducto] = useState("")

  // Cargar datos de referencia al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadReferenceData()
    }
  }, [isOpen])

  // Calcular totales cuando cambian los productos
  useEffect(() => {
    calculateTotals()
  }, [formData.productos])

  const loadReferenceData = async () => {
    await Promise.all([
      loadClientes(),
      loadProductos(),
      loadFormasCobro(),
      loadCajas()
    ])
  }

  const loadClientes = async () => {
    setLoadingClientes(true)
    try {
      const response = await fetch('/api/referencias/clientes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setClientes(data.data || [])
      }
    } catch (error) {
      console.error('Error loading clientes:', error)
    } finally {
      setLoadingClientes(false)
    }
  }

  const loadProductos = async () => {
    setLoadingProductos(true)
    try {
      const response = await fetch('/api/referencias/productos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setProductos(data.data || [])
      }
    } catch (error) {
      console.error('Error loading productos:', error)
    } finally {
      setLoadingProductos(false)
    }
  }

  const loadFormasCobro = async () => {
    setLoadingFormasCobro(true)
    try {
      const response = await fetch('/api/referencias/formas-cobro', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormasCobro(data.data || [])
      }
    } catch (error) {
      console.error('Error loading formas cobro:', error)
    } finally {
      setLoadingFormasCobro(false)
    }
  }

  const loadCajas = async () => {
    setLoadingCajas(true)
    try {
      const response = await fetch('/api/ventas/cajas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setCajas(data.data || [])
      }
    } catch (error) {
      console.error('Error loading cajas:', error)
    } finally {
      setLoadingCajas(false)
    }
  }

  const calculateTotals = () => {
    let montoGravada5 = 0
    let montoGravada10 = 0
    let montoExenta = 0
    let montoVenta = 0

    formData.productos.forEach(producto => {
      const subtotal = producto.cantidad * producto.precio_unitario - producto.descuento
      montoVenta += subtotal
      
      // Asumir que todos los productos tienen IVA 10% por simplicidad
      // En producción esto debería venir de la configuración del producto
      montoGravada10 += subtotal
    })

    const montoIVA = montoGravada5 * 0.05 + montoGravada10 * 0.10

    setFormData(prev => ({
      ...prev,
      monto_gravada_5: montoGravada5,
      monto_gravada_10: montoGravada10,
      monto_exenta: montoExenta,
      monto_iva: montoIVA,
      monto_venta: montoVenta
    }))
  }

  const addProducto = (producto: Producto) => {
    const productoVenta: ProductoVenta = {
      producto_id: producto.producto_id,
      nombre_producto: producto.nombre_producto,
      cod_product: producto.cod_product,
      cantidad: 1,
      precio_unitario: Number(producto.precio_venta || 0),
      descuento: 0,
      subtotal: Number(producto.precio_venta || 0)
    }

    setFormData(prev => ({
      ...prev,
      productos: [...prev.productos, productoVenta]
    }))
  }

  const updateProducto = (index: number, field: keyof ProductoVenta, value: number) => {
    setFormData(prev => {
      const newProductos = [...prev.productos]
      newProductos[index] = {
        ...newProductos[index],
        [field]: value,
        subtotal: field === 'cantidad' || field === 'precio_unitario' || field === 'descuento' 
          ? (newProductos[index].cantidad * newProductos[index].precio_unitario) - newProductos[index].descuento
          : newProductos[index].subtotal
      }
      return { ...prev, productos: newProductos }
    })
  }

  const removeProducto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      productos: prev.productos.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.productos.length === 0) {
      toast({
        title: "Error",
        description: "Debe agregar al menos un producto",
        variant: "destructive"
      })
      return
    }

    try {
      const ventaData = {
        ...formData,
        fecha_venta: new Date().toISOString().split('T')[0],
        estado: 'abierto'
      }

      const nuevaVenta = await createVenta(ventaData)
      
      if (nuevaVenta) {
        toast({
          title: "Éxito",
          description: "Venta creada correctamente",
        })
        
        // Resetear formulario
        setFormData({
          condicion_pago: 'contado',
          productos: [],
          monto_gravada_5: 0,
          monto_gravada_10: 0,
          monto_exenta: 0,
          monto_iva: 0,
          monto_venta: 0
        })
        
        setIsOpen(false)
        onVentaCreated?.()
      }
    } catch (error) {
      console.error('Error creating venta:', error)
      toast({
        title: "Error",
        description: "Error al crear la venta",
        variant: "destructive"
      })
    }
  }

  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
    cliente.telefono.includes(searchCliente) ||
    cliente.ruc.includes(searchCliente)
  )

  const filteredProductos = productos.filter(producto =>
    producto.nombre_producto.toLowerCase().includes(searchProducto.toLowerCase()) ||
    producto.cod_product.toLowerCase().includes(searchProducto.toLowerCase())
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Venta
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Nueva Venta
          </DialogTitle>
          <DialogDescription>
            Complete los datos para crear una nueva venta
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Cliente */}
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente</Label>
                  <div className="space-y-2">
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchCliente}
                      onChange={(e) => setSearchCliente(e.target.value)}
                    />
                    <Select onValueChange={(value) => {
                      if (value !== "loading-clientes") {
                        setFormData(prev => ({ ...prev, cliente_id: parseInt(value) }))
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingClientes ? (
                          <SelectItem value="loading-clientes" disabled>Cargando...</SelectItem>
                        ) : (
                          filteredClientes.map(cliente => (
                            <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()}>
                              {cliente.nombre} - {cliente.telefono}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Caja */}
                <div className="space-y-2">
                  <Label htmlFor="caja">Caja</Label>
                  <Select onValueChange={(value) => {
                    if (value !== "loading-cajas") {
                      setFormData(prev => ({ ...prev, caja_id: parseInt(value) }))
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar caja" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingCajas ? (
                        <SelectItem value="loading-cajas" disabled>Cargando...</SelectItem>
                      ) : (
                        cajas.filter(caja => caja.activo).map(caja => (
                          <SelectItem key={caja.caja_id} value={caja.caja_id.toString()}>
                            Caja {caja.nro_caja} - {caja.sucursal_nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Forma de Cobro */}
                <div className="space-y-2">
                  <Label htmlFor="forma_cobro">Forma de Cobro</Label>
                  <Select onValueChange={(value) => {
                    if (value !== "loading-formas-cobro") {
                      setFormData(prev => ({ ...prev, forma_cobro_id: parseInt(value) }))
                    }
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar forma de cobro" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingFormasCobro ? (
                        <SelectItem value="loading-formas-cobro" disabled>Cargando...</SelectItem>
                      ) : (
                        formasCobro.filter(fc => fc.activo).map(fc => (
                          <SelectItem key={fc.forma_cobro_id} value={fc.forma_cobro_id.toString()}>
                            {fc.nombre}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Condición de Pago */}
                <div className="space-y-2">
                  <Label htmlFor="condicion_pago">Condición de Pago</Label>
                  <Select 
                    value={formData.condicion_pago} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, condicion_pago: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="contado">Contado</SelectItem>
                      <SelectItem value="crédito">Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  placeholder="Observaciones adicionales..."
                  value={formData.observaciones || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Productos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buscar Productos */}
              <div className="space-y-2">
                <Label>Agregar Productos</Label>
                <Input
                  placeholder="Buscar productos..."
                  value={searchProducto}
                  onChange={(e) => setSearchProducto(e.target.value)}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {loadingProductos ? (
                    <div className="col-span-full text-center py-4">Cargando productos...</div>
                  ) : (
                    filteredProductos.map(producto => (
                      <div key={producto.producto_id} className="border rounded p-2 hover:bg-muted cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{producto.nombre_producto}</div>
                            <div className="text-xs text-muted-foreground">{producto.cod_product}</div>
                            <div className="text-xs text-muted-foreground">Stock: {producto.stock}</div>
                            <div className="text-sm font-medium">₡{Number(producto.precio_venta || 0).toLocaleString()}</div>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => addProducto(producto)}
                            disabled={producto.stock <= 0}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Lista de Productos Seleccionados */}
              {formData.productos.length > 0 && (
                <div className="space-y-2">
                  <Label>Productos Seleccionados</Label>
                  <div className="space-y-2">
                    {formData.productos.map((producto, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{producto.nombre_producto}</div>
                            <div className="text-sm text-muted-foreground">{producto.cod_product}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateProducto(index, 'cantidad', Math.max(1, producto.cantidad - 1))}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                value={producto.cantidad}
                                onChange={(e) => updateProducto(index, 'cantidad', parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                                min="1"
                              />
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => updateProducto(index, 'cantidad', producto.cantidad + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <Input
                              type="number"
                              value={producto.precio_unitario}
                              onChange={(e) => updateProducto(index, 'precio_unitario', parseFloat(e.target.value) || 0)}
                              className="w-24"
                              step="0.01"
                            />
                            <Input
                              type="number"
                              value={producto.descuento}
                              onChange={(e) => updateProducto(index, 'descuento', parseFloat(e.target.value) || 0)}
                              className="w-20"
                              step="0.01"
                              placeholder="Desc."
                            />
                            <div className="w-20 text-right font-medium">
                              ₡{producto.subtotal.toLocaleString()}
                            </div>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeProducto(index)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Resumen de Totales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₡{formData.monto_venta.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (10%):</span>
                  <span>₡{formData.monto_iva.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>₡{(formData.monto_venta + formData.monto_iva).toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={creatingVenta || formData.productos.length === 0}>
              {creatingVenta ? "Creando..." : "Crear Venta"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
