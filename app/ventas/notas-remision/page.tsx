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
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NotasRemisionPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"])

  // Datos de ejemplo para notas de remisión
  const notasRemision = [
    {
      id: "NR-001",
      cliente: "María González",
      email: "maria@email.com",
      telefono: "8812-3456",
      fechaCreacion: "2024-01-15",
      fechaEntrega: "2024-01-16",
      direccionEntrega: "San José, Centro, Av. Central 123",
      productos: 3,
      cantidadTotal: 5,
      valorEstimado: 118650,
      estado: "entregada",
      tipoEntrega: "domicilio",
      vendedor: "Juan Pérez",
      transportista: "Carlos Méndez",
      observaciones: "Entrega realizada sin novedad",
      facturada: false,
    },
    {
      id: "NR-002",
      cliente: "Carlos Rodríguez",
      email: "carlos@email.com",
      telefono: "8765-4321",
      fechaCreacion: "2024-01-14",
      fechaEntrega: "2024-01-15",
      direccionEntrega: "Cartago, Centro, Calle 5 Av. 2-4",
      productos: 2,
      cantidadTotal: 8,
      valorEstimado: 265550,
      estado: "pendiente",
      tipoEntrega: "taller",
      vendedor: "Ana Martínez",
      transportista: null,
      observaciones: "Cliente recogerá en taller",
      facturada: false,
    },
    {
      id: "NR-003",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      telefono: "8654-3210",
      fechaCreacion: "2024-01-13",
      fechaEntrega: "2024-01-14",
      direccionEntrega: "Heredia, Mercedes, Residencial Los Pinos",
      productos: 1,
      cantidadTotal: 2,
      valorEstimado: 96050,
      estado: "facturada",
      tipoEntrega: "domicilio",
      vendedor: "Juan Pérez",
      transportista: "Luis Vargas",
      observaciones: "Facturada como F-001236",
      facturada: true,
    },
    {
      id: "NR-004",
      cliente: "Luis Hernández",
      email: "luis@email.com",
      telefono: "8543-2109",
      fechaCreacion: "2024-01-12",
      fechaEntrega: "2024-01-13",
      direccionEntrega: "Alajuela, Centro, Calle 1 Av. 3",
      productos: 4,
      cantidadTotal: 6,
      valorEstimado: 192100,
      estado: "devuelta",
      tipoEntrega: "domicilio",
      vendedor: "Ana Martínez",
      transportista: "Carlos Méndez",
      observaciones: "Cliente no conforme, productos devueltos",
      facturada: false,
    },
    {
      id: "NR-005",
      cliente: "Carmen Jiménez",
      email: "carmen@email.com",
      telefono: "8432-1098",
      fechaCreacion: "2024-01-11",
      fechaEntrega: "2024-01-12",
      direccionEntrega: "Puntarenas, Centro, Paseo de los Turistas",
      productos: 2,
      cantidadTotal: 3,
      valorEstimado: 129950,
      estado: "en-transito",
      tipoEntrega: "domicilio",
      vendedor: "Juan Pérez",
      transportista: "Luis Vargas",
      observaciones: "En camino hacia destino",
      facturada: false,
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

  const filteredNotas = notasRemision.filter((nota) => {
    const matchesSearch =
      nota.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.vendedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nota.transportista && nota.transportista.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || nota.estado === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "en-transito":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "entregada":
        return "bg-green-100 text-green-800 border-green-200"
      case "devuelta":
        return "bg-red-100 text-red-800 border-red-200"
      case "facturada":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "en-transito":
        return <Truck className="h-4 w-4" />
      case "entregada":
        return <CheckCircle className="h-4 w-4" />
      case "devuelta":
        return <ArrowLeft className="h-4 w-4" />
      case "facturada":
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTipoEntregaIcon = (tipo: string) => {
    switch (tipo) {
      case "domicilio":
        return <Truck className="h-4 w-4" />
      case "taller":
        return <Package className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  // Métricas calculadas
  const totalNotas = notasRemision.length
  const notasPendientes = notasRemision.filter((n) => n.estado === "pendiente").length
  const notasEntregadas = notasRemision.filter((n) => n.estado === "entregada").length
  const notasPendientesFacturar = notasRemision.filter((n) => n.estado === "entregada" && !n.facturada).length

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
                        subItem.label === "Notas de Remisión"
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
                <Input placeholder="Buscar notas de remisión, clientes..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground">Notas de Remisión</h1>
                <p className="text-muted-foreground">Gestión de entregas y documentos de remisión</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota de Remisión
              </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Notas</CardTitle>
                  <FileText className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{totalNotas}</div>
                  <p className="text-xs text-muted-foreground">Todas las remisiones</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{notasPendientes}</div>
                  <p className="text-xs text-muted-foreground">Por entregar</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Entregadas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">{notasEntregadas}</div>
                  <p className="text-xs text-muted-foreground">Completadas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Facturar</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-chart-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-chart-4">{notasPendientesFacturar}</div>
                  <p className="text-xs text-muted-foreground">Requieren facturación</p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Notas de Remisión</CardTitle>
                <CardDescription>Gestiona todas las entregas y documentos de remisión</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar notas de remisión..."
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
                      <SelectItem value="en-transito">En Tránsito</SelectItem>
                      <SelectItem value="entregada">Entregada</SelectItem>
                      <SelectItem value="devuelta">Devuelta</SelectItem>
                      <SelectItem value="facturada">Facturada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de notas de remisión */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nota</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha/Entrega</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Dirección</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Valor Estimado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo Entrega</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Transportista</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotas.map((nota) => (
                        <tr key={nota.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="font-medium">{nota.id}</div>
                            <div className="text-sm text-muted-foreground">Vendedor: {nota.vendedor}</div>
                            {nota.facturada && <div className="text-xs text-green-600 font-medium">✓ Facturada</div>}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {nota.cliente
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{nota.cliente}</div>
                                <div className="text-sm text-muted-foreground">{nota.telefono}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="text-sm font-medium">Creada: {nota.fechaCreacion}</div>
                                <div className="text-sm text-muted-foreground">Entrega: {nota.fechaEntrega}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <div className="text-sm max-w-32 truncate" title={nota.direccionEntrega}>
                                {nota.direccionEntrega}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Package className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{nota.productos} items</div>
                                <div className="text-sm text-muted-foreground">Cant: {nota.cantidadTotal}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-primary">₡{nota.valorEstimado.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {getTipoEntregaIcon(nota.tipoEntrega)}
                              <span className="text-sm capitalize">{nota.tipoEntrega}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {nota.transportista ? (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{nota.transportista}</span>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(nota.estado)} flex items-center gap-1`}>
                              {getStatusIcon(nota.estado)}
                              {nota.estado === "en-transito"
                                ? "En Tránsito"
                                : nota.estado.charAt(0).toUpperCase() + nota.estado.slice(1)}
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
