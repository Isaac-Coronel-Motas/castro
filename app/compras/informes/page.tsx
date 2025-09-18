"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { InformeCompras, FiltrosInforme } from "@/lib/types/compras-adicionales"
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
  RefreshCw
} from "lucide-react"

export default function InformesComprasPage() {
  const [informe, setInforme] = useState<InformeCompras | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInforme>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: '',
    proveedor_id: '',
    categoria_id: '',
    estado: '',
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [proveedores, setProveedores] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadInforme()
  }, [])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await fetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar proveedores
      const proveedoresRes = await fetch('/api/referencias/proveedores')
      const proveedoresData = await proveedoresRes.json()
      if (proveedoresData.success) {
        setProveedores(proveedoresData.data)
      }

      // Cargar categorías
      const categoriasRes = await fetch('/api/referencias/categorias')
      const categoriasData = await categoriasRes.json()
      if (categoriasData.success) {
        setCategorias(categoriasData.data)
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
      if (filtros.sucursal_id) params.append('sucursal_id', filtros.sucursal_id)
      if (filtros.proveedor_id) params.append('proveedor_id', filtros.proveedor_id)
      if (filtros.categoria_id) params.append('categoria_id', filtros.categoria_id)
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await fetch(`/api/compras/informes?${params.toString()}`)
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

  const handleFiltroChange = (field: keyof FiltrosInforme, value: string) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleGenerarInforme = () => {
    loadInforme()
  }

  const handleExportarInforme = () => {
    // Implementar exportación de informe
    console.log('Exportar informe:', informe)
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

  const getTendenciaColor = (tendencia: 'up' | 'down' | 'stable') => {
    switch (tendencia) {
      case 'up':
        return 'text-green-500'
      case 'down':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CR').format(num)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Informes de Compras</h1>
            <p className="text-muted-foreground">Análisis y reportes del módulo de compras</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGenerarInforme} disabled={loading} className="bg-primary hover:bg-primary/90">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Generar Informe
            </Button>
            <Button onClick={handleExportarInforme} variant="outline" disabled={!informe}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Filtros del Informe
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
                  value={filtros.sucursal_id}
                  onValueChange={(value) => handleFiltroChange('sucursal_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las sucursales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las sucursales</SelectItem>
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
                  value={filtros.proveedor_id}
                  onValueChange={(value) => handleFiltroChange('proveedor_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los proveedores" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los proveedores</SelectItem>
                    {proveedores.map((proveedor) => (
                      <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                        {proveedor.nombre_proveedor}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria_id">Categoría</Label>
                <Select
                  value={filtros.categoria_id}
                  onValueChange={(value) => handleFiltroChange('categoria_id', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.categoria_id} value={categoria.categoria_id.toString()}>
                        {categoria.nombre_categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select
                  value={filtros.estado}
                  onValueChange={(value) => handleFiltroChange('estado', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los estados</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="aprobado">Aprobado</SelectItem>
                    <SelectItem value="rechazado">Rechazado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_periodo">Tipo de Período</Label>
                <Select
                  value={filtros.tipo_periodo}
                  onValueChange={(value) => handleFiltroChange('tipo_periodo', value)}
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
          </CardContent>
        </Card>

        {/* Contenido del Informe */}
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

        {error && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-red-500">
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {informe && !loading && (
          <div className="space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Pedidos</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_pedidos)}</p>
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
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_presupuestos)}</p>
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
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_ordenes)}</p>
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
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_compras)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2 text-white">
                      <DollarSign className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Valores Monetarios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Valor Total de Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(informe.resumen.valor_total_compras)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Período: {new Date(informe.periodo.fecha_desde).toLocaleDateString('es-CR')} - {new Date(informe.periodo.fecha_hasta).toLocaleDateString('es-CR')}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Valor Total de Órdenes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1">
                    {formatCurrency(informe.resumen.valor_total_ordenes)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Promedio por orden: {formatCurrency(informe.resumen.valor_total_ordenes / Math.max(informe.resumen.total_ordenes, 1))}
                  </p>
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
                              {formatNumber(proveedor.total_compras)} compras ({proveedor.porcentaje.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(proveedor.monto_total)}</p>
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
                              {formatNumber(sucursal.total_compras)} compras ({sucursal.porcentaje.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(sucursal.monto_total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tendencias */}
            {informe.tendencias && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tendencias
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {informe.tendencias.compras_mensuales && (
                      <div>
                        <h4 className="font-medium mb-4">Compras Mensuales</h4>
                        <div className="space-y-3">
                          {informe.tendencias.compras_mensuales.slice(0, 6).map((mes, index) => (
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

                    {informe.tendencias.monto_mensual && (
                      <div>
                        <h4 className="font-medium mb-4">Monto Mensual</h4>
                        <div className="space-y-3">
                          {informe.tendencias.monto_mensual.slice(0, 6).map((mes, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{mes.mes}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{formatCurrency(mes.monto)}</span>
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
    </AppLayout>
  )
}