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
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { useAuth } from "@/contexts/auth-context"
import { 
  getTipoOperacionColor, 
  getTipoOperacionLabel, 
  getNotaEstadoColor, 
  getNotaEstadoLabel 
} from "@/lib/utils/compras-client"
import { 
  NotaCreditoDebito, 
  CreateNotaCreditoDebitoRequest, 
  UpdateNotaCreditoDebitoRequest 
} from "@/lib/types/compras-adicionales"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog"
import { 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  User, 
  Building, 
  Package,
  DollarSign,
  AlertCircle
} from "lucide-react"

interface NotaCreditoDebitoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateNotaCreditoDebitoRequest | UpdateNotaCreditoDebitoRequest) => Promise<void>
  nota?: NotaCreditoDebito | null
  tipoOperacion: 'compra' | 'venta'
}

export function NotaCreditoDebitoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  nota, 
  tipoOperacion 
}: NotaCreditoDebitoModalProps) {
  const { user } = useAuth()
  const authenticatedFetch = useAuthenticatedFetch()
  
  const [formData, setFormData] = useState<CreateNotaCreditoDebitoRequest>({
    tipo_operacion: tipoOperacion,
    proveedor_id: undefined,
    cliente_id: undefined,
    sucursal_id: 1,
    almacen_id: 1,
    usuario_id: user?.usuario_id || 0,
    fecha_registro: new Date().toISOString().split('T')[0],
    motivo: '',
    estado: 'activo',
    referencia_id: 0,
    monto_nc: 0,
    monto_gravada_5: 0,
    monto_gravada_10: 0,
    monto_exenta: 0,
    monto_iva: 0,
    items: []
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  const isEdit = !!nota
  const isCompra = tipoOperacion === 'compra'

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (isEdit && nota) {
        loadNotaData()
      } else {
        resetForm()
      }
    }
  }, [isOpen, nota, tipoOperacion])

  const loadInitialData = async () => {
    try {
      console.log('🔍 Cargando datos iniciales...')
      
      const [proveedoresRes, clientesRes, sucursalesRes, almacenesRes, productosRes] = await Promise.all([
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/proveedores'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/clientes'),
        authenticatedFetch.authenticatedFetch('/api/sucursales'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/almacenes'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/productos')
      ])

      console.log('📡 Respuestas recibidas:', {
        proveedores: proveedoresRes.status,
        clientes: clientesRes.status,
        sucursales: sucursalesRes.status,
        almacenes: almacenesRes.status,
        productos: productosRes.status
      })

      const proveedoresData = await proveedoresRes.json()
      const clientesData = await clientesRes.json()
      const sucursalesData = await sucursalesRes.json()
      const almacenesData = await almacenesRes.json()
      const productosData = await productosRes.json()

      console.log('📊 Datos parseados:', {
        proveedores: proveedoresData.success ? proveedoresData.data?.length : 'error',
        clientes: clientesData.success ? clientesData.data?.length : 'error',
        sucursales: sucursalesData.success ? sucursalesData.data?.length : 'error',
        almacenes: almacenesData.success ? almacenesData.data?.length : 'error',
        productos: productosData.success ? productosData.data?.length : 'error'
      })

      if (proveedoresData.success) setProveedores(proveedoresData.data)
      if (clientesData.success) setClientes(clientesData.data)
      if (sucursalesData.success) setSucursales(sucursalesData.data)
      if (almacenesData.success) setAlmacenes(almacenesData.data)
      if (productosData.success) setProductos(productosData.data)

      console.log('✅ Datos cargados exitosamente')
    } catch (error) {
      console.error('❌ Error cargando datos iniciales:', error)
    }
  }

  const loadNotaData = () => {
    if (!nota) return

    setFormData({
      tipo_operacion: nota.tipo_operacion,
      proveedor_id: nota.proveedor_id,
      cliente_id: nota.cliente_id,
      sucursal_id: nota.sucursal_id,
      almacen_id: nota.almacen_id,
      usuario_id: nota.usuario_id,
      fecha_registro: nota.fecha_registro,
      motivo: nota.motivo || '',
      estado: nota.estado,
      referencia_id: nota.referencia_id,
      monto_nc: nota.monto_nc || 0,
      monto_gravada_5: nota.monto_gravada_5 || 0,
      monto_gravada_10: nota.monto_gravada_10 || 0,
      monto_exenta: nota.monto_exenta || 0,
      monto_iva: nota.monto_iva || 0,
      items: nota.detalles?.map(d => ({
        producto_id: d.producto_id,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      })) || []
    })
  }

  const resetForm = () => {
    setFormData({
      tipo_operacion: tipoOperacion,
      proveedor_id: undefined,
      cliente_id: undefined,
      sucursal_id: 1,
      almacen_id: 1,
      usuario_id: user?.usuario_id || 0,
      fecha_registro: new Date().toISOString().split('T')[0],
      motivo: '',
      estado: 'activo',
      referencia_id: 0,
      monto_nc: 0,
      monto_gravada_5: 0,
      monto_gravada_10: 0,
      monto_exenta: 0,
      monto_iva: 0,
      items: []
    })
    setErrors({})
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), { producto_id: 0, cantidad: 1, precio_unitario: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, i) => i !== index)
    }))
  }

  const updateItem = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }))
  }

  const calculateTotals = () => {
    const subtotal = (formData.items || []).reduce((sum, item) => 
      sum + (item.cantidad * item.precio_unitario), 0
    )
    const iva = subtotal * 0.13 // 13% IVA
    const total = subtotal + iva

    setFormData(prev => ({
      ...prev,
      monto_nc: total,
      monto_gravada_10: subtotal,
      monto_iva: iva
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.sucursal_id || formData.sucursal_id <= 0) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.almacen_id || formData.almacen_id <= 0) {
      newErrors.almacen_id = 'El almacén es requerido'
    }

    if (!formData.referencia_id || formData.referencia_id <= 0) {
      newErrors.referencia_id = 'La referencia es requerida'
    }

    if (isCompra && (!formData.proveedor_id || formData.proveedor_id <= 0)) {
      newErrors.proveedor_id = 'El proveedor es requerido'
    }

    if (!isCompra && (!formData.cliente_id || formData.cliente_id <= 0)) {
      newErrors.cliente_id = 'El cliente es requerido'
    }

    if (!formData.motivo?.trim()) {
      newErrors.motivo = 'El motivo es requerido'
    }

    if ((formData.items || []).length === 0) {
      newErrors.items = 'Debe agregar al menos un producto'
    }

    (formData.items || []).forEach((item, index) => {
      if (!item.producto_id || item.producto_id <= 0) {
        newErrors[`items[${index}].producto_id`] = 'El producto es requerido'
      }
      if (!item.cantidad || item.cantidad <= 0) {
        newErrors[`items[${index}].cantidad`] = 'La cantidad debe ser mayor a 0'
      }
      if (!item.precio_unitario || item.precio_unitario <= 0) {
        newErrors[`items[${index}].precio_unitario`] = 'El precio debe ser mayor a 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 handleSubmit: Iniciando envío del formulario...')
    console.log('🔍 handleSubmit: Datos del formulario:', formData)
    
    if (!validateForm()) {
      console.log('❌ handleSubmit: Validación fallida')
      return
    }

    console.log('✅ handleSubmit: Validación exitosa, preparando datos...')
    console.log('🔍 handleSubmit: Datos preparados para guardar:', formData)
    console.log('🔍 handleSubmit: Llamando a onSave...')

    setLoading(true)
    try {
      calculateTotals()
      await onSave(formData)
      console.log('✅ handleSubmit: Guardado exitoso')
      onClose()
    } catch (error) {
      console.error('❌ handleSubmit: Error guardando nota:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductoNombre = (productoId: number) => {
    const producto = productos.find(p => p.producto_id === productoId)
    return producto ? `${producto.cod_product} - ${producto.nombre_producto}` : 'Producto no encontrado'
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {isEdit ? 'Editar' : 'Crear'} Nota de {isCompra ? 'Crédito' : 'Débito'}
            <Badge className={getTipoOperacionColor(tipoOperacion)}>
              {getTipoOperacionLabel(tipoOperacion)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fecha_registro">Fecha de Registro</Label>
                  <Input
                    id="fecha_registro"
                    type="date"
                    value={formData.fecha_registro}
                    onChange={(e) => handleInputChange('fecha_registro', e.target.value)}
                    className={errors.fecha_registro ? 'border-red-500' : ''}
                  />
                  {errors.fecha_registro && (
                    <p className="text-sm text-red-500">{errors.fecha_registro}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referencia_id">Referencia ID</Label>
                  <Input
                    id="referencia_id"
                    type="number"
                    value={formData.referencia_id}
                    onChange={(e) => handleInputChange('referencia_id', parseInt(e.target.value))}
                    className={errors.referencia_id ? 'border-red-500' : ''}
                    placeholder="ID de la factura referenciada"
                  />
                  {errors.referencia_id && (
                    <p className="text-sm text-red-500">{errors.referencia_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sucursal_id">Sucursal</Label>
                  <Select
                    value={formData.sucursal_id.toString()}
                    onValueChange={(value) => handleInputChange('sucursal_id', parseInt(value))}
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
                    value={formData.almacen_id.toString()}
                    onValueChange={(value) => handleInputChange('almacen_id', parseInt(value))}
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

                {isCompra ? (
                  <div className="space-y-2">
                    <Label htmlFor="proveedor_id">Proveedor</Label>
                    <Select
                      value={formData.proveedor_id?.toString() || ''}
                      onValueChange={(value) => handleInputChange('proveedor_id', parseInt(value))}
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
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="cliente_id">Cliente</Label>
                    <Select
                      value={formData.cliente_id?.toString() || ''}
                      onValueChange={(value) => handleInputChange('cliente_id', parseInt(value))}
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
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo</Label>
                <Textarea
                  id="motivo"
                  value={formData.motivo}
                  onChange={(e) => handleInputChange('motivo', e.target.value)}
                  className={errors.motivo ? 'border-red-500' : ''}
                  placeholder="Describa el motivo de la nota..."
                  rows={3}
                />
                {errors.motivo && (
                  <p className="text-sm text-red-500">{errors.motivo}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Productos</CardTitle>
                <Button type="button" onClick={addItem} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {errors.items && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{errors.items}</p>
                </div>
              )}

              <div className="space-y-4">
                {(formData.items || []).map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Producto {index + 1}</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Producto</Label>
                        <Select
                          value={item.producto_id.toString()}
                          onValueChange={(value) => updateItem(index, 'producto_id', parseInt(value))}
                        >
                          <SelectTrigger className={errors[`items[${index}].producto_id`] ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {productos.map((producto) => (
                              <SelectItem key={producto.producto_id} value={producto.producto_id.toString()}>
                                {producto.cod_product} - {producto.nombre_producto}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors[`items[${index}].producto_id`] && (
                          <p className="text-sm text-red-500">{errors[`items[${index}].producto_id`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.cantidad}
                          onChange={(e) => updateItem(index, 'cantidad', parseFloat(e.target.value))}
                          className={errors[`items[${index}].cantidad`] ? 'border-red-500' : ''}
                        />
                        {errors[`items[${index}].cantidad`] && (
                          <p className="text-sm text-red-500">{errors[`items[${index}].cantidad`]}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Precio Unitario</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.precio_unitario}
                          onChange={(e) => updateItem(index, 'precio_unitario', parseFloat(e.target.value))}
                          className={errors[`items[${index}].precio_unitario`] ? 'border-red-500' : ''}
                        />
                        {errors[`items[${index}].precio_unitario`] && (
                          <p className="text-sm text-red-500">{errors[`items[${index}].precio_unitario`]}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        Subtotal: ₡{(item.cantidad * item.precio_unitario).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {(formData.items || []).length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay productos agregados</p>
                  <p className="text-sm">Haga clic en "Agregar Producto" para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totales */}
          {(formData.items || []).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₡{(formData.monto_gravada_10 || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IVA (13%):</span>
                    <span>₡{(formData.monto_iva || 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span>₡{(formData.monto_nc || 0).toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            onClick={handleSubmit}
            disabled={loading || (formData.items || []).length === 0}
          >
            {loading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}