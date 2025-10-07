"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { CompraCabeceraModal } from "@/components/modals/compra-cabecera-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { CompraCabecera, CreateCompraCabeceraRequest, UpdateCompraCabeceraRequest } from "@/lib/types/compras"
import { getEstadoColor, getEstadoLabel } from "@/lib/utils/compras"
import { Plus, Receipt, Calendar, User, Building, DollarSign, Eye, Edit, Trash2, FileText, CreditCard } from "lucide-react"

export default function RegistroDeComprasPage() {
  const [selectedCompra, setSelectedCompra] = useState<CompraCabecera | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [compraToDelete, setCompraToDelete] = useState<CompraCabecera | null>(null)

  const {
    data: compras,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    refetch: refresh
  } = useApi<CompraCabecera>('/api/compras/registro')

  const columns = [
    {
      key: 'nro_factura',
      label: 'Número Factura',
      sortable: true,
      render: (compra: CompraCabecera) => (
        <div className="font-medium text-foreground">
          {compra.nro_factura || 'N/A'}
        </div>
      )
    },
    {
      key: 'fecha_compra',
      label: 'Fecha Compra',
      sortable: true,
      render: (compra: CompraCabecera) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(compra.fecha_compra).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (compra: CompraCabecera) => (
        <Badge className={getEstadoColor(compra.estado)}>
          {getEstadoLabel(compra.estado)}
        </Badge>
      )
    },
    {
      key: 'proveedor_nombre',
      label: 'Proveedor',
      sortable: true,
      render: (compra: CompraCabecera) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{compra.proveedor_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'monto_compra',
      label: 'Monto',
      sortable: true,
      render: (compra: CompraCabecera) => (
        <div className="font-medium">
          ₡{(compra.monto_compra || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (compra: CompraCabecera) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(compra)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(compra)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(compra)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handleCreate = () => {
    setSelectedCompra(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (compra: CompraCabecera) => {
    setSelectedCompra(compra)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (compra: CompraCabecera) => {
    setSelectedCompra(compra)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (compra: CompraCabecera) => {
    setCompraToDelete(compra)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateCompraCabeceraRequest | UpdateCompraCabeceraRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateCompraCabeceraRequest)
      } else {
        await updateItem((data as UpdateCompraCabeceraRequest).compra_id!, data as UpdateCompraCabeceraRequest)
      }
      setIsModalOpen(false)
      setSelectedCompra(null)
    } catch (error) {
      console.error('Error guardando compra:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (compraToDelete) {
      try {
        await deleteItem(compraToDelete.compra_id)
        setIsDeleteModalOpen(false)
        setCompraToDelete(null)
      } catch (error) {
        console.error('Error eliminando compra:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCompra(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setCompraToDelete(null)
  }

  const metrics = [
    {
      title: "Total Compras",
      value: pagination?.total?.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Receipt,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: compras?.filter(c => c.estado === 'pendiente').length.toString() || "0",
      change: "-5%",
      trend: "down" as const,
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Progreso",
      value: compras?.filter(c => c.estado === 'en_progreso').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Receipt,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Completadas",
      value: compras?.filter(c => c.estado === 'completada').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: Receipt,
      color: "bg-green-500 text-white",
    },
    {
      title: "Valor Total",
      value: `₡${(compras?.reduce((total, c) => total + (c.monto_compra || 0), 0) || 0).toLocaleString()}`,
      change: "+15%",
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
            <h1 className="text-3xl font-bold text-foreground">Registro de Compras</h1>
            <p className="text-muted-foreground">Gestión de compras realizadas a proveedores</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Compra
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
              data={compras || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search={search}
              onSearch={search}
              onSort={(sortBy, sortOrder) => setSorting(sortBy, sortOrder)}
              onPageChange={(page) => setPagination(page, pagination?.limit || 10)}
              onLimitChange={(limit) => setPagination(pagination?.page || 1, limit)}
              searchPlaceholder="Buscar compras, proveedores, facturas..."
            />
          </CardContent>
        </Card>
      </div>

      <CompraCabeceraModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        compra={selectedCompra}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Registro de Compra"
        message={`¿Estás seguro de que deseas eliminar la compra "${compraToDelete?.nro_factura || compraToDelete?.compra_id}"?`}
        itemName={compraToDelete?.nro_factura || compraToDelete?.compra_id?.toString() || ''}
      />
    </AppLayout>
  )
}