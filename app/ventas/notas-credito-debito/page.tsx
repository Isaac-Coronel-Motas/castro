"use client"

import { useState, useEffect } from "react"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Receipt,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { toast } from "sonner"

export default function NotasCreditoDebitoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [notas, setNotas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchNotas()
  }, [])

  const fetchNotas = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: '1',
        limit: '100',
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { tipo_nota: typeFilter })
      })

      const response = await fetch(`/api/ventas/notas-credito-debito?${params}`)
      const data = await response.json()

      if (data.success) {
        setNotas(data.data || [])
        setError(null)
      } else {
        setError(data.message || 'Error al cargar las notas')
        toast.error(data.message || 'Error al cargar las notas')
      }
    } catch (err) {
      setError('Error de conexión')
      toast.error('Error de conexión')
      console.error('Error fetching notas:', err)
    } finally {
      setLoading(false)
    }
  }

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchNotas()
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [searchTerm, typeFilter])

  const filteredNotas = notas.filter((nota) => {
    const matchesSearch =
      nota.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.nro_nota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.motivo?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || nota.tipo_nota === typeFilter
    return matchesSearch && matchesType
  })

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800 border-green-200"
      case "anulado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "activo":
        return <CheckCircle className="h-4 w-4" />
      case "anulado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === "credito" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
  }

  const getTipoColor = (tipo: string) => {
    return tipo === "credito" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"
  }

  // Métricas calculadas
  const totalNotas = notas.length
  const notasCredito = notas.filter((n) => n.tipo_nota === "credito").length
  const notasDebito = notas.filter((n) => n.tipo_nota === "debito").length
  const montoTotalAjustes = notas.filter((n) => n.estado === "activo").reduce((sum, n) => {
    const monto = parseFloat(n.monto) || 0
    return sum + (n.tipo_nota === "credito" ? -monto : monto)
  }, 0)

  if (loading) {
    return (
      <AppLayout 
        title="Notas de Crédito/Débito" 
        subtitle="Gestión de ajustes contables y correcciones de ventas"
        currentModule="Ventas"
        currentSubmodule="Notas de Crédito/Débito"
      >
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando notas...</span>
        </div>
      </AppLayout>
    )
  }

  if (error) {
    return (
      <AppLayout 
        title="Notas de Crédito/Débito" 
        subtitle="Gestión de ajustes contables y correcciones de ventas"
        currentModule="Ventas"
        currentSubmodule="Notas de Crédito/Débito"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error al cargar las notas</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchNotas} variant="outline">
              Reintentar
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      title="Notas de Crédito/Débito" 
      subtitle="Gestión de ajustes contables y correcciones de ventas"
      currentModule="Ventas"
      currentSubmodule="Notas de Crédito/Débito"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header de la página */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Notas de Crédito/Débito</h1>
            <p className="text-muted-foreground">Gestión de ajustes contables y correcciones de ventas</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Nota
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notas</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{totalNotas}</div>
              <p className="text-xs text-muted-foreground">Todas las notas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas de Crédito</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{notasCredito}</div>
              <p className="text-xs text-muted-foreground">Reducciones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notas de Débito</CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{notasDebito}</div>
              <p className="text-xs text-muted-foreground">Aumentos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monto Total Ajustes</CardTitle>
              <DollarSign className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${montoTotalAjustes >= 0 ? "text-accent" : "text-destructive"}`}>
                ₡{Math.abs(montoTotalAjustes).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {montoTotalAjustes >= 0 ? "Aumentos netos" : "Reducciones netas"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Notas de Crédito/Débito</CardTitle>
            <CardDescription>Gestiona todos los ajustes contables y correcciones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="credito">Notas de Crédito</SelectItem>
                  <SelectItem value="debito">Notas de Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabla de notas */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nota</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Motivo</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredNotas.map((nota) => (
                    <tr key={`${nota.tipo_nota}-${nota.id}`} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTipoColor(nota.tipo_nota)} flex items-center gap-1`}>
                            {getTipoIcon(nota.tipo_nota)}
                            {nota.tipo_nota === "credito" ? "NC" : "ND"}
                          </Badge>
                          <div>
                            <div className="font-medium">{nota.nro_nota}</div>
                            <div className="text-sm text-muted-foreground">Usuario: {nota.usuario_nombre}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {nota.cliente_nombre
                                ?.split(" ")
                                .map((n: string) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{nota.cliente_nombre}</div>
                            <div className="text-sm text-muted-foreground">ID: {nota.cliente_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{nota.fecha_registro}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="max-w-32">
                          <div className="font-medium text-sm">{nota.motivo}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div
                          className={`font-bold text-lg ${nota.tipo_nota === "credito" ? "text-destructive" : "text-primary"}`}
                        >
                          {nota.tipo_nota === "credito" ? "-" : "+"}₡{(parseFloat(nota.monto) || 0).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={`${getStatusColor(nota.estado)} flex items-center gap-1`}>
                          {getStatusIcon(nota.estado)}
                          {nota.estado_display}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" title="Ver detalles">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Editar">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" title="Eliminar">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredNotas.length === 0 && !loading && (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay notas disponibles</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || typeFilter !== 'all' 
                    ? 'No se encontraron notas que coincidan con los filtros aplicados.'
                    : 'Aún no se han creado notas de crédito o débito.'
                  }
                </p>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Nota
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
