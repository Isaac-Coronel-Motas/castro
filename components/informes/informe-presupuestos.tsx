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
  FileText, 
  Users, 
  Building,
  Download,
  RefreshCw,
  Percent
} from "lucide-react"
import { InformePresupuestos, FiltrosInformePresupuestos } from "@/lib/types/informes"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"

export function InformePresupuestosComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformePresupuestos | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformePresupuestos>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    proveedor_id: undefined,
    estado: '',
    valido_hasta: '',
    descuento_min: undefined,
    descuento_max: undefined,
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadInforme()
  }, [])

  const loadInitialData = async () => {
    try {
      const [sucursalesRes, proveedoresRes] = await Promise.all([
        authenticatedFetch.authenticatedFetch('/api/sucursales'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/proveedores')
      ])
      
      const sucursalesData = await sucursalesRes.json()
      const proveedoresData = await proveedoresRes.json()
      
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
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
      if (filtros.proveedor_id) params.append('proveedor_id', filtros.proveedor_id.toString())
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.valido_hasta) params.append('valido_hasta', filtros.valido_hasta)
      if (filtros.descuento_min !== undefined) params.append('descuento_min', filtros.descuento_min.toString())
      if (filtros.descuento_max !== undefined) params.append('descuento_max', filtros.descuento_max.toString())
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/compras/informes/presupuestos?${params.toString()}`)
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

  const handleFiltroChange = (field: keyof FiltrosInformePresupuestos, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerarInforme = () => {
    loadInforme()
  }

  const handleExportarInforme = () => {
    console.log('Exportar informe de presupuestos:', informe)
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
            Filtros del Informe de Presupuestos
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
              <Label htmlFor="valido_hasta">Válido Hasta</Label>
              <Input
                id="valido_hasta"
                type="date"
                value={filtros.valido_hasta}
                onChange={(e) => handleFiltroChange('valido_hasta', e.target.value)}
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
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="enviado">Enviado</SelectItem>
                  <SelectItem value="recibido">Recibido</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="vencido">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="descuento_min">Descuento Mínimo (%)</Label>
              <Input
                id="descuento_min"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={filtros.descuento_min || ''}
                onChange={(e) => handleFiltroChange('descuento_min', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="descuento_max">Descuento Máximo (%)</Label>
              <Input
                id="descuento_max"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={filtros.descuento_max || ''}
                onChange={(e) => handleFiltroChange('descuento_max', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Presupuestos</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_registros)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Valor Total</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(informe.resumen.valor_total)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-1 text-white">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Promedio por Presupuesto</p>
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(informe.resumen.promedio_por_registro)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2 text-white">
                    <BarChart3 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Cambio vs Período Anterior</p>
                    <p className={`text-2xl font-bold ${informe.resumen.porcentaje_cambio >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {informe.resumen.porcentaje_cambio >= 0 ? '+' : ''}{informe.resumen.porcentaje_cambio.toFixed(1)}%
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary text-secondary-foreground">
                    {getTendenciaIcon(informe.resumen.porcentaje_cambio >= 0 ? 'up' : 'down')}
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
                          {formatNumber(estado.cantidad)} ({estado.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${estado.porcentaje}%` }}
                        />
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
                  Top Proveedores
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
                            {formatNumber(proveedor.cantidad_registros)} presupuestos ({proveedor.porcentaje.toFixed(1)}%)
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

          {/* Distribución por Descuento */}
          {informe.por_descuento && informe.por_descuento.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Distribución por Descuento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_descuento.map((descuento, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{descuento.rango_descuento}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(descuento.cantidad)} ({descuento.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div 
                          className="bg-chart-1 h-2 rounded-full" 
                          style={{ width: `${descuento.porcentaje}%` }}
                        />
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
                            {formatNumber(sucursal.cantidad_registros)} presupuestos ({sucursal.porcentaje.toFixed(1)}%)
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
                        <span className="text-sm font-medium">{formatNumber(mes.cantidad)}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(mes.valor_total)}</span>
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
