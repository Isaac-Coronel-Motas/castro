"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { InformeVentas, FiltrosInformeVentas } from "@/lib/types/informes-ventas"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
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
  CreditCard,
  Receipt,
  Filter
} from "lucide-react"

export default function InformesVentasPage() {
  const { token } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformeVentas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformeVentas>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: 'all',
    cliente_id: 'all',
    categoria_id: 'all',
    estado: 'all',
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [categorias, setCategorias] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (token) {
      loadInitialData()
      loadInforme()
    }
  }, [token, loadInitialData, loadInforme])

  const loadInitialData = useCallback(async () => {
    if (!token) return
    
    try {
      // Cargar sucursales
      const sucursalesRes = await authenticatedFetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar clientes
      const clientesRes = await authenticatedFetch('/api/referencias/clientes')
      const clientesData = await clientesRes.json()
      if (clientesData.success) {
        setClientes(clientesData.data)
      }

      // Cargar categorías
      const categoriasRes = await authenticatedFetch('/api/referencias/categorias')
      const categoriasData = await categoriasRes.json()
      if (categoriasData.success) {
        setCategorias(categoriasData.data)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
    }
  }, [token, authenticatedFetch])

  const loadInforme = useCallback(async () => {
    if (!token) {
      setError('No hay token de autenticación')
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      
      if (filtros.fecha_desde) params.append('fecha_desde', filtros.fecha_desde)
      if (filtros.fecha_hasta) params.append('fecha_hasta', filtros.fecha_hasta)
      if (filtros.sucursal_id && filtros.sucursal_id !== 'all') params.append('sucursal_id', filtros.sucursal_id)
      if (filtros.cliente_id && filtros.cliente_id !== 'all') params.append('cliente_id', filtros.cliente_id)
      if (filtros.categoria_id && filtros.categoria_id !== 'all') params.append('categoria_id', filtros.categoria_id)
      if (filtros.estado && filtros.estado !== 'all') params.append('estado', filtros.estado)
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch(`/api/ventas/informes?${params.toString()}`)
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
  }, [token, authenticatedFetch, filtros])

  const handleFiltroChange = (field: keyof FiltrosInformeVentas, value: string) => {
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
            <h1 className="text-3xl font-bold text-foreground">Informes de Ventas</h1>
            <p className="text-muted-foreground">Análisis y reportes del módulo de ventas</p>
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
                <Label htmlFor="cliente_id">Cliente</Label>
                <Select
                  value={filtros.cliente_id}
                  onValueChange={(value) => handleFiltroChange('cliente_id', value)}
                >
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
                    <SelectItem value="all">Todas las categorías</SelectItem>
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
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="abierto">Abierto</SelectItem>
                    <SelectItem value="cerrado">Cerrado</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
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
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Ventas</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_ventas)}</p>
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
                      <p className="text-sm font-medium text-muted-foreground mb-1">Ventas Cerradas</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_ventas_cerradas)}</p>
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
                      <p className="text-sm font-medium text-muted-foreground mb-1">Total Cobros</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_cobros)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-1 text-white">
                      <CreditCard className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Notas Crédito</p>
                      <p className="text-2xl font-bold text-foreground">{formatNumber(informe.resumen.total_notas_credito)}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-chart-2 text-white">
                      <Receipt className="h-6 w-6" />
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
                    Valor Total de Ventas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">
                    {formatCurrency(informe.resumen.valor_total_ventas)}
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
                    Valor Total de Cobros
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-chart-1">
                    {formatCurrency(informe.resumen.valor_total_cobros)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Promedio por cobro: {formatCurrency(informe.resumen.valor_total_cobros / Math.max(informe.resumen.total_cobros, 1))}
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

            {/* Top Clientes */}
            {informe.por_cliente && informe.por_cliente.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Top Clientes
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
                              {formatNumber(cliente.total_ventas)} ventas ({cliente.porcentaje.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(cliente.monto_total)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Productos */}
            {informe.por_producto && informe.por_producto.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Top Productos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {informe.por_producto.slice(0, 10).map((producto, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{producto.nombre_producto}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(producto.total_vendido)} unidades ({producto.porcentaje.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(producto.monto_total)}</p>
                          <Badge variant="outline" className="text-xs">
                            {producto.nombre_categoria}
                          </Badge>
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
                              {formatNumber(sucursal.total_ventas)} ventas ({sucursal.porcentaje.toFixed(1)}%)
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

            {/* Distribución por Categoría */}
            {informe.por_categoria && informe.por_categoria.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Distribución por Categoría
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {informe.por_categoria.map((categoria, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="font-medium">{categoria.nombre_categoria}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatNumber(categoria.total_productos)} productos ({categoria.porcentaje.toFixed(1)}%)
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(categoria.monto_total)}</p>
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
                    {informe.tendencias.ventas_periodo && (
                      <div>
                        <h4 className="font-medium mb-4">Ventas por {filtros.tipo_periodo}</h4>
                        <div className="space-y-3">
                          {informe.tendencias.ventas_periodo.slice(0, 6).map((periodo, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{periodo.periodo}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{formatNumber(periodo.cantidad)}</span>
                                {getTendenciaIcon(periodo.tendencia)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {informe.tendencias.ventas_periodo && (
                      <div>
                        <h4 className="font-medium mb-4">Monto por {filtros.tipo_periodo}</h4>
                        <div className="space-y-3">
                          {informe.tendencias.ventas_periodo.slice(0, 6).map((periodo, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <span className="text-sm">{periodo.periodo}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{formatCurrency(periodo.monto)}</span>
                                {getTendenciaIcon(periodo.tendencia)}
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
