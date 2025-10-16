"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  DollarSign, 
  Receipt, 
  Users, 
  Building,
  Download,
  RefreshCw,
  CreditCard,
  FileText,
  UserCheck
} from "lucide-react"
import { InformeNotasCreditoDebito, FiltrosInformeNotas } from "@/lib/types/informes"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"

export function InformeNotasComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformeNotasCreditoDebito | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformeNotas>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    almacen_id: undefined,
    tipo_operacion: '',
    estado: '',
    proveedor_id: undefined,
    cliente_id: undefined,
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadInforme()
  }, [])

  const loadInitialData = async () => {
    try {
      const [sucursalesRes, almacenesRes, proveedoresRes, clientesRes] = await Promise.all([
        authenticatedFetch.authenticatedFetch('/api/sucursales'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/almacenes'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/proveedores'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/clientes')
      ])
      
      const sucursalesData = await sucursalesRes.json()
      const almacenesData = await almacenesRes.json()
      const proveedoresData = await proveedoresRes.json()
      const clientesData = await clientesRes.json()
      
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
      }
      if (clientesData.success) {
        setClientes(clientesData.data)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
    }
  }

  const loadInforme = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
      if (filtros.sucursal_id) params.append('sucursal_id', filtros.sucursal_id.toString())
      if (filtros.almacen_id) params.append('almacen_id', filtros.almacen_id.toString())
      if (filtros.tipo_operacion) params.append('tipo_operacion', filtros.tipo_operacion)
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.proveedor_id) params.append('proveedor_id', filtros.proveedor_id.toString())
      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id.toString())
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/compras/informes/notas?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setInforme(data.data)
      } else {
        setError(data.message || 'Error al cargar el informe')
      }
    } catch (error) {
      console.error('Error cargando informe:', error)
      setError('Error al cargar el informe')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (field: keyof FiltrosInformeNotas, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerarInforme = () => {
    loadInforme()
  }

  const handleExportarInforme = () => {
    console.log('Exportar informe de notas:', informe)
    // Implementar exportación
  }

  const getTendenciaIcon = (tendencia: 'up' | 'down' | 'stable') => {
    switch (tendencia) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const formatCurrency = (amount: number) => {
    return `PYG ${amount.toLocaleString('es-PY')}`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-PY').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtros del Informe de Notas de Crédito/Débito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_desde">Fecha Desde</Label>
              <Input
                id="fecha_desde"
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
              <Input
                id="fecha_hasta"
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sucursal_id">Sucursal</Label>
              <Select
                value={filtros.sucursal_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('sucursal_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas las sucursales" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las sucursales</SelectItem>
                  {sucursales.map((sucursal) => (
                    <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id.toString()}>
                      {sucursal.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="almacen_id">Almacén</Label>
              <Select
                value={filtros.almacen_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('almacen_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los almacenes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los almacenes</SelectItem>
                  {almacenes.map((almacen) => (
                    <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                      {almacen.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_operacion">Tipo de Operación</Label>
              <Select
                value={filtros.tipo_operacion || 'all'}
                onValueChange={(value) => handleFiltroChange('tipo_operacion', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={filtros.estado || 'all'}
                onValueChange={(value) => handleFiltroChange('estado', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proveedor_id">Proveedor</Label>
              <Select
                value={filtros.proveedor_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('proveedor_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proveedores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los proveedores</SelectItem>
                  {proveedores.map((proveedor) => (
                    <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                      {proveedor.nombre_proveedor}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cliente_id">Cliente</Label>
              <Select
                value={filtros.cliente_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('cliente_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()}>
                      {cliente.nombre_cliente}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_periodo">Tipo de Período</Label>
              <Select
                value={filtros.tipo_periodo}
                onValueChange={(value) => handleFiltroChange('tipo_periodo', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                  <SelectItem value="trimestre">Trimestre</SelectItem>
                  <SelectItem value="año">Año</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button onClick={handleGenerarInforme} disabled={loading} className="bg-primary hover:bg-primary/90">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generar Informe
            </Button>
            <Button onClick={handleExportarInforme} variant="outline" disabled={!informe}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Generando informe...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-500">
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informe Content */}
      {informe && !loading && (
        <div className="space-y-6">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Notas</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_registros)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <Receipt className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Créditos</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(informe.resumen.monto_total_credito)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-500 text-white">
                    <CreditCard className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Débitos</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(informe.resumen.monto_total_debito)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-500 text-white">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Balance Neto</p>
                    <p className={`text-2xl font-bold ${informe.resumen.monto_total_general >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(informe.resumen.monto_total_general)}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por Estado */}
          {informe.por_estado && informe.por_estado.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Distribución por Estado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_estado.map((estado, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{estado.estado}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(estado.cantidad)} notas ({estado.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(estado.monto_total)}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">C: {formatCurrency(estado.monto_credito)}</span>
                          <span className="text-red-500">D: {formatCurrency(estado.monto_debito)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Tipo de Operación */}
          {informe.por_tipo_operacion && informe.por_tipo_operacion.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Distribución por Tipo de Operación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_tipo_operacion.map((tipo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{tipo.tipo_operacion}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(tipo.cantidad)} notas ({tipo.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(tipo.monto_total)}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">C: {formatCurrency(tipo.monto_credito)}</span>
                          <span className="text-red-500">D: {formatCurrency(tipo.monto_debito)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Proveedores */}
          {informe.por_proveedor && informe.por_proveedor.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Proveedores (Compras)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_proveedor.slice(0, 10).map((proveedor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{proveedor.proveedor_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(proveedor.cantidad_registros)} notas ({proveedor.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(proveedor.monto_total)}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">C: {formatCurrency(proveedor.monto_credito)}</span>
                          <span className="text-red-500">D: {formatCurrency(proveedor.monto_debito)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Clientes */}
          {informe.por_cliente && informe.por_cliente.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Top Clientes (Ventas)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_cliente.slice(0, 10).map((cliente, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{cliente.cliente_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(cliente.cantidad_registros)} notas ({cliente.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(cliente.monto_total)}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">C: {formatCurrency(cliente.monto_credito)}</span>
                          <span className="text-red-500">D: {formatCurrency(cliente.monto_debito)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Sucursal */}
          {informe.por_sucursal && informe.por_sucursal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Distribución por Sucursal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_sucursal.map((sucursal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{sucursal.sucursal_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(sucursal.cantidad_registros)} notas ({sucursal.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(sucursal.monto_total)}</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">C: {formatCurrency(sucursal.monto_credito)}</span>
                          <span className="text-red-500">D: {formatCurrency(sucursal.monto_debito)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tendencias Mensuales */}
          {informe.tendencias_mensuales && informe.tendencias_mensuales.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias Mensuales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {informe.tendencias_mensuales.slice(0, 12).map((mes, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{mes.mes} {mes.año}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{formatNumber(mes.cantidad)} notas</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(mes.monto_total)}</span>
                        {getTendenciaIcon(mes.tendencia)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
