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
  TrendingDown,
  Eye,
  Edit,
  Trash2,
  FileCheck,
  Calendar,
  Filter,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Minus,
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
      { label: "Ajustes de Inventario", href: "/compras/ajustes", active: false },
      { label: "Notas de Crédito/Débito", href: "/compras/notas", active: true },
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

export default function NotasCreditoDebitoPage() {
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
      title: "Total Notas",
      value: "24",
      change: "+8%",
      trend: "up",
      icon: FileCheck,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Notas de Crédito",
      value: "16",
      change: "+12%",
      trend: "up",
      icon: TrendingDown,
      color: "bg-green-500 text-white",
    },
    {
      title: "Notas de Débito",
      value: "8",
      change: "-5%",
      trend: "down",
      icon: TrendingUp,
      color: "bg-red-500 text-white",
    },
    {
      title: "Valor Neto",
      value: "₡1.2M",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  const creditDebitNotes = [
    {
      id: "NC-001",
      type: "credit",
      supplier: "Distribuidora Tech SA",
      issueDate: "2024-01-15",
      originalInvoice: "FAC-2024-001",
      reason: "Devolución productos defectuosos",
      status: "approved",
      subtotal: "₡450,000",
      tax: "₡58,500",
      total: "₡508,500",
      description: "Pantallas Samsung con defectos de fábrica",
      approvedBy: "Juan Pérez",
      items: 3,
      reference: "DEV-001",
    },
    {
      id: "ND-001",
      type: "debit",
      supplier: "Electrónica Central",
      issueDate: "2024-01-14",
      originalInvoice: "FAC-2024-002",
      reason: "Gastos de envío adicionales",
      status: "pending",
      subtotal: "₡75,000",
      tax: "₡9,750",
      total: "₡84,750",
      description: "Costo de envío express no incluido",
      approvedBy: null,
      items: 1,
      reference: "ENV-002",
    },
    {
      id: "NC-002",
      type: "credit",
      supplier: "Componentes del Este",
      issueDate: "2024-01-13",
      originalInvoice: "FAC-2024-003",
      reason: "Descuento por volumen aplicado",
      status: "approved",
      subtotal: "₡120,000",
      tax: "₡15,600",
      total: "₡135,600",
      description: "Descuento 8% por compra mayor a ₡1.5M",
      approvedBy: "María González",
      items: 1,
      reference: "DESC-001",
    },
    {
      id: "ND-002",
      type: "debit",
      supplier: "TechParts Solutions",
      issueDate: "2024-01-12",
      originalInvoice: "FAC-2024-004",
      reason: "Intereses por pago tardío",
      status: "rejected",
      subtotal: "₡95,000",
      tax: "₡12,350",
      total: "₡107,350",
      description: "Interés 2% mensual por pago fuera de término",
      approvedBy: null,
      items: 1,
      reference: "INT-001",
    },
    {
      id: "NC-003",
      type: "credit",
      supplier: "Suministros Electrónicos",
      issueDate: "2024-01-11",
      originalInvoice: "FAC-2024-005",
      reason: "Error en facturación - precio incorrecto",
      status: "approved",
      subtotal: "₡200,000",
      tax: "₡26,000",
      total: "₡226,000",
      description: "Corrección precio unitario procesadores",
      approvedBy: "Carlos Rodríguez",
      items: 2,
      reference: "COR-001",
    },
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case "credit":
        return "bg-green-500 text-white"
      case "debit":
        return "bg-red-500 text-white"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "credit":
        return "Crédito"
      case "debit":
        return "Débito"
      default:
        return type
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "credit":
        return TrendingDown
      case "debit":
        return TrendingUp
      default:
        return FileCheck
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
        return "Aprobada"
      case "pending":
        return "Pendiente"
      case "rejected":
        return "Rechazada"
      default:
        return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return CheckCircle
      case "pending":
        return Clock
      case "rejected":
        return AlertCircle
      default:
        return Clock
    }
  }

  const filteredNotes = creditDebitNotes.filter((note) => {
    const matchesSearch =
      note.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.originalInvoice.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.reference.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || note.type === filterType
    const matchesStatus = filterStatus === "all" || note.status === filterStatus
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
                    placeholder="Buscar notas, proveedores, facturas..."
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
                <h1 className="text-3xl font-bold text-foreground mb-2">Notas de Crédito/Débito</h1>
                <p className="text-muted-foreground">Gestión de ajustes contables con proveedores</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                  <Minus className="h-4 w-4 mr-2" />
                  Nota Crédito
                </Button>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Nota Débito
                </Button>
              </div>
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
                    <h3 className="font-semibold text-foreground">Notas Contables</h3>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm"
                      >
                        <option value="all">Todos los tipos</option>
                        <option value="credit">Notas de Crédito</option>
                        <option value="debit">Notas de Débito</option>
                      </select>
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-input border border-border rounded-md px-3 py-1 text-sm ml-2"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="approved">Aprobadas</option>
                        <option value="pending">Pendientes</option>
                        <option value="rejected">Rechazadas</option>
                      </select>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {filteredNotes.length} de {creditDebitNotes.length} notas
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredNotes.map((note) => {
                const TypeIcon = getTypeIcon(note.type)
                const StatusIcon = getStatusIcon(note.status)

                return (
                  <Card key={note.id} className="hover:shadow-lg transition-all duration-300 border-border group">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-foreground">{note.id}</CardTitle>
                        <Badge className={getTypeColor(note.type)}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {getTypeLabel(note.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{note.supplier}</p>
                      <p className="text-xs text-muted-foreground">Factura: {note.originalInvoice}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Motivo</p>
                        <p className="text-sm font-medium text-foreground">{note.reason}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha Emisión</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <p className="text-sm font-medium">{note.issueDate}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Items</p>
                          <p className="text-sm font-medium">{note.items}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                        <p className="text-sm text-foreground">{note.description}</p>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal:</span>
                          <span className="font-medium">{note.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Impuestos:</span>
                          <span className="font-medium">{note.tax}</span>
                        </div>
                        <div className="flex justify-between text-base font-bold border-t border-border pt-2">
                          <span>Total:</span>
                          <span
                            className={cn(
                              "text-foreground",
                              note.type === "credit" ? "text-green-600" : "text-red-600",
                            )}
                          >
                            {note.type === "credit" ? "-" : "+"}
                            {note.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Ref: {note.reference}</p>
                          {note.approvedBy && <p className="text-xs text-green-600">Aprobado por: {note.approvedBy}</p>}
                        </div>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge className={getStatusColor(note.status)}>{getStatusLabel(note.status)}</Badge>
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

            {filteredNotes.length === 0 && (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <FileCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No se encontraron notas</h3>
                  <p className="text-muted-foreground">Intenta ajustar los filtros o crear una nueva nota</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
