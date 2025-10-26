"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { PresupuestoProveedor, CreatePresupuestoProveedorRequest, UpdatePresupuestoProveedorRequest } from "@/lib/types/compras"
import { FileCheck, Calendar, User, Building, Percent, DollarSign, Package, Plus, Trash2 } from "lucide-react"
import { AgregarProductoModal } from "./agregar-producto-presupuesto-modal"

interface PresupuestoProveedorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreatePresupuestoProveedorRequest | UpdatePresupuestoProveedorRequest) => Promise<void>
  presupuesto?: PresupuestoProveedor | null
  mode: 'create' | 'edit' | 'view'
}

export function PresupuestoProveedorModal({ isOpen, onClose, onSave, presupuesto, mode }: PresupuestoProveedorModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch, token } = useAuthenticatedFetch()
  
  // Debug: verificar token
  console.log('🔍 PresupuestoProveedorModal: Token disponible:', token ? 'SÍ' : 'NO')
  if (token) {
    console.log('🔍 PresupuestoProveedorModal: Token preview:', token.substring(0, 20) + '...')
  }
  
  const [formData, setFormData] = useState<CreatePresupuestoProveedorRequest>({
    usuario_id: user?.usuario_id || 0,
    estado: 'nuevo',
    observaciones: '',
    monto_presu_prov: 0,
    fecha_presupuesto: new Date().toISOString().split('T')[0],
    pedido_prov_id: undefined,
    proveedor_id: undefined
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [proveedores, setProveedores] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [detalles, setDetalles] = useState<any[]>([])
  const [showAgregarProducto, setShowAgregarProducto] = useState(false)

  const loadPresupuestoCompleto = async (presuProvId: number) => {
    try {
      console.log('🔍 Cargando presupuesto completo desde API:', presuProvId)
      const response = await authenticatedFetch(`/api/compras/presupuestos/${presuProvId}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        console.log('✅ Datos del presupuesto cargados:', data.data)
        setFormData({
          usuario_id: data.data.usuario_id,
          estado: data.data.estado,
          observaciones: data.data.observaciones || '',
          monto_presu_prov: data.data.monto_presu_prov,
          fecha_presupuesto: data.data.fecha_presupuesto,
          pedido_prov_id: data.data.pedido_prov_id,
          proveedor_id: data.data.proveedor_id
        })
        // Cargar detalles
        loadDetalles(presuProvId)
      }
    } catch (error) {
      console.error('❌ Error cargando presupuesto completo:', error)
    }
  }

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadProveedores()
      loadProductos()
      if (presupuesto && mode !== 'create') {
        console.log('🔍 Cargando datos del presupuesto:', presupuesto)
        // Cargar datos completos desde la API
        loadPresupuestoCompleto(presupuesto.presu_prov_id)
      } else if (mode === 'create') {
        // Resetear formulario para modo creación
        setFormData({
          usuario_id: user?.usuario_id || 0,
          estado: 'nuevo',
          observaciones: '',
          monto_presu_prov: 0,
          fecha_presupuesto: new Date().toISOString().split('T')[0],
          pedido_prov_id: undefined,
          proveedor_id: undefined
        })
        setDetalles([])
      }
    }
  }, [isOpen, presupuesto, mode, user])

  const loadProveedores = async () => {
    try {
      console.log('🔍 loadProveedores: Iniciando carga de proveedores...')
      console.log('🔍 loadProveedores: Token disponible:', token ? 'SÍ' : 'NO')
      
      const response = await authenticatedFetch('/api/referencias/proveedores')
      console.log('🔍 loadProveedores: Respuesta proveedores:', response.status)
      
      const data = await response.json()
      if (data.success) {
        setProveedores(data.data)
        console.log('✅ loadProveedores: Proveedores cargados:', data.data.length)
      }
    } catch (error) {
      console.error('❌ loadProveedores: Error cargando proveedores:', error)
    }
  }

  const loadProductos = async () => {
    try {
      console.log('🔍 loadProductos: Iniciando carga de productos...')
      const response = await authenticatedFetch('/api/referencias/productos')
      const data = await response.json()
      if (data.success) {
        setProductos(data.data)
        console.log('✅ loadProductos: Productos cargados:', data.data.length)
      }
    } catch (error) {
      console.error('❌ loadProductos: Error cargando productos:', error)
    }
  }

  const loadDetalles = async (presupuestoId: number) => {
    try {
      console.log('🔍 loadDetalles: Cargando detalles del presupuesto:', presupuestoId)
      const response = await authenticatedFetch(`/api/compras/presupuestos/${presupuestoId}/detalles`)
      const data = await response.json()
      if (data.success) {
        setDetalles(data.data)
        console.log('✅ loadDetalles: Detalles cargados:', data.data.length)
      }
    } catch (error) {
      console.error('❌ loadDetalles: Error cargando detalles:', error)
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

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    // Validar proveedor solo en modo creación
    if (mode === 'create' && (!formData.proveedor_id || formData.proveedor_id <= 0)) {
      newErrors.proveedor_id = 'El proveedor es requerido'
    }

    if (formData.monto_presu_prov !== undefined && formData.monto_presu_prov < 0) {
      newErrors.monto_presu_prov = 'El monto no puede ser negativo'
    }

    if (formData.fecha_presupuesto && formData.fecha_presupuesto) {
      const fechaInicio = new Date(formData.fecha_presupuesto)
      if (isNaN(fechaInicio.getTime())) {
        newErrors.fecha_presupuesto = 'La fecha del presupuesto no es válida'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔍 handleSubmit: Iniciando envío del formulario...')
    console.log('🔍 handleSubmit: Datos del formulario:', formData)
    
    if (!validateForm()) {
      console.log('❌ handleSubmit: Validación falló')
      return
    }
    
    console.log('✅ handleSubmit: Validación exitosa, preparando datos...')

    setLoading(true)
    try {
      const dataToSave = mode === 'create' 
        ? formData 
        : { ...formData, presu_prov_id: presupuesto?.presu_prov_id }
      
      console.log('🔍 handleSubmit: Datos preparados para guardar:', dataToSave)
      console.log('🔍 handleSubmit: Llamando a onSave...')
      
      await onSave(dataToSave)
      console.log('✅ handleSubmit: onSave completado exitosamente')
      onClose()
    } catch (error) {
      console.error('❌ handleSubmit: Error guardando presupuesto:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateMontoConDescuento = () => {
    const montoDetalles = detalles.reduce((total, detalle) => {
      return total + (detalle.cantidad * detalle.precio_unitario)
    }, 0)
    
    // Si hay detalles, usar el monto calculado de los detalles
    if (detalles.length > 0) {
      return montoDetalles
    }
    
    // Si no hay detalles, usar el monto manual
    return formData.monto_presu_prov || 0
  }

  // Actualizar el monto del formulario cuando cambien los detalles
  useEffect(() => {
    if (detalles.length > 0) {
      const montoCalculado = detalles.reduce((total, detalle) => {
        return total + (detalle.cantidad * detalle.precio_unitario)
      }, 0)
      
      setFormData(prev => ({
        ...prev,
        monto_presu_prov: montoCalculado
      }))
    }
  }, [detalles])

  const handleAgregarProducto = async (productoData: { producto_id: number; cantidad: number; precio_unitario: number }) => {
    try {
      console.log('🔍 handleAgregarProducto: Agregando producto:', productoData)
      
      if (presupuesto && presupuesto.presu_prov_id) {
        // Si es un presupuesto existente, crear el detalle en la BD
        const response = await authenticatedFetch(`/api/compras/presupuestos/${presupuesto.presu_prov_id}/detalles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productoData)
        })
        
        const data = await response.json()
        if (data.success) {
          // Agregar el detalle a la lista local
          setDetalles(prev => [...prev, data.data])
          console.log('✅ Producto agregado exitosamente')
        } else {
          throw new Error(data.message || 'Error agregando producto')
        }
      } else {
        // Si es un presupuesto nuevo, solo agregar a la lista local
        const nuevoDetalle = {
          detalle_presup_id: Date.now(), // ID temporal
          presu_prov_id: 0,
          producto_id: productoData.producto_id,
          cantidad: productoData.cantidad,
          precio_unitario: productoData.precio_unitario,
          nombre_producto: productos.find(p => p.producto_id === productoData.producto_id)?.nombre_producto,
          cod_producto: productos.find(p => p.producto_id === productoData.producto_id)?.cod_product,
          descripcion_producto: productos.find(p => p.producto_id === productoData.producto_id)?.descripcion_producto,
          subtotal: productoData.cantidad * productoData.precio_unitario
        }
        
        setDetalles(prev => [...prev, nuevoDetalle])
        console.log('✅ Producto agregado a lista local')
      }
      
      setShowAgregarProducto(false)
    } catch (error) {
      console.error('❌ Error agregando producto:', error)
      throw error
    }
  }

  const handleEliminarProducto = async (detalleId: number) => {
    try {
      console.log('🔍 handleEliminarProducto: Eliminando detalle:', detalleId)
      
      if (presupuesto && presupuesto.presu_prov_id && detalleId > 1000) {
        // Si es un detalle de la BD (ID > 1000), eliminarlo de la BD
        const response = await authenticatedFetch(`/api/compras/presupuestos/${presupuesto.presu_prov_id}/detalles/${detalleId}`, {
          method: 'DELETE'
        })
        
        const data = await response.json()
        if (data.success) {
          // Remover el detalle de la lista local
          setDetalles(prev => prev.filter(d => d.detalle_presup_id !== detalleId))
          console.log('✅ Producto eliminado exitosamente')
        } else {
          throw new Error(data.message || 'Error eliminando producto')
        }
      } else {
        // Si es un detalle local (ID temporal), solo remover de la lista
        setDetalles(prev => prev.filter(d => d.detalle_presup_id !== detalleId))
        console.log('✅ Producto eliminado de lista local')
      }
    } catch (error) {
      console.error('❌ Error eliminando producto:', error)
      throw error
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Presupuesto Proveedor' : 
               mode === 'edit' ? 'Editar Presupuesto Proveedor' : 
               'Ver Presupuesto Proveedor'}
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
                  <FileCheck className="h-5 w-5" />
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
                      value={(() => {
                        if (!formData.fecha_presupuesto) return ''
                        try {
                          const date = new Date(formData.fecha_presupuesto)
                          if (isNaN(date.getTime())) {
                            return ''
                          }
                          return date.toISOString().split('T')[0]
                        } catch (error) {
                          return ''
                        }
                      })()}
                      onChange={(e) => handleInputChange('fecha_presupuesto', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_presupuesto ? 'border-red-500' : ''}
                    />
                    {errors.fecha_presupuesto && (
                      <p className="text-sm text-red-500">{errors.fecha_presupuesto}</p>
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
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="pendiente">Pendiente</SelectItem>
              <SelectItem value="aprobado">Aprobado</SelectItem>
              <SelectItem value="rechazado">Rechazado</SelectItem>
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
                            <div className="flex flex-col">
                              <span className="font-medium">{proveedor.nombre_proveedor}</span>
                              <span className="text-sm text-muted-foreground">
                                {proveedor.cod_proveedor || 'Sin código'}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.proveedor_id && (
                      <p className="text-sm text-red-500">{errors.proveedor_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pedido_prov_id">Pedido Proveedor ID (Opcional)</Label>
                    <Input
                      id="pedido_prov_id"
                      type="number"
                      value={formData.pedido_prov_id || ''}
                      onChange={(e) => handleInputChange('pedido_prov_id', parseInt(e.target.value) || undefined)}
                      disabled={mode === 'view'}
                      placeholder="ID del pedido proveedor (opcional)"
                    />
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

            {/* Información Financiera */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Información Financiera
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_presu_prov">Monto del Presupuesto</Label>
                    <Input
                      id="monto_presu_prov"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_presu_prov || ''}
                      onChange={(e) => handleInputChange('monto_presu_prov', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                      className={errors.monto_presu_prov ? 'border-red-500' : ''}
                    />
                    {errors.monto_presu_prov && (
                      <p className="text-sm text-red-500">{errors.monto_presu_prov}</p>
                    )}
                  </div>
                </div>

                {/* Resumen de Montos */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">Monto Total:</span>
                    <span className="font-bold text-lg">PYG {calculateMontoConDescuento().toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de Productos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Detalles de Productos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Lista de detalles existentes */}
                {detalles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Productos incluidos:</h4>
                    <div className="space-y-2">
                      {detalles.map((detalle, index) => (
                        <div key={detalle.detalle_presup_id || index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex-1">
                            <div className="font-medium">{detalle.nombre_producto}</div>
                            <div className="text-sm text-muted-foreground">
                              Cantidad: {detalle.cantidad} × PYG {detalle.precio_unitario?.toLocaleString()} = PYG {(detalle.cantidad * detalle.precio_unitario).toLocaleString()}
                            </div>
                          </div>
                          {mode !== 'view' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEliminarProducto(detalle.detalle_presup_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Botón para agregar producto */}
                {mode !== 'view' && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAgregarProducto(true)}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                )}

                {/* Resumen de detalles */}
                {detalles.length > 0 && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total de productos:</span>
                      <span className="font-medium">{detalles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monto calculado:</span>
                      <span className="font-medium">PYG {calculateMontoConDescuento().toLocaleString()}</span>
                    </div>
                  </div>
                )}
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

      {/* Modal para agregar producto */}
      <AgregarProductoModal
        isOpen={showAgregarProducto}
        onClose={() => setShowAgregarProducto(false)}
        onAdd={handleAgregarProducto}
        productos={productos}
      />
    </div>
  )
}
