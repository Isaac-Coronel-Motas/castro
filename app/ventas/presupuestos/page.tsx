"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  TrendingUp,
  Filter,
  RefreshCw,
  FileText,
  User,
  Building,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ModalNuevoPresupuestoServicio } from "@/components/modals/modal-nuevo-presupuesto-servicio";
import { ModalEditarPresupuestoServicio } from "@/components/modals/modal-editar-presupuesto-servicio";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display";
import { usePresupuestosServicios, usePresupuestosServiciosStats, useDeletePresupuestoServicio } from "@/hooks/use-presupuestos";
import { PresupuestoServicio, PresupuestosServiciosStats } from "@/lib/types/presupuestos";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";

export default function PresupuestosServiciosPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [estado, setEstado] = useState("");
  const [tipoPresu, setTipoPresu] = useState("");
  const [sortBy, setSortBy] = useState("fecha_presupuesto");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<PresupuestoServicio | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"]);

  const { toast } = useToast();

  // Memoizar filtros para evitar llamadas infinitas
  const filtros = useMemo(() => ({
    search: searchTerm,
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    estado: estado && estado !== "all-estados" ? estado : undefined,
    tipo_presu: tipoPresu && tipoPresu !== "all-tipos" ? tipoPresu : undefined,
  }), [searchTerm, page, limit, sortBy, sortOrder, fechaDesde, fechaHasta, estado, tipoPresu]);

  // Hooks para datos
  const {
    presupuestos,
    loading,
    error,
    pagination,
    fetchPresupuestos,
    refetchPresupuestos
  } = usePresupuestosServicios({
    filtros,
    autoFetch: true
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    fetchStats
  } = usePresupuestosServiciosStats();

  const {
    deletePresupuesto,
    loading: deletingPresupuesto,
    error: deleteError
  } = useDeletePresupuestoServicio();

  // Cargar estadísticas cuando haya token
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  // Verificar que el token esté disponible antes de hacer peticiones
  useEffect(() => {
    if (!token) {
      console.log('⚠️ PresupuestosServiciosPage: Token no disponible, esperando autenticación...');
    } else {
      console.log('✅ PresupuestosServiciosPage: Token disponible, peticiones habilitadas');
    }
  }, [token]);

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
  ];

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => (prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]));
  };

  const navigateTo = (href: string) => {
    window.location.href = href;
  };

  // Manejar eliminación de presupuesto
  const handleDeletePresupuesto = async (presupuesto: PresupuestoServicio) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el presupuesto ${presupuesto.codigo_presupuesto}?`)) {
      const success = await deletePresupuesto(presupuesto.presu_serv_id);
      if (success) {
        toast({
          title: "Presupuesto eliminado",
          description: `El presupuesto ${presupuesto.codigo_presupuesto} ha sido eliminado exitosamente`,
        });
        refetchPresupuestos();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: deleteError || "Error al eliminar el presupuesto",
          variant: "destructive",
        });
      }
    }
  };

  // Manejar edición de presupuesto
  const handleEditPresupuesto = (presupuesto: PresupuestoServicio) => {
    setSelectedPresupuesto(presupuesto);
    setEditModalOpen(true);
  };

  // Manejar actualización exitosa
  const handlePresupuestoUpdated = () => {
    refetchPresupuestos();
    fetchStats();
  };

  // Manejar creación exitosa
  const handlePresupuestoCreated = () => {
    refetchPresupuestos();
    fetchStats();
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("");
    setFechaDesde("");
    setFechaHasta("");
    setEstado("");
    setTipoPresu("");
    setPage(1);
  };

  // Cambiar página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Cambiar límite de elementos por página
  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1);
  };

  // Cambiar ordenamiento
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  // Obtener color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return "bg-green-100 text-green-800 border-green-200";
      case "pendiente":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rechazado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "aprobado":
        return <CheckCircle className="h-4 w-4" />;
      case "pendiente":
        return <Clock className="h-4 w-4" />;
      case "rechazado":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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
                        subItem.label === "Presupuestos"
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
                <Input placeholder="Buscar presupuestos, clientes, diagnósticos..." className="pl-10 w-80" />
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
                <h1 className="text-3xl font-bold text-foreground">Presupuestos de Servicios</h1>
                <p className="text-muted-foreground">Gestión de presupuestos para servicios técnicos</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    refetchPresupuestos();
                    fetchStats();
                  }}
                  disabled={loading || statsLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading || statsLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <ModalNuevoPresupuestoServicio onPresupuestoCreated={handlePresupuestoCreated} />
              </div>
            </div>

            {/* Métricas */}
            {statsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                      <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : statsError ? (
              <Card>
                <CardContent className="p-6">
                  <ErrorDisplay
                    title="Error al cargar estadísticas"
                    message={statsError}
                    onRetry={fetchStats}
                  />
                </CardContent>
              </Card>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Presupuestos</CardTitle>
                    <FileText className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-primary">{stats.general.total_presupuestos}</div>
                    <p className="text-xs text-muted-foreground">Registros totales</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monto Total</CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">{formatCurrency(stats.general.monto_total)}</div>
                    <p className="text-xs text-muted-foreground">Presupuestos registrados</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Presupuestos Hoy</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-500">{stats.hoy.presupuestos_hoy}</div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(stats.hoy.monto_hoy)}</p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio</CardTitle>
                    <DollarSign className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-500">{formatCurrency(stats.general.promedio_presupuesto)}</div>
                    <p className="text-xs text-muted-foreground">Por presupuesto</p>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros y Búsqueda
                </CardTitle>
                <CardDescription>Busca y filtra los presupuestos según tus necesidades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar presupuestos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Input
                    type="date"
                    placeholder="Fecha desde"
                    value={fechaDesde}
                    onChange={(e) => setFechaDesde(e.target.value)}
                  />
                  
                  <Input
                    type="date"
                    placeholder="Fecha hasta"
                    value={fechaHasta}
                    onChange={(e) => setFechaHasta(e.target.value)}
                  />

                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-estados">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="aprobado">Aprobado</SelectItem>
                      <SelectItem value="rechazado">Rechazado</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={tipoPresu} onValueChange={setTipoPresu}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-tipos">Todos los tipos</SelectItem>
                      <SelectItem value="con_diagnostico">Con Diagnóstico</SelectItem>
                      <SelectItem value="sin_diagnostico">Sin Diagnóstico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    Limpiar Filtros
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabla de presupuestos */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Presupuestos</CardTitle>
                <CardDescription>
                  {pagination ? `${pagination.total} presupuestos encontrados` : "Cargando..."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : error ? (
                  <ErrorDisplay
                    title="Error al cargar presupuestos"
                    message={error}
                    onRetry={refetchPresupuestos}
                  />
                ) : presupuestos.length === 0 ? (
                  <EmptyState
                    title="No se encontraron presupuestos"
                    description="No hay presupuestos que coincidan con los filtros aplicados"
                    action={{
                      label: "Crear primer presupuesto",
                      onClick: () => {
                        // Abrir modal de nuevo presupuesto
                      }
                    }}
                  />
                ) : (
                  <>
                    {/* Tabla */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              <button
                                onClick={() => handleSortChange('codigo_presupuesto')}
                                className="flex items-center gap-1 hover:text-foreground"
                              >
                                Código
                                {sortBy === 'codigo_presupuesto' && (
                                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </button>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              <button
                                onClick={() => handleSortChange('cliente_nombre')}
                                className="flex items-center gap-1 hover:text-foreground"
                              >
                                Cliente
                                {sortBy === 'cliente_nombre' && (
                                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </button>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              <button
                                onClick={() => handleSortChange('fecha_presupuesto')}
                                className="flex items-center gap-1 hover:text-foreground"
                              >
                                Fecha
                                {sortBy === 'fecha_presupuesto' && (
                                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </button>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                              <button
                                onClick={() => handleSortChange('monto_presu_ser')}
                                className="flex items-center gap-1 hover:text-foreground"
                              >
                                Monto
                                {sortBy === 'monto_presu_ser' && (
                                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                                )}
                              </button>
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                            <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {presupuestos.map((presupuesto) => (
                            <tr key={presupuesto.presu_serv_id} className="border-b border-border hover:bg-muted/50">
                              <td className="py-3 px-4">
                                <div className="font-medium">{presupuesto.codigo_presupuesto}</div>
                                {presupuesto.nro_presupuesto && (
                                  <div className="text-sm text-muted-foreground">
                                    #{presupuesto.nro_presupuesto}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {presupuesto.cliente_nombre
                                        ?.split(" ")
                                        .map((n) => n[0])
                                        .join("")
                                        .toUpperCase() || "C"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{presupuesto.cliente_nombre || "Sin cliente"}</div>
                                    {presupuesto.cliente_telefono && (
                                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-3 w-3" />
                                        {presupuesto.cliente_telefono}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">{formatDate(presupuesto.fecha_presupuesto)}</span>
                                </div>
                                {(presupuesto.valido_desde || presupuesto.valido_hasta) && (
                                  <div className="text-xs text-muted-foreground">
                                    Válido: {presupuesto.valido_desde ? formatDate(presupuesto.valido_desde) : 'N/A'} - {presupuesto.valido_hasta ? formatDate(presupuesto.valido_hasta) : 'N/A'}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-bold text-primary text-lg">
                                  {formatCurrency(presupuesto.monto_presu_ser)}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(presupuesto.estado)}`}>
                                  {getStatusIcon(presupuesto.estado)}
                                  {presupuesto.estado}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-sm">
                                  {presupuesto.tipo_presu === 'con_diagnostico' ? 'Con Diagnóstico' : 'Sin Diagnóstico'}
                                </div>
                                {presupuesto.diagnostico_descripcion && (
                                  <div className="text-xs text-muted-foreground">
                                    {presupuesto.diagnostico_descripcion.substring(0, 30)}...
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm">
                                    {presupuesto.usuario_nombre || "Sin asignar"}
                                  </span>
                                </div>
                                {presupuesto.sucursal_nombre && (
                                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Building className="h-3 w-3" />
                                    {presupuesto.sucursal_nombre}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditPresupuesto(presupuesto)}
                                    title="Editar presupuesto"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePresupuesto(presupuesto)}
                                    disabled={deletingPresupuesto}
                                    title="Eliminar presupuesto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Paginación */}
                    {pagination && pagination.total_pages > 1 && (
                      <div className="flex items-center justify-between mt-6">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{" "}
                            {Math.min(pagination.page * pagination.limit, pagination.total)} de{" "}
                            {pagination.total} resultados
                          </span>
                          <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10</SelectItem>
                              <SelectItem value="25">25</SelectItem>
                              <SelectItem value="50">50</SelectItem>
                              <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page - 1)}
                            disabled={pagination.page === 1}
                          >
                            Anterior
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                              const pageNum = Math.max(1, pagination.page - 2) + i;
                              if (pageNum > pagination.total_pages) return null;
                              
                              return (
                                <Button
                                  key={pageNum}
                                  variant={pageNum === pagination.page ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handlePageChange(pageNum)}
                                  className="w-8 h-8 p-0"
                                >
                                  {pageNum}
                                </Button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePageChange(pagination.page + 1)}
                            disabled={pagination.page === pagination.total_pages}
                          >
                            Siguiente
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Modal de edición */}
      {selectedPresupuesto && (
        <ModalEditarPresupuestoServicio
          presupuesto={selectedPresupuesto}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onPresupuestoUpdated={handlePresupuestoUpdated}
        />
      )}
    </div>
  );
}