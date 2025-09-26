"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Plus,
  FileText,
  TrendingDown,
  TrendingUp,
  DollarSign,
  User,
  Mail,
  Phone,
  Search,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { toast } from "sonner"

interface NotaCreditoDebitoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<boolean>
  nota?: any
  mode: 'create' | 'edit'
}

interface FormData {
  tipo: 'credito' | 'debito'
  facturaOriginal: string
  fechaFactura: string
  montoOriginal: string
  cliente_id: number
  cliente_nombre: string
  email: string
  telefono: string
  motivo: string
  descripcion: string
  montoAjuste: string
  impuestosAjuste: string
}

interface Cliente {
  cliente_id: number
  nombre: string
  email?: string
  telefono?: string
}

interface Sucursal {
  sucursal_id: number
  nombre: string
}

interface Almacen {
  almacen_id: number
  nombre: string
  descripcion?: string
  almacen_principal: boolean
  sucursal_nombre?: string
}

interface Usuario {
  usuario_id: number
  nombre: string
  username: string
}

export function NotaCreditoDebitoModal({ 
  isOpen, 
  onClose, 
  onSave, 
  nota, 
  mode 
}: NotaCreditoDebitoModalProps) {
  const { token, user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  
  const [formData, setFormData] = useState<FormData>({
    tipo: 'credito',
    facturaOriginal: '',
    fechaFactura: new Date().toISOString().split('T')[0],
    montoOriginal: '',
    cliente_id: 0,
    cliente_nombre: '',
    email: '',
    telefono: '',
    motivo: '',
    descripcion: '',
    montoAjuste: '',
    impuestosAjuste: '',
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  
  // Estados para datos de referencia
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [sucursales, setSucursales] = useState<Sucursal[]>([])
  const [almacenes, setAlmacenes] = useState<Almacen[]>([])
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  
  // Estados de carga
  const [loadingClientes, setLoadingClientes] = useState(false)
  const [loadingSucursales, setLoadingSucursales] = useState(false)
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false)
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  
  // Estados para búsqueda
  const [searchCliente, setSearchCliente] = useState('')
  const [showClienteDropdown, setShowClienteDropdown] = useState(false)

  // Cargar datos de referencia cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      loadReferenceData()
    }
  }, [isOpen])

  // Cargar datos de la nota si está en modo edición
  useEffect(() => {
    if (mode === 'edit' && nota) {
      setFormData({
        tipo: nota.tipo_nota || 'credito',
        facturaOriginal: nota.referencia_id || '',
        fechaFactura: nota.fecha_registro || new Date().toISOString().split('T')[0],
        montoOriginal: nota.monto_original?.toString() || '',
        cliente_id: nota.cliente_id || 0,
        cliente_nombre: nota.cliente_nombre || '',
        email: nota.cliente_email || '',
        telefono: nota.cliente_telefono || '',
        motivo: nota.motivo || '',
        descripcion: nota.descripcion || '',
        montoAjuste: nota.monto?.toString() || '',
        impuestosAjuste: nota.monto_iva?.toString() || '',
      })
    } else {
      // Resetear formulario para modo creación
      setFormData({
        tipo: 'credito',
        facturaOriginal: '',
        fechaFactura: new Date().toISOString().split('T')[0],
        montoOriginal: '',
        cliente_id: 0,
        cliente_nombre: '',
        email: '',
        telefono: '',
        motivo: '',
        descripcion: '',
        montoAjuste: '',
        impuestosAjuste: '',
      })
    }
    setErrors({})
  }, [mode, nota, isOpen])

  // Funciones para cargar datos de referencia
  const loadReferenceData = async () => {
    await Promise.all([
      loadClientes(),
      loadSucursales(),
      loadAlmacenes(),
      loadUsuarios()
    ])
  }

  const loadClientes = async () => {
    try {
      setLoadingClientes(true)
      const response = await authenticatedFetch('/api/referencias/clientes?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setClientes(data.data || [])
      } else {
        toast.error('Error al cargar clientes')
      }
    } catch (error) {
      console.error('Error loading clientes:', error)
      toast.error('Error al cargar clientes')
    } finally {
      setLoadingClientes(false)
    }
  }

  const loadSucursales = async () => {
    try {
      setLoadingSucursales(true)
      const response = await authenticatedFetch('/api/sucursales')
      const data = await response.json()
      
      if (data.success) {
        setSucursales(data.data || [])
      } else {
        toast.error('Error al cargar sucursales')
      }
    } catch (error) {
      console.error('Error loading sucursales:', error)
      toast.error('Error al cargar sucursales')
    } finally {
      setLoadingSucursales(false)
    }
  }

  const loadAlmacenes = async () => {
    try {
      setLoadingAlmacenes(true)
      const response = await authenticatedFetch('/api/referencias/almacenes')
      const data = await response.json()
      
      if (data.success) {
        setAlmacenes(data.data || [])
      } else {
        toast.error('Error al cargar almacenes')
      }
    } catch (error) {
      console.error('Error loading almacenes:', error)
      toast.error('Error al cargar almacenes')
    } finally {
      setLoadingAlmacenes(false)
    }
  }

  const loadUsuarios = async () => {
    try {
      setLoadingUsuarios(true)
      const response = await authenticatedFetch('/api/usuarios?limit=100')
      const data = await response.json()
      
      if (data.success) {
        setUsuarios(data.data || [])
      } else {
        toast.error('Error al cargar usuarios')
      }
    } catch (error) {
      console.error('Error loading usuarios:', error)
      toast.error('Error al cargar usuarios')
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const calculateTaxes = (amount: string): string => {
    const numAmount = parseFloat(amount) || 0
    return (numAmount * 0.13).toFixed(2)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {}

    if (!formData.facturaOriginal.trim()) {
      newErrors.facturaOriginal = 'El número de factura es requerido'
    }

    if (!formData.fechaFactura) {
      newErrors.fechaFactura = 'La fecha de factura es requerida'
    }

    if (!formData.montoOriginal || parseFloat(formData.montoOriginal) <= 0) {
      newErrors.montoOriginal = 'El monto original debe ser mayor a 0'
    }

    if (!formData.cliente_id || formData.cliente_id === 0) {
      newErrors.cliente_id = 'Debe seleccionar un cliente'
    }

    if (!formData.motivo) {
      newErrors.motivo = 'El motivo del ajuste es requerido'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'La descripción es requerida'
    }

    if (!formData.montoAjuste || parseFloat(formData.montoAjuste) <= 0) {
      newErrors.montoAjuste = 'El monto del ajuste debe ser mayor a 0'
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
      // Obtener valores por defecto del usuario actual
      const defaultSucursalId = user?.sucursales?.[0]?.sucursal_id || sucursales[0]?.sucursal_id || 1
      const defaultAlmacenId = almacenes.find(a => a.sucursal_nombre === sucursales.find(s => s.sucursal_id === defaultSucursalId)?.nombre)?.almacen_id || almacenes[0]?.almacen_id || 1
      const defaultUsuarioId = user?.usuario_id || usuarios[0]?.usuario_id || 1

      const notaData = {
        tipo_nota: formData.tipo,
        cliente_id: formData.cliente_id,
        referencia_id: formData.facturaOriginal,
        fecha_registro: formData.fechaFactura,
        motivo: formData.motivo,
        descripcion: formData.descripcion,
        monto: parseFloat(formData.montoAjuste),
        monto_iva: parseFloat(formData.impuestosAjuste),
        monto_gravada_10: parseFloat(formData.montoAjuste),
        monto_gravada_5: 0,
        monto_exenta: 0,
        estado: 'activo',
        tipo_operacion: 'venta',
        sucursal_id: defaultSucursalId,
        almacen_id: defaultAlmacenId,
        usuario_id: defaultUsuarioId,
      }

      const success = await onSave(notaData)
      if (success) {
        toast.success(
          mode === 'create' 
            ? 'Nota creada exitosamente' 
            : 'Nota actualizada exitosamente'
        )
        onClose()
      }
    } catch (error) {
      console.error('Error al guardar nota:', error)
      toast.error('Error al guardar la nota')
    } finally {
      setLoading(false)
    }
  }

  const handleFacturaSearch = async (numeroFactura: string) => {
    if (!numeroFactura.trim()) {
      toast.error('Ingrese un número de factura para buscar')
      return
    }

    try {
      const response = await authenticatedFetch(`/api/ventas/buscar-facturas?numero=${encodeURIComponent(numeroFactura)}&limit=5`)
      const data = await response.json()
      
      if (data.success && data.data.length > 0) {
        const factura = data.data[0] // Tomar la primera factura encontrada
        
        // Llenar automáticamente los datos de la factura
        setFormData(prev => ({
          ...prev,
          facturaOriginal: factura.nro_factura,
          fechaFactura: factura.fecha_venta,
          montoOriginal: factura.monto_venta.toString(),
          cliente_id: factura.cliente.cliente_id,
          cliente_nombre: factura.cliente.nombre,
          email: factura.cliente.email || '',
          telefono: factura.cliente.telefono || ''
        }))
        
        setSearchCliente(factura.cliente.nombre)
        
        toast.success(`Factura encontrada: ${factura.nro_factura} - ${factura.cliente.nombre}`)
      } else {
        toast.warning('No se encontraron facturas con ese número')
      }
    } catch (error) {
      console.error('Error buscando factura:', error)
      toast.error('Error al buscar la factura')
    }
  }

  // Funciones para manejo de clientes
  const handleClienteSelect = (cliente: Cliente) => {
    setFormData(prev => ({
      ...prev,
      cliente_id: cliente.cliente_id,
      cliente_nombre: cliente.nombre,
      email: cliente.email || '',
      telefono: cliente.telefono || ''
    }))
    setSearchCliente(cliente.nombre)
    setShowClienteDropdown(false)
    
    // Limpiar error del cliente
    if (errors.cliente_id) {
      setErrors(prev => ({
        ...prev,
        cliente_id: undefined
      }))
    }
  }

  const handleClienteSearch = (search: string) => {
    setSearchCliente(search)
    setShowClienteDropdown(search.length > 0)
  }

  // Filtrar clientes por búsqueda
  const filteredClientes = clientes.filter(cliente =>
    cliente.nombre.toLowerCase().includes(searchCliente.toLowerCase()) ||
    cliente.email?.toLowerCase().includes(searchCliente.toLowerCase()) ||
    cliente.telefono?.includes(searchCliente)
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {mode === 'create' ? 'Nueva' : 'Modificar'} Nota de Crédito/Débito
          </DialogTitle>
          <DialogDescription>
            Complete los datos para {mode === 'create' ? 'crear' : 'modificar'} una nota de ajuste contable
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Nota */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Tipo de Nota</Label>
            <RadioGroup
              value={formData.tipo}
              onValueChange={(value) => handleInputChange("tipo", value as 'credito' | 'debito')}
              className="flex gap-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="credito" id="credito" />
                <Label htmlFor="credito" className="flex items-center gap-2 cursor-pointer">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Nota de Crédito (Reducción)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="debito" id="debito" />
                <Label htmlFor="debito" className="flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  Nota de Débito (Aumento)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Información de Factura Original */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Factura Original</CardTitle>
              <CardDescription>Datos de la factura que se va a ajustar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="facturaOriginal">Número de Factura *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="facturaOriginal"
                      placeholder="F-001234"
                      value={formData.facturaOriginal}
                      onChange={(e) => handleInputChange("facturaOriginal", e.target.value)}
                      className={errors.facturaOriginal ? "border-red-500" : ""}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleFacturaSearch(formData.facturaOriginal)}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {errors.facturaOriginal && (
                    <p className="text-sm text-red-500">{errors.facturaOriginal}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaFactura">Fecha de Factura *</Label>
                  <Input
                    id="fechaFactura"
                    type="date"
                    value={formData.fechaFactura}
                    onChange={(e) => handleInputChange("fechaFactura", e.target.value)}
                    className={errors.fechaFactura ? "border-red-500" : ""}
                  />
                  {errors.fechaFactura && (
                    <p className="text-sm text-red-500">{errors.fechaFactura}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="montoOriginal">Monto Original de Factura *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="montoOriginal"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`pl-10 ${errors.montoOriginal ? "border-red-500" : ""}`}
                    value={formData.montoOriginal}
                    onChange={(e) => handleInputChange("montoOriginal", e.target.value)}
                  />
                </div>
                {errors.montoOriginal && (
                  <p className="text-sm text-red-500">{errors.montoOriginal}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
              <CardDescription>Datos del cliente asociado a la factura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cliente">Nombre del Cliente *</Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id="cliente"
                                placeholder="Buscar cliente..."
                                className={`pl-10 ${errors.cliente_id ? "border-red-500" : ""}`}
                                value={searchCliente}
                                onChange={(e) => handleClienteSearch(e.target.value)}
                                onFocus={() => setShowClienteDropdown(true)}
                              />
                              {showClienteDropdown && filteredClientes.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                  {filteredClientes.map((cliente) => (
                                    <div
                                      key={cliente.cliente_id}
                                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                      onClick={() => handleClienteSelect(cliente)}
                                    >
                                      <div className="font-medium">{cliente.nombre}</div>
                                      {cliente.email && (
                                        <div className="text-sm text-gray-500">{cliente.email}</div>
                                      )}
                                      {cliente.telefono && (
                                        <div className="text-sm text-gray-500">{cliente.telefono}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {errors.cliente_id && (
                              <p className="text-sm text-red-500">{errors.cliente_id}</p>
                            )}
                          </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="cliente@email.com"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      placeholder="8888-8888"
                      className="pl-10"
                      value={formData.telefono}
                      onChange={(e) => handleInputChange("telefono", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detalles del Ajuste */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Ajuste</CardTitle>
              <CardDescription>Información sobre el motivo y monto del ajuste</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del Ajuste *</Label>
                <Select 
                  value={formData.motivo} 
                  onValueChange={(value) => handleInputChange("motivo", value)}
                >
                  <SelectTrigger className={errors.motivo ? "border-red-500" : ""}>
                    <SelectValue placeholder="Seleccione el motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.tipo === "credito" ? (
                      <>
                        <SelectItem value="devolucion">Devolución por defecto</SelectItem>
                        <SelectItem value="descuento">Descuento por volumen</SelectItem>
                        <SelectItem value="error_facturacion">Error en facturación</SelectItem>
                        <SelectItem value="garantia">Garantía</SelectItem>
                        <SelectItem value="promocion">Promoción especial</SelectItem>
                        <SelectItem value="otro_credito">Otro motivo</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="recargo_tardio">Recargo por entrega tardía</SelectItem>
                        <SelectItem value="intereses_mora">Intereses por mora</SelectItem>
                        <SelectItem value="servicios_adicionales">Servicios adicionales</SelectItem>
                        <SelectItem value="ajuste_precio">Ajuste de precio</SelectItem>
                        <SelectItem value="gastos_envio">Gastos de envío</SelectItem>
                        <SelectItem value="otro_debito">Otro motivo</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.motivo && (
                  <p className="text-sm text-red-500">{errors.motivo}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción Detallada *</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describa detalladamente el motivo del ajuste..."
                  rows={3}
                  value={formData.descripcion}
                  onChange={(e) => handleInputChange("descripcion", e.target.value)}
                  className={errors.descripcion ? "border-red-500" : ""}
                />
                {errors.descripcion && (
                  <p className="text-sm text-red-500">{errors.descripcion}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="montoAjuste">
                    Monto del Ajuste * 
                    <span className="text-sm text-muted-foreground ml-1">
                      ({formData.tipo === "credito" ? "Reducción" : "Aumento"})
                    </span>
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="montoAjuste"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className={`pl-10 ${errors.montoAjuste ? "border-red-500" : ""}`}
                      value={formData.montoAjuste}
                      onChange={(e) => {
                        handleInputChange("montoAjuste", e.target.value)
                        // Calcular impuestos automáticamente
                        const taxes = calculateTaxes(e.target.value)
                        handleInputChange("impuestosAjuste", taxes)
                      }}
                    />
                  </div>
                  {errors.montoAjuste && (
                    <p className="text-sm text-red-500">{errors.montoAjuste}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="impuestosAjuste">Impuestos (13% IVA)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="impuestosAjuste"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10"
                      value={formData.impuestosAjuste}
                      onChange={(e) => handleInputChange("impuestosAjuste", e.target.value)}
                      readOnly
                    />
                  </div>
                </div>
              </div>

              {/* Resumen del Ajuste */}
              {formData.montoAjuste && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <h4 className="font-semibold mb-2">Resumen del Ajuste</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Monto Original:</span>
                      <div className="font-medium">₡{Number.parseFloat(formData.montoOriginal || "0").toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        {formData.tipo === "credito" ? "Reducción:" : "Aumento:"}
                      </span>
                      <div className={`font-medium ${formData.tipo === "credito" ? "text-red-600" : "text-blue-600"}`}>
                        {formData.tipo === "credito" ? "-" : "+"}₡{Number.parseFloat(formData.montoAjuste || "0").toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Impuestos:</span>
                      <div className={`font-medium ${formData.tipo === "credito" ? "text-red-600" : "text-blue-600"}`}>
                        {formData.tipo === "credito" ? "-" : "+"}₡{Number.parseFloat(formData.impuestosAjuste || "0").toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Final:</span>
                      <div className="font-bold text-lg">
                        ₡{(
                          Number.parseFloat(formData.montoOriginal || "0") + 
                          (formData.tipo === "credito" ? -1 : 1) * 
                          (Number.parseFloat(formData.montoAjuste || "0") + Number.parseFloat(formData.impuestosAjuste || "0"))
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {mode === 'create' ? 'Creando...' : 'Actualizando...'}
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  {mode === 'create' ? 'Crear Nota' : 'Actualizar Nota'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
