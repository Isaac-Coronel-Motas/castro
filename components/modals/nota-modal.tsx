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
import { NotaCredito, NotaDebito, CreateNotaCreditoRequest, CreateNotaDebitoRequest, UpdateNotaCreditoRequest, UpdateNotaDebitoRequest } from "@/lib/types/compras"
import { FileText, Calendar, User, Building, Warehouse, DollarSign, Receipt, CreditCard } from "lucide-react"

interface NotaModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateNotaCreditoRequest | CreateNotaDebitoRequest | UpdateNotaCreditoRequest | UpdateNotaDebitoRequest) => Promise<void>
  nota?: NotaCredito | NotaDebito | null
  mode: 'create' | 'edit' | 'view'
  tipo: 'credito' | 'debito'
}

export function NotaModal({ isOpen, onClose, onSave, nota, mode, tipo }: NotaModalProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState<CreateNotaCreditoRequest | CreateNotaDebitoRequest>({
    tipo_operacion: 'compra',
    sucursal_id: 1,
    almacen_id: 1,
    usuario_id: user?.usuario_id || 0,
    referencia_id: 0,
    estado: 'activo',
    motivo: '',
    monto_nc: 0,
    monto_gravada_5: 0,
    monto_gravada_10: 0,
    monto_exento: 0,
    total_iva: 0,
    total_nota: 0
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [referencias, setReferencias] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (nota && mode !== 'create') {
        setFormData({
          tipo_operacion: nota.tipo_operacion,
          sucursal_id: nota.sucursal_id,
          almacen_id: nota.almacen_id,
          usuario_id: nota.usuario_id,
          referencia_id: nota.referencia_id,
          estado: nota.estado,
          motivo: nota.motivo || '',
          fecha_registro: nota.fecha_registro,
          proveedor_id: nota.proveedor_id,
          cliente_id: nota.cliente_id,
          monto_nc: tipo === 'credito' ? (nota as NotaCredito).monto_nc : 0,
          monto_nd: tipo === 'debito' ? (nota as NotaDebito).monto_nd : 0,
          monto_gravada_5: nota.monto_gravada_5,
          monto_gravada_10: nota.monto_gravada_10,
          monto_exento: nota.monto_exento,
          total_iva: nota.total_iva,
          total_nota: nota.total_nota
        })
      }
    }
  }, [isOpen, nota, mode, tipo])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar almacenes
      const almacenesRes = await fetch('/api/almacenes')
      const almacenesData = await almacenesRes.json()
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }

      // Cargar proveedores
      const proveedoresRes = await fetch('/api/referencias/proveedores')
      const proveedoresData = await proveedoresRes.json()
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
      }

      // Cargar clientes
      const clientesRes = await fetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar referencias (compras)
      const referenciasRes = await fetch('/api/compras/registro')
      const referenciasData = await referenciasRes.json()
      if (referenciasData.success) {
        setReferencias(referenciasData.data)
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

    if (!formData.tipo_operacion) {
      newErrors.tipo_operacion = 'El tipo de operación es requerido'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.almacen_id) {
      newErrors.almacen_id = 'El almacén es requerido'
    }

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.referencia_id) {
      newErrors.referencia_id = 'La referencia es requerida'
    }

    if (formData.tipo_operacion === 'compra' && !formData.proveedor_id) {
      newErrors.proveedor_id = 'El proveedor es requerido para operaciones de compra'
    }

    if (formData.tipo_operacion === 'venta' && !formData.cliente_id) {
      newErrors.cliente_id = 'El cliente es requerido para operaciones de venta'
    }

    if (formData.fecha_registro && isNaN(Date.parse(formData.fecha_registro))) {
      newErrors.fecha_registro = 'La fecha de registro no es válida'
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
        : { ...formData, [`nota_${tipo}_id`]: nota?.[`nota_${tipo}_id`] }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando nota:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalNota = () => {
    const montoGravada5 = formData.monto_gravada_5 || 0
    const montoGravada10 = formData.monto_gravada_10 || 0
    const montoExento = formData.monto_exento || 0
    const totalIva = formData.total_iva || 0
    
    return montoGravada5 + montoGravada10 + montoExento + totalIva
  }

  if (!isOpen) return null

  const titulo = tipo === 'credito' ? 'Nota de Crédito' : 'Nota de Débito'
  const icono = tipo === 'credito' ? CreditCard : Receipt

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? `Nueva ${titulo}` : 
               mode === 'edit' ? `Editar ${titulo}` : 
               `Ver ${titulo}`}
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
                  <FileText className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_operacion">Tipo de Operación</Label>
                    <Select
                      value={formData.tipo_operacion}
                      onValueChange={(value) => handleInputChange('tipo_operacion', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.tipo_operacion ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compra">Compra</SelectItem>
                        <SelectItem value="venta">Venta</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.tipo_operacion && (
                      <p className="text-sm text-red-500">{errors.tipo_operacion}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fecha_registro">Fecha de Registro</Label>
                    <Input
                      id="fecha_registro"
                      type="date"
                      value={formData.fecha_registro || ''}
                      onChange={(e) => handleInputChange('fecha_registro', e.target.value)}
                      disabled={mode === 'view'}
                      className={errors.fecha_registro ? 'border-red-500' : ''}
                    />
                    {errors.fecha_registro && (
                      <p className="text-sm text-red-500">{errors.fecha_registro}</p>
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
                        <SelectItem value="activo">Activo</SelectItem>
                        <SelectItem value="anulado">Anulado</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.estado && (
                      <p className="text-sm text-red-500">{errors.estado}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referencia_id">Referencia</Label>
                    <Select
                      value={formData.referencia_id?.toString()}
                      onValueChange={(value) => handleInputChange('referencia_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.referencia_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar referencia" />
                      </SelectTrigger>
                      <SelectContent>
                        {referencias.map((ref) => (
                          <SelectItem key={ref.compra_id} value={ref.compra_id.toString()}>
                            {ref.nro_factura || `Compra #${ref.compra_id}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.referencia_id && (
                      <p className="text-sm text-red-500">{errors.referencia_id}</p>
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
                  <Label htmlFor="motivo">Motivo</Label>
                  <Textarea
                    id="motivo"
                    value={formData.motivo || ''}
                    onChange={(e) => handleInputChange('motivo', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Motivo de la nota..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información de Cliente/Proveedor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  {formData.tipo_operacion === 'compra' ? 'Información del Proveedor' : 'Información del Cliente'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={formData.tipo_operacion === 'compra' ? 'proveedor_id' : 'cliente_id'}>
                    {formData.tipo_operacion === 'compra' ? 'Proveedor' : 'Cliente'}
                  </Label>
                  <Select
                    value={formData.tipo_operacion === 'compra' ? formData.proveedor_id?.toString() : formData.cliente_id?.toString()}
                    onValueChange={(value) => handleInputChange(
                      formData.tipo_operacion === 'compra' ? 'proveedor_id' : 'cliente_id', 
                      parseInt(value)
                    )}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className={errors[formData.tipo_operacion === 'compra' ? 'proveedor_id' : 'cliente_id'] ? 'border-red-500' : ''}>
                      <SelectValue placeholder={`Seleccionar ${formData.tipo_operacion === 'compra' ? 'proveedor' : 'cliente'}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {(formData.tipo_operacion === 'compra' ? proveedores : clientes).map((item) => (
                        <SelectItem key={item[`${formData.tipo_operacion === 'compra' ? 'proveedor' : 'cliente'}_id`]} value={item[`${formData.tipo_operacion === 'compra' ? 'proveedor' : 'cliente'}_id`].toString()}>
                          {item[`nombre_${formData.tipo_operacion === 'compra' ? 'proveedor' : 'cliente'}`]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors[formData.tipo_operacion === 'compra' ? 'proveedor_id' : 'cliente_id'] && (
                    <p className="text-sm text-red-500">{errors[formData.tipo_operacion === 'compra' ? 'proveedor_id' : 'cliente_id']}</p>
                  )}
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
                    <Label htmlFor={tipo === 'credito' ? 'monto_nc' : 'monto_nd'}>
                      Monto {tipo === 'credito' ? 'Nota de Crédito' : 'Nota de Débito'}
                    </Label>
                    <Input
                      id={tipo === 'credito' ? 'monto_nc' : 'monto_nd'}
                      type="number"
                      min="0"
                      step="0.01"
                      value={tipo === 'credito' ? (formData as CreateNotaCreditoRequest).monto_nc || '' : (formData as CreateNotaDebitoRequest).monto_nd || ''}
                      onChange={(e) => handleInputChange(tipo === 'credito' ? 'monto_nc' : 'monto_nd', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto_gravada_5">Monto Gravado 5%</Label>
                    <Input
                      id="monto_gravada_5"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_gravada_5 || ''}
                      onChange={(e) => handleInputChange('monto_gravada_5', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto_gravada_10">Monto Gravado 10%</Label>
                    <Input
                      id="monto_gravada_10"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_gravada_10 || ''}
                      onChange={(e) => handleInputChange('monto_gravada_10', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="monto_exento">Monto Exento</Label>
                    <Input
                      id="monto_exento"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.monto_exento || ''}
                      onChange={(e) => handleInputChange('monto_exento', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_iva">Total IVA</Label>
                    <Input
                      id="total_iva"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_iva || ''}
                      onChange={(e) => handleInputChange('total_iva', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="total_nota">Total Nota</Label>
                    <Input
                      id="total_nota"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.total_nota || ''}
                      onChange={(e) => handleInputChange('total_nota', parseFloat(e.target.value) || 0)}
                      disabled={mode === 'view'}
                    />
                  </div>
                </div>

                {/* Resumen de Montos */}
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto Gravado 5%:</span>
                    <span className="font-medium">₡{(formData.monto_gravada_5 || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto Gravado 10%:</span>
                    <span className="font-medium">₡{(formData.monto_gravada_10 || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Monto Exento:</span>
                    <span className="font-medium">₡{(formData.monto_exento || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total IVA:</span>
                    <span className="font-medium">₡{(formData.total_iva || 0).toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-semibold">Total Nota:</span>
                    <span className="font-bold text-lg">₡{calculateTotalNota().toLocaleString()}</span>
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
