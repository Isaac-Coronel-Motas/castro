"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Send,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PresupuestosVentasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"])

  // Datos de ejemplo para presupuestos de ventas
  const presupuestos = [
    {
      id: "PV-001",
      cliente: "María González",
      email: "maria@email.com",
      telefono: "8812-3456",
      fechaCreacion: "2024-01-15",
      fechaVigencia: "2024-02-15",
      diasVigencia: 15,
      productos: 3,
      subtotal: 105000,
      descuento: 5000,
      impuestos: 13000,
      total: 113000,
      estado: "pendiente",
      prioridad: "media",
      vendedor: "Juan Pérez",
      observaciones: "Cliente interesado en descuento por volumen",
    },
    {
      id: "PV-002",
      cliente: "Carlos Rodríguez",
      email: "carlos@email.com",
      telefono: "8765-4321",
      fechaCreacion: "2024-01-14",
      fechaVigencia: "2024-02-14",
      diasVigencia: 14,
      productos: 5,
      subtotal: 250000,
      descuento: 15000,
      impuestos: 30550,
      total: 265550,
      estado: "aprobado",
      prioridad: "alta",
      vendedor: "Ana Martínez",
      observaciones: "Presupuesto aprobado, proceder con venta",
    },
    {
      id: "PV-003",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      telefono: "8654-3210",
      fechaCreacion: "2024-01-13",
      fechaVigencia: "2024-01-28",
      diasVigencia: -2,
      productos: 2,
      subtotal: 85000,
      descuento: 0,
      impuestos: 11050,
      total: 96050,
      estado: "vencido",
      prioridad: "baja",
      vendedor: "Juan Pérez",
      observaciones: "Presupuesto vencido, contactar para renovar",
    },
    {
      id: "PV-004",
      cliente: "Luis Hernández",
      email: "luis@email.com",
      telefono: "8543-2109",
      fechaCreacion: "2024-01-12",
      fechaVigencia: "2024-02-12",
      diasVigencia: 12,
      productos: 4,
      subtotal: 180000,
      descuento: 10000,
      impuestos: 22100,
      total: 192100,
      estado: "convertido",
      prioridad: "alta",
      vendedor: "Ana Martínez",
      observaciones: "Convertido a venta V-004",
    },
    {
      id: "PV-005",
      cliente: "Carmen Jiménez",
      email: "carmen@email.com",
      telefono: "8432-1098",
      fechaCreacion: "2024-01-11",
      fechaVigencia: "2024-01-26",
      diasVigencia: -4,
      productos: 1,
      subtotal: 120000,
      descuento: 5000,
      impuestos: 14950,
      total: 129950,
      estado: "rechazado",
      prioridad: "media",
      vendedor: "Juan Pérez",
      observaciones: "Cliente decidió no proceder con la compra",
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

  const filteredPresupuestos = presupuestos.filter((presupuesto) => {
    const matchesSearch =
      presupuesto.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      presupuesto.vendedor.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || presupuesto.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "aprobado":
        return "bg-green-100 text-green-800 border-green-200"
      case "rechazado":
        return "bg-red-100 text-red-800 border-red-200"
      case "vencido":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "convertido":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case "alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "media":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "baja":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "aprobado":
        return <CheckCircle className="h-4 w-4" />
      case "rechazado":
        return <XCircle className="h-4 w-4" />
      case "vencido":
        return <AlertTriangle className="h-4 w-4" />
      case "convertido":
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getVigenciaColor = (dias: number) => {
    if (dias < 0) return "text-red-600"
    if (dias <= 3) return "text-orange-600"
    if (dias <= 7) return "text-yellow-600"
    return "text-green-600"
  }

  // Métricas calculadas
  const totalPresupuestos = presupuestos.length
  const presupuestosPendientes = presupuestos.filter((p) => p.estado === "pendiente").length
  const presupuestosAprobados = presupuestos.filter((p) => p.estado === "aprobado").length
  const valorTotalPendiente = presupuestos
    .filter((p) => p.estado === "pendiente" || p.estado === "aprobado")
    .reduce((sum, p) => sum + p.total, 0)

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
                        subItem.label === "Presupuestos"
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
                <Input placeholder="Buscar presupuestos, clientes..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground">Presupuestos de Ventas</h1>
                <p className="text-muted-foreground">Gestión de cotizaciones y propuestas comerciales</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Presupuesto
              </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Presupuestos</CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalPresupuestos}</div>
                  <p className="text-xs text-muted-foreground">Todas las cotizaciones</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{presupuestosPendientes}</div>
                  <p className="text-xs text-muted-foreground">Esperando respuesta</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aprobados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{presupuestosAprobados}</div>
                  <p className="text-xs text-muted-foreground">Listos para venta</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Potencial</CardTitle>
                  <DollarSign className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-4">₡{valorTotalPendiente.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Pendientes + Aprobados</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Presupuestos</CardTitle>
                <CardDescription>Gestiona todas las cotizaciones y propuestas comerciales</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar presupuestos..."
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
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                      <SelectItem value="convertido">Convertido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de presupuestos */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Presupuesto</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha/Vigencia</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Subtotal</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Descuento</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Prioridad</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPresupuestos.map((presupuesto) => (
                        <tr key={presupuesto.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{presupuesto.id}</div>
                            <div className="text-sm text-muted-foreground">Vendedor: {presupuesto.vendedor}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {presupuesto.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{presupuesto.cliente}</div>
                                <div className="text-sm text-muted-foreground">{presupuesto.telefono}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">{presupuesto.fechaCreacion}</div>
                                <div className="text-sm text-muted-foreground">Vence: {presupuesto.fechaVigencia}</div>
                                <div className={`text-xs font-medium ${getVigenciaColor(presupuesto.diasVigencia)}`}>
                                  {presupuesto.diasVigencia < 0
                                    ? `Vencido hace ${Math.abs(presupuesto.diasVigencia)} días`
                                    : presupuesto.diasVigencia === 0
                                      ? "Vence hoy"
                                      : `${presupuesto.diasVigencia} días restantes`}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{presupuesto.productos}</span>
                              <span className="text-sm text-muted-foreground">items</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">₡{presupuesto.subtotal.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-green-600">
                              {presupuesto.descuento > 0 ? `-₡${presupuesto.descuento.toLocaleString()}` : "-"}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-primary text-lg">₡{presupuesto.total.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(presupuesto.estado)} flex items-center gap-1`}>
                              {getStatusIcon(presupuesto.estado)}
                              {presupuesto.estado.charAt(0).toUpperCase() + presupuesto.estado.slice(1)}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getPriorityColor(presupuesto.prioridad)}>
                              {presupuesto.prioridad.charAt(0).toUpperCase() + presupuesto.prioridad.slice(1)}
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
                              <Button variant="ghost" size="sm" title="Enviar por email">
                                <Send className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" title="Descargar PDF">
                                <Download className="h-4 w-4" />
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
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
