'use client';

import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/app-layout';
import { DataTable } from '@/components/data-table';
import { LoadingSpinner } from '@/components/ui/loading';
import { ErrorDisplay, EmptyState } from '@/components/ui/error-display';
import { ModalNuevaNotaRemision } from '@/components/modals/modal-nueva-nota-remision';
import { ModalEditarNotaRemision } from '@/components/modals/modal-editar-nota-remision';
import { useNotasRemision, useNotasRemisionStats, useDeleteNotaRemision } from '@/hooks/use-notas-remision';
import { NotaRemision, NotasRemisionStats } from '@/lib/types/notas-remision';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/auth-context';
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

export default function NotasRemisionPage() {
  const { token } = useAuth();
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

  // Cargar estadísticas cuando haya token
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

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
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notas de Remisión</h1>
            <p className="text-gray-600 mt-2">Gestión de entregas y documentos de remisión</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                refetchNotasRemision();
                fetchStats();
              }}
              disabled={loadingNotas || loadingStats}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${(loadingNotas || loadingStats) ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <ModalNuevaNotaRemision onNotaRemisionCreated={refetchNotasRemision} />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loadingStats ? (
            [...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2" />
                      <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
                    </div>
                    <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : errorStats ? (
            <Card>
              <CardContent className="p-6">
                <ErrorDisplay
                  title="Error al cargar estadísticas"
                  message={errorStats}
                  onRetry={fetchStats}
                />
              </CardContent>
            </Card>
          ) : stats ? (
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Notas</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.general.total_remisiones}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Hoy</p>
                      <p className="text-2xl font-bold text-green-600">{stats.hoy.remisiones_hoy}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Este Mes</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.mes.remisiones_mes}</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Productos</p>
                      <p className="text-2xl font-bold text-purple-600">{stats.general.total_productos}</p>
                    </div>
                    <Truck className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Tabla de Notas de Remisión */}
        <DataTable
          title="Lista de Notas de Remisión"
          data={notasRemision}
          columns={[
            {
              key: 'codigo_remision',
              header: 'Nota',
              render: (nota: NotaRemision) => (
                <div>
                  <div className="font-medium">{nota.codigo_remision}</div>
                  {nota.observaciones && (
                    <div className="text-sm text-gray-500 truncate max-w-32" title={nota.observaciones}>
                      {nota.observaciones}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'fecha_remision',
              header: 'Fecha',
              render: (nota: NotaRemision) => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(nota.fecha_remision)}</span>
                </div>
              ),
            },
            {
              key: 'usuario_nombre',
              header: 'Usuario',
              render: (nota: NotaRemision) => (
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {nota.usuario_nombre?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{nota.usuario_nombre || 'Sin usuario'}</span>
                </div>
              ),
            },
            {
              key: 'origen_almacen_nombre',
              header: 'Origen',
              render: (nota: NotaRemision) => (
                <div className="text-sm">{nota.origen_almacen_nombre || 'Sin almacén'}</div>
              ),
            },
            {
              key: 'destino',
              header: 'Destino',
              render: (nota: NotaRemision) => (
                <div className="text-sm">
                  {nota.destino_sucursal_nombre || nota.destino_almacen_nombre || 'Sin destino'}
                </div>
              ),
            },
            {
              key: 'tipo_remision',
              header: 'Tipo',
              render: (nota: NotaRemision) => (
                <Badge className={`${getTipoColor(nota.tipo_remision)} capitalize`}>
                  {nota.tipo_remision}
                </Badge>
              ),
            },
            {
              key: 'total_productos',
              header: 'Productos',
              render: (nota: NotaRemision) => (
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium">{nota.total_productos}</div>
                    <div className="text-sm text-gray-500">Cant: {nota.total_cantidad}</div>
                  </div>
                </div>
              ),
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (nota: NotaRemision) => (
                <Badge className={`${getStatusColor(nota.estado)} flex items-center gap-1 w-fit`}>
                  {getStatusIcon(nota.estado)}
                  {nota.estado.charAt(0).toUpperCase() + nota.estado.slice(1)}
                </Badge>
              ),
            },
          ]}
          loading={loadingNotas}
          error={errorNotas}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => {}}
          createButtonText="Nueva Nota"
          searchPlaceholder="Buscar por código, usuario..."
          emptyMessage="No hay notas de remisión registradas"
          actions={[
            {
              key: 'view',
              label: 'Ver',
              icon: Eye,
              onClick: () => {},
              variant: 'ghost'
            },
            {
              key: 'edit',
              label: 'Editar',
              icon: Edit,
              onClick: () => {},
              variant: 'ghost'
            },
            {
              key: 'delete',
              label: 'Eliminar',
              icon: Trash2,
              onClick: handleDelete,
              variant: 'ghost'
            }
          ]}
        />
      </div>
    </AppLayout>
  );
}