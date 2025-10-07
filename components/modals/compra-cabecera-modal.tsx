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
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { CompraCabecera, CreateCompraCabeceraRequest, UpdateCompraCabeceraRequest } from "@/lib/types/compras"
import { Receipt, Calendar, User, Building, Warehouse, DollarSign, FileText, CreditCard } from "lucide-react"

interface CompraCabeceraModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateCompraCabeceraRequest | UpdateCompraCabeceraRequest) => Promise<void>
  compra?: CompraCabecera | null
  mode: 'create' | 'edit' | 'view'
}

export function CompraCabeceraModal({ isOpen, onClose, onSave, compra, mode }: CompraCabeceraModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateCompraCabeceraRequest>({
    proveedor_id: 0,
    usuario_id: user?.usuario_id || 0,
    monto_compra: 0,
    estado: 'pendiente',
    observaciones: '',
    sucursal_id: 1,
    condicion_pago: 'contado',
    tipo_doc_id: 1
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [proveedores, setProveedores] = useState<any[]>([])
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [tiposDocumento, setTiposDocumento] = useState<any[]>([])
  const [ordenesCompra, setOrdenesCompra] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (compra && mode !== 'create') {
        setFormData({
          proveedor_id: compra.proveedor_id,
          usuario_id: compra.usuario_id,
          monto_compra: compra.monto_compra,
          estado: compra.estado,
          observaciones: compra.observaciones || '',
          sucursal_id: compra.sucursal_id,
          condicion_pago: compra.condicion_pago || 'contado',
          tipo_doc_id: compra.tipo_doc_id,
          fecha_compra: compra.fecha_compra,
          almacen_id: compra.almacen_id,
          orden_compra_id: compra.orden_compra_id,
          timbrado: compra.timbrado,
          nro_factura: compra.nro_factura,
          fecha_comprobante: compra.fecha_comprobante
        })
      }
    }
  }, [isOpen, compra, mode])

  const loadInitialData = async () => {
    try {
      // Cargar proveedores
      const proveedoresRes = await authenticatedFetch('/api/referencias/proveedores')
      const proveedoresData = await proveedoresRes.json()
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
      }

      // Cargar sucursales
      const sucursalesRes = await authenticatedFetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar almacenes
      const almacenesRes = await authenticatedFetch('/api/referencias/almacenes')
      const almacenesData = await almacenesRes.json()
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }

      // Cargar tipos de documento
      const tiposDocRes = await authenticatedFetch('/api/referencias/tipos-documento')
      const tiposDocData = await tiposDocRes.json()
      if (tiposDocData.success) {
        setTiposDocumento(tiposDocData.data)
      }

      // Cargar órdenes de compra
      const ordenesRes = await authenticatedFetch('/api/compras/ordenes')
      const ordenesData = await ordenesRes.json()
      if (ordenesData.success) {
        setOrdenesCompra(ordenesData.data)
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

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido'
    }

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.tipo_doc_id) {
      newErrors.tipo_doc_id = 'El tipo de documento es requerido'
    }

    if (formData.monto_compra <= 0) {
      newErrors.monto_compra = 'El monto de la compra debe ser mayor a 0'
    }

    if (formData.fecha_compra && isNaN(Date.parse(formData.fecha_compra))) {
      newErrors.fecha_compra = 'La fecha de la compra no es válida'
    }

    if (formData.fecha_comprobante && isNaN(Date.parse(formData.fecha_comprobante))) {
      newErrors.fecha_comprobante = 'La fecha del comprobante no es válida'
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
      const dataToSave = mode === 'create' 
        ? formData 
        : { ...formData, compra_id: compra?.compra_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando compra:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCondicionPagoLabel = (condicion: string) => {
    const labels: { [key: string]: string } = {
      'contado': 'Contado',
      'credito_15': 'Crédito 15 días',
      'credito_30': 'Crédito 30 días',
      'credito_45': 'Crédito 45 días',
      'credito_60': 'Crédito 60 días'
    }
    return labels[condicion] || condicion
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Registro de Compra' : 
               mode === 'edit' ? 'Editar Registro de Compra' : 
               'Ver Registro de Compra'}
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
                  <Receipt className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha_compra">Fecha de la Compra</Label>
                    <Input
                      id="fecha_compra"
                      type="date"
                      value={formData.fecha_compra || ''}
                      onChange={(e) => handleInputChange('fecha_compra', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_compra ? 'border-red-500' : ''}
                    />
                    {errors.fecha_compra && (
                      <p className="text-sm text-red-500">{errors.fecha_compra}</p>
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
                        <SelectItem value="en_progreso">En Progreso</SelectItem>
                        <SelectItem value="completada">Completada</SelectItem>
                        <SelectItem value="cancelada">Cancelada</SelectItem>
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
                            {proveedor.nombre_proveedor}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.proveedor_id && (
                      <p className="text-sm text-red-500">{errors.proveedor_id}</p>
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
                      value={formData.almacen_id?.toString() || 'no-almacen'}
                      onValueChange={(value) => handleInputChange('almacen_id', value && value !== 'no-almacen' ? parseInt(value) : undefined)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar almacén (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-almacen">Sin almacén</SelectItem>
                        {almacenes.map((almacen) => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orden_compra_id">Orden de Compra</Label>
                    <Select
                      value={formData.orden_compra_id?.toString() || 'no-orden'}
                      onValueChange={(value) => handleInputChange('orden_compra_id', value && value !== 'no-orden' ? parseInt(value) : undefined)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar orden (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no-orden">Sin orden</SelectItem>
                        {ordenesCompra.map((orden) => (
                          <SelectItem key={orden.orden_compra_id} value={orden.orden_compra_id.toString()}>
                            {orden.nro_comprobante} - {orden.proveedor_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto_compra">Monto de la Compra</Label>
                    <Input
                      id="monto_compra"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_compra || ''}
                      onChange={(e) => handleInputChange('monto_compra', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                      className={errors.monto_compra ? 'border-red-500' : ''}
                    />
                    {errors.monto_compra && (
                      <p className="text-sm text-red-500">{errors.monto_compra}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condicion_pago">Condición de Pago</Label>
                    <Select
                      value={formData.condicion_pago}
                      onValueChange={(value) => handleInputChange('condicion_pago', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar condición" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contado">Contado</SelectItem>
                        <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                        <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                        <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                        <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Comprobante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Información del Comprobante
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_doc_id">Tipo de Documento</Label>
                    <Select
                      value={formData.tipo_doc_id?.toString()}
                      onValueChange={(value) => handleInputChange('tipo_doc_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.tipo_doc_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar tipo de documento" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDocumento.map((tipo) => (
                          <SelectItem key={tipo.tipo_doc_id} value={tipo.tipo_doc_id.toString()}>
                            {tipo.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipo_doc_id && (
                      <p className="text-sm text-red-500">{errors.tipo_doc_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_comprobante">Fecha del Comprobante</Label>
                    <Input
                      id="fecha_comprobante"
                      type="date"
                      value={formData.fecha_comprobante || ''}
                      onChange={(e) => handleInputChange('fecha_comprobante', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_comprobante ? 'border-red-500' : ''}
                    />
                    {errors.fecha_comprobante && (
                      <p className="text-sm text-red-500">{errors.fecha_comprobante}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nro_factura">Número de Factura</Label>
                    <Input
                      id="nro_factura"
                      type="text"
                      value={formData.nro_factura || ''}
                      onChange={(e) => handleInputChange('nro_factura', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="Número de factura..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timbrado">Timbrado</Label>
                    <Input
                      id="timbrado"
                      type="text"
                      value={formData.timbrado || ''}
                      onChange={(e) => handleInputChange('timbrado', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="Número de timbrado..."
                    />
                  </div>
                </div>
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
