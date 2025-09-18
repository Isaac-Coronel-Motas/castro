"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { PedidoCompraModal } from "@/components/modals/pedido-compra-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { PedidoCompra, CreatePedidoCompraRequest, UpdatePedidoCompraRequest } from "@/lib/types/compras"
import { getEstadoColor, getEstadoLabel } from "@/lib/utils/compras"
import { Plus, Package, Calendar, User, Building, Warehouse, Eye, Edit, Trash2 } from "lucide-react"

export default function PedidosDeCompraPage() {
  const [selectedPedido, setSelectedPedido] = useState<PedidoCompra | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [pedidoToDelete, setPedidoToDelete] = useState<PedidoCompra | null>(null)

  // Hook para manejar la API
  const {
    data: pedidos,
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
  } = useApi<PedidoCompra>('/api/compras/pedidos')

  // Columnas para la tabla
  const columns = [
    {
      key: 'nro_comprobante',
      label: 'Número',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="font-medium text-foreground">
          {pedido.nro_comprobante}
        </div>
      )
    },
    {
      key: 'fecha_pedido',
      label: 'Fecha',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(pedido.fecha_pedido).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <Badge className={getEstadoColor(pedido.estado)}>
          {getEstadoLabel(pedido.estado)}
        </Badge>
      )
    },
    {
      key: 'usuario_nombre',
      label: 'Usuario',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{pedido.usuario_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{pedido.sucursal_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'almacen_nombre',
      label: 'Almacén',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-muted-foreground" />
          <span>{pedido.almacen_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'total_items',
      label: 'Items',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{pedido.total_items || 0}</span>
        </div>
      )
    },
    {
      key: 'monto_total',
      label: 'Monto Total',
      sortable: true,
      render: (pedido: PedidoCompra) => (
        <div className="font-medium">
          ₡{(pedido.monto_total || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (pedido: PedidoCompra) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(pedido)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(pedido)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(pedido)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  // Handlers
  const handleCreate = () => {
    setSelectedPedido(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (pedido: PedidoCompra) => {
    setSelectedPedido(pedido)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (pedido: PedidoCompra) => {
    setSelectedPedido(pedido)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (pedido: PedidoCompra) => {
    setPedidoToDelete(pedido)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreatePedidoCompraRequest | UpdatePedidoCompraRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreatePedidoCompraRequest)
      } else {
        await updateItem((data as UpdatePedidoCompraRequest).pedido_compra_id!, data as UpdatePedidoCompraRequest)
      }
      setIsModalOpen(false)
      setSelectedPedido(null)
    } catch (error) {
      console.error('Error guardando pedido:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (pedidoToDelete) {
      try {
        await deleteItem(pedidoToDelete.pedido_compra_id)
        setIsDeleteModalOpen(false)
        setPedidoToDelete(null)
      } catch (error) {
        console.error('Error eliminando pedido:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPedido(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setPedidoToDelete(null)
  }

  // Métricas calculadas
  const metrics = [
    {
      title: "Total Pedidos",
      value: pagination?.total?.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Package,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: pedidos?.filter(p => p.estado === 'pendiente').length.toString() || "0",
      change: "-5%",
      trend: "down" as const,
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Aprobados",
      value: pedidos?.filter(p => p.estado === 'aprobado').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Package,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Total",
      value: `₡${(pedidos?.reduce((total, p) => total + (p.monto_total || 0), 0) || 0).toLocaleString()}`,
      change: "+15%",
      trend: "up" as const,
      icon: Package,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Pedidos de Compra</h1>
            <p className="text-muted-foreground">Gestión de solicitudes a proveedores</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pedido
          </Button>
        </div>

        {/* Métricas */}
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

        {/* Tabla de datos */}
        <Card>
          <CardContent className="p-0">
            <DataTable
              data={pedidos || []}
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
              searchPlaceholder="Buscar pedidos, usuarios, sucursales..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <PedidoCompraModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        pedido={selectedPedido}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Pedido de Compra"
        message={`¿Estás seguro de que deseas eliminar el pedido "${pedidoToDelete?.nro_comprobante}"?`}
        itemName={pedidoToDelete?.nro_comprobante || ''}
      />
    </AppLayout>
  )
}