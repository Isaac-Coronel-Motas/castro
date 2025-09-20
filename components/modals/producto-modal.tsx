"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Producto, ProductoFormData, Categoria, Marca } from "@/lib/types/referencias"
import { X, Save, Package, DollarSign, Hash, Tag, Building } from "lucide-react"

interface ProductoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (producto: Partial<Producto>) => Promise<boolean>
  producto?: Producto | null
  categorias: Categoria[]
  marcas: Marca[]
  title: string
}

interface FormErrors {
  nombre_producto?: string
  precio_unitario?: string
  stock?: string
  precio_costo?: string
  precio_venta?: string
  stock_minimo?: string
  stock_maximo?: string
  categoria_id?: string
}

export function ProductoModal({ isOpen, onClose, onSave, producto, categorias, marcas, title }: ProductoModalProps) {
  const [formData, setFormData] = useState<ProductoFormData>({
    nombre_producto: "",
    descripcion_producto: "",
    precio_unitario: 0,
    stock: 0,
    categoria_id: null,
    precio_costo: 0,
    precio_venta: 0,
    stock_minimo: 0,
    stock_maximo: 0,
    marca_id: null,
    cod_product: "",
    estado: true,
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre_producto: producto.nombre_producto || "",
        descripcion_producto: producto.descripcion_producto || "",
        precio_unitario: producto.precio_unitario || 0,
        stock: producto.stock || 0,
        categoria_id: producto.categoria_id || null,
        precio_costo: producto.precio_costo || 0,
        precio_venta: producto.precio_venta || 0,
        stock_minimo: producto.stock_minimo || 0,
        stock_maximo: producto.stock_maximo || 0,
        marca_id: producto.marca_id || null,
        cod_product: producto.cod_product || "",
        estado: producto.estado ?? true,
      })
    } else {
      setFormData({
        nombre_producto: "",
        descripcion_producto: "",
        precio_unitario: 0,
        stock: 0,
        categoria_id: null,
        precio_costo: 0,
        precio_venta: 0,
        stock_minimo: 0,
        stock_maximo: 0,
        marca_id: null,
        cod_product: "",
        estado: true,
      })
    }
    setErrors({})
  }, [producto, isOpen])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.nombre_producto.trim()) {
      newErrors.nombre_producto = "El nombre del producto es requerido"
    } else if (formData.nombre_producto.length < 2) {
      newErrors.nombre_producto = "El nombre debe tener al menos 2 caracteres"
    }

    if (formData.precio_unitario < 0) {
      newErrors.precio_unitario = "El precio no puede ser negativo"
    }

    if (formData.stock < 0) {
      newErrors.stock = "El stock no puede ser negativo"
    }

    if (formData.precio_costo < 0) {
      newErrors.precio_costo = "El precio de costo no puede ser negativo"
    }

    if (formData.precio_venta < 0) {
      newErrors.precio_venta = "El precio de venta no puede ser negativo"
    }

    if (formData.stock_minimo < 0) {
      newErrors.stock_minimo = "El stock mínimo no puede ser negativo"
    }

    if (formData.stock_maximo < 0) {
      newErrors.stock_maximo = "El stock máximo no puede ser negativo"
    }

    if (formData.stock_minimo > formData.stock_maximo) {
      newErrors.stock_minimo = "El stock mínimo no puede ser mayor al máximo"
    }

    if (!formData.categoria_id) {
      newErrors.categoria_id = "Selecciona una categoría"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      const productoData: Partial<Producto> = {
        nombre_producto: formData.nombre_producto.trim(),
        descripcion_producto: formData.descripcion_producto.trim() || null,
        precio_unitario: formData.precio_unitario,
        stock: formData.stock,
        categoria_id: formData.categoria_id!,
        precio_costo: formData.precio_costo,
        precio_venta: formData.precio_venta,
        stock_minimo: formData.stock_minimo,
        stock_maximo: formData.stock_maximo,
        marca_id: formData.marca_id,
        cod_product: formData.cod_product.trim() || null,
        estado: formData.estado,
      }

      const success = await onSave(productoData)
      if (success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al guardar producto:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof ProductoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre_producto">Nombre del Producto *</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="nombre_producto"
                      value={formData.nombre_producto}
                      onChange={(e) => handleInputChange("nombre_producto", e.target.value)}
                      placeholder="Ingresa el nombre del producto"
                      className={`pl-10 ${errors.nombre_producto ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.nombre_producto && <p className="text-red-500 text-sm mt-1">{errors.nombre_producto}</p>}
                </div>

                <div>
                  <Label htmlFor="cod_product">Código del Producto</Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="cod_product"
                      value={formData.cod_product}
                      onChange={(e) => handleInputChange("cod_product", e.target.value)}
                      placeholder="PROD-001"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion_producto">Descripción</Label>
                <Textarea
                  id="descripcion_producto"
                  value={formData.descripcion_producto}
                  onChange={(e) => handleInputChange("descripcion_producto", e.target.value)}
                  placeholder="Descripción detallada del producto"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="categoria_id">Categoría *</Label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select
                      value={formData.categoria_id?.toString() || ""}
                      onValueChange={(value) => handleInputChange("categoria_id", parseInt(value))}
                    >
                      <SelectTrigger className={`pl-10 ${errors.categoria_id ? "border-red-500" : ""}`}>
                        <SelectValue placeholder="Selecciona una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map((categoria) => (
                          <SelectItem key={categoria.categoria_id} value={categoria.categoria_id.toString()}>
                            {categoria.nombre_categoria}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {errors.categoria_id && <p className="text-red-500 text-sm mt-1">{errors.categoria_id}</p>}
                </div>

                <div>
                  <Label htmlFor="marca_id">Marca</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Select
                      value={formData.marca_id?.toString() || ""}
                      onValueChange={(value) => handleInputChange("marca_id", parseInt(value))}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Selecciona una marca" />
                      </SelectTrigger>
                      <SelectContent>
                        {marcas.map((marca) => (
                          <SelectItem key={marca.marca_id} value={marca.marca_id.toString()}>
                            {marca.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Precios</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="precio_unitario">Precio Unitario</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="precio_unitario"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_unitario}
                      onChange={(e) => handleInputChange("precio_unitario", parseFloat(e.target.value) || 0)}
                      className={`pl-10 ${errors.precio_unitario ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.precio_unitario && <p className="text-red-500 text-sm mt-1">{errors.precio_unitario}</p>}
                </div>

                <div>
                  <Label htmlFor="precio_costo">Precio de Costo</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="precio_costo"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_costo}
                      onChange={(e) => handleInputChange("precio_costo", parseFloat(e.target.value) || 0)}
                      className={`pl-10 ${errors.precio_costo ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.precio_costo && <p className="text-red-500 text-sm mt-1">{errors.precio_costo}</p>}
                </div>

                <div>
                  <Label htmlFor="precio_venta">Precio de Venta</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="precio_venta"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.precio_venta}
                      onChange={(e) => handleInputChange("precio_venta", parseFloat(e.target.value) || 0)}
                      className={`pl-10 ${errors.precio_venta ? "border-red-500" : ""}`}
                    />
                  </div>
                  {errors.precio_venta && <p className="text-red-500 text-sm mt-1">{errors.precio_venta}</p>}
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Control de Stock</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="stock">Stock Actual</Label>
                  <Input
                    id="stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => handleInputChange("stock", parseInt(e.target.value) || 0)}
                    className={errors.stock ? "border-red-500" : ""}
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock}</p>}
                </div>

                <div>
                  <Label htmlFor="stock_minimo">Stock Mínimo</Label>
                  <Input
                    id="stock_minimo"
                    type="number"
                    min="0"
                    value={formData.stock_minimo}
                    onChange={(e) => handleInputChange("stock_minimo", parseInt(e.target.value) || 0)}
                    className={errors.stock_minimo ? "border-red-500" : ""}
                  />
                  {errors.stock_minimo && <p className="text-red-500 text-sm mt-1">{errors.stock_minimo}</p>}
                </div>

                <div>
                  <Label htmlFor="stock_maximo">Stock Máximo</Label>
                  <Input
                    id="stock_maximo"
                    type="number"
                    min="0"
                    value={formData.stock_maximo}
                    onChange={(e) => handleInputChange("stock_maximo", parseInt(e.target.value) || 0)}
                    className={errors.stock_maximo ? "border-red-500" : ""}
                  />
                  {errors.stock_maximo && <p className="text-red-500 text-sm mt-1">{errors.stock_maximo}</p>}
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Estado</h3>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="estado"
                  checked={formData.estado}
                  onCheckedChange={(checked) => handleInputChange("estado", checked)}
                />
                <Label htmlFor="estado">Producto activo</Label>
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Guardando..." : "Guardar"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
