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
  TrendingDown,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Receipt,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function NotasCreditoDebitoPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"])

  // Datos de ejemplo para notas de crédito/débito
  const notas = [
    {
      id: "NC-001",
      tipo: "credito",
      cliente: "María González",
      email: "maria@email.com",
      telefono: "8812-3456",
      facturaOriginal: "F-001234",
      fechaCreacion: "2024-01-20",
      fechaFactura: "2024-01-15",
      motivo: "Devolución por defecto de fábrica",
      descripcion: "Producto con falla técnica, cliente solicita devolución completa",
      montoOriginal: 118650,
      montoAjuste: -50000,
      impuestosAjuste: -6500,
      montoTotal: -56500,
      estado: "aprobada",
      vendedor: "Juan Pérez",
      aprobadoPor: "Jaime Castro",
    },
    {
      id: "ND-001",
      tipo: "debito",
      cliente: "Carlos Rodríguez",
      email: "carlos@email.com",
      telefono: "8765-4321",
      facturaOriginal: "F-001235",
      fechaCreacion: "2024-01-19",
      fechaFactura: "2024-01-14",
      motivo: "Recargo por entrega tardía",
      descripcion: "Aplicación de recargo por demora en entrega según contrato",
      montoOriginal: 282500,
      montoAjuste: 15000,
      impuestosAjuste: 1950,
      montoTotal: 16950,
      estado: "pendiente",
      vendedor: "Ana Martínez",
      aprobadoPor: null,
    },
    {
      id: "NC-002",
      tipo: "credito",
      cliente: "Ana Martínez",
      email: "ana@email.com",
      telefono: "8654-3210",
      facturaOriginal: "F-001236",
      fechaCreacion: "2024-01-18",
      fechaFactura: "2024-01-13",
      motivo: "Descuento por volumen",
      descripcion: "Aplicación de descuento especial por compra de gran volumen",
      montoOriginal: 96050,
      montoAjuste: -10000,
      impuestosAjuste: -1300,
      montoTotal: -11300,
      estado: "aprobada",
      vendedor: "Juan Pérez",
      aprobadoPor: "Jaime Castro",
    },
    {
      id: "ND-002",
      tipo: "debito",
      cliente: "Luis Hernández",
      email: "luis@email.com",
      telefono: "8543-2109",
      facturaOriginal: "F-001237",
      fechaCreacion: "2024-01-17",
      fechaFactura: "2024-01-12",
      motivo: "Intereses por mora",
      descripcion: "Aplicación de intereses por pago tardío según términos acordados",
      montoOriginal: 203400,
      montoAjuste: 8000,
      impuestosAjuste: 1040,
      montoTotal: 9040,
      estado: "rechazada",
      vendedor: "Ana Martínez",
      aprobadoPor: "Jaime Castro",
    },
    {
      id: "NC-003",
      tipo: "credito",
      cliente: "Carmen Jiménez",
      email: "carmen@email.com",
      telefono: "8432-1098",
      facturaOriginal: "F-001238",
      fechaCreacion: "2024-01-16",
      fechaFactura: "2024-01-11",
      motivo: "Error en facturación",
      descripcion: "Corrección por error en cantidad facturada, se cobró de más",
      montoOriginal: 135600,
      montoAjuste: -25000,
      impuestosAjuste: -3250,
      montoTotal: -28250,
      estado: "procesando",
      vendedor: "Juan Pérez",
      aprobadoPor: null,
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

  const filteredNotas = notas.filter((nota) => {
    const matchesSearch =
      nota.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.facturaOriginal.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.motivo.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || nota.tipo === typeFilter
    return matchesSearch && matchesType
  })

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "procesando":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "aprobada":
        return "bg-green-100 text-green-800 border-green-200"
      case "rechazada":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return <Clock className="h-4 w-4" />
      case "procesando":
        return <AlertTriangle className="h-4 w-4" />
      case "aprobada":
        return <CheckCircle className="h-4 w-4" />
      case "rechazada":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getTipoIcon = (tipo: string) => {
    return tipo === "credito" ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />
  }

  const getTipoColor = (tipo: string) => {
    return tipo === "credito" ? "bg-red-100 text-red-800 border-red-200" : "bg-blue-100 text-blue-800 border-blue-200"
  }

  // Métricas calculadas
  const totalNotas = notas.length
  const notasCredito = notas.filter((n) => n.tipo === "credito").length
  const notasDebito = notas.filter((n) => n.tipo === "debito").length
  const montoTotalAjustes = notas.filter((n) => n.estado === "aprobada").reduce((sum, n) => sum + n.montoTotal, 0)

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
                        subItem.label === "Notas de Crédito/Débito"
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
                <Input placeholder="Buscar notas, clientes, facturas..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground">Notas de Crédito/Débito</h1>
                <p className="text-muted-foreground">Gestión de ajustes contables y correcciones de ventas</p>
              </div>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Nota
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
                  <p className="text-xs text-muted-foreground">Todas las notas</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notas de Crédito</CardTitle>
                  <TrendingDown className="h-4 w-4 text-destructive" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-destructive">{notasCredito}</div>
                  <p className="text-xs text-muted-foreground">Reducciones</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Notas de Débito</CardTitle>
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{notasDebito}</div>
                  <p className="text-xs text-muted-foreground">Aumentos</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Monto Total Ajustes</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${montoTotalAjustes >= 0 ? "text-accent" : "text-destructive"}`}>
                    ₡{Math.abs(montoTotalAjustes).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {montoTotalAjustes >= 0 ? "Aumentos netos" : "Reducciones netas"}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Notas de Crédito/Débito</CardTitle>
                <CardDescription>Gestiona todos los ajustes contables y correcciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar notas..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue placeholder="Filtrar por tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los tipos</SelectItem>
                      <SelectItem value="credito">Notas de Crédito</SelectItem>
                      <SelectItem value="debito">Notas de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Tabla de notas */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Nota</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Cliente</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Factura Original</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Fecha</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Motivo</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Monto Original</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ajuste</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNotas.map((nota) => (
                        <tr key={nota.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Badge className={`${getTipoColor(nota.tipo)} flex items-center gap-1`}>
                                {getTipoIcon(nota.tipo)}
                                {nota.tipo === "credito" ? "NC" : "ND"}
                              </Badge>
                              <div>
                                <div className="font-medium">{nota.id}</div>
                                <div className="text-sm text-muted-foreground">Vendedor: {nota.vendedor}</div>
                              </div>
                            </div>
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
                              <Receipt className="h-4 w-4 text-muted-foreground" />
                              <div>
                                <div className="font-medium">{nota.facturaOriginal}</div>
                                <div className="text-sm text-muted-foreground">Fecha: {nota.fechaFactura}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{nota.fechaCreacion}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="max-w-32">
                              <div className="font-medium text-sm">{nota.motivo}</div>
                              <div className="text-xs text-muted-foreground truncate" title={nota.descripcion}>
                                {nota.descripcion}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium">₡{nota.montoOriginal.toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className={`font-bold ${nota.montoAjuste >= 0 ? "text-blue-600" : "text-red-600"}`}>
                              {nota.montoAjuste >= 0 ? "+" : ""}₡{nota.montoAjuste.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Imp: {nota.impuestosAjuste >= 0 ? "+" : ""}₡{nota.impuestosAjuste.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div
                              className={`font-bold text-lg ${nota.montoTotal >= 0 ? "text-primary" : "text-destructive"}`}
                            >
                              {nota.montoTotal >= 0 ? "+" : ""}₡{nota.montoTotal.toLocaleString()}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={`${getStatusColor(nota.estado)} flex items-center gap-1`}>
                              {getStatusIcon(nota.estado)}
                              {nota.estado.charAt(0).toUpperCase() + nota.estado.slice(1)}
                            </Badge>
                            {nota.aprobadoPor && (
                              <div className="text-xs text-muted-foreground mt-1">Por: {nota.aprobadoPor}</div>
                            )}
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
