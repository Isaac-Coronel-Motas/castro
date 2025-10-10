"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AppLayout } from "@/components/app-layout";
import { DataTable } from "@/components/data-table";
import { ModalNuevoPresupuestoServicio } from "@/components/modals/modal-nuevo-presupuesto-servicio";
import { ModalEditarPresupuestoServicio } from "@/components/modals/modal-editar-presupuesto-servicio";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorDisplay, EmptyState } from "@/components/ui/error-display";
import { usePresupuestosServicios, usePresupuestosServiciosStats, useDeletePresupuestoServicio } from "@/hooks/use-presupuestos";
import { PresupuestoServicio, PresupuestosServiciosStats } from "@/lib/types/presupuestos";
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
  FileText,
  User,
  Building,
} from "lucide-react";

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
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Presupuestos de Servicios</h1>
            <p className="text-gray-600 mt-2">Gestión de presupuestos para servicios técnicos</p>
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
                      <p className="text-sm font-medium text-gray-600">Total Presupuestos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.general.total_presupuestos}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-500" />
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
                      <p className="text-sm font-medium text-gray-600">Presupuestos Hoy</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.hoy.presupuestos_hoy}</p>
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
                      <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.general.promedio_presupuesto)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}
        </div>

        {/* Tabla de Presupuestos */}
        <DataTable
          title="Lista de Presupuestos"
          data={presupuestos}
          columns={[
            {
              key: 'codigo_presupuesto',
              header: 'Código',
              render: (presupuesto: PresupuestoServicio) => (
                <div>
                  <div className="font-medium">{presupuesto.codigo_presupuesto}</div>
                  {presupuesto.nro_presupuesto && (
                    <div className="text-sm text-gray-500">#{presupuesto.nro_presupuesto}</div>
                  )}
                </div>
              ),
            },
            {
              key: 'cliente_nombre',
              header: 'Cliente',
              render: (presupuesto: PresupuestoServicio) => (
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
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {presupuesto.cliente_telefono}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'fecha_presupuesto',
              header: 'Fecha',
              render: (presupuesto: PresupuestoServicio) => (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="text-sm font-medium">{formatDate(presupuesto.fecha_presupuesto)}</div>
                    {(presupuesto.valido_desde || presupuesto.valido_hasta) && (
                      <div className="text-xs text-gray-500">
                        Válido: {presupuesto.valido_desde ? formatDate(presupuesto.valido_desde) : 'N/A'} - {presupuesto.valido_hasta ? formatDate(presupuesto.valido_hasta) : 'N/A'}
                      </div>
                    )}
                  </div>
                </div>
              ),
            },
            {
              key: 'monto_presu_ser',
              header: 'Monto',
              render: (presupuesto: PresupuestoServicio) => (
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-bold text-lg">{formatCurrency(presupuesto.monto_presu_ser)}</span>
                </div>
              ),
            },
            {
              key: 'estado',
              header: 'Estado',
              render: (presupuesto: PresupuestoServicio) => (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(presupuesto.estado)}`}>
                  {getStatusIcon(presupuesto.estado)}
                  {presupuesto.estado}
                </div>
              ),
            },
            {
              key: 'tipo_presu',
              header: 'Tipo',
              render: (presupuesto: PresupuestoServicio) => (
                <div>
                  <div className="text-sm">
                    {presupuesto.tipo_presu === 'con_diagnostico' ? 'Con Diagnóstico' : 'Sin Diagnóstico'}
                  </div>
                  {presupuesto.diagnostico_descripcion && (
                    <div className="text-xs text-gray-500">
                      {presupuesto.diagnostico_descripcion.substring(0, 30)}...
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: 'usuario_nombre',
              header: 'Usuario',
              render: (presupuesto: PresupuestoServicio) => (
                <div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{presupuesto.usuario_nombre || "Sin asignar"}</span>
                  </div>
                  {presupuesto.sucursal_nombre && (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      {presupuesto.sucursal_nombre}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          onCreate={() => {}}
          createButtonText="Nuevo Presupuesto"
          searchPlaceholder="Buscar por cliente, código..."
          emptyMessage="No hay presupuestos registrados"
          actions={[
            {
              key: 'edit',
              label: 'Editar',
              icon: Edit,
              onClick: handleEditPresupuesto,
              variant: 'ghost'
            },
            {
              key: 'delete',
              label: 'Eliminar',
              icon: Trash2,
              onClick: handleDeletePresupuesto,
              variant: 'ghost'
            }
          ]}
        />
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
    </AppLayout>
  );
}