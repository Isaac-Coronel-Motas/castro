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
import { AjusteInventario, CreateAjusteInventarioRequest, UpdateAjusteInventarioRequest, AjusteInventarioDetalle } from "@/lib/types/compras"
import { Package, Calendar, User, Warehouse, Plus, Trash2, AlertTriangle } from "lucide-react"

interface AjusteInventarioModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateAjusteInventarioRequest | UpdateAjusteInventarioRequest) => Promise<void>
  ajuste?: AjusteInventario | null
  mode: 'create' | 'edit' | 'view'
}

export function AjusteInventarioModal({ isOpen, onClose, onSave, ajuste, mode }: AjusteInventarioModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateAjusteInventarioRequest>({
    usuario_id: user?.usuario_id || 0,
    motivo_id: 0,
    observaciones: '',
    almacen_id: 0,
    estado: 'borrador',
    detalles: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [motivos, setMotivos] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (ajuste && mode !== 'create') {
        setFormData({
          usuario_id: ajuste.usuario_id,
          motivo_id: ajuste.motivo_id,
          observaciones: ajuste.observaciones || '',
          almacen_id: ajuste.almacen_id,
          estado: ajuste.estado,
          fecha: ajuste.fecha,
          detalles: []
        })
      }
    }
  }, [isOpen, ajuste, mode])

  const loadInitialData = async () => {
    try {
      // Cargar almacenes
      const almacenesRes = await fetch('/api/almacenes')
      const almacenesData = await almacenesRes.json()
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }

      // Cargar motivos de ajuste
      const motivosRes = await fetch('/api/motivos-ajuste')
      const motivosData = await motivosRes.json()
      if (motivosData.success) {
        setMotivos(motivosData.data)
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
          cantidad_ajustada: 0,
          comentario: ''
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

    if (!formData.motivo_id) {
      newErrors.motivo_id = 'El motivo es requerido'
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
      if (detalle.cantidad_ajustada === 0) {
        newErrors[`detalle_${index}_cantidad`] = 'La cantidad ajustada no puede ser 0'
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
        : { ...formData, ajuste_id: ajuste?.ajuste_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando ajuste:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalItems = () => {
    return formData.detalles?.length || 0
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Ajuste de Inventario' : 
               mode === 'edit' ? 'Editar Ajuste de Inventario' : 
               'Ver Ajuste de Inventario'}
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
                    <Label htmlFor="fecha">Fecha del Ajuste</Label>
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
                        <SelectItem value="borrador">Borrador</SelectItem>
                        <SelectItem value="validado">Validado</SelectItem>
                        <SelectItem value="anulado">Anulado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivo_id">Motivo del Ajuste</Label>
                    <Select
                      value={formData.motivo_id?.toString()}
                      onValueChange={(value) => handleInputChange('motivo_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.motivo_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {motivos.map((motivo) => (
                          <SelectItem key={motivo.motivo_id} value={motivo.motivo_id.toString()}>
                            {motivo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.motivo_id && (
                      <p className="text-sm text-red-500">{errors.motivo_id}</p>
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

            {/* Detalles del Ajuste */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Productos a Ajustar
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
                            <Label>Cantidad Ajustada</Label>
                            <Input
                              type="number"
                              value={detalle.cantidad_ajustada || ''}
                              onChange={(e) => handleDetalleChange(index, 'cantidad_ajustada', parseInt(e.target.value) || 0)}
                              disabled={mode === 'view'}
                              className={errors[`detalle_${index}_cantidad`] ? 'border-red-500' : ''}
                              placeholder="Cantidad a ajustar..."
                            />
                            {errors[`detalle_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`detalle_${index}_cantidad`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Comentario</Label>
                            <Input
                              type="text"
                              value={detalle.comentario || ''}
                              onChange={(e) => handleDetalleChange(index, 'comentario', e.target.value)}
                              disabled={mode === 'view'}
                              placeholder="Comentario del ajuste..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right">
                        <p className="text-lg font-semibold">
                          Total de productos: {calculateTotalItems()}
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
