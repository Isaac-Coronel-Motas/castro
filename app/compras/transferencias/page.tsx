"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { TransferenciaStockModal } from "@/components/modals/transferencia-stock-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { TransferenciaStock, CreateTransferenciaStockRequest, UpdateTransferenciaStockRequest } from "@/lib/types/compras"
import { Plus, Package, Calendar, User, Warehouse, ArrowRightLeft, Eye, Edit, Trash2, Truck, CheckCircle } from "lucide-react"

export default function TransferenciasStockPage() {
  const [selectedTransferencia, setSelectedTransferencia] = useState<TransferenciaStock | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [transferenciaToDelete, setTransferenciaToDelete] = useState<TransferenciaStock | null>(null)

  const {
    data: transferencias,
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
  } = useApi<TransferenciaStock>('/api/compras/transferencias')

  const columns = [
    {
      key: 'transferencia_id',
      label: 'ID',
      sortable: true,
      render: (transferencia: TransferenciaStock) => (
        <div className="font-medium text-foreground">
          #{transferencia.transferencia_id}
        </div>
      )
    },
    {
      key: 'fecha',
      label: 'Fecha',
      sortable: true,
      render: (transferencia: TransferenciaStock) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(transferencia.fecha).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (transferencia: TransferenciaStock) => (
        <Badge className={getEstadoColor(transferencia.estado)}>
          {getEstadoLabel(transferencia.estado)}
        </Badge>
      )
    },
    {
      key: 'almacenes',
      label: 'Almacenes',
      sortable: false,
      render: (transferencia: TransferenciaStock) => (
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">
            <div className="font-medium">{transferencia.almacen_origen_nombre}</div>
            <div className="text-muted-foreground">→ {transferencia.almacen_destino_nombre}</div>
          </div>
        </div>
      )
    },
    {
      key: 'usuario_nombre',
      label: 'Usuario',
      sortable: true,
      render: (transferencia: TransferenciaStock) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{transferencia.usuario_nombre}</span>
        </div>
      )
    },
    {
      key: 'total_items',
      label: 'Items',
      sortable: true,
      render: (transferencia: TransferenciaStock) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{transferencia.total_items || 0}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (transferencia: TransferenciaStock) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(transferencia)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {transferencia.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(transferencia)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {transferencia.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleComplete(transferencia)}
              className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {transferencia.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(transferencia)}
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
    setSelectedTransferencia(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (transferencia: TransferenciaStock) => {
    setSelectedTransferencia(transferencia)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (transferencia: TransferenciaStock) => {
    setSelectedTransferencia(transferencia)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (transferencia: TransferenciaStock) => {
    setTransferenciaToDelete(transferencia)
    setIsDeleteModalOpen(true)
  }

  const handleComplete = async (transferencia: TransferenciaStock) => {
    try {
      await fetch(`/api/compras/transferencias/${transferencia.transferencia_id}/completar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      refresh()
    } catch (error) {
      console.error('Error completando transferencia:', error)
    }
  }

  const handleSave = async (data: CreateTransferenciaStockRequest | UpdateTransferenciaStockRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateTransferenciaStockRequest)
      } else {
        await updateItem((data as UpdateTransferenciaStockRequest).transferencia_id!, data as UpdateTransferenciaStockRequest)
      }
      setIsModalOpen(false)
      setSelectedTransferencia(null)
    } catch (error) {
      console.error('Error guardando transferencia:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (transferenciaToDelete) {
      try {
        await deleteItem(transferenciaToDelete.transferencia_id)
        setIsDeleteModalOpen(false)
        setTransferenciaToDelete(null)
      } catch (error) {
        console.error('Error eliminando transferencia:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTransferencia(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setTransferenciaToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-secondary text-secondary-foreground',
      'enviada': 'bg-chart-1 text-white',
      'recibida': 'bg-green-500 text-white',
      'cancelada': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const etiquetas: { [key: string]: string } = {
      'pendiente': 'Pendiente',
      'enviada': 'Enviada',
      'recibida': 'Recibida',
      'cancelada': 'Cancelada'
    }
    return etiquetas[estado] || estado
  }

  const metrics = [
    {
      title: "Total Transferencias",
      value: pagination?.total?.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: ArrowRightLeft,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: transferencias?.filter(t => t.estado === 'pendiente').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Package,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Enviadas",
      value: transferencias?.filter(t => t.estado === 'enviada').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: Truck,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Completadas",
      value: transferencias?.filter(t => t.estado === 'recibida').length.toString() || "0",
      change: "+20%",
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
            <h1 className="text-3xl font-bold text-foreground">Transferencias de Stock</h1>
            <p className="text-muted-foreground">Gestión de transferencias entre almacenes</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Transferencia
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
              data={transferencias || []}
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
              searchPlaceholder="Buscar transferencias..."
            />
          </CardContent>
        </Card>
      </div>

      <TransferenciaStockModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        transferencia={selectedTransferencia}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Transferencia"
        message={`¿Estás seguro de que deseas eliminar la transferencia #${transferenciaToDelete?.transferencia_id}?`}
        itemName={`Transferencia #${transferenciaToDelete?.transferencia_id}`}
      />
    </AppLayout>
  )
}