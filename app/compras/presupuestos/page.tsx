"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
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
  LogOut,
  Plus,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  DollarSign,
  Calendar,
  Filter,
  Send,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  {
    icon: ShoppingCart,
    label: "Compras",
    active: true,
    submenu: [
      { label: "Pedidos de Compra", href: "/compras/pedidos-de-compra", active: false },
      { label: "Presupuestos Proveedor", href: "/compras/presupuestos", active: true },
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
    active: false,
    submenu: [
      { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente", active: false },
      { label: "Recepción de Equipos", href: "/servicios/recepcion", active: false },
      { label: "Diagnósticos", href: "/servicios/diagnosticos", active: false },
      { label: "Presupuestos", href: "/servicios/presupuestos", active: false },
      { label: "Órdenes de Servicio", href: "/servicios/ordenes", active: false },
      { label: "Retiro de Equipos", href: "/servicios/retiro", active: false },
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
      { label: "Pedidos de Clientes", href: "/ventas/pedidos", active: false },
      { label: "Registro de Ventas", href: "/ventas/registro", active: false },
      { label: "Cobros", href: "/ventas/cobros", active: false },
      { label: "Presupuestos", href: "/ventas/presupuestos", active: false },
      { label: "Notas de Remisión", href: "/ventas/notas-remision", active: false },
      { label: "Notas de Crédito/Débito", href: "/ventas/notas-credito", active: false },
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
      { label: "Roles y Permisos", href: "/administracion/roles", active: false },
      { label: "Auditoría", href: "/administracion/auditoria", active: false },
      { label: "Configuración", href: "/administracion/configuracion", active: false },
    ],
  },
]

export default function PresupuestosProveedorPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  const metrics = [
    {
      title: "Total Presupuestos",
      value: "18",
      change: "+8%",
      trend: "up",
      icon: FileCheck,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: "6",
      change: "-3%",
      trend: "down",
      icon: Clock,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Aprobados",
      value: "9",
      change: "+12%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Estimado",
      value: "₡4.2M",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  const budgets = [
    {
      id: "PP-001",
      supplier: "Distribuidora Tech SA",
      requestDate: "2024-01-15",
      responseDate: "2024-01-18",
      status: "pending",
      items: 8,
      estimatedTotal: "₡3,200,000",
      validUntil: "2024-02-15",
      description: "Componentes para reparaciones Q1",
      priority: "high",
      discount: "5%",
    },
    {
      id: "PP-002",
      supplier: "Electrónica Central",
      requestDate: "2024-01-12",
      responseDate: "2024-01-14",
      status: "approved",
      items: 5,
      estimatedTotal: "₡2,100,000",
      validUntil: "2024-02-12",
      description: "Pantallas y displays premium",
      priority: "medium",
      discount: "8%",
    },
    {
      id: "PP-003",
      supplier: "Componentes del Este",
      requestDate: "2024-01-10",
      responseDate: "2024-01-13",
      status: "rejected",
      items: 3,
      estimatedTotal: "₡1,500,000",
      validUntil: "2024-02-10",
      description: "Cables especializados",
      priority: "low",
      discount: "0%",
    },
    {
      id: "PP-004",
      supplier: "TechParts Solutions",
      requestDate: "2024-01-08",
      responseDate: "2024-01-11",
      status: "negotiating",
      items: 12,
      estimatedTotal: "₡4,800,000",
      validUntil: "2024-02-08",
      description: "Procesadores y memorias RAM",
      priority: "high",
      discount: "12%",
    },
    {
      id: "PP-005",
      supplier: "Suministros Electrónicos",
      requestDate: "2024-01-05",
      responseDate: "2024-01-09",
      status: "expired",
      items: 4,
      estimatedTotal: "₡1,800,000",
      validUntil: "2024-01-25",
      description: "Herramientas de diagnóstico",
      priority: "medium",
      discount: "3%",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary text-secondary-foreground"
      case "approved":
        return "bg-chart-1 text-white"
      case "rejected":
        return "bg-destructive text-destructive-foreground"
      case "negotiating":
        return "bg-chart-2 text-white"
      case "expired":
        return "bg-muted text-muted-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "approved":
        return "Aprobado"
      case "rejected":
        return "Rechazado"
      case "negotiating":
        return "Negociando"
      case "expired":
        return "Vencido"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "approved":
        return CheckCircle
      case "rejected":
        return XCircle
      case "negotiating":
        return Send
      case "expired":
        return AlertCircle
      default:
        return Clock
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const isExpiringSoon = (validUntil: string) => {
    const today = new Date()
    const expiryDate = new Date(validUntil)
    const diffTime = expiryDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const filteredBudgets = budgets.filter((budget) => {
    const matchesSearch =
      budget.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || budget.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const navigateTo = (href: string) => {
    router.push(href)
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        {/* Sidebar */}
        <div className={cn("bg-slate-800 text-white transition-all duration-300", sidebarOpen ? "w-64" : "w-16")}>
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
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar presupuestos, proveedores..."
                    className="pl-10 w-80 bg-input border-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium text-foreground">{user?.username || "Usuario"}</p>
                    <p className="text-muted-foreground">{user?.role || "Usuario"}</p>
                  </div>
                </div>
                <Button
                  onClick={logout}
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6 bg-background">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Presupuestos Proveedor</h1>
                <p className="text-muted-foreground">Gestión de cotizaciones y negociaciones con proveedores</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Solicitar Presupuesto
              </Button>
            </div>

            {/* Metrics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <Card key={index} className="hover:shadow-lg transition-all duration-300 border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
                        <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                        <div className="flex items-center mt-2">
                          <TrendingUp
                            className={cn("h-4 w-4 mr-1", metric.trend === "up" ? "text-green-500" : "text-red-500")}
                          />
                          <span
                            className={cn(
                              "text-sm font-medium",
                              metric.trend === "up" ? "text-green-500" : "text-red-500",
                            )}
                          >
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <div className={cn("p-3 rounded-lg", metric.color)}>
                        <metric.icon className="h-6 w-6" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Filters */}
            <Card className="mb-6 border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-semibold text-foreground">Presupuestos Activos</h3>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="approved">Aprobados</option>
                        <option value="negotiating">Negociando</option>
                        <option value="rejected">Rechazados</option>
                        <option value="expired">Vencidos</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredBudgets.length} de {budgets.length} presupuestos
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Budgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBudgets.map((budget) => {
                const StatusIcon = getStatusIcon(budget.status)
                const isExpiring = isExpiringSoon(budget.validUntil)

                return (
                  <Card key={budget.id} className="hover:shadow-lg transition-all duration-300 border-border group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">{budget.id}</CardTitle>
                        <div className="flex items-center gap-2">
                          {isExpiring && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">
                              Vence pronto
                            </Badge>
                          )}
                          <Badge className={cn("text-xs", getPriorityColor(budget.priority))}>
                            {budget.priority === "high" ? "Alta" : budget.priority === "medium" ? "Media" : "Baja"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{budget.supplier}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                        <p className="text-sm font-medium text-foreground">{budget.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Solicitud</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm font-medium">{budget.requestDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Válido hasta</p>
                          <p className={cn("text-sm font-medium", isExpiring ? "text-orange-600" : "")}>
                            {budget.validUntil}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Items: {budget.items} • Desc: {budget.discount}
                          </p>
                          <p className="text-lg font-bold text-foreground">{budget.estimatedTotal}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getStatusColor(budget.status)}>{getStatusLabel(budget.status)}</Badge>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-border opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          Ver
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive bg-transparent"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredBudgets.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron presupuestos</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros o solicitar un nuevo presupuesto</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
