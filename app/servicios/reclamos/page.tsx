"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ReclamoModal } from "@/components/modals/reclamo-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Reclamo, CreateReclamoRequest, UpdateReclamoRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, MessageSquare, Calendar, User, Building, Eye, Edit, Trash2, Clock, AlertTriangle, CheckCircle, XCircle, Star } from "lucide-react"

export default function ReclamosPage() {
  const [selectedReclamo, setSelectedReclamo] = useState<Reclamo | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [reclamoToDelete, setReclamoToDelete] = useState<Reclamo | null>(null)

  const {
    data: reclamos,
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
  } = useApi<Reclamo>('/api/servicios/reclamos')

  const columns = [
    {
      key: 'nro_reclamo',
      label: 'Número',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div className="font-medium text-foreground">
          {reclamo.nro_reclamo || `#${reclamo.reclamo_id}`}
        </div>
      )
    },
    {
      key: 'fecha_reclamo',
      label: 'Fecha',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(reclamo.fecha_reclamo).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{reclamo.cliente_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'tipo_reclamo',
      label: 'Tipo',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <Badge className={getTipoColor(reclamo.tipo_reclamo)}>
          {getTipoLabel(reclamo.tipo_reclamo)}
        </Badge>
      )
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      sortable: false,
      render: (reclamo: Reclamo) => (
        <div className="max-w-xs">
          <p className="text-sm text-foreground truncate">{reclamo.descripcion}</p>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <Badge className={`${getEstadoColor(reclamo.estado)} flex items-center gap-1 w-fit`}>
          {getEstadoIcon(reclamo.estado)}
          {getEstadoLabel(reclamo.estado)}
        </Badge>
      )
    },
    {
      key: 'prioridad',
      label: 'Prioridad',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <Badge className={getPrioridadColor(reclamo.prioridad)}>
          {getPrioridadLabel(reclamo.prioridad)}
        </Badge>
      )
    },
    {
      key: 'tecnico_nombre',
      label: 'Técnico',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div>
          <div className="text-sm font-medium text-foreground">{reclamo.tecnico_nombre || 'Sin asignar'}</div>
          {reclamo.tiempo_respuesta && (
            <div className="text-xs text-muted-foreground">Resp: {reclamo.tiempo_respuesta}</div>
          )}
        </div>
      )
    },
    {
      key: 'satisfaccion_cliente',
      label: 'Satisfacción',
      sortable: true,
      render: (reclamo: Reclamo) => (
        reclamo.satisfaccion_cliente && reclamo.satisfaccion_cliente > 0 ? (
          renderStars(reclamo.satisfaccion_cliente)
        ) : (
          <span className="text-muted-foreground">Sin calificar</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (reclamo: Reclamo) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(reclamo)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {reclamo.estado !== 'cerrado' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(reclamo)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {reclamo.estado === 'abierto' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(reclamo)}
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
    setSelectedReclamo(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (reclamo: Reclamo) => {
    setSelectedReclamo(reclamo)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (reclamo: Reclamo) => {
    setSelectedReclamo(reclamo)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (reclamo: Reclamo) => {
    setReclamoToDelete(reclamo)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateReclamoRequest | UpdateReclamoRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateReclamoRequest)
      } else {
        await updateItem((data as UpdateReclamoRequest).reclamo_id!, data as UpdateReclamoRequest)
      }
      setIsModalOpen(false)
      setSelectedReclamo(null)
    } catch (error) {
      console.error('Error guardando reclamo:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (reclamoToDelete) {
      try {
        await deleteItem(reclamoToDelete.reclamo_id)
        setIsDeleteModalOpen(false)
        setReclamoToDelete(null)
      } catch (error) {
        console.error('Error eliminando reclamo:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedReclamo(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setReclamoToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'abierto': 'bg-red-500 text-white',
      'en_proceso': 'bg-blue-500 text-white',
      'resuelto': 'bg-green-500 text-white',
      'cerrado': 'bg-gray-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'abierto': 'Abierto',
      'en_proceso': 'En Proceso',
      'resuelto': 'Resuelto',
      'cerrado': 'Cerrado'
    }
    return labels[estado] || estado
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'abierto':
        return <AlertTriangle className="h-4 w-4" />
      case 'en_proceso':
        return <Clock className="h-4 w-4" />
      case 'resuelto':
        return <CheckCircle className="h-4 w-4" />
      case 'cerrado':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const getPrioridadColor = (prioridad: string) => {
    const colores: { [key: string]: string } = {
      'alta': 'bg-red-500 text-white',
      'media': 'bg-yellow-500 text-white',
      'baja': 'bg-green-500 text-white'
    }
    return colores[prioridad] || 'bg-muted text-muted-foreground'
  }

  const getPrioridadLabel = (prioridad: string) => {
    return prioridad.charAt(0).toUpperCase() + prioridad.slice(1)
  }

  const getTipoColor = (tipo: string) => {
    const colores: { [key: string]: string } = {
      'garantia': 'bg-purple-500 text-white',
      'calidad_servicio': 'bg-blue-500 text-white',
      'tiempo_entrega': 'bg-orange-500 text-white',
      'atencion_cliente': 'bg-pink-500 text-white'
    }
    return colores[tipo] || 'bg-muted text-muted-foreground'
  }

  const getTipoLabel = (tipo: string) => {
    const labels: { [key: string]: string } = {
      'garantia': 'Garantía',
      'calidad_servicio': 'Calidad Servicio',
      'tiempo_entrega': 'Tiempo Entrega',
      'atencion_cliente': 'Atención Cliente'
    }
    return labels[tipo] || tipo
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">({rating})</span>
      </div>
    )
  }

  const metrics = [
    {
      title: "Total Reclamos",
      value: pagination?.total?.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: MessageSquare,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Reclamos Abiertos",
      value: reclamos?.filter(r => r.estado === 'abierto').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: AlertTriangle,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Proceso",
      value: reclamos?.filter(r => r.estado === 'en_proceso').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: Clock,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Resueltos",
      value: reclamos?.filter(r => r.estado === 'resuelto' || r.estado === 'cerrado').length.toString() || "0",
      change: "+22%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Reclamos</h1>
            <p className="text-muted-foreground">Gestión de quejas y reclamos de clientes</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Reclamo
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
              data={reclamos || []}
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
              searchPlaceholder="Buscar reclamos..."
            />
          </CardContent>
        </Card>
      </div>

      <ReclamoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        reclamo={selectedReclamo}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Reclamo"
        message={`¿Estás seguro de que deseas eliminar el reclamo "${reclamoToDelete?.nro_reclamo || `#${reclamoToDelete?.reclamo_id}`}"?`}
        itemName={reclamoToDelete?.nro_reclamo || `Reclamo #${reclamoToDelete?.reclamo_id}`}
      />
    </AppLayout>
  )
}
