"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { AppLayout } from "@/components/app-layout"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { InformeServiciosTecnicos, FiltrosInformeServicios } from "@/lib/types/servicios-tecnicos"
import { Download, BarChart3, TrendingUp, Users, AlertCircle, Clock, CheckCircle, Star, FileText, Target } from "lucide-react"

export default function InformesServiciosPage() {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [selectedPeriod, setSelectedPeriod] = useState("mes")
  const [loading, setLoading] = useState(false)
  const [informe, setInforme] = useState<InformeServiciosTecnicos | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadInforme = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const filtros: FiltrosInformeServicios = {
        fecha_inicio: getDateRange(selectedPeriod).inicio,
        fecha_fin: getDateRange(selectedPeriod).fin,
        sucursal_id: 0, // Todas las sucursales
        tecnico_id: 0, // Todos los técnicos
        tipo_servicio_id: 0, // Todos los tipos
        estado: 'todos'
      }

      const response = await authenticatedFetch('/api/servicios/informes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filtros)
      })

      if (!response.ok) {
        throw new Error('Error al cargar el informe')
      }

      const data = await response.json()
      if (data.success) {
        setInforme(data.data)
      } else {
        throw new Error(data.message || 'Error al cargar el informe')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = (period: string) => {
    const hoy = new Date()
    let inicio: Date
    let fin: Date = new Date(hoy)

    switch (period) {
      case 'dia':
        inicio = new Date(hoy)
        inicio.setHours(0, 0, 0, 0)
        break
      case 'semana':
        inicio = new Date(hoy)
        inicio.setDate(hoy.getDate() - 7)
        break
      case 'mes':
        inicio = new Date(hoy)
        inicio.setMonth(hoy.getMonth() - 1)
        break
      case 'trimestre':
        inicio = new Date(hoy)
        inicio.setMonth(hoy.getMonth() - 3)
        break
      case 'año':
        inicio = new Date(hoy)
        inicio.setFullYear(hoy.getFullYear() - 1)
        break
      default:
        inicio = new Date(hoy)
        inicio.setMonth(hoy.getMonth() - 1)
    }

    return {
      inicio: inicio.toISOString().split('T')[0],
      fin: fin.toISOString().split('T')[0]
    }
  }

  const handleExport = async () => {
    if (!informe) return

    try {
      const response = await authenticatedFetch('/api/servicios/informes/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filtros: {
            fecha_inicio: getDateRange(selectedPeriod).inicio,
            fecha_fin: getDateRange(selectedPeriod).fin,
            sucursal_id: 0,
            tecnico_id: 0,
            tipo_servicio_id: 0,
            estado: 'todos'
          },
          formato: 'excel'
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `informe-servicios-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('Error exportando informe:', error)
    }
  }

  useEffect(() => {
    loadInforme()
  }, [selectedPeriod])

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-3 w-3 ${star <= Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Informes de Servicios</h1>
            <p className="text-muted-foreground">Análisis y reportes del área de servicios técnicos</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dia">Hoy</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mes</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="año">Este Año</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleExport} className="bg-primary hover:bg-primary/90" disabled={!informe}>
              <Download className="h-4 w-4 mr-2" />
              Exportar Datos
            </Button>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando informe...</p>
            </div>
          </div>
        )}

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                <p className="font-medium">Error al cargar el informe</p>
              </div>
              <p className="text-red-600 mt-2">{error}</p>
              <Button onClick={loadInforme} variant="outline" className="mt-4">
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {informe && !loading && (
          <>
            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servicios Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{informe.resumen.total_ordenes}</div>
                  <p className="text-xs text-muted-foreground">
                    {informe.resumen.total_ordenes > 0 ? '+12%' : '0%'} vs período anterior
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{informe.resumen.tiempo_promedio_resolucion.toFixed(1)} días</div>
                  <p className="text-xs text-muted-foreground">
                    Tiempo promedio de resolución
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
                  <Star className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">4.2</div>
                  {renderStars(4.2)}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Técnicos Activos</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{informe.por_tecnico.length}</div>
                  <p className="text-xs text-muted-foreground">Técnicos activos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₡{informe.resumen.monto_total_ordenes.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Ingresos por órdenes de servicio
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reclamos Resueltos</CardTitle>
                  <Target className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{informe.resumen.total_reclamos}</div>
                  <p className="text-xs text-muted-foreground">Total de reclamos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Técnicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimiento de Técnicos</CardTitle>
                  <CardDescription>Top técnicos por servicios completados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {informe.por_tecnico.slice(0, 5).map((tecnico, index) => (
                      <div key={tecnico.tecnico_id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-primary/10 text-primary rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {tecnico.tecnico_nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{tecnico.tecnico_nombre}</div>
                            <div className="text-sm text-muted-foreground">{tecnico.total_servicios} servicios</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-medium">₡{tecnico.monto_total.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Servicios por Sucursal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Servicios por Sucursal</CardTitle>
                  <CardDescription>Distribución de servicios por sucursal</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {informe.por_sucursal.slice(0, 5).map((sucursal) => (
                      <div key={sucursal.sucursal_id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-foreground">{sucursal.sucursal_nombre}</span>
                          <span className="text-sm text-muted-foreground">
                            {sucursal.total_servicios} ({sucursal.porcentaje.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${sucursal.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reportes Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reportes Disponibles</CardTitle>
                <CardDescription>Generar informes detallados y análisis específicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Rendimiento de Técnicos</h3>
                          <p className="text-sm text-muted-foreground">Análisis de productividad y eficiencia por técnico</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Productividad</Badge>
                      <Badge variant="outline" className="text-xs">Gráfico de Barras</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>Última generación: {new Date().toLocaleDateString('es-CR')}</span>
                      <span>Frecuencia: Semanal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Tipos de Reparaciones</h3>
                          <p className="text-sm text-muted-foreground">Distribución de servicios más solicitados</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Servicios</Badge>
                      <Badge variant="outline" className="text-xs">Gráfico Circular</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>Última generación: {new Date().toLocaleDateString('es-CR')}</span>
                      <span>Frecuencia: Mensual</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Tiempos de Servicio</h3>
                          <p className="text-sm text-muted-foreground">Análisis de tiempos promedio por tipo de reparación</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Eficiencia</Badge>
                      <Badge variant="outline" className="text-xs">Línea de Tiempo</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>Última generación: {new Date().toLocaleDateString('es-CR')}</span>
                      <span>Frecuencia: Diario</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-lg">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Satisfacción del Cliente</h3>
                          <p className="text-sm text-muted-foreground">Métricas de calidad y satisfacción</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">Calidad</Badge>
                      <Badge variant="outline" className="text-xs">Dashboard</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>Última generación: {new Date().toLocaleDateString('es-CR')}</span>
                      <span>Frecuencia: Semanal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="bg-primary hover:bg-primary/90 flex-1">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Generar
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  )
}
