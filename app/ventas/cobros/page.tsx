"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/app-layout";
import { DataTable } from "@/components/data-table";
import { ModalNuevoCobro } from "@/components/modals/modal-nuevo-cobro";
import { ModalEditarCobro } from "@/components/modals/modal-editar-cobro";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display";
import { useCobros, useCobrosStats, useDeleteCobro } from "@/hooks/use-cobros";
import { Cobro, CobroStats } from "@/lib/types/cobros";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
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
} from "lucide-react";

export default function CobrosPage() {
  const { token } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [sortBy, setSortBy] = useState("fecha_cobro");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedCobro, setSelectedCobro] = useState<Cobro | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

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
  }), [searchTerm, page, limit, sortBy, sortOrder, fechaDesde, fechaHasta]);

  // Hooks para datos
  const {
    cobros,
    loading,
    error,
    pagination,
    fetchCobros,
    refetchCobros
  } = useCobros({
    filtros,
    autoFetch: true
  });

  const {
    stats,
    loading: statsLoading,
    error: statsError,
    fetchStats
  } = useCobrosStats();

  const {
    deleteCobro,
    loading: deletingCobro,
    error: deleteError
  } = useDeleteCobro();

  // Cargar estadísticas cuando haya token
  useEffect(() => {
    if (token) {
      fetchStats();
    }
  }, [token, fetchStats]);

  // Verificar que el token esté disponible antes de hacer peticiones
  useEffect(() => {
    if (!token) {
      console.log('⚠️ CobrosPage: Token no disponible, esperando autenticación...');
    } else {
      console.log('✅ CobrosPage: Token disponible, peticiones habilitadas');
    }
  }, [token]);


  // Manejar eliminación de cobro
  const handleDeleteCobro = async (cobro: Cobro) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el cobro ${cobro.codigo_cobro}?`)) {
      const success = await deleteCobro(cobro.cobro_id);
      if (success) {
        toast({
          title: "Cobro eliminado",
          description: `El cobro ${cobro.codigo_cobro} ha sido eliminado exitosamente`,
        });
        refetchCobros();
        fetchStats();
      } else {
        toast({
          title: "Error",
          description: deleteError || "Error al eliminar el cobro",
          variant: "destructive",
        });
      }
    }
  };

  // Manejar edición de cobro
  const handleEditCobro = (cobro: Cobro) => {
    setSelectedCobro(cobro);
    setEditModalOpen(true);
  };

  // Manejar actualización exitosa
  const handleCobroUpdated = () => {
    refetchCobros();
    fetchStats();
  };

  // Manejar creación exitosa
  const handleCobroCreated = () => {
    refetchCobros();
    fetchStats();
  };

  // Resetear filtros
  const resetFilters = () => {
    setSearchTerm("");
    setFechaDesde("");
    setFechaHasta("");
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

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Cobros</h1>
            <p className="text-gray-600 mt-2">Control de cobros y seguimiento de pagos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                refetchCobros();
                fetchStats();
              }}
              disabled={loading || statsLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading || statsLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <ModalNuevoCobro onCobroCreated={handleCobroCreated} />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
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
            <>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Cobros</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.general.total_cobros}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Monto Total</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.general.monto_total)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Cobros Hoy</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.hoy.cobros_hoy}</p>
                    </div>
                    <Calendar className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Promedio</p>
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.general.promedio_cobro)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Tabla de Cobros */}
        <DataTable
          title="Lista de Cobros"
          data={cobros}
          columns={[
            {
              key: 'codigo_cobro',
              header: 'Código',
              render: (cobro: Cobro) => (
                <div className="font-medium">{cobro.codigo_cobro}</div>
              ),
            },
            {
              key: 'cliente_nombre',
              header: 'Cliente',
              render: (cobro: Cobro) => (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {cobro.cliente_nombre
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{cobro.cliente_nombre || "Sin cliente"}</div>
                    {cobro.cliente_telefono && (
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cobro.cliente_telefono}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'nro_factura',
              header: 'Factura',
              render: (cobro: Cobro) => (
                <div>
                  <div className="font-medium">{cobro.nro_factura || "N/A"}</div>
                  {cobro.fecha_venta && (
                    <div className="text-sm text-gray-500">
                      Venta: {formatDate(cobro.fecha_venta)}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'fecha_cobro',
              header: 'Fecha Cobro',
              render: (cobro: Cobro) => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{formatDate(cobro.fecha_cobro)}</span>
                </div>
              ),
            },
            {
              key: 'monto',
              header: 'Monto',
              render: (cobro: Cobro) => (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-bold text-lg">{formatCurrency(cobro.monto)}</span>
                </div>
              ),
            },
            {
              key: 'caja_nro',
              header: 'Caja',
              render: (cobro: Cobro) => (
                <div>
                  <div className="text-sm">{cobro.caja_nro ? `Caja ${cobro.caja_nro}` : "N/A"}</div>
                  {cobro.sucursal_nombre && (
                    <div className="text-xs text-gray-500">{cobro.sucursal_nombre}</div>
                  )}
                </div>
              ),
            },
            {
              key: 'usuario_nombre',
              header: 'Usuario',
              render: (cobro: Cobro) => (
                <div className="text-sm">{cobro.usuario_nombre || "Sin asignar"}</div>
              ),
            },
          ]}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => {}}
          createButtonText="Nuevo Cobro"
          searchPlaceholder="Buscar por cliente, factura..."
          emptyMessage="No hay cobros registrados"
          actions={[
            {
              key: 'edit',
              label: 'Editar',
              icon: Edit,
              onClick: handleEditCobro,
              variant: 'ghost'
            },
            {
              key: 'delete',
              label: 'Eliminar',
              icon: Trash2,
              onClick: handleDeleteCobro,
              variant: 'ghost'
            }
          ]}
        />
      </div>

      {/* Modal de edición */}
      {selectedCobro && (
        <ModalEditarCobro
          cobro={selectedCobro}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onCobroUpdated={handleCobroUpdated}
        />
      )}
    </AppLayout>
  );
}