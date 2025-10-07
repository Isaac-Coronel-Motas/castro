"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import { useApi } from "@/hooks/use-api"
import { DataTable } from "@/components/data-table"
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
import { AjusteInventario } from "@/lib/types/compras-adicionales"
import { getAjusteEstadoColor, getAjusteEstadoLabel, getTipoMovimientoColor, getTipoMovimientoLabel } from "@/lib/utils/compras-client"
import { AjusteInventarioModal } from "@/components/modals/ajuste-inventario-modal"

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
  const [selectedAjuste, setSelectedAjuste] = useState<AjusteInventario | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const {
    data: ajustes,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    refetch: refresh
  } = useApi<AjusteInventario>('/api/compras/ajustes-inventario')

  const metrics = [
    {
      title: "Ajustes del Mes",
      value: ajustes?.filter(a => {
        const fecha = new Date(a.fecha)
        const ahora = new Date()
        return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear()
      }).length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: RotateCcw,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Productos Afectados",
      value: ajustes?.reduce((total, ajuste) => total + (ajuste.total_productos || 0), 0).toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Boxes,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Entradas",
      value: ajustes?.filter(a => a.detalles?.some(d => d.cantidad_ajustada > 0)).length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: ArrowUp,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Ajustado",
      value: `₡${ajustes?.reduce((total, ajuste) => total + (ajuste.valor_total || 0), 0).toLocaleString() || "0"}`,
      change: "+22%",
      trend: "up" as const,
      icon: Calculator,
      color: "bg-chart-2 text-white",
    },
  ]

  const columns = [
    {
      key: 'codigo_ajuste',
      label: 'Código',
      sortable: true,
    },
    {
      key: 'fecha',
      label: 'Fecha',
      sortable: true,
      render: (item: any) => new Date(item.fecha).toLocaleDateString('es-CR')
    },
    {
      key: 'motivo_descripcion',
      label: 'Motivo',
      sortable: true,
    },
    {
      key: 'almacen_nombre',
      label: 'Almacén',
      sortable: true,
    },
    {
      key: 'total_productos',
      label: 'Productos',
      sortable: true,
    },
    {
      key: 'valor_total',
      label: 'Valor',
      sortable: true,
      render: (item: any) => `₡${(item.valor_total || 0).toLocaleString()}`
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (item: any) => (
        <Badge className={getAjusteEstadoColor(item.estado)}>
          {getAjusteEstadoLabel(item.estado)}
        </Badge>
      )
    },
    {
      key: 'usuario_nombre',
      label: 'Usuario',
      sortable: true,
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleView(item)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {item.estado === 'borrador' && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(item)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(item)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

  const handleCreate = () => {
    setSelectedAjuste(null)
    setModalMode('create')
    setShowModal(true)
  }

  const handleEdit = (ajuste: AjusteInventario) => {
    setSelectedAjuste(ajuste)
    setModalMode('edit')
    setShowModal(true)
  }

  const handleView = (ajuste: AjusteInventario) => {
    setSelectedAjuste(ajuste)
    setModalMode('view')
    setShowModal(true)
  }

  const handleDelete = async (ajuste: AjusteInventario) => {
    if (confirm(`¿Está seguro de que desea eliminar el ajuste ${ajuste.codigo_ajuste}?`)) {
      try {
        await deleteItem(ajuste.ajuste_id)
        refresh()
      } catch (error) {
        console.error('Error eliminando ajuste:', error)
      }
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await createItem(data)
      } else if (modalMode === 'edit' && selectedAjuste) {
        await updateItem(selectedAjuste.ajuste_id, data)
      }
      setShowModal(false)
      refresh()
    } catch (error) {
      console.error('Error guardando ajuste:', error)
    }
  }

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
                    placeholder="Buscar ajustes, motivos, almacenes..."
                    className="pl-10 w-80 bg-input border-border"
                    value={searchTerm}
                    onChange={(e) => {
                      const term = e.target.value
                      setSearchTerm(term)
                      search(term)
                    }}
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
                    <p className="text-muted-foreground">{user?.rol_nombre || "Usuario"}</p>
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
              <Button 
                onClick={handleCreate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              >
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

            {/* Data Table */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Ajustes de Inventario
                </CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable
                  title="Ajustes de Inventario"
                  data={ajustes || []}
                  columns={columns}
                  loading={loading}
                  error={error}
                  pagination={pagination}
                  onSearch={search}
                  onSort={(sortBy, sortOrder) => setSorting(sortBy, sortOrder)}
                  onPageChange={(page) => setPagination(page, pagination?.limit || 10)}
                  onLimitChange={(limit) => setPagination(pagination?.page || 1, limit)}
                  searchPlaceholder="Buscar ajustes, motivos, almacenes..."
                />
              </CardContent>
            </Card>
          </main>
        </div>

        {/* Modal */}
        <AjusteInventarioModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          ajuste={selectedAjuste}
          mode={modalMode}
        />
      </div>
    </ProtectedRoute>
  )
}