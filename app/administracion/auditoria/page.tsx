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
  Clock,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  LogOut,
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
    active: false,
    submenu: [
      { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente", active: false },
      { label: "Recepción de Equipos", href: "/servicios/recepcion-equipos", active: false },
      { label: "Diagnósticos", href: "/servicios/diagnosticos", active: false },
      { label: "Presupuestos", href: "/servicios/presupuestos", active: false },
      { label: "Órdenes de Servicio", href: "/servicios/ordenes-servicio", active: false },
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
    active: true,
    submenu: [
      { label: "Usuarios", href: "/administracion/usuarios", active: false },
      { label: "Roles y Permisos", href: "/administracion/roles-permisos", active: false },
      { label: "Auditoría", href: "/administracion/auditoria", active: true },
      { label: "Configuración", href: "/administracion/configuracion", active: false },
    ],
  },
]

export default function AuditoriaPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: false,
    "Servicios Técnicos": false,
    Ventas: false,
    Referencias: false,
    Administración: true,
  })
  const [searchTerm, setSearchTerm] = useState("")
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

  const filteredLogs = logsAuditoria.filter(
    (log) =>
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case "Exitoso":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Fallido":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Advertencia":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case "Exitoso":
        return <CheckCircle className="h-3 w-3" />
      case "Fallido":
        return <XCircle className="h-3 w-3" />
      case "Advertencia":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case "Usuarios":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "Ventas":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Servicios":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Compras":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Sistema":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
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
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar pedidos, clientes, productos..." className="pl-10 w-80" />
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
          <main className="flex-1 overflow-auto p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Auditoría</h1>
                <p className="text-gray-600">Registro de actividades y seguimiento de acciones del sistema</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Exportar Logs
              </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Registro de Auditoría</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar en logs de auditoría..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha/Hora</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Usuario</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Acción</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Módulo</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Detalles</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">IP</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Resultado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.map((log, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-3 w-3" />
                              {log.fechaHora}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                  {log.usuario.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-gray-900">{log.usuario}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Activity className="h-3 w-3 text-gray-500" />
                              <span className="text-gray-900">{log.accion}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getModuloBadge(log.modulo)}>{log.modulo}</Badge>
                          </td>
                          <td className="py-3 px-4 max-w-xs">
                            <span className="text-sm text-gray-600 truncate block">{log.detalles}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Globe className="h-3 w-3" />
                              {log.ip}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getResultadoBadge(log.resultado)}>
                              <div className="flex items-center gap-1">
                                {getResultadoIcon(log.resultado)}
                                {log.resultado}
                              </div>
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron registros de auditoría que coincidan con la búsqueda.
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

const logsAuditoria = [
  {
    fechaHora: "2024-01-15 14:32:15",
    usuario: "jcastro",
    accion: "Inicio de Sesión",
    modulo: "Sistema",
    detalles: "Usuario administrador inició sesión correctamente",
    ip: "192.168.1.100",
    resultado: "Exitoso",
  },
  {
    fechaHora: "2024-01-15 14:30:45",
    usuario: "mrodriguez",
    accion: "Crear Usuario",
    modulo: "Usuarios",
    detalles: "Creó nuevo usuario: cperez con rol Vendedor",
    ip: "192.168.1.105",
    resultado: "Exitoso",
  },
  {
    fechaHora: "2024-01-15 14:28:20",
    usuario: "cperez",
    accion: "Generar Venta",
    modulo: "Ventas",
    detalles: "Procesó venta #V-001 por ₡350,000",
    ip: "192.168.1.110",
    resultado: "Exitoso",
  },
  {
    fechaHora: "2024-01-15 14:25:10",
    usuario: "agarcia",
    accion: "Acceso Denegado",
    modulo: "Sistema",
    detalles: "Intento de acceso a módulo sin permisos: Administración",
    ip: "192.168.1.115",
    resultado: "Fallido",
  },
  {
    fechaHora: "2024-01-15 14:22:30",
    usuario: "lmartinez",
    accion: "Actualizar Servicio",
    modulo: "Servicios",
    detalles: "Cambió estado de servicio SS-002 a En Proceso",
    ip: "192.168.1.120",
    resultado: "Exitoso",
  },
  {
    fechaHora: "2024-01-15 14:20:15",
    usuario: "jcastro",
    accion: "Modificar Permisos",
    modulo: "Usuarios",
    detalles: "Actualizó permisos del rol Técnico Senior",
    ip: "192.168.1.100",
    resultado: "Advertencia",
  },
  {
    fechaHora: "2024-01-15 14:18:45",
    usuario: "mrodriguez",
    accion: "Crear Pedido",
    modulo: "Compras",
    detalles: "Generó pedido de compra PC-004 a Distribuidora Tech SA",
    ip: "192.168.1.105",
    resultado: "Exitoso",
  },
  {
    fechaHora: "2024-01-15 14:15:30",
    usuario: "sistema",
    accion: "Backup Automático",
    modulo: "Sistema",
    detalles: "Respaldo automático de base de datos completado",
    ip: "127.0.0.1",
    resultado: "Exitoso",
  },
]
