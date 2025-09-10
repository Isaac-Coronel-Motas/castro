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
  Eye,
  Edit,
  Trash2,
  ShoppingBag,
  DollarSign,
  Calendar,
  Filter,
  Truck,
  Package,
  FileCheck,
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
      { label: "Presupuestos Proveedor", href: "/compras/presupuestos", active: false },
      { label: "Órdenes de Compra", href: "/compras/ordenes", active: true },
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

export default function OrdenesDeCompraPage() {
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
      title: "Total Órdenes",
      value: "32",
      change: "+15%",
      trend: "up",
      icon: ShoppingBag,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "En Proceso",
      value: "12",
      change: "+8%",
      trend: "up",
      icon: Clock,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Completadas",
      value: "18",
      change: "+22%",
      trend: "up",
      icon: CheckCircle,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Total",
      value: "₡8.5M",
      change: "+28%",
      trend: "up",
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  const purchaseOrders = [
    {
      id: "OC-001",
      supplier: "Distribuidora Tech SA",
      orderDate: "2024-01-15",
      deliveryDate: "2024-01-25",
      status: "confirmed",
      items: 8,
      totalAmount: "₡3,200,000",
      paymentTerms: "30 días",
      description: "Componentes electrónicos Q1",
      priority: "high",
      progress: 75,
      trackingNumber: "TRK-001-2024",
    },
    {
      id: "OC-002",
      supplier: "Electrónica Central",
      orderDate: "2024-01-12",
      deliveryDate: "2024-01-22",
      status: "shipped",
      items: 5,
      totalAmount: "₡2,100,000",
      paymentTerms: "15 días",
      description: "Pantallas premium y displays",
      priority: "medium",
      progress: 90,
      trackingNumber: "TRK-002-2024",
    },
    {
      id: "OC-003",
      supplier: "Componentes del Este",
      orderDate: "2024-01-10",
      deliveryDate: "2024-01-20",
      status: "delivered",
      items: 3,
      totalAmount: "₡1,500,000",
      paymentTerms: "Contado",
      description: "Cables especializados",
      priority: "low",
      progress: 100,
      trackingNumber: "TRK-003-2024",
    },
    {
      id: "OC-004",
      supplier: "TechParts Solutions",
      orderDate: "2024-01-08",
      deliveryDate: "2024-01-18",
      status: "cancelled",
      items: 12,
      totalAmount: "₡4,800,000",
      paymentTerms: "45 días",
      description: "Procesadores y memorias",
      priority: "high",
      progress: 0,
      trackingNumber: "TRK-004-2024",
    },
    {
      id: "OC-005",
      supplier: "Suministros Electrónicos",
      orderDate: "2024-01-05",
      deliveryDate: "2024-01-15",
      status: "pending",
      items: 6,
      totalAmount: "₡2,800,000",
      paymentTerms: "20 días",
      description: "Herramientas de diagnóstico",
      priority: "medium",
      progress: 25,
      trackingNumber: "TRK-005-2024",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-secondary text-secondary-foreground"
      case "confirmed":
        return "bg-chart-1 text-white"
      case "shipped":
        return "bg-chart-2 text-white"
      case "delivered":
        return "bg-green-500 text-white"
      case "cancelled":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente"
      case "confirmed":
        return "Confirmada"
      case "shipped":
        return "Enviada"
      case "delivered":
        return "Entregada"
      case "cancelled":
        return "Cancelada"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return Clock
      case "confirmed":
        return FileCheck
      case "shipped":
        return Truck
      case "delivered":
        return Package
      case "cancelled":
        return XCircle
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

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "bg-green-500"
    if (progress >= 50) return "bg-yellow-500"
    if (progress >= 25) return "bg-blue-500"
    return "bg-gray-300"
  }

  const isOverdue = (deliveryDate: string, status: string) => {
    const today = new Date()
    const delivery = new Date(deliveryDate)
    return delivery < today && status !== "delivered" && status !== "cancelled"
  }

  const filteredOrders = purchaseOrders.filter((order) => {
    const matchesSearch =
      order.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === "all" || order.status === filterStatus
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
                    placeholder="Buscar órdenes, proveedores, tracking..."
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Órdenes de Compra</h1>
                <p className="text-muted-foreground">Gestión y seguimiento de órdenes confirmadas con proveedores</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Orden
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
                    <h3 className="font-semibold text-foreground">Órdenes Activas</h3>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendientes</option>
                        <option value="confirmed">Confirmadas</option>
                        <option value="shipped">Enviadas</option>
                        <option value="delivered">Entregadas</option>
                        <option value="cancelled">Canceladas</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredOrders.length} de {purchaseOrders.length} órdenes
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const StatusIcon = getStatusIcon(order.status)
                const overdue = isOverdue(order.deliveryDate, order.status)

                return (
                  <Card key={order.id} className="hover:shadow-lg transition-all duration-300 border-border group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">{order.id}</CardTitle>
                        <div className="flex items-center gap-2">
                          {overdue && <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Vencida</Badge>}
                          <Badge className={cn("text-xs", getPriorityColor(order.priority))}>
                            {order.priority === "high" ? "Alta" : order.priority === "medium" ? "Media" : "Baja"}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{order.supplier}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                        <p className="text-sm font-medium text-foreground">{order.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Orden</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm font-medium">{order.orderDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Entrega</p>
                          <p className={cn("text-sm font-medium", overdue ? "text-red-600" : "")}>
                            {order.deliveryDate}
                          </p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-muted-foreground">Progreso</p>
                          <p className="text-xs font-medium">{order.progress}%</p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={cn("h-2 rounded-full transition-all", getProgressColor(order.progress))}
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Items: {order.items} • {order.paymentTerms}
                          </p>
                          <p className="text-lg font-bold text-foreground">{order.totalAmount}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getStatusColor(order.status)}>{getStatusLabel(order.status)}</Badge>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-2">Tracking: {order.trackingNumber}</p>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredOrders.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron órdenes</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros o crear una nueva orden</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
