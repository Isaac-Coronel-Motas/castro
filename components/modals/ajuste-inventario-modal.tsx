"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { 
  AjusteInventario, 
  CreateAjusteInventarioRequest, 
  UpdateAjusteInventarioRequest,
  MotivoAjuste,
  EstadoAjusteInventario 
} from "@/lib/types/compras-adicionales"
import { 
  getAjusteEstadoColor, 
  getAjusteEstadoLabel,
  getTipoMovimientoColor,
  getTipoMovimientoLabel 
} from "@/lib/utils/compras-client"
import { Plus, Trash2, Package, ArrowUp, ArrowDown, RotateCcw } from "lucide-react"

interface AjusteInventarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateAjusteInventarioRequest | UpdateAjusteInventarioRequest) => void
  ajuste?: AjusteInventario | null
  mode: 'create' | 'edit' | 'view'
}

export function AjusteInventarioModal({ 
  isOpen, 
  onClose, 
  onSave, 
  ajuste, 
  mode 
}: AjusteInventarioModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  
  const [formData, setFormData] = useState<CreateAjusteInventarioRequest>({
    usuario_id: user?.usuario_id || 0,
    motivo_id: 0,
    observaciones: '',
    almacen_id: 0,
    estado: 'borrador',
    items: []
  })

  const [motivos, setMotivos] = useState<MotivoAjuste[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (ajuste && (mode === 'edit' || mode === 'view')) {
        loadAjusteData()
      } else if (mode === 'create') {
        resetForm()
      }
    }
  }, [isOpen, ajuste, mode])

  const loadInitialData = async () => {
    try {
      const [motivosRes, almacenesRes, productosRes] = await Promise.all([
        authenticatedFetch('/api/referencias/motivos-ajuste'),
        authenticatedFetch('/api/referencias/almacenes'),
        authenticatedFetch('/api/referencias/productos')
      ])

      const motivosData = await motivosRes.json()
      const almacenesData = await almacenesRes.json()
      const productosData = await productosRes.json()

      if (motivosData.success) setMotivos(motivosData.data)
      if (almacenesData.success) setAlmacenes(almacenesData.data)
      if (productosData.success) setProductos(productosData.data)
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
    }
  }

  const loadAjusteData = async () => {
    if (!ajuste) return

    try {
      const response = await authenticatedFetch(`/api/compras/ajustes-inventario/${ajuste.ajuste_id}`)
      const responseData = await response.json()
      
      if (responseData.success) {
        const ajusteData = responseData.data
        setFormData({
          usuario_id: ajusteData.usuario_id,
          motivo_id: ajusteData.motivo_id,
          observaciones: ajusteData.observaciones || '',
          almacen_id: ajusteData.almacen_id,
          estado: ajusteData.estado,
          items: ajusteData.detalles?.map((detalle: any) => ({
            producto_id: detalle.producto_id,
            cantidad_ajustada: detalle.cantidad_ajustada,
            comentario: detalle.comentario || ''
          })) || []
        })
      }
    } catch (error) {
      console.error('Error cargando datos del ajuste:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      usuario_id: user?.usuario_id || 0,
      motivo_id: 0,
      observaciones: '',
      almacen_id: 0,
      estado: 'borrador',
      items: []
    })
    setErrors({})
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

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items!]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), {
        producto_id: 0,
        cantidad_ajustada: 0,
        comentario: ''
      }]
    }))
  }

  const removeItem = (index: number) => {
    const newItems = formData.items!.filter((_, i) => i !== index)
    setFormData(prev => ({
      ...prev,
      items: newItems
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.motivo_id) {
      newErrors.motivo_id = 'El motivo es requerido'
    }

    if (!formData.almacen_id) {
      newErrors.almacen_id = 'El almacén es requerido'
    }

    if (!formData.items || formData.items.length === 0) {
      newErrors.items = 'Debe agregar al menos un producto'
    } else {
      formData.items.forEach((item, index) => {
        if (!item.producto_id) {
          newErrors[`item_${index}_producto`] = 'El producto es requerido'
        }
        if (item.cantidad_ajustada === 0) {
          newErrors[`item_${index}_cantidad`] = 'La cantidad no puede ser cero'
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setLoading(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error guardando ajuste:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProductoNombre = (productoId: number) => {
    const producto = productos.find(p => p.producto_id === productoId)
    return producto ? `${producto.nombre_producto} (${producto.cod_product})` : 'Producto no encontrado'
  }

  const getTipoMovimiento = (cantidad: number) => {
    if (cantidad > 0) return 'entrada'
    if (cantidad < 0) return 'salida'
    return 'ajuste'
  }

  const getTipoMovimientoIcon = (cantidad: number) => {
    if (cantidad > 0) return ArrowUp
    if (cantidad < 0) return ArrowDown
    return RotateCcw
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' && 'Nuevo Ajuste de Inventario'}
            {mode === 'edit' && 'Editar Ajuste de Inventario'}
            {mode === 'view' && 'Ver Ajuste de Inventario'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Crear un nuevo ajuste de inventario'}
            {mode === 'edit' && 'Modificar el ajuste de inventario existente'}
            {mode === 'view' && 'Visualizar los detalles del ajuste de inventario'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="motivo_id">Motivo del Ajuste *</Label>
                  <Select
                    value={formData.motivo_id.toString()}
                    onValueChange={(value) => handleInputChange('motivo_id', parseInt(value))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      {motivos.map((motivo) => (
                        <SelectItem key={motivo.motivo_id} value={motivo.motivo_id.toString()}>
                          {motivo.descripcion}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.motivo_id && (
                    <p className="text-sm text-destructive">{errors.motivo_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="almacen_id">Almacén *</Label>
                  <Select
                    value={formData.almacen_id.toString()}
                    onValueChange={(value) => handleInputChange('almacen_id', parseInt(value))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
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
                    <p className="text-sm text-destructive">{errors.almacen_id}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea
                  id="observaciones"
                  value={formData.observaciones}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  placeholder="Observaciones adicionales..."
                  disabled={mode === 'view'}
                  rows={3}
                />
              </div>

              {mode !== 'create' && (
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value) => handleInputChange('estado', value as EstadoAjusteInventario)}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="borrador">Borrador</SelectItem>
                      <SelectItem value="validado">Validado</SelectItem>
                      <SelectItem value="anulado">Anulado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Productos a Ajustar</CardTitle>
                {mode !== 'view' && (
                  <Button onClick={addItem} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Producto
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {errors.items && (
                <p className="text-sm text-destructive mb-4">{errors.items}</p>
              )}

              <div className="space-y-4">
                {formData.items?.map((item, index) => {
                  const TipoIcon = getTipoMovimientoIcon(item.cantidad_ajustada)
                  const tipoMovimiento = getTipoMovimiento(item.cantidad_ajustada)
                  
                  return (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Producto {index + 1}</span>
                          {item.cantidad_ajustada !== 0 && (
                            <Badge className={getTipoMovimientoColor(tipoMovimiento)}>
                              <TipoIcon className="h-3 w-3 mr-1" />
                              {getTipoMovimientoLabel(tipoMovimiento)}
                            </Badge>
                          )}
                        </div>
                        {mode !== 'view' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Producto *</Label>
                          <Select
                            value={item.producto_id.toString()}
                            onValueChange={(value) => handleItemChange(index, 'producto_id', parseInt(value))}
                            disabled={mode === 'view'}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {productos.map((producto) => (
                                <SelectItem key={producto.producto_id} value={producto.producto_id.toString()}>
                                  {producto.nombre_producto} ({producto.cod_product})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors[`item_${index}_producto`] && (
                            <p className="text-sm text-destructive">{errors[`item_${index}_producto`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Cantidad Ajustada *</Label>
                          <Input
                            type="number"
                            value={item.cantidad_ajustada}
                            onChange={(e) => handleItemChange(index, 'cantidad_ajustada', parseFloat(e.target.value) || 0)}
                            placeholder="0"
                            disabled={mode === 'view'}
                          />
                          {errors[`item_${index}_cantidad`] && (
                            <p className="text-sm text-destructive">{errors[`item_${index}_cantidad`]}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Comentario</Label>
                          <Input
                            value={item.comentario}
                            onChange={(e) => handleItemChange(index, 'comentario', e.target.value)}
                            placeholder="Comentario opcional"
                            disabled={mode === 'view'}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}

                {(!formData.items || formData.items.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay productos agregados</p>
                    {mode !== 'view' && (
                      <p className="text-sm">Haz clic en "Agregar Producto" para comenzar</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {mode === 'view' ? 'Cerrar' : 'Cancelar'}
          </Button>
          {mode !== 'view' && (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}