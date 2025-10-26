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
import { NotaCreditoDebitoModal } from "@/components/modals/nota-credito-debito-modal"
import { 
  getTipoOperacionColor, 
  getTipoOperacionLabel, 
  getNotaEstadoColor, 
  getNotaEstadoLabel 
} from "@/lib/utils/compras-client"
import { NotaCreditoDebito } from "@/lib/types/compras-adicionales"
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
  const [modalOpen, setModalOpen] = useState(false)
  const [modalTipoOperacion, setModalTipoOperacion] = useState<'compra' | 'venta'>('compra')
  const [selectedNota, setSelectedNota] = useState<NotaCreditoDebito | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const router = useRouter()

  // Hook para manejar las APIs
  const { 
    data: notasCredito, 
    loading: loadingCredito, 
    error: errorCredito,
    search: searchCredito,
    create: createCredito,
    update: updateCredito,
    delete: deleteCredito
  } = useApi<NotaCreditoDebito>('/api/compras/notas-credito')

  const { 
    data: notasDebito, 
    loading: loadingDebito, 
    error: errorDebito,
    search: searchDebito,
    create: createDebito,
    update: updateDebito,
    delete: deleteDebito
  } = useApi<NotaCreditoDebito>('/api/compras/notas-debito')

  // Combinar notas de crédito y débito
  const allNotas = [...(notasCredito || []), ...(notasDebito || [])]
  const loading = loadingCredito || loadingDebito
  const error = errorCredito || errorDebito

  // Filtrar notas
  const filteredNotas = allNotas.filter((nota) => {
    const matchesSearch = 
      nota.nro_nota?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.motivo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.proveedor_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      nota.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || nota.tipo_operacion === filterType
    const matchesStatus = filterStatus === "all" || nota.estado === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Métricas calculadas
  const metrics = [
    {
      title: "Total Notas",
      value: allNotas.length.toString(),
      change: "+8%",
      trend: "up",
      icon: FileCheck,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Notas de Crédito",
      value: notasCredito?.length.toString() || "0",
      change: "+12%",
      trend: "up",
      icon: TrendingDown,
      color: "bg-green-500 text-white",
    },
    {
      title: "Notas de Débito",
      value: notasDebito?.length.toString() || "0",
      change: "-5%",
      trend: "down",
      icon: TrendingUp,
      color: "bg-red-500 text-white",
    },
    {
      title: "Valor Neto",
      value: `₡${allNotas.reduce((sum, nota) => sum + (nota.monto_nc || 0), 0).toLocaleString()}`,
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    searchCredito(term)
    searchDebito(term)
  }

  const handleCreateCredito = () => {
    setModalTipoOperacion('compra')
    setModalMode('create')
    setSelectedNota(null)
    setModalOpen(true)
  }

  const handleCreateDebito = () => {
    setModalTipoOperacion('venta')
    setModalMode('create')
    setSelectedNota(null)
    setModalOpen(true)
  }

  const handleView = (nota: NotaCreditoDebito) => {
    setModalTipoOperacion(nota.tipo_operacion)
    setModalMode('view')
    setSelectedNota(nota)
    setModalOpen(true)
  }

  const handleEdit = (nota: NotaCreditoDebito) => {
    setModalTipoOperacion(nota.tipo_operacion)
    setModalMode('edit')
    setSelectedNota(nota)
    setModalOpen(true)
  }

  const handleDelete = async (nota: NotaCreditoDebito) => {
    if (confirm('¿Está seguro de que desea eliminar esta nota?')) {
      try {
        if (nota.tipo_operacion === 'compra') {
          await deleteCredito(nota.nota_credito_id)
        } else {
          await deleteDebito(nota.nota_credito_id)
        }
      } catch (error) {
        console.error('Error eliminando nota:', error)
      }
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        if (modalTipoOperacion === 'compra') {
          await createCredito(data)
        } else {
          await createDebito(data)
        }
      } else if (modalMode === 'edit') {
        if (modalTipoOperacion === 'compra') {
          await updateCredito(selectedNota?.nota_credito_id || 0, data)
        } else {
          await updateDebito(selectedNota?.nota_credito_id || 0, data)
        }
      }
    } catch (error) {
      console.error('Error guardando nota:', error)
      throw error
    }
  }

  const columns = [
    { key: 'nro_nota', label: 'Número', sortable: true },
    { key: 'fecha_registro', label: 'Fecha', sortable: true, render: (item: any) => new Date(item.fecha_registro).toLocaleDateString('es-CR') },
    { key: 'tipo_operacion', label: 'Tipo', sortable: true, render: (item: any) => (
      <Badge className={getTipoOperacionColor(item.tipo_operacion)}>
        {getTipoOperacionLabel(item.tipo_operacion)}
      </Badge>
    )},
    { key: 'proveedor_nombre', label: 'Proveedor/Cliente', sortable: true, render: (item: any) => item.proveedor_nombre || item.cliente_nombre },
    { key: 'motivo', label: 'Motivo', sortable: true },
    { key: 'monto', label: 'Monto', sortable: true, render: (item: any) => {
        const monto = item.monto || 0;
        return `₡${monto.toLocaleString()}`;
      }
    },
    { key: 'estado', label: 'Estado', sortable: true, render: (item: any) => (
      <Badge className={getNotaEstadoColor(item.estado)}>
        {getNotaEstadoLabel(item.estado)}
      </Badge>
    )},
    { key: 'usuario_nombre', label: 'Usuario', sortable: true },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item: any) => (
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => handleView(item)} className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
          </Button>
          {item.estado === 'activo' && (
            <>
              <Button size="sm" variant="outline" onClick={() => handleEdit(item)} className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleDelete(item)} className="h-8 w-8 p-0 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ]

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
                    onChange={(e) => handleSearch(e.target.value)}
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
                <Button 
                  variant="outline" 
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  onClick={handleCreateCredito}
                >
                  <Minus className="h-4 w-4 mr-2" />
                  Nota Crédito
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
                  onClick={handleCreateDebito}
                >
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
                    {filteredNotas.length} de {allNotas.length} notas
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Table */}
            <Card className="border-border">
              <CardContent className="p-0">
                <DataTable
                  data={filteredNotas}
                  columns={columns}
                  loading={loading}
                  error={error}
                  title="Notas de Crédito/Débito"
                  onSearch={handleSearch}
                />
              </CardContent>
            </Card>

            {/* Modal */}
            <NotaCreditoDebitoModal
              isOpen={modalOpen}
              onClose={() => setModalOpen(false)}
              onSave={handleSave}
              nota={selectedNota}
              tipoOperacion={modalTipoOperacion}
            />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
