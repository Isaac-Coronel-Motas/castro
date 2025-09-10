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
  Package,
  Eye,
  Edit,
  Trash2,
  RotateCcw,
  Calendar,
  Filter,
  ArrowUp,
  ArrowDown,
  AlertTriangle,
  Boxes,
  Calculator,
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
      { label: "Órdenes de Compra", href: "/compras/ordenes", active: false },
      { label: "Registro de Compras", href: "/compras/registro", active: false },
      { label: "Ajustes de Inventario", href: "/compras/ajustes", active: true },
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

export default function AjustesInventarioPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()

  const metrics = [
    {
      title: "Ajustes del Mes",
      value: "28",
      change: "+12%",
      trend: "up",
      icon: RotateCcw,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Productos Afectados",
      value: "156",
      change: "+8%",
      trend: "up",
      icon: Boxes,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Entradas",
      value: "18",
      change: "+15%",
      trend: "up",
      icon: ArrowUp,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Ajustado",
      value: "₡2.1M",
      change: "+22%",
      trend: "up",
      icon: Calculator,
      color: "bg-chart-2 text-white",
    },
  ]

  const inventoryAdjustments = [
    {
      id: "AJ-001",
      product: "Samsung Galaxy A54 - Pantalla",
      sku: "SGX-A54-LCD",
      adjustmentDate: "2024-01-15",
      type: "entry",
      reason: "Compra",
      previousStock: 15,
      adjustment: 25,
      newStock: 40,
      unitCost: "₡85,000",
      totalValue: "₡2,125,000",
      status: "approved",
      user: "Juan Pérez",
      reference: "OC-001",
      location: "Almacén Principal",
    },
    {
      id: "AJ-002",
      product: "iPhone 12 - Batería Original",
      sku: "IPH-12-BAT",
      adjustmentDate: "2024-01-14",
      type: "exit",
      reason: "Venta",
      previousStock: 8,
      adjustment: -3,
      newStock: 5,
      unitCost: "₡45,000",
      totalValue: "-₡135,000",
      status: "approved",
      user: "María González",
      reference: "VT-045",
      location: "Almacén Principal",
    },
    {
      id: "AJ-003",
      product: "Cable USB-C Premium",
      sku: "CBL-USBC-PR",
      adjustmentDate: "2024-01-13",
      type: "correction",
      reason: "Corrección Stock",
      previousStock: 50,
      adjustment: -5,
      newStock: 45,
      unitCost: "₡3,500",
      totalValue: "-₡17,500",
      status: "pending",
      user: "Carlos Rodríguez",
      reference: "INV-2024-001",
      location: "Almacén Principal",
    },
    {
      id: "AJ-004",
      product: "Procesador Intel i7-12700K",
      sku: "INT-I7-12700K",
      adjustmentDate: "2024-01-12",
      type: "loss",
      reason: "Merma",
      previousStock: 12,
      adjustment: -2,
      newStock: 10,
      unitCost: "₡180,000",
      totalValue: "-₡360,000",
      status: "approved",
      user: "Ana Martínez",
      reference: "MER-001",
      location: "Almacén Principal",
    },
    {
      id: "AJ-005",
      product: "Memoria RAM DDR4 16GB",
      sku: "RAM-DDR4-16GB",
      adjustmentDate: "2024-01-11",
      type: "return",
      reason: "Devolución Cliente",
      previousStock: 22,
      adjustment: 1,
      newStock: 23,
      unitCost: "₡65,000",
      totalValue: "₡65,000",
      status: "approved",
      user: "Luis Fernández",
      reference: "DEV-012",
      location: "Almacén Principal",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "entry":
        return "bg-green-500 text-white"
      case "exit":
        return "bg-blue-500 text-white"
      case "correction":
        return "bg-secondary text-secondary-foreground"
      case "loss":
        return "bg-destructive text-destructive-foreground"
      case "return":
        return "bg-chart-2 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "entry":
        return "Entrada"
      case "exit":
        return "Salida"
      case "correction":
        return "Corrección"
      case "loss":
        return "Merma"
      case "return":
        return "Devolución"
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "entry":
        return ArrowUp
      case "exit":
        return ArrowDown
      case "correction":
        return RotateCcw
      case "loss":
        return AlertTriangle
      case "return":
        return Package
      default:
        return RotateCcw
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500 text-white"
      case "pending":
        return "bg-secondary text-secondary-foreground"
      case "rejected":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return "Aprobado"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazado"
      default:
        return status
    }
  }

  const getAdjustmentColor = (adjustment: number) => {
    if (adjustment > 0) return "text-green-600"
    if (adjustment < 0) return "text-red-600"
    return "text-muted-foreground"
  }

  const filteredAdjustments = inventoryAdjustments.filter((adjustment) => {
    const matchesSearch =
      adjustment.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || adjustment.type === filterType
    const matchesStatus = filterStatus === "all" || adjustment.status === filterStatus
    return matchesSearch && matchesType && matchesStatus
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
                    placeholder="Buscar productos, SKU, referencias..."
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Ajustes de Inventario</h1>
                <p className="text-muted-foreground">Control y seguimiento de movimientos de stock</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Ajuste
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
                    <h3 className="font-semibold text-foreground">Movimientos de Inventario</h3>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="entry">Entradas</option>
                        <option value="exit">Salidas</option>
                        <option value="correction">Correcciones</option>
                        <option value="loss">Mermas</option>
                        <option value="return">Devoluciones</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm ml-2"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="approved">Aprobados</option>
                        <option value="pending">Pendientes</option>
                        <option value="rejected">Rechazados</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredAdjustments.length} de {inventoryAdjustments.length} ajustes
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Adjustments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAdjustments.map((adjustment) => {
                const TypeIcon = getTypeIcon(adjustment.type)

                return (
                  <Card key={adjustment.id} className="hover:shadow-lg transition-all duration-300 border-border group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">{adjustment.id}</CardTitle>
                        <div className="flex items-center gap-2">
                          <Badge className={getTypeColor(adjustment.type)}>
                            <TypeIcon className="h-3 w-3 mr-1" />
                            {getTypeLabel(adjustment.type)}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{adjustment.product}</p>
                      <p className="text-xs text-muted-foreground">SKU: {adjustment.sku}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Motivo</p>
                        <p className="text-sm font-medium text-foreground">{adjustment.reason}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm font-medium">{adjustment.adjustmentDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Usuario</p>
                          <p className="text-sm font-medium">{adjustment.user}</p>
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Stock Anterior:</span>
                          <span className="font-medium">{adjustment.previousStock}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Ajuste:</span>
                          <span className={cn("font-bold", getAdjustmentColor(adjustment.adjustment))}>
                            {adjustment.adjustment > 0 ? "+" : ""}
                            {adjustment.adjustment}
                          </span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                          <span>Stock Nuevo:</span>
                          <span className="text-foreground">{adjustment.newStock}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Ref: {adjustment.reference} • {adjustment.location}
                          </p>
                          <p className="text-sm font-bold text-foreground">{adjustment.totalValue}</p>
                        </div>
                        <Badge className={getStatusColor(adjustment.status)}>{getStatusLabel(adjustment.status)}</Badge>
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

            {filteredAdjustments.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <RotateCcw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron ajustes</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros o crear un nuevo ajuste</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
