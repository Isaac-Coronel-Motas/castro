'use client';

import { useState, useMemo } from 'react';
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
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorDisplay, EmptyState } from '@/components/ui/error-display';
import { ModalNuevaNotaRemision } from '@/components/modals/modal-nueva-nota-remision';
import { ModalEditarNotaRemision } from '@/components/modals/modal-editar-nota-remision';
import { useNotasRemision, useNotasRemisionStats, useDeleteNotaRemision } from '@/hooks/use-notas-remision';
import { NotaRemision, NotasRemisionStats } from '@/lib/types/notas-remision';
import { useToast } from '@/hooks/use-toast';

export default function NotasRemisionPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Ventas"]);
  const [searchTerm, setSearchTerm] = useState('');
  const [estado, setEstado] = useState('');
  const [tipoRemision, setTipoRemision] = useState('');
  const [usuarioId, setUsuarioId] = useState('');
  const [origenAlmacenId, setOrigenAlmacenId] = useState('');
  const [destinoSucursalId, setDestinoSucursalId] = useState('');
  const [destinoAlmacenId, setDestinoAlmacenId] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState('fecha_remision');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Configuración del menú lateral
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

  const { toast } = useToast();

  // Configurar filtros para el hook
  const filtros = useMemo(() => ({
    search: searchTerm,
    estado: estado && estado !== "all-estados" ? estado : undefined,
    tipo_remision: tipoRemision && tipoRemision !== "all-tipos" ? tipoRemision : undefined,
    usuario_id: usuarioId ? parseInt(usuarioId) : undefined,
    origen_almacen_id: origenAlmacenId ? parseInt(origenAlmacenId) : undefined,
    destino_sucursal_id: destinoSucursalId ? parseInt(destinoSucursalId) : undefined,
    destino_almacen_id: destinoAlmacenId ? parseInt(destinoAlmacenId) : undefined,
    fecha_desde: fechaDesde || undefined,
    fecha_hasta: fechaHasta || undefined,
    page,
    limit,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [searchTerm, page, limit, sortBy, sortOrder, fechaDesde, fechaHasta, estado, tipoRemision, usuarioId, origenAlmacenId, destinoSucursalId, destinoAlmacenId]);

  // Hooks para datos
  const {
    notasRemision,
    loading: loadingNotas,
    error: errorNotas,
    pagination,
    refetchNotasRemision
  } = useNotasRemision({ filtros, autoFetch: true });

  const {
    stats,
    loading: loadingStats,
    error: errorStats,
    fetchStats
  } = useNotasRemisionStats();

  const {
    deleteNotaRemision,
    loading: deletingNotaRemision,
    error: deleteError
  } = useDeleteNotaRemision();

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm('');
    setFechaDesde('');
    setFechaHasta('');
    setEstado('');
    setTipoRemision('');
    setUsuarioId('');
    setOrigenAlmacenId('');
    setDestinoSucursalId('');
    setDestinoAlmacenId('');
    setPage(1);
  };

  // Manejar eliminación
  const handleDelete = async (notaRemision: NotaRemision) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la nota de remisión ${notaRemision.codigo_remision}?`)) {
      const success = await deleteNotaRemision(notaRemision.remision_id);
      
      if (success) {
        toast({
          title: 'Nota de remisión eliminada',
          description: `La nota de remisión ${notaRemision.codigo_remision} ha sido eliminada exitosamente`,
        });
        refetchNotasRemision();
        fetchStats();
      } else {
        toast({
          title: 'Error',
          description: deleteError || 'Error al eliminar la nota de remisión',
          variant: 'destructive',
        });
      }
    }
  };

  // Obtener color del estado
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'anulado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4" />;
      case 'anulado':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Obtener color del tipo
  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'venta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'compra':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'transferencia':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Manejar cambio de límite
  const handleLimitChange = (newLimit: string) => {
    setLimit(parseInt(newLimit));
    setPage(1);
  };

  // Manejar ordenamiento
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    refetchNotasRemision();
                    fetchStats();
                  }}
                  disabled={loadingNotas || loadingStats}
                  className="gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${(loadingNotas || loadingStats) ? 'animate-spin' : ''}`} />
                  Actualizar
                </Button>
                <ModalNuevaNotaRemision onNotaRemisionCreated={refetchNotasRemision} />
              </div>
            </div>

      {/* Estadísticas */}
      {loadingStats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">Cargando datos...</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : errorStats ? (
        <ErrorDisplay
          title="Error al cargar estadísticas"
          description={errorStats}
          action={{
            label: 'Reintentar',
            onClick: fetchStats
          }}
        />
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notas</CardTitle>
              <FileText className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.general.total_remisiones}</div>
              <p className="text-xs text-muted-foreground">Todas las remisiones</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoy</CardTitle>
              <Calendar className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.hoy.remisiones_hoy}</div>
              <p className="text-xs text-muted-foreground">Notas de hoy</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Este Mes</CardTitle>
              <Package className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.mes.remisiones_mes}</div>
              <p className="text-xs text-muted-foreground">Notas del mes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-chart-4/10 to-chart-4/5 border-chart-4/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
              <Truck className="h-4 w-4 text-chart-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-chart-4">{stats.general.total_productos}</div>
              <p className="text-xs text-muted-foreground">Productos movidos</p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Filtros y búsqueda */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Notas de Remisión</CardTitle>
          <CardDescription>Gestiona todas las entregas y documentos de remisión</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar notas de remisión..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={estado} onValueChange={setEstado}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-estados">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="anulado">Anulado</SelectItem>
                </SelectContent>
              </Select>

              <Select value={tipoRemision} onValueChange={setTipoRemision}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-tipos">Todos los tipos</SelectItem>
                  <SelectItem value="venta">Venta</SelectItem>
                  <SelectItem value="compra">Compra</SelectItem>
                  <SelectItem value="transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Desde"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-full sm:w-40"
                />
                <Input
                  type="date"
                  placeholder="Hasta"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>

              <Button variant="outline" onClick={resetFilters} className="flex-1">
                <Filter className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            </div>
          </div>

          {/* Contenido principal */}
          {loadingNotas ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : errorNotas ? (
            <ErrorDisplay
              title="Error al cargar notas de remisión"
              description={errorNotas}
              action={{
                label: 'Reintentar',
                onClick: refetchNotasRemision
              }}
            />
          ) : notasRemision.length === 0 ? (
            <EmptyState
              title="No se encontraron notas de remisión"
              description="No hay notas de remisión que coincidan con los filtros aplicados"
              action={{
                label: 'Crear primera nota',
                onClick: () => {
                  // Trigger del modal de nueva nota
                  const button = document.querySelector('[data-new-nota-remision]') as HTMLButtonElement;
                  if (button) button.click();
                }
              }}
            />
          ) : (
            <>
              {/* Tabla de notas de remisión */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('codigo_remision')}
                          className="h-auto p-0 font-medium"
                        >
                          Nota
                          {sortBy === 'codigo_remision' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSort('fecha_remision')}
                          className="h-auto p-0 font-medium"
                        >
                          Fecha
                          {sortBy === 'fecha_remision' && (
                            <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </Button>
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Usuario</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Origen</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Destino</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Tipo</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Productos</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Estado</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {notasRemision.map((nota) => (
                      <tr key={nota.remision_id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{nota.codigo_remision}</div>
                          {nota.observaciones && (
                            <div className="text-sm text-muted-foreground truncate max-w-32" title={nota.observaciones}>
                              {nota.observaciones}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div className="text-sm">{formatDate(nota.fecha_remision)}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {nota.usuario_nombre?.charAt(0) || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-sm">{nota.usuario_nombre || 'Sin usuario'}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">{nota.origen_almacen_nombre || 'Sin almacén'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm">
                            {nota.destino_sucursal_nombre || nota.destino_almacen_nombre || 'Sin destino'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getTipoColor(nota.tipo_remision)} capitalize`}>
                            {nota.tipo_remision}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{nota.total_productos}</div>
                              <div className="text-sm text-muted-foreground">Cant: {nota.total_cantidad}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${getStatusColor(nota.estado)} flex items-center gap-1 w-fit`}>
                            {getStatusIcon(nota.estado)}
                            {nota.estado.charAt(0).toUpperCase() + nota.estado.slice(1)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" title="Ver detalles">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <ModalEditarNotaRemision 
                              notaRemision={nota} 
                              onNotaRemisionUpdated={refetchNotasRemision} 
                            />
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              title="Eliminar"
                              onClick={() => handleDelete(nota)}
                              disabled={deletingNotaRemision}
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
                      Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} resultados
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
                      disabled={pagination.page <= 1}
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
                      disabled={pagination.page >= pagination.total_pages}
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
    </div>
  );
}