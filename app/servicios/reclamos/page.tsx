"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  MessageSquare,
  Star,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReclamosPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [priorityFilter, setPriorityFilter] = useState("todas")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Servicios Técnicos"])

  // Datos de ejemplo para reclamos
  const reclamos = [
    {
      id: "REC-001",
      cliente: "María González",
      avatar: "/placeholder.svg?height=32&width=32",
      tipo: "Garantía",
      descripcion: "Equipo presenta el mismo problema después de la reparación",
      estado: "Abierto",
      prioridad: "Alta",
      fechaCreacion: "2024-01-15",
      tecnicoAsignado: "Carlos Rodríguez",
      ordenServicio: "OS-234",
      tiempoRespuesta: "2 horas",
      satisfaccion: null,
    },
    {
      id: "REC-002",
      cliente: "Juan Pérez",
      avatar: "/placeholder.svg?height=32&width=32",
      tipo: "Calidad Servicio",
      descripcion: "Insatisfacción con el tiempo de reparación",
      estado: "En Proceso",
      prioridad: "Media",
      fechaCreacion: "2024-01-14",
      tecnicoAsignado: "Ana Martínez",
      ordenServicio: "OS-198",
      tiempoRespuesta: "4 horas",
      satisfaccion: null,
    },
    {
      id: "REC-003",
      cliente: "Luis Castro",
      avatar: "/placeholder.svg?height=32&width=32",
      tipo: "Tiempo Entrega",
      descripcion: "Retraso significativo en la entrega del equipo",
      estado: "Resuelto",
      prioridad: "Baja",
      fechaCreacion: "2024-01-12",
      tecnicoAsignado: "Pedro Sánchez",
      ordenServicio: "OS-156",
      tiempoRespuesta: "24 horas",
      satisfaccion: 4,
    },
    {
      id: "REC-004",
      cliente: "Carmen López",
      avatar: "/placeholder.svg?height=32&width=32",
      tipo: "Atención Cliente",
      descripcion: "Trato inadecuado durante la recepción del equipo",
      estado: "Cerrado",
      prioridad: "Alta",
      fechaCreacion: "2024-01-10",
      tecnicoAsignado: "María Fernández",
      ordenServicio: "OS-134",
      tiempoRespuesta: "1 hora",
      satisfaccion: 5,
    },
  ]

  const sidebarItems = [
    { label: "Dashboard", icon: BarChart3, href: "/dashboard" },
    {
      label: "Compras",
      icon: Users,
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
      icon: AlertCircle,
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
      icon: TrendingUp,
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
      icon: Users,
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
      icon: Users,
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

  const filteredReclamos = reclamos.filter((reclamo) => {
    const matchesSearch =
      reclamo.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reclamo.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reclamo.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "todos" || reclamo.estado.toLowerCase() === statusFilter.toLowerCase()
    const matchesPriority =
      priorityFilter === "todas" || reclamo.prioridad.toLowerCase() === priorityFilter.toLowerCase()

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return "bg-red-100 text-red-800 border-red-200"
      case "En Proceso":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Resuelto":
        return "bg-green-100 text-green-800 border-green-200"
      case "Cerrado":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "bg-red-100 text-red-800 border-red-200"
      case "Media":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "Baja":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "Garantía":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "Calidad Servicio":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Tiempo Entrega":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "Atención Cliente":
        return "bg-pink-100 text-pink-800 border-pink-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Abierto":
        return <AlertTriangle className="h-4 w-4" />
      case "En Proceso":
        return <Clock className="h-4 w-4" />
      case "Resuelto":
        return <CheckCircle className="h-4 w-4" />
      case "Cerrado":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const renderStars = (rating: number | null) => {
    if (rating === null) return <span className="text-gray-400">Sin calificar</span>

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  // Métricas calculadas
  const totalReclamos = reclamos.length
  const reclamosAbiertos = reclamos.filter((r) => r.estado === "Abierto").length
  const reclamosEnProceso = reclamos.filter((r) => r.estado === "En Proceso").length
  const reclamosResueltos = reclamos.filter((r) => r.estado === "Resuelto" || r.estado === "Cerrado").length
  const tiempoPromedioResolucion = "6.5 horas"

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`bg-slate-800 text-white transition-all duration-300 ${sidebarCollapsed ? "w-16" : "w-64"} flex-shrink-0`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg p-2">
              <AlertCircle className="h-6 w-6 text-slate-800" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg">Taller Castro</h1>
                <p className="text-slate-300 text-sm">Sistema de Gestión</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8">
          {sidebarItems.map((item) => (
            <div key={item.label}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    toggleSubmenu(item.label)
                  } else if (item.href) {
                    navigateTo(item.href)
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-700 transition-colors ${
                  item.label === "Servicios Técnicos" ? "bg-slate-700 border-r-2 border-red-500" : ""
                }`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.submenu && (
                      <div className={`transition-transform ${expandedMenus.includes(item.label) ? "rotate-90" : ""}`}>
                        ▶
                      </div>
                    )}
                  </>
                )}
              </button>

              {item.submenu && expandedMenus.includes(item.label) && !sidebarCollapsed && (
                <div className="bg-slate-900">
                  {item.submenu.map((subItem) => (
                    <button
                      key={subItem.label}
                      onClick={() => navigateTo(subItem.href)}
                      className={`w-full text-left px-8 py-2 text-sm hover:bg-slate-700 transition-colors ${
                        subItem.label === "Reclamos" ? "bg-slate-700 text-red-400" : "text-slate-300"
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
                ☰
              </Button>
              <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-gray-400" />
                <Input placeholder="Buscar reclamos, clientes, productos..." className="w-96" />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </div>
                <Button variant="ghost" size="sm">
                  🔔
                </Button>
              </div>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>JC</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <div className="font-medium">Jaime Castro</div>
                  <div className="text-gray-500">Administrador</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Reclamos</h1>
                <p className="text-gray-600">Gestión de quejas y reclamos de clientes</p>
              </div>
              <Button className="bg-red-600 hover:bg-red-700">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Reclamo
              </Button>
            </div>

            {/* Métricas Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Reclamos</CardTitle>
                  <MessageSquare className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalReclamos}</div>
                  <p className="text-xs text-gray-600">Este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reclamos Abiertos</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{reclamosAbiertos}</div>
                  <p className="text-xs text-gray-600">Requieren atención</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{reclamosEnProceso}</div>
                  <p className="text-xs text-gray-600">Siendo atendidos</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{tiempoPromedioResolucion}</div>
                  <p className="text-xs text-gray-600">Resolución</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y Búsqueda */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Lista de Reclamos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Buscar reclamos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="abierto">Abierto</SelectItem>
                      <SelectItem value="en proceso">En Proceso</SelectItem>
                      <SelectItem value="resuelto">Resuelto</SelectItem>
                      <SelectItem value="cerrado">Cerrado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todas">Todas las prioridades</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="baja">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>

                {/* Tabla de Reclamos */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Reclamo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Prioridad</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Técnico</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Satisfacción</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReclamos.map((reclamo) => (
                        <tr key={reclamo.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{reclamo.id}</div>
                              <div className="text-sm text-gray-500">{reclamo.fechaCreacion}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={reclamo.avatar || "/placeholder.svg"} />
                                <AvatarFallback>
                                  {reclamo.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium text-gray-900">{reclamo.cliente}</div>
                                <div className="text-sm text-gray-500">{reclamo.ordenServicio}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getTipoColor(reclamo.tipo)}>{reclamo.tipo}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 truncate">{reclamo.descripcion}</p>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={`${getEstadoColor(reclamo.estado)} flex items-center gap-1 w-fit`}>
                              {getEstadoIcon(reclamo.estado)}
                              {reclamo.estado}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getPrioridadColor(reclamo.prioridad)}>{reclamo.prioridad}</Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{reclamo.tecnicoAsignado}</div>
                              <div className="text-xs text-gray-500">Resp: {reclamo.tiempoRespuesta}</div>
                            </div>
                          </td>
                          <td className="py-4 px-4">{renderStars(reclamo.satisfaccion)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
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
