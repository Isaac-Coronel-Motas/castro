'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Download, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Users,
  Building,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ShoppingCart,
  CreditCard,
  Receipt,
  Package,
  FileX,
  FileText,
  Calculator
} from 'lucide-react'
import { useAuthenticatedFetch } from '@/hooks/use-authenticated-fetch'
import { InformeDashboardVentas, FiltrosBaseInformeVentas, TopCliente, TopUsuario, DistribucionPorEstadoVentas, DistribucionPorSucursalVentas, DistribucionPorCajaVentas, TendenciaMensualVentas } from '@/lib/types/informes-ventas'

export default function DashboardVentasComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformeDashboardVentas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosBaseInformeVentas>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    cliente_id: undefined,
    usuario_id: undefined,
    estado: '',
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (authenticatedFetch.token) {
      loadInitialData()
      loadInforme()
    }
  }, [authenticatedFetch.token])

  // Recargar informe cuando cambien los filtros
  useEffect(() => {
    if (authenticatedFetch.token) {
      loadInforme()
    }
  }, [filtros, authenticatedFetch.token])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesResponse = await authenticatedFetch.authenticatedFetch('/api/sucursales')
      if (sucursalesResponse.ok) {
        const sucursalesData = await sucursalesResponse.json()
        setSucursales(sucursalesData.data || [])
      }

      // Cargar clientes
      const clientesResponse = await authenticatedFetch.authenticatedFetch('/api/clientes')
      if (clientesResponse.ok) {
        const clientesData = await clientesResponse.json()
        setClientes(clientesData.data || [])
      }

      // Cargar usuarios
      const usuariosResponse = await authenticatedFetch.authenticatedFetch('/api/usuarios')
      if (usuariosResponse.ok) {
        const usuariosData = await usuariosResponse.json()
        setUsuarios(usuariosData.data || [])
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
      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id.toString())
      if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id.toString())
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/ventas/informes/dashboard?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setInforme(data.data)
    } catch (error) {
      console.error('Error cargando informe:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof FiltrosBaseInformeVentas, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value === 'all' ? undefined : value
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CR').format(num)
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600'
    if (trend < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Cargando informe...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
        <span className="text-red-500">Error: {error}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Informe
          </CardTitle>
          <CardDescription>
            Configure los filtros para personalizar el informe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Fecha Desde */}
            <div className="space-y-2">
              <Label htmlFor="fecha_desde">Fecha Desde</Label>
              <Input
                id="fecha_desde"
                type="date"
                value={filtros.fecha_desde}
                onChange={(e) => handleFilterChange('fecha_desde', e.target.value)}
              />
            </div>

            {/* Fecha Hasta */}
            <div className="space-y-2">
              <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
              <Input
                id="fecha_hasta"
                type="date"
                value={filtros.fecha_hasta}
                onChange={(e) => handleFilterChange('fecha_hasta', e.target.value)}
              />
            </div>

            {/* Sucursal */}
            <div className="space-y-2">
              <Label>Sucursal</Label>
              <Select value={filtros.sucursal_id?.toString() || 'all'} onValueChange={(value) => handleFilterChange('sucursal_id', value)}>
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

            {/* Cliente */}
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={filtros.cliente_id?.toString() || 'all'} onValueChange={(value) => handleFilterChange('cliente_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los clientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los clientes</SelectItem>
                  {clientes.map((cliente) => (
                    <SelectItem key={cliente.cliente_id} value={cliente.cliente_id.toString()}>
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Usuario */}
            <div className="space-y-2">
              <Label>Usuario</Label>
              <Select value={filtros.usuario_id?.toString() || 'all'} onValueChange={(value) => handleFilterChange('usuario_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los usuarios</SelectItem>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.usuario_id} value={usuario.usuario_id.toString()}>
                      {usuario.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estado */}
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={filtros.estado || 'all'} onValueChange={(value) => handleFilterChange('estado', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                  <SelectItem value="completada">Completada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tipo de Período */}
            <div className="space-y-2">
              <Label>Tipo de Período</Label>
              <Select value={filtros.tipo_periodo || 'mes'} onValueChange={(value) => handleFilterChange('tipo_periodo', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo de período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Día</SelectItem>
                  <SelectItem value="semana">Semana</SelectItem>
                  <SelectItem value="mes">Mes</SelectItem>
                  <SelectItem value="año">Año</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Botones de Acción */}
            <div className="flex items-end gap-2">
              <Button onClick={loadInforme} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen General */}
      {informe && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Ventas */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(informe.resumen.total_ventas)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(informe.resumen.tendencia_ventas)}
                  <span className={`ml-1 ${getTrendColor(informe.resumen.tendencia_ventas)}`}>
                    {Math.abs(informe.resumen.tendencia_ventas)}% vs período anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Cobros */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cobros</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(informe.resumen.total_cobros)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(informe.resumen.tendencia_cobros)}
                  <span className={`ml-1 ${getTrendColor(informe.resumen.tendencia_cobros)}`}>
                    {Math.abs(informe.resumen.tendencia_cobros)}% vs período anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Pedidos */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(informe.resumen.total_pedidos)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(informe.resumen.tendencia_pedidos)}
                  <span className={`ml-1 ${getTrendColor(informe.resumen.tendencia_pedidos)}`}>
                    {Math.abs(informe.resumen.tendencia_pedidos)}% vs período anterior
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Total Clientes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(informe.resumen.total_clientes)}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(informe.resumen.tendencia_clientes)}
                  <span className={`ml-1 ${getTrendColor(informe.resumen.tendencia_clientes)}`}>
                    {Math.abs(informe.resumen.tendencia_clientes)}% vs período anterior
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Distribución de ventas por estado</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {informe.distribucion_por_estado.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold">{formatNumber(parseInt(item.cantidad))}</div>
                    <div className="text-sm text-muted-foreground">{item.estado}</div>
                    <Badge variant="secondary" className="mt-1">
                      {formatCurrency(parseFloat(item.monto))}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Clientes */}
          <Card>
            <CardHeader>
              <CardTitle>Top Clientes</CardTitle>
              <CardDescription>Clientes con mayor volumen de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {informe.top_clientes.map((cliente, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{cliente.nombre}</div>
                        <div className="text-sm text-muted-foreground">{cliente.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(parseFloat(cliente.total_ventas))}</div>
                      <div className="text-sm text-muted-foreground">{cliente.total_pedidos} pedidos</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Usuarios */}
          <Card>
            <CardHeader>
              <CardTitle>Top Usuarios</CardTitle>
              <CardDescription>Usuarios con mayor actividad de ventas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {informe.top_usuarios.map((usuario, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{usuario.nombre}</div>
                        <div className="text-sm text-muted-foreground">{usuario.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(usuario.total_ventas)}</div>
                      <div className="text-sm text-muted-foreground">{usuario.total_transacciones} transacciones</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Sucursal */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Sucursal</CardTitle>
              <CardDescription>Ventas distribuidas por sucursal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {informe.distribucion_por_sucursal.map((sucursal, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">{sucursal.nombre}</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(sucursal.total_ventas)}</div>
                    <div className="text-sm text-muted-foreground">{sucursal.total_transacciones} transacciones</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Distribución por Caja */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Caja</CardTitle>
              <CardDescription>Ventas distribuidas por caja registradora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {informe.distribucion_por_caja.map((caja, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-lg font-semibold">Caja {caja.nro_caja}</div>
                    <div className="text-2xl font-bold text-primary">{formatCurrency(parseFloat(caja.total_ventas))}</div>
                    <div className="text-sm text-muted-foreground">{caja.total_transacciones} transacciones</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendencias Mensuales */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
              <CardDescription>Evolución de ventas por mes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {informe.tendencias_mensuales.map((tendencia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{tendencia.mes}</div>
                        <div className="text-sm text-muted-foreground">{tendencia.año}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(parseFloat(tendencia.total_ventas))}</div>
                      <div className="text-sm text-muted-foreground">{tendencia.total_transacciones} transacciones</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}