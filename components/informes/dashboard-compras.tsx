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
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  Building,
  Download,
  RefreshCw,
  Settings,
  ArrowRightLeft
} from "lucide-react"
import { DashboardCompras, FiltrosInformeBase } from "@/lib/types/informes"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"

export function DashboardComprasComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [dashboard, setDashboard] = useState<DashboardCompras | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformeBase>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadDashboard()
  }, [])

  const loadInitialData = async () => {
    try {
      const sucursalesRes = await authenticatedFetch.authenticatedFetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
    }
  }

  const loadDashboard = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
      if (filtros.sucursal_id) params.append('sucursal_id', filtros.sucursal_id.toString())
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/compras/informes/dashboard?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setDashboard(data.data)
      } else {
        setError(data.message || 'Error al cargar el dashboard')
      }
    } catch (error) {
      console.error('Error cargando dashboard:', error)
      setError('Error al cargar el dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (field: keyof FiltrosInformeBase, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerarDashboard = () => {
    loadDashboard()
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
            Filtros del Dashboard
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

          <div className="flex justify-end mt-4">
            <Button onClick={handleGenerarDashboard} disabled={loading} className="bg-primary hover:bg-primary/90">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generar Dashboard
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
              <span className="ml-2">Generando dashboard...</span>
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

      {/* Dashboard Content */}
      {dashboard && !loading && (
        <div className="space-y-6">
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Pedidos</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(dashboard.resumen_general.total_pedidos)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Presupuestos</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(dashboard.resumen_general.total_presupuestos)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Órdenes</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(dashboard.resumen_general.total_ordenes)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-1 text-white">
                    <Package className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Compras</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(dashboard.resumen_general.total_compras)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2 text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Valores Monetarios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Valor Total de Compras
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {formatCurrency(dashboard.resumen_general.valor_total_compras)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Período: {new Date(dashboard.periodo.fecha_desde).toLocaleDateString('es-CR')} - {new Date(dashboard.periodo.fecha_hasta).toLocaleDateString('es-CR')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Valor Total de Órdenes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-1">
                  {formatCurrency(dashboard.resumen_general.valor_total_ordenes)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Promedio por orden: {formatCurrency(dashboard.resumen_general.valor_total_ordenes / Math.max(dashboard.resumen_general.total_ordenes, 1))}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Valor Total de Presupuestos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-chart-2">
                  {formatCurrency(dashboard.resumen_general.valor_total_presupuestos)}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Promedio por presupuesto: {formatCurrency(dashboard.resumen_general.valor_total_presupuestos / Math.max(dashboard.resumen_general.total_presupuestos, 1))}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Proveedores */}
          {dashboard.top_proveedores && dashboard.top_proveedores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Top Proveedores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.top_proveedores.slice(0, 10).map((proveedor, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{proveedor.proveedor_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(proveedor.cantidad_registros)} registros ({proveedor.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(proveedor.valor_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Sucursal */}
          {dashboard.distribucion_por_sucursal && dashboard.distribucion_por_sucursal.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Distribución por Sucursal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboard.distribucion_por_sucursal.map((sucursal, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{sucursal.sucursal_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(sucursal.cantidad_registros)} registros ({sucursal.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(sucursal.valor_total)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tendencias Generales */}
          {dashboard.tendencias_generales && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendencias Generales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {dashboard.tendencias_generales.compras_mensuales && (
                    <div>
                      <h4 className="font-medium mb-4">Compras Mensuales</h4>
                      <div className="space-y-3">
                        {dashboard.tendencias_generales.compras_mensuales.slice(0, 6).map((mes, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{mes.mes}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{formatNumber(mes.cantidad)}</span>
                              {getTendenciaIcon(mes.tendencia)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboard.tendencias_generales.ordenes_mensuales && (
                    <div>
                      <h4 className="font-medium mb-4">Órdenes Mensuales</h4>
                      <div className="space-y-3">
                        {dashboard.tendencias_generales.ordenes_mensuales.slice(0, 6).map((mes, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{mes.mes}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{formatNumber(mes.cantidad)}</span>
                              {getTendenciaIcon(mes.tendencia)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboard.tendencias_generales.presupuestos_mensuales && (
                    <div>
                      <h4 className="font-medium mb-4">Presupuestos Mensuales</h4>
                      <div className="space-y-3">
                        {dashboard.tendencias_generales.presupuestos_mensuales.slice(0, 6).map((mes, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="text-sm">{mes.mes}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">{formatNumber(mes.cantidad)}</span>
                              {getTendenciaIcon(mes.tendencia)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
