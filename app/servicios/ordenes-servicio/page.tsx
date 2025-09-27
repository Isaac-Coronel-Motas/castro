"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { OrdenServicioModal } from "@/components/modals/orden-servicio-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { OrdenServicio, CreateOrdenServicioRequest, UpdateOrdenServicioRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, ClipboardList, Calendar, User, Building, Eye, Edit, Trash2, Clock, Play, Pause, CheckCircle, AlertCircle } from "lucide-react"

export default function OrdenesServicioPage() {
  const [selectedOrden, setSelectedOrden] = useState<OrdenServicio | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ordenToDelete, setOrdenToDelete] = useState<OrdenServicio | null>(null)

  const {
    data: ordenes,
    loading,
    error,
    pagination,
    refetch,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    search: handleSearch,
    setSorting: handleSort,
    setPagination: handlePageChange,
    setFilters
  } = useApi<OrdenServicio>('/api/servicios/ordenes-servicio')

  const columns = [
    {
      key: 'orden_servicio_id',
      label: 'Número',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="font-medium text-foreground">
          #{orden.orden_servicio_id}
        </div>
      )
    },
    {
      key: 'fecha_solicitud',
      label: 'Fecha',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(orden.fecha_solicitud).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <Badge className={getEstadoColor(orden.estado)}>
          {getEstadoLabel(orden.estado)}
        </Badge>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{orden.cliente_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'tecnico_nombre',
      label: 'Técnico',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{orden.tecnico_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'monto_servicio',
      label: 'Monto',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="font-medium">
          ${orden.monto_servicio?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(orden)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {orden.estado !== 'completado' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(orden)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {orden.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(orden)}
              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const handleLimitChange = (limit: number) => {
    handlePageChange(1, limit)
  }

  const handlePageChangeWrapper = (page: number) => {
    handlePageChange(page, pagination?.limit || 10)
  }

  const handleCreate = () => {
    setSelectedOrden(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (orden: OrdenServicio) => {
    setSelectedOrden(orden)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (orden: OrdenServicio) => {
    setSelectedOrden(orden)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (orden: OrdenServicio) => {
    setOrdenToDelete(orden)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateOrdenServicioRequest | UpdateOrdenServicioRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateOrdenServicioRequest)
      } else {
        await updateItem((data as UpdateOrdenServicioRequest).orden_servicio_id!, data as UpdateOrdenServicioRequest)
      }
      setIsModalOpen(false)
      setSelectedOrden(null)
    } catch (error) {
      console.error('Error guardando orden de servicio:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (ordenToDelete) {
      try {
        await deleteItem(ordenToDelete.orden_servicio_id)
        setIsDeleteModalOpen(false)
        setOrdenToDelete(null)
      } catch (error) {
        console.error('Error eliminando orden de servicio:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrden(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setOrdenToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-blue-500 text-white',
      'en_proceso': 'bg-yellow-500 text-white',
      'completado': 'bg-green-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_proceso': 'En Proceso',
      'completado': 'Completado'
    }
    return labels[estado] || estado
  }

  const metrics = [
    {
      title: "Total Órdenes",
      value: pagination?.total?.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: ClipboardList,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: ordenes?.filter(o => o.estado === 'pendiente').length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Play,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Proceso",
      value: ordenes?.filter(o => o.estado === 'en_proceso').length.toString() || "0",
      change: "+28%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Completadas",
      value: ordenes?.filter(o => o.estado === 'completado').length.toString() || "0",
      change: "+5%",
      trend: "up" as const,
      icon: Pause,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Órdenes de Servicio</h1>
            <p className="text-muted-foreground">Gestión y seguimiento de órdenes de trabajo</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Orden
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
              data={ordenes || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search=""
              sort={{ sortBy: 'created_at', sortOrder: 'desc' }}
              onSearch={handleSearch}
              onSort={handleSort}
              onPageChange={handlePageChangeWrapper}
              onLimitChange={handleLimitChange}
              searchPlaceholder="Buscar órdenes..."
            />
          </CardContent>
        </Card>
      </div>

      <OrdenServicioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        orden={selectedOrden}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Orden de Servicio"
        message={`¿Estás seguro de que deseas eliminar la orden "${ordenToDelete?.nro_orden || `#${ordenToDelete?.orden_servicio_id}`}"?`}
        itemName={ordenToDelete?.nro_orden || `Orden #${ordenToDelete?.orden_servicio_id}`}
      />
    </AppLayout>
  )
}
