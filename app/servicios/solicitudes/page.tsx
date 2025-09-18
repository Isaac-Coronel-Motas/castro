"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { SolicitudServicioModal } from "@/components/modals/solicitud-servicio-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { SolicitudServicio, CreateSolicitudServicioRequest, UpdateSolicitudServicioRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, FileText, Calendar, User, Building, MapPin, Eye, Edit, Trash2, Clock, Wrench } from "lucide-react"

export default function SolicitudesClientePage() {
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudServicio | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [solicitudToDelete, setSolicitudToDelete] = useState<SolicitudServicio | null>(null)

  const {
    data: solicitudes,
    loading,
    error,
    pagination,
    search,
    sort,
    page,
    limit,
    handleSearch,
    handleSort,
    handlePageChange,
    handleLimitChange,
    createItem,
    updateItem,
    deleteItem,
    refresh
  } = useApi<SolicitudServicio>('/api/servicios/solicitudes')

  const columns = [
    {
      key: 'nro_solicitud',
      label: 'Número',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <div className="font-medium text-foreground">
          {solicitud.nro_solicitud || `#${solicitud.solicitud_id}`}
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      label: 'Fecha',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(solicitud.fecha_solicitud).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado_solicitud',
      label: 'Estado',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <Badge className={getEstadoColor(solicitud.estado_solicitud)}>
          {getEstadoLabel(solicitud.estado_solicitud)}
        </Badge>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="font-medium">{solicitud.cliente_nombre}</div>
            {solicitud.cliente_telefono && (
              <div className="text-sm text-muted-foreground">{solicitud.cliente_telefono}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'tipo_atencion',
      label: 'Tipo',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <Badge variant="outline">
          {solicitud.tipo_atencion}
        </Badge>
      )
    },
    {
      key: 'direccion',
      label: 'Dirección',
      sortable: false,
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2 max-w-xs">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="truncate">{solicitud.direccion}</span>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{solicitud.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'total_servicios',
      label: 'Servicios',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span>{solicitud.total_servicios || 0}</span>
        </div>
      )
    },
    {
      key: 'fecha_programada',
      label: 'Programada',
      sortable: true,
      render: (solicitud: SolicitudServicio) => (
        solicitud.fecha_programada ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(solicitud.fecha_programada).toLocaleDateString('es-CR')}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">No programada</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (solicitud: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(solicitud)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {solicitud.estado_solicitud === 'Pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(solicitud)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {solicitud.estado_solicitud === 'Pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(solicitud)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const handleCreate = () => {
    setSelectedSolicitud(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (solicitud: SolicitudServicio) => {
    setSelectedSolicitud(solicitud)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (solicitud: SolicitudServicio) => {
    setSelectedSolicitud(solicitud)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (solicitud: SolicitudServicio) => {
    setSolicitudToDelete(solicitud)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateSolicitudServicioRequest | UpdateSolicitudServicioRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateSolicitudServicioRequest)
      } else {
        await updateItem((data as UpdateSolicitudServicioRequest).solicitud_id!, data as UpdateSolicitudServicioRequest)
      }
      setIsModalOpen(false)
      setSelectedSolicitud(null)
    } catch (error) {
      console.error('Error guardando solicitud:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (solicitudToDelete) {
      try {
        await deleteItem(solicitudToDelete.solicitud_id)
        setIsDeleteModalOpen(false)
        setSolicitudToDelete(null)
      } catch (error) {
        console.error('Error eliminando solicitud:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSolicitud(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSolicitudToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'Pendiente': 'bg-secondary text-secondary-foreground',
      'Asignada': 'bg-chart-1 text-white',
      'En proceso': 'bg-chart-2 text-white',
      'Finalizada': 'bg-green-500 text-white',
      'Cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado
  }

  const metrics = [
    {
      title: "Total Solicitudes",
      value: pagination?.total?.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: FileText,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: solicitudes?.filter(s => s.estado_solicitud === 'Pendiente').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Clock,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Proceso",
      value: solicitudes?.filter(s => s.estado_solicitud === 'En proceso').length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Wrench,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Finalizadas",
      value: solicitudes?.filter(s => s.estado_solicitud === 'Finalizada').length.toString() || "0",
      change: "+20%",
      trend: "up" as const,
      icon: Calendar,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Solicitudes de Cliente</h1>
            <p className="text-muted-foreground">Gestión de solicitudes de servicios técnicos</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground">{metric.value}</p>
                    <div className="flex items-center mt-2">
                      <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg ${metric.color}`}>
                    <metric.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardContent className="p-0">
            <DataTable
              data={solicitudes || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search={search}
              sort={sort}
              onSearch={handleSearch}
              onSort={handleSort}
              onPageChange={handlePageChange}
              onLimitChange={handleLimitChange}
              searchPlaceholder="Buscar solicitudes..."
            />
          </CardContent>
        </Card>
      </div>

      <SolicitudServicioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        solicitud={selectedSolicitud}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Solicitud"
        message={`¿Estás seguro de que deseas eliminar la solicitud "${solicitudToDelete?.nro_solicitud || `#${solicitudToDelete?.solicitud_id}`}"?`}
        itemName={solicitudToDelete?.nro_solicitud || `Solicitud #${solicitudToDelete?.solicitud_id}`}
      />
    </AppLayout>
  )
}
