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
  } = useApi<OrdenServicio>('/api/servicios/ordenes-servicio')

  const columns = [
    {
      key: 'nro_orden',
      label: 'Número',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="font-medium text-foreground">
          {orden.nro_orden || `#${orden.orden_servicio_id}`}
        </div>
      )
    },
    {
      key: 'fecha_orden',
      label: 'Fecha',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(orden.fecha_orden).toLocaleDateString('es-CR')}</span>
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
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{orden.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'progreso',
      label: 'Progreso',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">{orden.progreso}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${getProgresoColor(orden.progreso)}`}
              style={{ width: `${orden.progreso}%` }}
            ></div>
          </div>
        </div>
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      sortable: true,
      render: (orden: OrdenServicio) => (
        <Badge className={getPrioridadColor(orden.prioridad)}>
          {getPrioridadLabel(orden.prioridad)}
        </Badge>
      )
    },
    {
      key: 'fecha_estimada',
      label: 'Fecha Estimada',
      sortable: true,
      render: (orden: OrdenServicio) => (
        orden.fecha_estimada ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={getVencimientoColor(orden.fecha_estimada)}>
              {new Date(orden.fecha_estimada).toLocaleDateString('es-CR')}
            </span>
          </div>
        ) : (
          <span className="text-muted-foreground">Sin fecha</span>
        )
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
          {orden.estado !== 'completada' && orden.estado !== 'cancelada' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(orden)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {orden.estado === 'iniciada' && (
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
      'iniciada': 'bg-blue-500 text-white',
      'en_proceso': 'bg-yellow-500 text-white',
      'pausada': 'bg-orange-500 text-white',
      'completada': 'bg-green-500 text-white',
      'cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'iniciada': 'Iniciada',
      'en_proceso': 'En Proceso',
      'pausada': 'Pausada',
      'completada': 'Completada',
      'cancelada': 'Cancelada'
    }
    return labels[estado] || estado
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      'urgente': 'bg-red-500 text-white',
      'alta': 'bg-orange-500 text-white',
      'media': 'bg-yellow-500 text-white',
      'baja': 'bg-green-500 text-white'
    }
    return colores[prioridad] || 'bg-muted text-muted-foreground'
  }

  const getPrioridadLabel = (prioridad: string) => {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
  }

  const getProgresoColor = (progreso: number) => {
    if (progreso >= 80) return 'bg-green-500'
    if (progreso >= 50) return 'bg-yellow-500'
    if (progreso >= 25) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const getVencimientoColor = (fechaEstimada: string) => {
    const hoy = new Date()
    const estimada = new Date(fechaEstimada)
    const diasRestantes = Math.ceil((estimada.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes < 0) return 'text-red-500'
    if (diasRestantes <= 3) return 'text-yellow-500'
    return 'text-muted-foreground'
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
      title: "Activas",
      value: ordenes?.filter(o => o.estado === 'iniciada' || o.estado === 'en_proceso').length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Play,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Completadas",
      value: ordenes?.filter(o => o.estado === 'completada').length.toString() || "0",
      change: "+28%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Pausadas",
      value: ordenes?.filter(o => o.estado === 'pausada').length.toString() || "0",
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
              search={search}
              sort={sort}
              onSearch={handleSearch}
              onSort={handleSort}
              onPageChange={handlePageChange}
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
