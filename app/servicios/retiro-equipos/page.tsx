"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  Wrench,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Receipt,
  FileText,
  Users,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Plus,
  Eye,
  Edit,
  Trash2,
  LogOut,
  PackageCheck,
  AlertCircle,
  CheckCircle,
  Filter,
  Phone,
  Calendar,
  Clock,
  Truck,
  User,
  MapPin,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  {
    icon: ShoppingCart,
    label: "Compras",
    active: false,
    submenu: [
      { label: "Pedidos de Compra", href: "/compras/pedidos-de-compra", active: false },
      { label: "Presupuestos Proveedor", href: "/compras/presupuestos", active: false },
      { label: "Órdenes de Compra", href: "/compras/ordenes", active: false },
      { label: "Registro de Compras", href: "/compras/registro", active: false },
      { label: "Ajustes de Inventario", href: "/compras/ajustes", active: false },
      { label: "Notas de Crédito/Débito", href: "/compras/notas", active: false },
      { label: "Transferencias", href: "/compras/transferencias", active: false },
      { label: "Informes", href: "/compras/informes", active: false },
    ],
  },
  {
    icon: Settings,
    label: "Servicios Técnicos",
    active: true,
    submenu: [
      { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente", active: false },
      { label: "Recepción de Equipos", href: "/servicios/recepcion-equipos", active: false },
      { label: "Diagnósticos", href: "/servicios/diagnosticos", active: false },
      { label: "Presupuestos", href: "/servicios/presupuestos", active: false },
      { label: "Órdenes de Servicio", href: "/servicios/ordenes-servicio", active: false },
      { label: "Retiro de Equipos", href: "/servicios/retiro-equipos", active: true },
      { label: "Reclamos", href: "/servicios/reclamos", active: false },
      { label: "Informes", href: "/servicios/informes", active: false },
    ],
  },
  {
    icon: Receipt,
    label: "Ventas",
    active: false,
    submenu: [
      { label: "Apertura/Cierre Caja", href: "/ventas/apertura-cierre-caja", active: false },
      { label: "Pedidos de Clientes", href: "/ventas/pedidos-clientes", active: false },
      { label: "Registro de Ventas", href: "/ventas/registro-ventas", active: false },
      { label: "Cobros", href: "/ventas/cobros", active: false },
      { label: "Presupuestos", href: "/ventas/presupuestos", active: false },
      { label: "Notas de Remisión", href: "/ventas/notas-remision", active: false },
      { label: "Notas de Crédito/Débito", href: "/ventas/notas-credito-debito", active: false },
      { label: "Informes", href: "/ventas/informes", active: false },
    ],
  },
  {
    icon: FileText,
    label: "Referencias",
    active: false,
    submenu: [
      { label: "Proveedores", href: "/referencias/proveedores", active: false },
      { label: "Productos", href: "/referencias/productos", active: false },
      { label: "Categorías", href: "/referencias/categorias", active: false },
      { label: "Clientes", href: "/referencias/clientes", active: false },
      { label: "Marcas", href: "/referencias/marcas", active: false },
      { label: "Tipos de Servicio", href: "/referencias/tipos-servicio", active: false },
    ],
  },
  {
    icon: Users,
    label: "Administración",
    active: false,
    submenu: [
      { label: "Usuarios", href: "/administracion/usuarios", active: false },
      { label: "Roles y Permisos", href: "/administracion/roles-permisos", active: false },
      { label: "Auditoría", href: "/administracion/auditoria", active: false },
      { label: "Configuración", href: "/administracion/configuracion", active: false },
    ],
  },
]

export default function RetiroEquiposPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: false,
    "Servicios Técnicos": true,
    Ventas: false,
    Referencias: false,
    Administración: false,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("Todos")
  const router = useRouter()

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const navigateTo = (href: string) => {
    router.push(href)
  }

  const totalRetiros = retiros.length
  const listosParaRetiro = retiros.filter((r) => r.estado === "Listo para Retiro").length
  const retiradosHoy = retiros.filter((r) => r.estado === "Retirado" && r.fechaRetiro === "2024-01-15").length
  const pendientesNotificacion = retiros.filter((r) => r.estado === "Pendiente Notificación").length

  const filteredRetiros = retiros.filter((retiro) => {
    const matchesSearch =
      retiro.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retiro.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retiro.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retiro.telefono.includes(searchTerm)

    const matchesFilter = filterEstado === "Todos" || retiro.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Pendiente Notificación":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Cliente Notificado":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Listo para Retiro":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Retirado":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "Entrega a Domicilio":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pendiente Notificación":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "Cliente Notificado":
        return <Phone className="h-4 w-4 text-blue-600" />
      case "Listo para Retiro":
        return <PackageCheck className="h-4 w-4 text-green-600" />
      case "Retirado":
        return <CheckCircle className="h-4 w-4 text-gray-600" />
      case "Entrega a Domicilio":
        return <Truck className="h-4 w-4 text-purple-600" />
      default:
        return <PackageCheck className="h-4 w-4 text-gray-600" />
    }
  }

  const getMetodoEntregaBadge = (metodo: string) => {
    switch (metodo) {
      case "Retiro en Taller":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Entrega a Domicilio":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "Envío por Courier":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const diasEnTaller = (fechaCompletado: string) => {
    const hoy = new Date()
    const completado = new Date(fechaCompletado)
    const diferencia = Math.ceil((hoy.getTime() - completado.getTime()) / (1000 * 3600 * 24))
    return diferencia
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={cn("bg-slate-800 text-white transition-all duration-300", sidebarOpen ? "w-64" : "w-16")}>
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-slate-800" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-sm">Taller Castro</h2>
                  <p className="text-xs text-slate-300">Sistema de Gestión</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <div>
                    <button
                      onClick={() => {
                        if (item.submenu) {
                          toggleSubmenu(item.label)
                        } else if (item.href) {
                          navigateTo(item.href)
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        item.active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm">{item.label}</span>
                          {item.submenu ? (
                            expandedMenus[item.label] ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
                        </>
                      )}
                    </button>

                    {item.submenu && expandedMenus[item.label] && sidebarOpen && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <button
                              onClick={() => navigateTo(subItem.href)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-xs",
                                subItem.active
                                  ? "bg-slate-600 text-white"
                                  : "text-slate-400 hover:bg-slate-600 hover:text-white",
                              )}
                            >
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full text-white border-slate-600 hover:bg-slate-700 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar retiros, clientes, equipos..." className="pl-10 w-80" />
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{user?.username || "Usuario"}</p>
                    <p className="text-gray-500">{user?.role || "Usuario"}</p>
                  </div>
                </div>
                <Button onClick={logout} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Retiro de Equipos</h1>
                <p className="text-muted-foreground">Gestión de entrega de equipos reparados a clientes</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Retiro
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Retiros</p>
                      <p className="text-3xl font-bold text-card-foreground">{totalRetiros}</p>
                      <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <PackageCheck className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Listos para Retiro</p>
                      <p className="text-3xl font-bold text-card-foreground">{listosParaRetiro}</p>
                      <p className="text-xs text-muted-foreground mt-1">Esperando cliente</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Retirados Hoy</p>
                      <p className="text-3xl font-bold text-card-foreground">{retiradosHoy}</p>
                      <p className="text-xs text-muted-foreground mt-1">Entregas completadas</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes Notificación</p>
                      <p className="text-3xl font-bold text-card-foreground">{pendientesNotificacion}</p>
                      <p className="text-xs text-muted-foreground mt-1">Por contactar</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Phone className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Equipment Pickup List */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="bg-muted/50 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Lista de Retiros de Equipos</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="text-sm border border-border rounded-md px-3 py-1 bg-background"
                      >
                        <option value="Todos">Todos los estados</option>
                        <option value="Pendiente Notificación">Pendiente Notificación</option>
                        <option value="Cliente Notificado">Cliente Notificado</option>
                        <option value="Listo para Retiro">Listo para Retiro</option>
                        <option value="Retirado">Retirado</option>
                        <option value="Entrega a Domicilio">Entrega a Domicilio</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número, cliente, equipo o teléfono..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-border"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/30">
                      <tr>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Número
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Cliente/Contacto
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Equipo
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Fecha Completado
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Método Entrega
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Estado
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Días en Taller
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRetiros.map((retiro, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-muted p-2 rounded-lg">{getEstadoIcon(retiro.estado)}</div>
                              <span className="font-semibold text-primary">{retiro.numero}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {retiro.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground block">{retiro.cliente}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Phone className="h-3 w-3" />
                                  {retiro.telefono}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <span className="font-medium text-foreground block">{retiro.equipo}</span>
                              <span className="text-sm text-muted-foreground">{retiro.descripcionReparacion}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {retiro.fechaCompletado}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {retiro.metodoEntrega === "Entrega a Domicilio" ? (
                                <Truck className="h-4 w-4 text-purple-600" />
                              ) : retiro.metodoEntrega === "Envío por Courier" ? (
                                <MapPin className="h-4 w-4 text-orange-600" />
                              ) : (
                                <User className="h-4 w-4 text-blue-600" />
                              )}
                              <Badge className={getMetodoEntregaBadge(retiro.metodoEntrega)}>
                                {retiro.metodoEntrega}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getEstadoBadge(retiro.estado)}>{retiro.estado}</Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span
                                className={cn(
                                  "text-sm font-medium",
                                  diasEnTaller(retiro.fechaCompletado) > 7
                                    ? "text-red-600"
                                    : diasEnTaller(retiro.fechaCompletado) > 3
                                      ? "text-yellow-600"
                                      : "text-muted-foreground",
                                )}
                              >
                                {diasEnTaller(retiro.fechaCompletado)} días
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-primary/10">
                                <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-secondary/10">
                                <Edit className="h-4 w-4 text-muted-foreground hover:text-secondary" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredRetiros.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No se encontraron retiros de equipos que coincidan con los filtros.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}

const retiros = [
  {
    numero: "RT-001",
    cliente: "María González",
    telefono: "0981234567",
    equipo: "Samsung Galaxy A54",
    descripcionReparacion: "Reemplazo de pantalla completo",
    fechaCompletado: "2024-01-12",
    fechaRetiro: null,
    metodoEntrega: "Retiro en Taller",
    estado: "Listo para Retiro",
  },
  {
    numero: "RT-002",
    cliente: "Carlos Rodríguez",
    telefono: "0987654321",
    equipo: "HP Pavilion 15",
    descripcionReparacion: "Reemplazo de fuente de poder",
    fechaCompletado: "2024-01-14",
    fechaRetiro: "2024-01-15",
    metodoEntrega: "Retiro en Taller",
    estado: "Retirado",
  },
  {
    numero: "RT-003",
    cliente: "Ana Martínez",
    telefono: "0976543210",
    equipo: "iPhone 12",
    descripcionReparacion: "Reemplazo de batería",
    fechaCompletado: "2024-01-10",
    fechaRetiro: null,
    metodoEntrega: "Entrega a Domicilio",
    estado: "Cliente Notificado",
  },
  {
    numero: "RT-004",
    cliente: "Luis Pérez",
    telefono: "0965432109",
    equipo: "LG Monitor 24MK430H",
    descripcionReparacion: "Reparación de panel LCD",
    fechaCompletado: "2024-01-08",
    fechaRetiro: null,
    metodoEntrega: "Envío por Courier",
    estado: "Pendiente Notificación",
  },
  {
    numero: "RT-005",
    cliente: "Carmen Silva",
    telefono: "0954321098",
    equipo: "MacBook Air M1",
    descripcionReparacion: "Reemplazo de teclado",
    fechaCompletado: "2024-01-13",
    fechaRetiro: null,
    metodoEntrega: "Retiro en Taller",
    estado: "Listo para Retiro",
  },
]
