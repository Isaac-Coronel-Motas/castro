"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Package, Plus } from "lucide-react"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"

interface AgregarProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (producto: { producto_id: number; cantidad: number; precio_unitario: number }) => Promise<void>
  productos: any[]
}

export function AgregarProductoModal({ isOpen, onClose, onAdd, productos }: AgregarProductoModalProps) {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState({
    producto_id: 0,
    cantidad: 1,
    precio_unitario: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [productoSeleccionado, setProductoSeleccionado] = useState<any>(null)

  // Resetear formulario cuando se abre
  useEffect(() => {
    if (isOpen) {
      setFormData({
        producto_id: 0,
        cantidad: 1,
        precio_unitario: 0
      })
      setProductoSeleccionado(null)
      setErrors({})
    }
  }, [isOpen])

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

    // Si cambia el producto, actualizar el precio unitario
    if (field === 'producto_id') {
      const producto = productos.find(p => p.producto_id === parseInt(value))
      if (producto) {
        setProductoSeleccionado(producto)
        setFormData(prev => ({
          ...prev,
          precio_unitario: producto.precio_venta || 0
        }))
      }
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.producto_id || formData.producto_id <= 0) {
      newErrors.producto_id = 'Debe seleccionar un producto'
    }

    if (!formData.cantidad || formData.cantidad <= 0) {
      newErrors.cantidad = 'La cantidad debe ser mayor a 0'
    }

    if (!formData.precio_unitario || formData.precio_unitario <= 0) {
      newErrors.precio_unitario = 'El precio unitario debe ser mayor a 0'
    }

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
      await onAdd({
        producto_id: formData.producto_id,
        cantidad: formData.cantidad,
        precio_unitario: formData.precio_unitario
      })
      onClose()
    } catch (error) {
      console.error('Error agregando producto:', error)
    } finally {
      setLoading(false)
    }
  }

  const calcularSubtotal = () => {
    return formData.cantidad * formData.precio_unitario
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Producto
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Selección de Producto */}
          <div className="space-y-2">
            <Label htmlFor="producto_id">Producto</Label>
            <Select
              value={formData.producto_id?.toString()}
              onValueChange={(value) => handleInputChange('producto_id', parseInt(value))}
            >
              <SelectTrigger className={errors.producto_id ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {productos.map((producto) => (
                  <SelectItem key={producto.producto_id} value={producto.producto_id.toString()}>
                    <div className="flex flex-col">
                      <span className="font-medium">{producto.nombre_producto}</span>
                      <span className="text-sm text-muted-foreground">
                        {producto.cod_product} - ₡{(producto.precio_venta || 0).toLocaleString()}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.producto_id && (
              <p className="text-sm text-red-500">{errors.producto_id}</p>
            )}
          </div>

          {/* Información del Producto Seleccionado */}
          {productoSeleccionado && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Información del Producto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Código:</span> {productoSeleccionado.cod_product}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Descripción:</span> {productoSeleccionado.descripcion_producto || 'N/A'}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Precio sugerido:</span> ₡{(productoSeleccionado.precio_venta || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cantidad y Precio */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => handleInputChange('cantidad', parseInt(e.target.value) || 1)}
                className={errors.cantidad ? 'border-red-500' : ''}
              />
              {errors.cantidad && (
                <p className="text-sm text-red-500">{errors.cantidad}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio_unitario">Precio Unitario</Label>
              <Input
                id="precio_unitario"
                type="number"
                min="0"
                step="0.01"
                value={formData.precio_unitario}
                onChange={(e) => handleInputChange('precio_unitario', parseFloat(e.target.value) || 0)}
                className={errors.precio_unitario ? 'border-red-500' : ''}
              />
              {errors.precio_unitario && (
                <p className="text-sm text-red-500">{errors.precio_unitario}</p>
              )}
            </div>
          </div>

          {/* Resumen */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal:</span>
                <span className="font-bold text-lg">₡{calcularSubtotal().toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Botones */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Agregando...' : 'Agregar Producto'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
