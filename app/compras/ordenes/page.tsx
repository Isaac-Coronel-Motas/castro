"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { OrdenCompraModal } from "@/components/modals/orden-compra-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { OrdenCompra, CreateOrdenCompraRequest, UpdateOrdenCompraRequest } from "@/lib/types/compras"
import { getEstadoColor, getEstadoLabel, getPrioridadColor, getPrioridadLabel } from "@/lib/utils/compras"
import { Plus, ShoppingBag, Calendar, User, Building, DollarSign, Eye, Edit, Trash2, Truck, Package } from "lucide-react"

export default function OrdenesDeCompraPage() {
  const [selectedOrden, setSelectedOrden] = useState<OrdenCompra | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [ordenToDelete, setOrdenToDelete] = useState<OrdenCompra | null>(null)

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
  } = useApi<OrdenCompra>('/api/compras/ordenes')

  const columns = [
    {
      key: 'nro_comprobante',
      label: 'Número',
      sortable: true,
      render: (orden: OrdenCompra) => (
        <div className="font-medium text-foreground">
          {orden.nro_comprobante}
        </div>
      )
    },
    {
      key: 'fecha_orden',
      label: 'Fecha Orden',
      sortable: true,
      render: (orden: OrdenCompra) => (
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
      render: (orden: OrdenCompra) => (
        <Badge className={getEstadoColor(orden.estado)}>
          {getEstadoLabel(orden.estado)}
        </Badge>
      )
    },
    {
      key: 'proveedor_nombre',
      label: 'Proveedor',
      sortable: true,
      render: (orden: OrdenCompra) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{orden.proveedor_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'monto_oc',
      label: 'Monto',
      sortable: true,
      render: (orden: OrdenCompra) => (
        <div className="font-medium">
          ₡{(orden.monto_oc || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (orden: OrdenCompra) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(orden)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(orden)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(orden)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handleCreate = () => {
    setSelectedOrden(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (orden: OrdenCompra) => {
    setSelectedOrden(orden)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (orden: OrdenCompra) => {
    setSelectedOrden(orden)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (orden: OrdenCompra) => {
    setOrdenToDelete(orden)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateOrdenCompraRequest | UpdateOrdenCompraRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateOrdenCompraRequest)
      } else {
        await updateItem((data as UpdateOrdenCompraRequest).orden_compra_id!, data as UpdateOrdenCompraRequest)
      }
      setIsModalOpen(false)
      setSelectedOrden(null)
    } catch (error) {
      console.error('Error guardando orden:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (ordenToDelete) {
      try {
        await deleteItem(ordenToDelete.orden_compra_id)
        setIsDeleteModalOpen(false)
        setOrdenToDelete(null)
      } catch (error) {
        console.error('Error eliminando orden:', error)
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

  const metrics = [
    {
      title: "Total Órdenes",
      value: pagination?.total?.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: ShoppingBag,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "En Proceso",
      value: ordenes?.filter(o => o.estado === 'pendiente' || o.estado === 'confirmada' || o.estado === 'enviada').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Completadas",
      value: ordenes?.filter(o => o.estado === 'entregada').length.toString() || "0",
      change: "+22%",
      trend: "up" as const,
      icon: Package,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Total",
      value: `₡${(ordenes?.reduce((total, o) => total + (o.monto_oc || 0), 0) || 0).toLocaleString()}`,
      change: "+28%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Órdenes de Compra</h1>
            <p className="text-muted-foreground">Gestión y seguimiento de órdenes confirmadas con proveedores</p>
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
              searchPlaceholder="Buscar órdenes, proveedores..."
            />
          </CardContent>
        </Card>
      </div>

      <OrdenCompraModal
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
        title="Eliminar Orden de Compra"
        message={`¿Estás seguro de que deseas eliminar la orden "${ordenToDelete?.nro_comprobante}"?`}
        itemName={ordenToDelete?.nro_comprobante || ''}
      />
    </AppLayout>
  )
}