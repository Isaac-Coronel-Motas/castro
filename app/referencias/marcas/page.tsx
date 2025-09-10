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
  Package,
  Globe,
  Award,
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
    active: true,
    submenu: [
      { label: "Proveedores", href: "/referencias/proveedores", active: false },
      { label: "Productos", href: "/referencias/productos", active: false },
      { label: "Categorías", href: "/referencias/categorias", active: false },
      { label: "Clientes", href: "/referencias/clientes", active: false },
      { label: "Marcas", href: "/referencias/marcas", active: true },
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

export default function MarcasPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: false,
    "Servicios Técnicos": false,
    Ventas: false,
    Referencias: true,
    Administración: false,
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

  const filteredMarcas = marcas.filter(
    (marca) =>
      marca.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marca.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marca.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      marca.pais.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Activa":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Inactiva":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Descontinuada":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      case "Nueva":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getProductosBadge = (cantidad: number) => {
    if (cantidad === 0) return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    if (cantidad <= 5) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    if (cantidad <= 15) return "bg-blue-100 text-blue-800 hover:bg-blue-100"
    return "bg-green-100 text-green-800 hover:bg-green-100"
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
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Marcas</h1>
                <p className="text-gray-600">Gestión de marcas y fabricantes de productos</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Marca
              </Button>
            </div>

            {/* Filters and Search */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Lista de Marcas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar marcas..."
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
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Código</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Descripción</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">País</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Productos</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMarcas.map((marca, index) => (
                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{marca.codigo}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-blue-600" />
                              <span className="text-gray-900 font-medium">{marca.nombre}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 max-w-xs truncate">{marca.descripcion}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1 text-gray-600">
                              <Globe className="h-3 w-3" />
                              <span>{marca.pais}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Package className="h-3 w-3 text-gray-400" />
                              <Badge className={getProductosBadge(marca.productos)}>{marca.productos} productos</Badge>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge className={getEstadoBadge(marca.estado)}>{marca.estado}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredMarcas.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No se encontraron marcas que coincidan con la búsqueda.
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

const marcas = [
  {
    codigo: "MAR-001",
    nombre: "Samsung",
    descripcion: "Fabricante surcoreano de electrónicos y tecnología",
    pais: "Corea del Sur",
    productos: 25,
    estado: "Activa",
  },
  {
    codigo: "MAR-002",
    nombre: "Apple",
    descripcion: "Empresa estadounidense de tecnología y dispositivos móviles",
    pais: "Estados Unidos",
    productos: 18,
    estado: "Activa",
  },
  {
    codigo: "MAR-003",
    nombre: "HP",
    descripcion: "Hewlett-Packard, fabricante de computadoras e impresoras",
    pais: "Estados Unidos",
    productos: 12,
    estado: "Activa",
  },
  {
    codigo: "MAR-004",
    nombre: "Logitech",
    descripcion: "Fabricante suizo de periféricos y accesorios informáticos",
    pais: "Suiza",
    productos: 8,
    estado: "Activa",
  },
  {
    codigo: "MAR-005",
    nombre: "Kingston",
    descripcion: "Empresa estadounidense especializada en memorias y almacenamiento",
    pais: "Estados Unidos",
    productos: 6,
    estado: "Activa",
  },
  {
    codigo: "MAR-006",
    nombre: "Nokia",
    descripción: "Empresa finlandesa de telecomunicaciones y tecnología",
    pais: "Finlandia",
    productos: 3,
    estado: "Nueva",
  },
  {
    codigo: "MAR-007",
    nombre: "Blackberry",
    descripcion: "Fabricante canadiense de dispositivos móviles empresariales",
    pais: "Canadá",
    productos: 0,
    estado: "Descontinuada",
  },
]
