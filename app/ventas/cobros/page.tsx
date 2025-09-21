"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function CobrosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"])

  // Datos de ejemplo para cobros
  const cobros = [
    {
      id: "COB-001",
      cliente: "María González",
      email: "maria@email.com",
      telefono: "8812-3456",
      factura: "F-001234",
      fechaVenta: "2024-01-10",
      fechaVencimiento: "2024-01-25",
      diasVencido: 5,
      montoOriginal: 118650,
      montoPagado: 50000,
      saldoPendiente: 68650,
      estado: "vencido",
      ultimoContacto: "2024-01-20",
      vendedor: "Juan Pérez",
    },
    {
      id: "COB-002",
      cliente: "Carlos Rodríguez",
      email: "carlos@email.com",
      telefono: "8765-4321",
      factura: "F-001235",
      fechaVenta: "2024-01-15",
      fechaVencimiento: "2024-02-15",
      diasVencido: 0,
      montoOriginal: 282500,
      montoPagado: 0,
      saldoPendiente: 282500,
      estado: "pendiente",
      ultimoContacto: "2024-01-15",
      vendedor: "Ana Martínez",
    },
    {
      id: "COB-003",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      telefono: "8654-3210",
      factura: "F-001236",
      fechaVenta: "2024-01-12",
      fechaVencimiento: "2024-01-27",
      diasVencido: 3,
      montoOriginal: 96050,
      montoPagado: 96050,
      saldoPendiente: 0,
      estado: "pagado",
      ultimoContacto: "2024-01-27",
      vendedor: "Juan Pérez",
    },
    {
      id: "COB-004",
      cliente: "Luis Hernández",
      email: "luis@email.com",
      telefono: "8543-2109",
      factura: "F-001237",
      fechaVenta: "2024-01-08",
      fechaVencimiento: "2024-01-23",
      diasVencido: 7,
      montoOriginal: 203400,
      montoPagado: 100000,
      saldoPendiente: 103400,
      estado: "vencido",
      ultimoContacto: "2024-01-18",
      vendedor: "Ana Martínez",
    },
    {
      id: "COB-005",
      cliente: "Carmen Jiménez",
      email: "carmen@email.com",
      telefono: "8432-1098",
      factura: "F-001238",
      fechaVenta: "2024-01-20",
      fechaVencimiento: "2024-02-20",
      diasVencido: 0,
      montoOriginal: 135600,
      montoPagado: 0,
      saldoPendiente: 135600,
      estado: "al-dia",
      ultimoContacto: "2024-01-20",
      vendedor: "Juan Pérez",
    },
  ]

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

  const filteredCobros = cobros.filter((cobro) => {
    const matchesSearch =
      cobro.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cobro.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cobro.factura.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cobro.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || cobro.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pagado":
        return "bg-green-100 text-green-800 border-green-200"
      case "pendiente":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "vencido":
        return "bg-red-100 text-red-800 border-red-200"
      case "al-dia":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pagado":
        return <CheckCircle className="h-4 w-4" />
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "vencido":
        return <AlertTriangle className="h-4 w-4" />
      case "al-dia":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getDiasVencidoColor = (dias: number) => {
    if (dias === 0) return "text-green-600"
    if (dias <= 7) return "text-yellow-600"
    if (dias <= 30) return "text-orange-600"
    return "text-red-600"
  }

  // Métricas calculadas
  const totalPorCobrar = cobros.reduce((sum, c) => sum + c.saldoPendiente, 0)
  const cobrosVencidos = cobros.filter((c) => c.estado === "vencido").length
  const cobrosPagados = cobros.filter((c) => c.estado === "pagado").length
  const cobrosDelDia = cobros
    .filter((c) => c.estado === "pagado" && c.ultimoContacto === "2024-01-30")
    .reduce((sum, c) => sum + c.montoPagado, 0)

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
                        subItem.label === "Cobros"
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
                <Input placeholder="Buscar cobros, clientes, facturas..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground">Gestión de Cobros</h1>
                <p className="text-muted-foreground">Control de cuentas por cobrar y seguimiento de pagos</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Pago
              </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total por Cobrar</CardTitle>
                  <DollarSign className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">₡{totalPorCobrar.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobros Vencidos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{cobrosVencidos}</div>
                  <p className="text-xs text-muted-foreground">Requieren atención</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobros Pagados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{cobrosPagados}</div>
                  <p className="text-xs text-muted-foreground">Completados</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cobros del Día</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">₡{cobrosDelDia.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Pagos recibidos hoy</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Cuentas por Cobrar</CardTitle>
                <CardDescription>Seguimiento y gestión de pagos pendientes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar cobros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="al-dia">Al día</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de cobros */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cobro</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Factura</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Vencimiento</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Días Vencido</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Monto Original</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Pagado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Saldo</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCobros.map((cobro) => (
                        <tr key={cobro.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{cobro.id}</div>
                            <div className="text-sm text-muted-foreground">Vendedor: {cobro.vendedor}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {cobro.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{cobro.cliente}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {cobro.telefono}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{cobro.factura}</div>
                            <div className="text-sm text-muted-foreground">Venta: {cobro.fechaVenta}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{cobro.fechaVencimiento}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-bold ${getDiasVencidoColor(cobro.diasVencido)}`}>
                              {cobro.diasVencido === 0 ? "Al día" : `${cobro.diasVencido} días`}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">₡{cobro.montoOriginal.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-green-600">₡{cobro.montoPagado.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-primary text-lg">
                              ₡{cobro.saldoPendiente.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(cobro.estado)} flex items-center gap-1`}>
                              {getStatusIcon(cobro.estado)}
                              {cobro.estado === "al-dia"
                                ? "Al día"
                                : cobro.estado.charAt(0).toUpperCase() + cobro.estado.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" title="Ver detalles">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Llamar cliente">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Enviar email">
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Registrar pago">
                                <CreditCard className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
