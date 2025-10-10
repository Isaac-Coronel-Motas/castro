'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  FileText,
  Building,
  Users,
  AlertCircle
} from 'lucide-react'
import { useAuthenticatedFetch } from '@/hooks/use-authenticated-fetch'
import { InformePresupuestos, FiltrosInformePresupuestos } from '@/lib/types/informes-servicios'

export function InformePresupuestosComponent() {
  const authenticatedFetch = useAuthenticatedFetch()
  const [informe, setInforme] = useState<InformePresupuestos | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filtros, setFiltros] = useState<FiltrosInformePresupuestos>({
    fecha_desde: '',
    fecha_hasta: '',
    sucursal_id: undefined,
    tecnico_id: undefined,
    cliente_id: undefined,
    estado: '',
    tipo_presu: '',
    valido_desde: '',
    valido_hasta: '',
    promocion_id: undefined,
    tipo_periodo: 'mes'
  })
  const [sucursales, setSucursales] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [promociones, setPromociones] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData()
    loadInforme()
  }, [])

  const loadInitialData = async () => {
    try {
      const [sucursalesRes, tecnicosRes, clientesRes, promocionesRes] = await Promise.all([
        authenticatedFetch.authenticatedFetch('/api/sucursales'),
        authenticatedFetch.authenticatedFetch('/api/servicios/referencias/tecnicos'),
        authenticatedFetch.authenticatedFetch('/api/referencias/clientes'),
        authenticatedFetch.authenticatedFetch('/api/servicios/referencias/promociones')
      ])
      
      const sucursalesData = await sucursalesRes.json()
      const tecnicosData = await tecnicosRes.json()
      const clientesData = await clientesRes.json()
      const promocionesData = await promocionesRes.json()
      
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }
      if (tecnicosData.success) {
        setTecnicos(tecnicosData.data)
      }
      if (clientesData.success) {
        setClientes(clientesData.data)
      }
      if (promocionesData.success) {
        setPromociones(promocionesData.data)
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
      if (filtros.tecnico_id) params.append('tecnico_id', filtros.tecnico_id.toString())
      if (filtros.cliente_id) params.append('cliente_id', filtros.cliente_id.toString())
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.tipo_presu) params.append('tipo_presu', filtros.tipo_presu)
      if (filtros.valido_desde) params.append('valido_desde', filtros.valido_desde)
      if (filtros.valido_hasta) params.append('valido_hasta', filtros.valido_hasta)
      if (filtros.promocion_id) params.append('promocion_id', filtros.promocion_id.toString())
      if (filtros.tipo_periodo) params.append('tipo_periodo', filtros.tipo_periodo)

      const response = await authenticatedFetch.authenticatedFetch(`/api/servicios/informes/presupuestos?${params.toString()}`)
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

  const handleFiltroChange = (key: keyof FiltrosInformePresupuestos, value: any) => {
    setFiltros(prev => ({
      ...prev,
      [key]: value
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

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'aprobado': 'bg-green-100 text-green-800',
      'rechazado': 'bg-red-100 text-red-800',
      'vencido': 'bg-gray-100 text-gray-800'
    }
    return colores[estado] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Cargando informe...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{error}</p>
            <Button onClick={loadInforme} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros del Informe de Presupuestos</CardTitle>
          <CardDescription>
            Configure los filtros para generar el informe de presupuestos de servicio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha_desde">Fecha Desde</Label>
              <Input
                id="fecha_desde"
                type="date"
                value={filtros.fecha_desde || ''}
                onChange={(e) => handleFiltroChange('fecha_desde', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha_hasta">Fecha Hasta</Label>
              <Input
                id="fecha_hasta"
                type="date"
                value={filtros.fecha_hasta || ''}
                onChange={(e) => handleFiltroChange('fecha_hasta', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Sucursal</Label>
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
              <Label>Técnico</Label>
              <Select
                value={filtros.tecnico_id?.toString() || 'all'}
                onValueChange={(value) => handleFiltroChange('tecnico_id', value === 'all' ? undefined : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los técnicos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los técnicos</SelectItem>
                  {tecnicos.map((tecnico) => (
                    <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id?.toString() || ''}>
                      {tecnico.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
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
                      {cliente.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Select
                value={filtros.estado || 'all'}
                onValueChange={(value) => handleFiltroChange('estado', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobado">Aprobado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Presupuesto</Label>
              <Select
                value={filtros.tipo_presu || 'all'}
                onValueChange={(value) => handleFiltroChange('tipo_presu', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="con_diagnostico">Con Diagnóstico</SelectItem>
                  <SelectItem value="sin_diagnostico">Sin Diagnóstico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de Período</Label>
              <Select
                value={filtros.tipo_periodo || 'mes'}
                onValueChange={(value) => handleFiltroChange('tipo_periodo', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dia">Diario</SelectItem>
                  <SelectItem value="semana">Semanal</SelectItem>
                  <SelectItem value="mes">Mensual</SelectItem>
                  <SelectItem value="año">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={loadInforme} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Generar Informe
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {informe && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Presupuestos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNumber(informe.resumen.total_registros)}</div>
                <p className="text-xs text-muted-foreground">
                  Presupuestos generados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(informe.resumen.valor_total || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Valor total presupuestado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Registro</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(informe.resumen.promedio_por_registro || 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Promedio por presupuesto
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tendencia</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{informe.resumen.porcentaje_cambio || 0}%</div>
                <p className="text-xs text-muted-foreground">
                  Cambio vs período anterior
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Estado</CardTitle>
              <CardDescription>Estado de los presupuestos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {informe.por_estado.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge className={getEstadoColor(item.estado)}>
                        {item.estado}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(item.cantidad)}</div>
                      <div className="text-sm text-gray-500">{item.porcentaje}%</div>
                      {item.valor_total && (
                        <div className="text-sm text-gray-500">{formatCurrency(item.valor_total)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Técnicos y Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Técnicos</CardTitle>
                <CardDescription>Técnicos con más presupuestos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {informe.por_tecnico.slice(0, 5).map((tecnico, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                        </div>
                        <span className="font-medium">{tecnico.tecnico_nombre}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(tecnico.cantidad_registros)}</div>
                        <div className="text-sm text-gray-500">{tecnico.porcentaje}%</div>
                        {tecnico.valor_total && (
                          <div className="text-sm text-gray-500">{formatCurrency(tecnico.valor_total)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Clientes</CardTitle>
                <CardDescription>Clientes con más presupuestos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {informe.por_cliente.slice(0, 5).map((cliente, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-green-600">{index + 1}</span>
                        </div>
                        <span className="font-medium">{cliente.cliente_nombre}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatNumber(cliente.cantidad_registros)}</div>
                        <div className="text-sm text-gray-500">{cliente.porcentaje}%</div>
                        {cliente.valor_total && (
                          <div className="text-sm text-gray-500">{formatCurrency(cliente.valor_total)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Distribución por Sucursal */}
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Sucursal</CardTitle>
              <CardDescription>Presupuestos por sucursal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {informe.por_sucursal.map((sucursal, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span className="font-medium">{sucursal.sucursal_nombre}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(sucursal.cantidad_registros)}</div>
                      <div className="text-sm text-gray-500">{sucursal.porcentaje}%</div>
                      {sucursal.valor_total && (
                        <div className="text-sm text-gray-500">{formatCurrency(sucursal.valor_total)}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tendencias Mensuales */}
          <Card>
            <CardHeader>
              <CardTitle>Tendencias Mensuales</CardTitle>
              <CardDescription>Evolución de los presupuestos en los últimos meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {informe.tendencias_mensuales.map((tendencia, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{tendencia.mes}</span>
                      {getTendenciaIcon(tendencia.tendencia)}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatNumber(tendencia.cantidad_registros)}</div>
                      {tendencia.valor_total && (
                        <div className="text-sm text-gray-500">{formatCurrency(tendencia.valor_total)}</div>
                      )}
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
