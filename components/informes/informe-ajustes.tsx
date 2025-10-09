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
  Package, 
  Warehouse, 
  Building,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Target
} from "lucide-react"
import { InformeAjustesInventario, FiltrosInformeAjustes } from "@/lib/types/informes"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"

export function InformeAjustesComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformeAjustesInventario | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformeAjustes>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    almacen_id: undefined,
    motivo_id: undefined,
    estado: '',
    tipo_movimiento: '',
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [almacenes, setAlmacenes] = useState<any[]>([])
  const [motivos, setMotivos] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadInforme()
  }, [])

  const loadInitialData = async () => {
    try {
      const [sucursalesRes, almacenesRes, motivosRes] = await Promise.all([
        authenticatedFetch.authenticatedFetch('/api/sucursales'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/almacenes'),
        authenticatedFetch.authenticatedFetch('/api/compras/referencias/motivos-ajuste')
      ])
      
      const sucursalesData = await sucursalesRes.json()
      const almacenesData = await almacenesRes.json()
      const motivosData = await motivosRes.json()
      
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }
      if (almacenesData.success) {
        setAlmacenes(almacenesData.data)
      }
      if (motivosData.success) {
        setMotivos(motivosData.data)
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
      if (filtros.motivo_id) params.append('motivo_id', filtros.motivo_id.toString())
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_movimiento) params.append('tipo_movimiento', filtros.tipo_movimiento)
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/compras/informes/ajustes?${params.toString()}`)
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

  const handleFiltroChange = (field: keyof FiltrosInformeAjustes, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerarInforme = () => {
    loadInforme()
  }

  const handleExportarInforme = () => {
    console.log('Exportar informe de ajustes:', informe)
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

  const getTipoMovimientoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowUp className="h-4 w-4 text-green-500" />
      case 'salida':
        return <ArrowDown className="h-4 w-4 text-red-500" />
      default:
        return <ArrowUpDown className="h-4 w-4 text-blue-500" />
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CR').format(num)
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtros del Informe de Ajustes de Inventario
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
              <Label htmlFor="motivo_id">Motivo</Label>
              <Select
                value={filtros.motivo_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('motivo_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los motivos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los motivos</SelectItem>
                  {motivos.map((motivo) => (
                    <SelectItem key={motivo.motivo_id} value={motivo.motivo_id.toString()}>
                      {motivo.descripcion}
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
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="validado">Validado</SelectItem>
                  <SelectItem value="anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_movimiento">Tipo de Movimiento</Label>
              <Select
                value={filtros.tipo_movimiento || 'all'}
                onValueChange={(value) => handleFiltroChange('tipo_movimiento', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="salida">Salida</SelectItem>
                  <SelectItem value="ajuste">Ajuste</SelectItem>
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Ajustes</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_registros)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                    <Target className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Total Detalles</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_detalles)}</p>
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
                    <p className="text-sm font-medium text-muted-foreground mb-1">Cantidad Total</p>
                    <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.cantidad_total_ajustada)}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-chart-2 text-white">
                    <ArrowUpDown className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Entradas vs Salidas</p>
                    <div className="flex gap-2">
                      <span className="text-sm text-green-500">↑ {formatNumber(informe.resumen.cantidad_entradas)}</span>
                      <span className="text-sm text-red-500">↓ {formatNumber(informe.resumen.cantidad_salidas)}</span>
                    </div>
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
                          {formatNumber(estado.cantidad)} ajustes ({estado.porcentaje.toFixed(1)}%)
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

          {/* Distribución por Almacén */}
          {informe.por_almacen && informe.por_almacen.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Warehouse className="h-5 w-5" />
                  Distribución por Almacén
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_almacen.map((almacen, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-medium">{almacen.almacen_nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {almacen.sucursal_nombre} • {formatNumber(almacen.cantidad_registros)} ajustes ({almacen.porcentaje.toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(almacen.cantidad_total)} unidades</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(almacen.total_detalles)} detalles</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Motivo */}
          {informe.por_motivo && informe.por_motivo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Distribución por Motivo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_motivo.map((motivo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{motivo.motivo_descripcion}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(motivo.cantidad)} ajustes ({motivo.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(motivo.cantidad_total)} unidades</p>
                        <p className="text-sm text-muted-foreground">{formatNumber(motivo.total_detalles)} detalles</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Distribución por Tipo de Movimiento */}
          {informe.por_tipo_movimiento && informe.por_tipo_movimiento.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="h-5 w-5" />
                  Distribución por Tipo de Movimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.por_tipo_movimiento.map((tipo, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTipoMovimientoIcon(tipo.tipo_movimiento)}
                        <Badge variant="outline">{tipo.tipo_movimiento}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatNumber(tipo.cantidad_detalles)} detalles ({tipo.porcentaje.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(tipo.cantidad_total)} unidades</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Productos */}
          {informe.top_productos && informe.top_productos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Top Productos Más Ajustados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {informe.top_productos.slice(0, 10).map((producto, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                        <div>
                          <p className="font-medium">{producto.producto_descripcion}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(producto.cantidad_ajustes)} ajustes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatNumber(producto.cantidad_total)} total</p>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-500">↑ {formatNumber(producto.cantidad_entradas)}</span>
                          <span className="text-red-500">↓ {formatNumber(producto.cantidad_salidas)}</span>
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
                        <span className="text-sm font-medium">{formatNumber(mes.cantidad_ajustes)} ajustes</span>
                        <span className="text-sm text-muted-foreground">{formatNumber(mes.cantidad_total)} unidades</span>
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
