"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { useVentas, useVentasStats } from "@/hooks/use-ventas"
import { Venta } from "@/lib/types/ventas"
import { ModalNuevaVenta } from "@/components/modals/modal-nueva-venta"
import { LoadingSpinner } from "@/components/ui/loading"
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Receipt,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Banknote,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react"

export default function RegistroVentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")

  // Usar hooks para obtener datos de la API
  const {
    ventas,
    loading: ventasLoading,
    error: ventasError,
    pagination,
    updateSearch,
    updateFilters,
    refetch: refetchVentas
  } = useVentas({
    page: 1,
    limit: 10,
    search: searchTerm,
    filters: {
      forma_cobro_id: paymentFilter !== "all" ? parseInt(paymentFilter) : undefined
    }
  })

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats
  } = useVentasStats()

  // Manejar cambios en la búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    updateSearch(value)
  }

  // Manejar cambios en el filtro de pago
  const handlePaymentFilterChange = (value: string) => {
    setPaymentFilter(value)
    updateFilters({
      forma_cobro_id: value !== "all" ? parseInt(value) : undefined
    })
  }

  const getPaymentIcon = (formaCobroNombre: string) => {
    const metodo = formaCobroNombre?.toLowerCase() || ""
    switch (metodo) {
      case "efectivo":
        return <Banknote className="h-4 w-4" />
      case "tarjeta":
        return <CreditCard className="h-4 w-4" />
      case "transferencia":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  const getPaymentColor = (formaCobroNombre: string) => {
    const metodo = formaCobroNombre?.toLowerCase() || ""
    switch (metodo) {
      case "efectivo":
        return "bg-green-100 text-green-800 border-green-200"
      case "tarjeta":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "transferencia":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "cerrado":
        return "bg-green-100 text-green-800 border-green-200"
      case "abierto":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "cerrado":
        return <CheckCircle className="h-4 w-4" />
      case "abierto":
        return <Clock className="h-4 w-4" />
      case "cancelado":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES')
  }

  // Formatear hora para mostrar
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Registro de Ventas</h1>
            <p className="text-gray-600 mt-2">Historial completo de transacciones y facturación</p>
          </div>
          <ModalNuevaVenta onVentaCreated={refetchVentas} />
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Ventas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalVentas || 0}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.ventasCompletadas || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Ingresos Totales</p>
                  <p className="text-2xl font-bold text-gray-900">₡{(stats?.ingresosTotales || 0).toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Clientes Atendidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.clientesAtendidos || 0}</p>
                </div>
                <Users className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de Ventas */}
        <DataTable
          title="Historial de Ventas"
          data={ventas}
          columns={[
            {
              key: 'venta_id',
              header: 'Venta',
              render: (venta: Venta) => (
                <div>
                  <div className="font-medium">V-{venta.venta_id.toString().padStart(4, '0')}</div>
                  <div className="text-sm text-gray-500">Factura: {venta.nro_factura || 'N/A'}</div>
                </div>
              ),
            },
            {
              key: 'cliente_nombre',
              header: 'Cliente',
              render: (venta: Venta) => (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {venta.cliente_nombre
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "N/A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{venta.cliente_nombre || 'Cliente no especificado'}</div>
                    <div className="text-sm text-gray-500">{venta.cliente_telefono || 'N/A'}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'fecha_venta',
              header: 'Fecha/Hora',
              render: (venta: Venta) => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{formatDate(venta.fecha_venta)}</div>
                    <div className="text-sm text-gray-500">{formatTime(venta.fecha_venta)}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'total_productos',
              header: 'Productos',
              render: (venta: Venta) => (
                <div className="flex items-center gap-1">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{venta.total_productos || 0}</span>
                  <span className="text-sm text-gray-500">items</span>
                </div>
              ),
            },
            {
              key: 'monto_venta',
              header: 'Total',
              render: (venta: Venta) => (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-bold text-lg">₡{(venta.monto_venta || 0).toLocaleString()}</span>
                </div>
              ),
            },
            {
              key: 'forma_cobro_nombre',
              header: 'Método Pago',
              render: (venta: Venta) => (
                <Badge className={`${getPaymentColor(venta.forma_cobro_nombre || '')} flex items-center gap-1`}>
                  {getPaymentIcon(venta.forma_cobro_nombre || '')}
                  {venta.forma_cobro_nombre || 'N/A'}
                </Badge>
              ),
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (venta: Venta) => (
                <Badge className={`${getStatusColor(venta.estado)} flex items-center gap-1`}>
                  {getStatusIcon(venta.estado)}
                  {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                </Badge>
              ),
            },
          ]}
          loading={ventasLoading}
          error={ventasError}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={handleSearchChange}
          onCreate={() => {}}
          createButtonText="Nueva Venta"
          searchPlaceholder="Buscar por cliente, factura..."
          emptyMessage="No hay ventas registradas"
        />
      </div>
    </AppLayout>
  )
}
