"use client"

import { useState } from "react"
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useVentas, useVentasStats } from "@/hooks/use-ventas"
import { Venta } from "@/lib/types/ventas"
import { ModalNuevaVenta } from "@/components/modals/modal-nueva-venta"
import { LoadingSpinner } from "@/components/ui/loading"
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display"

export default function RegistroVentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"])

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

  const sidebarItems = [
    {
      label: "Dashboard",
      icon: "📊",
      href: "/dashboard",
    },
    {
      label: "Compras",
      icon: "🛒",
      submenu: [
        { label: "Pedidos de Compra", href: "/compras/pedidos-de-compra" },
        { label: "Presupuestos Proveedor", href: "/compras/presupuestos" },
        { label: "Órdenes de Compra", href: "/compras/ordenes" },
        { label: "Registro de Compras", href: "/compras/registro" },
        { label: "Ajustes de Inventario", href: "/compras/ajustes" },
        { label: "Notas de Crédito/Débito", href: "/compras/notas" },
        { label: "Transferencias", href: "/compras/transferencias" },
        { label: "Informes", href: "/compras/informes" },
      ],
    },
    {
      label: "Servicios Técnicos",
      icon: "🔧",
      submenu: [
        { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente" },
        { label: "Recepción de Equipos", href: "/servicios/recepcion-equipos" },
        { label: "Diagnósticos", href: "/servicios/diagnosticos" },
        { label: "Presupuestos", href: "/servicios/presupuestos" },
        { label: "Órdenes de Servicio", href: "/servicios/ordenes-servicio" },
        { label: "Retiro de Equipos", href: "/servicios/retiro-equipos" },
        { label: "Reclamos", href: "/servicios/reclamos" },
        { label: "Informes", href: "/servicios/informes" },
      ],
    },
    {
      label: "Ventas",
      icon: "💰",
      submenu: [
        { label: "Apertura/Cierre Caja", href: "/ventas/apertura-cierre-caja" },
        { label: "Pedidos de Clientes", href: "/ventas/pedidos-clientes" },
        { label: "Registro de Ventas", href: "/ventas/registro" },
        { label: "Cobros", href: "/ventas/cobros" },
        { label: "Presupuestos", href: "/ventas/presupuestos" },
        { label: "Notas de Remisión", href: "/ventas/notas-remision" },
        { label: "Notas de Crédito/Débito", href: "/ventas/notas-credito-debito" },
        { label: "Informes", href: "/ventas/informes" },
      ],
    },
    {
      label: "Referencias",
      icon: "📋",
      submenu: [
        { label: "Proveedores", href: "/referencias/proveedores" },
        { label: "Productos", href: "/referencias/productos" },
        { label: "Categorías", href: "/referencias/categorias" },
        { label: "Clientes", href: "/referencias/clientes" },
        { label: "Marcas", href: "/referencias/marcas" },
        { label: "Tipos de Servicio", href: "/referencias/tipos-servicio" },
      ],
    },
    {
      label: "Administración",
      icon: "⚙️",
      submenu: [
        { label: "Usuarios", href: "/administracion/usuarios" },
        { label: "Roles y Permisos", href: "/administracion/roles-permisos" },
        { label: "Auditoría", href: "/administracion/auditoria" },
        { label: "Configuración", href: "/administracion/configuracion" },
      ],
    },
  ]

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]))
  }

  const navigateTo = (href: string) => {
    window.location.href = href
  }

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
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-sidebar border-r border-sidebar-border transition-all duration-300 flex flex-col`}
      >
        {/* Header del Sidebar */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <span className="text-sidebar-primary-foreground font-bold text-sm">TC</span>
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-semibold text-sidebar-foreground">Taller Castro</h2>
                <p className="text-xs text-muted-foreground">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => (item.submenu ? toggleSubmenu(item.label) : navigateTo(item.href!))}
                className="w-full flex items-center gap-3 px-3 py-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.submenu && (
                      <span
                        className={`transform transition-transform ${expandedMenus.includes(item.label) ? "rotate-90" : ""}`}
                      >
                        ▶
                      </span>
                    )}
                  </>
                )}
              </button>

              {!sidebarCollapsed && item.submenu && expandedMenus.includes(item.label) && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.label}
                      onClick={() => navigateTo(subItem.href)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        subItem.label === "Registro de Ventas"
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      }`}
                    >
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-muted rounded-lg">
                ☰
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input placeholder="Buscar ventas, clientes, facturas..." className="pl-10 w-80" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
                <Button variant="ghost" size="sm">
                  🔔
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Jaime Castro</div>
                  <div className="text-muted-foreground">Administrador</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header de la página */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Registro de Ventas</h1>
                <p className="text-muted-foreground">Historial completo de transacciones y facturación</p>
              </div>
              <ModalNuevaVenta onVentaCreated={refetchVentas} />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                  <Receipt className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSpinner size="sm" text="Cargando..." />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-primary">{stats?.totalVentas || 0}</div>
                      <p className="text-xs text-muted-foreground">Todas las transacciones</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSpinner size="sm" text="Cargando..." />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-secondary">{stats?.ventasCompletadas || 0}</div>
                      <p className="text-xs text-muted-foreground">Ventas finalizadas</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSpinner size="sm" text="Cargando..." />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-accent">₡{(stats?.ingresosTotales || 0).toLocaleString()}</div>
                      <p className="text-xs text-muted-foreground">Ventas completadas</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
                  <Users className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  {statsLoading ? (
                    <LoadingSpinner size="sm" text="Cargando..." />
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-chart-4">{stats?.clientesAtendidos || 0}</div>
                      <p className="text-xs text-muted-foreground">Clientes únicos</p>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Historial de Ventas</CardTitle>
                <CardDescription>Registro completo de todas las transacciones realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar ventas..."
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={paymentFilter} onValueChange={handlePaymentFilterChange}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Método de pago" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="1">Efectivo</SelectItem>
                      <SelectItem value="2">Tarjeta</SelectItem>
                      <SelectItem value="3">Transferencia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Estado de carga y error */}
                {ventasError && (
                  <ErrorDisplay
                    title="Error al cargar las ventas"
                    message={ventasError}
                    onRetry={refetchVentas}
                    className="mb-4"
                  />
                )}

                {/* Tabla de ventas */}
                {ventasLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="lg" text="Cargando ventas..." />
                  </div>
                ) : ventas.length === 0 ? (
                  <EmptyState
                    title="No se encontraron ventas"
                    description="No hay ventas que coincidan con los filtros aplicados"
                    action={{
                      label: "Limpiar filtros",
                      onClick: () => {
                        setSearchTerm("")
                        setPaymentFilter("all")
                        updateSearch("")
                        updateFilters({})
                      }
                    }}
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Venta</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha/Hora</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subtotal</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Impuestos</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Método Pago</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventas.map((venta: Venta) => (
                          <tr key={venta.venta_id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="font-medium">V-{venta.venta_id.toString().padStart(4, '0')}</div>
                              <div className="text-sm text-muted-foreground">Factura: {venta.nro_factura || 'N/A'}</div>
                              <div className="text-sm text-muted-foreground">Sucursal: {venta.sucursal_nombre || 'N/A'}</div>
                            </td>
                            <td className="py-3 px-4">
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
                                  <div className="text-sm text-muted-foreground">{venta.cliente_telefono || 'N/A'}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="text-sm font-medium">{formatDate(venta.fecha_venta)}</div>
                                  <div className="text-sm text-muted-foreground">{formatTime(venta.fecha_venta)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Receipt className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{venta.total_productos || 0}</span>
                                <span className="text-sm text-muted-foreground">items</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">₡{((venta.monto_gravada_5 || 0) + (venta.monto_gravada_10 || 0) + (venta.monto_exenta || 0)).toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium text-muted-foreground">₡{(venta.monto_iva || 0).toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-bold text-primary text-lg">₡{(venta.monto_venta || 0).toLocaleString()}</div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${getPaymentColor(venta.forma_cobro_nombre || '')} flex items-center gap-1`}>
                                {getPaymentIcon(venta.forma_cobro_nombre || '')}
                                {venta.forma_cobro_nombre || 'N/A'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge className={`${getStatusColor(venta.estado)} flex items-center gap-1`}>
                                {getStatusIcon(venta.estado)}
                                {venta.estado.charAt(0).toUpperCase() + venta.estado.slice(1)}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
