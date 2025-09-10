"use client"

import { useState } from "react"
import {
  Search,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  AlertCircle,
  Clock,
  CheckCircle,
  Star,
  FileText,
  Target,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function InformesServiciosPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Servicios Técnicos"])
  const [selectedPeriod, setSelectedPeriod] = useState("mes")

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

  // Datos de ejemplo para informes
  const reportes = [
    {
      id: "RPT-001",
      nombre: "Rendimiento de Técnicos",
      descripcion: "Análisis de productividad y eficiencia por técnico",
      categoria: "Productividad",
      tipo: "Gráfico de Barras",
      ultimaGeneracion: "2024-01-15",
      frecuencia: "Semanal",
    },
    {
      id: "RPT-002",
      nombre: "Tipos de Reparaciones",
      descripcion: "Distribución de servicios más solicitados",
      categoria: "Servicios",
      tipo: "Gráfico Circular",
      ultimaGeneracion: "2024-01-14",
      frecuencia: "Mensual",
    },
    {
      id: "RPT-003",
      nombre: "Tiempos de Servicio",
      descripcion: "Análisis de tiempos promedio por tipo de reparación",
      categoria: "Eficiencia",
      tipo: "Línea de Tiempo",
      ultimaGeneracion: "2024-01-13",
      frecuencia: "Diario",
    },
    {
      id: "RPT-004",
      nombre: "Satisfacción del Cliente",
      descripcion: "Métricas de calidad y satisfacción",
      categoria: "Calidad",
      tipo: "Dashboard",
      ultimaGeneracion: "2024-01-12",
      frecuencia: "Semanal",
    },
  ]

  const metricas = {
    serviciosCompletados: 156,
    tiempoPromedioReparacion: "4.2 días",
    satisfaccionPromedio: 4.6,
    tecnicosActivos: 8,
    ingresosTotales: "₡2,450,000",
    reclamosResueltos: 12,
  }

  const topTecnicos = [
    { nombre: "Carlos Rodríguez", servicios: 45, satisfaccion: 4.8, avatar: "/placeholder.svg?height=32&width=32" },
    { nombre: "Ana Martínez", servicios: 38, satisfaccion: 4.7, avatar: "/placeholder.svg?height=32&width=32" },
    { nombre: "Pedro Sánchez", servicios: 32, satisfaccion: 4.5, avatar: "/placeholder.svg?height=32&width=32" },
    { nombre: "María Fernández", servicios: 28, satisfaccion: 4.9, avatar: "/placeholder.svg?height=32&width=32" },
  ]

  const tiposServicio = [
    { tipo: "Reparación Pantalla", cantidad: 45, porcentaje: 28.8 },
    { tipo: "Diagnóstico", cantidad: 38, porcentaje: 24.4 },
    { tipo: "Limpieza", cantidad: 32, porcentaje: 20.5 },
    { tipo: "Actualización Software", cantidad: 25, porcentaje: 16.0 },
    { tipo: "Cambio Batería", cantidad: 16, porcentaje: 10.3 },
  ]

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
                        subItem.label === "Informes" ? "bg-slate-700 text-red-400" : "text-slate-300"
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
                <Input placeholder="Buscar informes, métricas, análisis..." className="w-96" />
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
                <h1 className="text-2xl font-bold text-gray-900">Informes de Servicios</h1>
                <p className="text-gray-600">Análisis y reportes del área de servicios técnicos</p>
              </div>
              <div className="flex items-center gap-3">
                <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dia">Hoy</SelectItem>
                    <SelectItem value="semana">Esta Semana</SelectItem>
                    <SelectItem value="mes">Este Mes</SelectItem>
                    <SelectItem value="trimestre">Trimestre</SelectItem>
                    <SelectItem value="año">Este Año</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-red-600 hover:bg-red-700">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Datos
                </Button>
              </div>
            </div>

            {/* Métricas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Servicios Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metricas.serviciosCompletados}</div>
                  <p className="text-xs text-gray-600">+12% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tiempo Promedio</CardTitle>
                  <Clock className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{metricas.tiempoPromedioReparacion}</div>
                  <p className="text-xs text-gray-600">-8% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Satisfacción Promedio</CardTitle>
                  <Star className="h-4 w-4 text-amber-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{metricas.satisfaccionPromedio}</div>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-3 w-3 ${star <= Math.floor(metricas.satisfaccionPromedio) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Técnicos Activos</CardTitle>
                  <Users className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{metricas.tecnicosActivos}</div>
                  <p className="text-xs text-gray-600">Disponibles hoy</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{metricas.ingresosTotales}</div>
                  <p className="text-xs text-gray-600">+15% vs mes anterior</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reclamos Resueltos</CardTitle>
                  <Target className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{metricas.reclamosResueltos}</div>
                  <p className="text-xs text-gray-600">95% de satisfacción</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Top Técnicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Rendimiento de Técnicos</CardTitle>
                  <CardDescription>Top técnicos por servicios completados</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topTecnicos.map((tecnico, index) => (
                      <div key={tecnico.nombre} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                            {index + 1}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={tecnico.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {tecnico.nombre
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{tecnico.nombre}</div>
                            <div className="text-sm text-gray-500">{tecnico.servicios} servicios</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{tecnico.satisfaccion}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Tipos de Servicio */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tipos de Servicio Más Solicitados</CardTitle>
                  <CardDescription>Distribución por categoría de reparación</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tiposServicio.map((servicio) => (
                      <div key={servicio.tipo} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">{servicio.tipo}</span>
                          <span className="text-sm text-gray-600">
                            {servicio.cantidad} ({servicio.porcentaje}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${servicio.porcentaje}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reportes Disponibles */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Reportes Disponibles</CardTitle>
                <CardDescription>Generar informes detallados y análisis específicos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportes.map((reporte) => (
                    <div
                      key={reporte.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-red-100 p-2 rounded-lg">
                            <FileText className="h-5 w-5 text-red-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{reporte.nombre}</h3>
                            <p className="text-sm text-gray-600">{reporte.descripcion}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className="text-xs">
                          {reporte.categoria}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {reporte.tipo}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>Última generación: {reporte.ultimaGeneracion}</span>
                        <span>Frecuencia: {reporte.frecuencia}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 flex-1">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Generar
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
