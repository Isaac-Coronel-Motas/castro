"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { PedidoClienteModal } from "@/components/modals/pedido-cliente-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { PedidoCliente, PedidoFormData } from "@/lib/types/pedidos-clientes"
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Calendar,
  User,
  Package,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  ShoppingCart
} from "lucide-react"

export default function PedidosClientesPage() {
  const {
    data: pedidos,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deletePedido,
  } = useApi<PedidoCliente>('/api/ventas/pedidos-clientes');

  const [searchTerm, setSearchTerm] = useState("")
  const [pedidoModalOpen, setPedidoModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState<PedidoCliente | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    search(term)
  }

  const handleCreate = () => {
    setSelectedPedido(null)
    setModalMode('create')
    setPedidoModalOpen(true)
  }

  const handleView = (pedido: PedidoCliente) => {
    setSelectedPedido(pedido)
    setModalMode('view')
    setPedidoModalOpen(true)
  }

  const handleEdit = (pedido: PedidoCliente) => {
    setSelectedPedido(pedido)
    setModalMode('edit')
    setPedidoModalOpen(true)
  }

  const handleDelete = (pedido: PedidoCliente) => {
    setSelectedPedido(pedido)
    setDeleteModalOpen(true)
  }

  const handleSavePedido = async (pedidoData: PedidoFormData): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(pedidoData)
      } else if (modalMode === 'edit' && selectedPedido) {
        return await update(selectedPedido.venta_id, pedidoData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar pedido:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedPedido) {
      await deletePedido(selectedPedido.venta_id)
      setDeleteModalOpen(false)
      setSelectedPedido(null)
    }
  }

  const handleSort = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSorting(sortBy, sortOrder)
  }

  const handlePageChange = (page: number) => {
    setPagination(page, pagination?.limit || 10)
  }

  const handleLimitChange = (limit: number) => {
    setPagination(1, limit)
  }

  const getEstadoBadge = (estado: string) => {
    const variants = {
      'Abierto': 'default',
      'Cerrado': 'secondary',
      'Cancelado': 'destructive'
    } as const

    const icons = {
      'Abierto': Clock,
      'Cerrado': CheckCircle,
      'Cancelado': XCircle
    } as const

    const Icon = icons[estado as keyof typeof icons] || AlertCircle

    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        <Icon className="h-3 w-3 mr-1" />
        {estado}
      </Badge>
    )
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create': return 'Nuevo Pedido de Cliente'
      case 'edit': return 'Editar Pedido de Cliente'
      case 'view': return 'Ver Pedido de Cliente'
      default: return 'Pedido de Cliente'
    }
  }

  // Calcular estadísticas
  const stats = {
    total: pedidos?.length || 0,
    abiertos: pedidos?.filter(p => p.estado === 'abierto').length || 0,
    cerrados: pedidos?.filter(p => p.estado === 'cerrado').length || 0,
    cancelados: pedidos?.filter(p => p.estado === 'cancelado').length || 0,
    montoTotal: Number(pedidos?.reduce((sum, p) => sum + (Number(p.monto_venta) || 0), 0) || 0),
    montoPendiente: Number(pedidos?.filter(p => p.estado === 'abierto').reduce((sum, p) => sum + (Number(p.monto_venta) || 0), 0) || 0)
  }

  const columns = [
    {
      key: 'venta_id',
      header: 'ID',
      render: (pedido: PedidoCliente) => (
        <span className="font-mono text-sm">#{pedido.venta_id}</span>
      ),
    },
    {
      key: 'cliente_nombre',
      header: 'Cliente',
      render: (pedido: PedidoCliente) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-gray-400" />
          <div>
            <p className="font-medium">{pedido.cliente_nombre}</p>
            <p className="text-sm text-gray-500">{pedido.cliente_ruc || 'Sin RUC'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'fecha_venta',
      header: 'Fecha',
      render: (pedido: PedidoCliente) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{new Date(pedido.fecha_venta).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: 'tipo_documento',
      header: 'Tipo',
      render: (pedido: PedidoCliente) => (
        <Badge variant="outline">{pedido.tipo_documento}</Badge>
      ),
    },
    {
      key: 'estado',
      header: 'Estado',
      render: (pedido: PedidoCliente) => getEstadoBadge(pedido.estado_display),
    },
    {
      key: 'total_productos',
      header: 'Productos',
      render: (pedido: PedidoCliente) => (
        <div className="flex items-center gap-1">
          <Package className="h-4 w-4 text-gray-400" />
          <span className="text-sm">{pedido.total_productos}</span>
        </div>
      ),
    },
    {
      key: 'monto_venta',
      header: 'Monto',
      render: (pedido: PedidoCliente) => (
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium">${(Number(pedido.monto_venta) || 0).toFixed(2)}</span>
        </div>
      ),
    },
  ]

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pedidos de Clientes</h1>
            <p className="text-gray-600 mt-2">Gestión de pedidos y ventas de clientes</p>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Pedido
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pedidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Abiertos</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.abiertos}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cerrados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.cerrados}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Cancelados</p>
                  <p className="text-2xl font-bold text-red-600">{stats.cancelados}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monto Total</p>
                  <p className="text-2xl font-bold text-gray-900">${(stats.montoTotal || 0).toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendiente</p>
                  <p className="text-2xl font-bold text-orange-600">${(stats.montoPendiente || 0).toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs text-gray-500 space-y-1">
                <p>Loading: {loading ? 'true' : 'false'}</p>
                <p>Error: {error || 'none'}</p>
                <p>Pedidos count: {pedidos?.length || 0}</p>
                <p>API Endpoint: /api/ventas/pedidos-clientes</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Pedidos */}
        <DataTable
          title="Lista de Pedidos"
          data={pedidos}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onSort={handleSort}
          onPageChange={handlePageChange}
          onLimitChange={handleLimitChange}
          onCreate={handleCreate}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          createButtonText="Nuevo Pedido"
          searchPlaceholder="Buscar por cliente, documento..."
          emptyMessage="No hay pedidos registrados"
          actions={[
            {
              key: 'cerrar',
              label: 'Cerrar',
              icon: CheckCircle,
              onClick: (pedido: PedidoCliente) => {
                // TODO: Implementar cerrar pedido
                console.log('Cerrar pedido:', pedido.venta_id)
              },
              condition: (pedido: PedidoCliente) => pedido.estado === 'abierto',
              variant: 'secondary'
            }
          ]}
        />

        {/* Modales */}
        <PedidoClienteModal
          isOpen={pedidoModalOpen}
          onClose={() => setPedidoModalOpen(false)}
          onSave={handleSavePedido}
          pedido={selectedPedido}
          mode={modalMode}
        />

        <ConfirmDeleteModal
          isOpen={deleteModalOpen}
          onClose={() => setDeleteModalOpen(false)}
          onConfirm={handleConfirmDelete}
          title="Eliminar Pedido"
          message={`¿Estás seguro de que deseas eliminar el pedido #${selectedPedido?.venta_id}?`}
        />
      </div>
    </AppLayout>
  )
}
