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
    create,
    update,
    delete: deleteItem,
    refetch,
    search,
    setSorting,
    setPagination
  } = useApi<Reclamo>('/api/servicios/reclamos')

  const columns = [
    {
      key: 'reclamo_id',
      label: 'Número',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div className="font-medium text-foreground">
          #{reclamo.reclamo_id}
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
      key: 'recibido_por_nombre',
      label: 'Recibido por',
      sortable: true,
      render: (reclamo: Reclamo) => (
        <div>
          <div className="text-sm font-medium text-foreground">{reclamo.recibido_por_nombre || 'N/A'}</div>
        </div>
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
          {reclamo.estado !== 'anulado' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(reclamo)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {reclamo.estado === 'pendiente' && (
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

  const handleSave = async (data: CreateReclamoRequest & { reclamo_id?: number }) => {
    try {
      if (modalMode === 'create') {
        await create(data as CreateReclamoRequest)
      } else {
        await update(data.reclamo_id!, data as CreateReclamoRequest)
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

  // Wrapper functions for DataTable
  const handleSearch = (searchTerm: string) => {
    search(searchTerm)
  }

  const handleSort = (field: string, order: 'asc' | 'desc') => {
    setSorting({ field, order })
  }

  const handlePageChange = (newPage: number) => {
    setPagination({ page: newPage, limit: pagination?.limit || 10 })
  }

  const handleLimitChange = (newLimit: number) => {
    setPagination({ page: 1, limit: newLimit })
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-yellow-500 text-white',
      'en_verificacion': 'bg-blue-500 text-white',
      'resuelto': 'bg-green-500 text-white',
      'rechazado': 'bg-red-500 text-white',
      'anulado': 'bg-gray-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'en_verificacion': 'En Verificación',
      'resuelto': 'Resuelto',
      'rechazado': 'Rechazado',
      'anulado': 'Anulado'
    }
    return labels[estado] || estado
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <AlertTriangle className="h-4 w-4" />
      case 'en_verificacion':
        return <Clock className="h-4 w-4" />
      case 'resuelto':
        return <CheckCircle className="h-4 w-4" />
      case 'rechazado':
        return <XCircle className="h-4 w-4" />
      case 'anulado':
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
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
      title: "Pendientes",
      value: reclamos?.filter(r => r.estado === 'pendiente').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: AlertTriangle,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Verificación",
      value: reclamos?.filter(r => r.estado === 'en_verificacion').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: Clock,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Resueltos",
      value: reclamos?.filter(r => r.estado === 'resuelto').length.toString() || "0",
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
              search=""
              sort={{ field: 'fecha_reclamo', order: 'desc' }}
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
        message={`¿Estás seguro de que deseas eliminar el reclamo #${reclamoToDelete?.reclamo_id}?`}
        itemName={`Reclamo #${reclamoToDelete?.reclamo_id}`}
      />
    </AppLayout>
  )
}
