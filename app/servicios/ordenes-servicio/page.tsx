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
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Filter,
  User,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Cross as Progress,
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
      { label: "Órdenes de Servicio", href: "/servicios/ordenes-servicio", active: true },
      { label: "Retiro de Equipos", href: "/servicios/retiro-equipos", active: false },
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

export default function OrdenesServicioPage() {
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

  const totalOrdenes = ordenes.length
  const activas = ordenes.filter((o) => o.estado === "En Proceso" || o.estado === "Iniciada").length
  const completadas = ordenes.filter((o) => o.estado === "Completada").length
  const pausadas = ordenes.filter((o) => o.estado === "Pausada").length

  const filteredOrdenes = ordenes.filter((orden) => {
    const matchesSearch =
      orden.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orden.tecnico.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterEstado === "Todos" || orden.estado === filterEstado

    return matchesSearch && matchesFilter
  })

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Iniciada":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "En Proceso":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Pausada":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Completada":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Cancelada":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Iniciada":
        return <Play className="h-4 w-4 text-blue-600" />
      case "En Proceso":
        return <Progress className="h-4 w-4 text-yellow-600" />
      case "Pausada":
        return <Pause className="h-4 w-4 text-orange-600" />
      case "Completada":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "Cancelada":
        return <RotateCcw className="h-4 w-4 text-red-600" />
      default:
        return <ClipboardList className="h-4 w-4 text-gray-600" />
    }
  }

  const getPrioridadBadge = (prioridad: string) => {
    switch (prioridad) {
      case "Urgente":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Alta":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Media":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Baja":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getProgressColor = (progreso: number) => {
    if (progreso >= 80) return "bg-green-500"
    if (progreso >= 50) return "bg-yellow-500"
    if (progreso >= 25) return "bg-orange-500"
    return "bg-red-500"
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
                  <Input placeholder="Buscar órdenes, clientes, técnicos..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Órdenes de Servicio</h1>
                <p className="text-muted-foreground">Gestión y seguimiento de órdenes de trabajo</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
              </Button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Órdenes</p>
                      <p className="text-3xl font-bold text-card-foreground">{totalOrdenes}</p>
                      <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <ClipboardList className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Activas</p>
                      <p className="text-3xl font-bold text-card-foreground">{activas}</p>
                      <p className="text-xs text-muted-foreground mt-1">En desarrollo</p>
                    </div>
                    <div className="bg-yellow-100 p-3 rounded-full">
                      <Progress className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                      <p className="text-3xl font-bold text-card-foreground">{completadas}</p>
                      <p className="text-xs text-muted-foreground mt-1">Este mes</p>
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
                      <p className="text-sm font-medium text-muted-foreground">Pausadas</p>
                      <p className="text-3xl font-bold text-card-foreground">{pausadas}</p>
                      <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                    </div>
                    <div className="bg-orange-100 p-3 rounded-full">
                      <Pause className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Orders List */}
            <Card className="bg-card border-border shadow-sm">
              <CardHeader className="bg-muted/50 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-card-foreground">Lista de Órdenes de Servicio</CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterEstado}
                        onChange={(e) => setFilterEstado(e.target.value)}
                        className="text-sm border border-border rounded-md px-3 py-1 bg-background"
                      >
                        <option value="Todos">Todos los estados</option>
                        <option value="Iniciada">Iniciada</option>
                        <option value="En Proceso">En Proceso</option>
                        <option value="Pausada">Pausada</option>
                        <option value="Completada">Completada</option>
                        <option value="Cancelada">Cancelada</option>
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
                      placeholder="Buscar por número, cliente, equipo o técnico..."
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
                          Cliente/Equipo
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Técnico Asignado
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Progreso
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Fecha Estimada
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Estado
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Prioridad
                        </th>
                        <th className="text-left py-4 px-6 font-semibold text-foreground border-b border-border">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrdenes.map((orden, index) => (
                        <tr key={index} className="border-b border-border hover:bg-muted/20 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="bg-muted p-2 rounded-lg">{getEstadoIcon(orden.estado)}</div>
                              <span className="font-semibold text-primary">{orden.numero}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {orden.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground block">{orden.cliente}</span>
                                <span className="text-sm text-muted-foreground">{orden.equipo}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-secondary/10 text-secondary text-xs">
                                  {orden.tecnico
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-foreground block">{orden.tecnico}</span>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  Técnico
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">{orden.progreso}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn("h-2 rounded-full transition-all", getProgressColor(orden.progreso))}
                                  style={{ width: `${orden.progreso}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {orden.fechaEstimada}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getEstadoBadge(orden.estado)}>{orden.estado}</Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={getPrioridadBadge(orden.prioridad)}>{orden.prioridad}</Badge>
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

                {filteredOrdenes.length === 0 && (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No se encontraron órdenes de servicio que coincidan con los filtros.
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

const ordenes = [
  {
    numero: "OS-001",
    cliente: "María González",
    equipo: "Samsung Galaxy A54",
    tecnico: "Juan Pérez",
    progreso: 75,
    fechaEstimada: "2024-01-18",
    estado: "En Proceso",
    prioridad: "Media",
  },
  {
    numero: "OS-002",
    cliente: "Carlos Rodríguez",
    equipo: "HP Pavilion 15",
    tecnico: "Ana Martínez",
    progreso: 100,
    fechaEstimada: "2024-01-17",
    estado: "Completada",
    prioridad: "Alta",
  },
  {
    numero: "OS-003",
    cliente: "Ana Martínez",
    equipo: "iPhone 12",
    tecnico: "Luis Castro",
    progreso: 25,
    fechaEstimada: "2024-01-20",
    estado: "Pausada",
    prioridad: "Baja",
  },
  {
    numero: "OS-004",
    cliente: "Luis Pérez",
    equipo: "LG Monitor 24MK430H",
    tecnico: "Juan Pérez",
    progreso: 10,
    fechaEstimada: "2024-01-22",
    estado: "Iniciada",
    prioridad: "Urgente",
  },
  {
    numero: "OS-005",
    cliente: "Carmen Silva",
    equipo: "MacBook Air M1",
    tecnico: "Ana Martínez",
    progreso: 50,
    fechaEstimada: "2024-01-19",
    estado: "En Proceso",
    prioridad: "Media",
  },
]
