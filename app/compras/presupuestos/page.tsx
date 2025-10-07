"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { PresupuestoProveedorModal } from "@/components/modals/presupuesto-proveedor-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { PresupuestoProveedor, CreatePresupuestoProveedorRequest, UpdatePresupuestoProveedorRequest } from "@/lib/types/compras"
import { getEstadoColor, getEstadoLabel } from "@/lib/utils/compras"
import { Plus, FileCheck, Calendar, User, Building, DollarSign, Eye, Edit, Trash2, Percent, Package } from "lucide-react"

export default function PresupuestosProveedorPage() {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<PresupuestoProveedor | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [presupuestoToDelete, setPresupuestoToDelete] = useState<PresupuestoProveedor | null>(null)

  // Hook para manejar la API
  const apiResult = useApi<PresupuestoProveedor>('/api/compras/presupuestos')
  
  const {
    data: presupuestos,
    loading,
    error,
    pagination,
    refetch,
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    search,
    setFilters,
    setSorting,
    setPagination
  } = apiResult

  // Columnas para la tabla
  const columns = [
    {
      key: 'nro_comprobante',
      label: 'Número',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="font-medium text-foreground">
          {presupuesto.nro_comprobante}
        </div>
      )
    },
    {
      key: 'fecha_presupuesto',
      label: 'Fecha',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(presupuesto.fecha_presupuesto).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <Badge className={getEstadoColor(presupuesto.estado)}>
          {getEstadoLabel(presupuesto.estado)}
        </Badge>
      )
    },
    {
      key: 'proveedor_nombre',
      label: 'Proveedor',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.proveedor_nombre || 'Sin proveedor'}</span>
        </div>
      )
    },
    {
      key: 'usuario_nombre',
      label: 'Usuario',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.usuario_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'total_detalles',
      label: 'Detalles',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.total_detalles || 0} productos</span>
        </div>
      )
    },
    {
      key: 'monto_presu_prov',
      label: 'Monto',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="font-medium">
          ₡{(presupuesto.monto_presu_prov || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'descuento',
      label: 'Descuento',
      sortable: true,
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <Percent className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.descuento || 0}%</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (presupuesto: PresupuestoProveedor) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(presupuesto)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(presupuesto)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(presupuesto)}
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
    setSelectedPresupuesto(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (presupuesto: PresupuestoProveedor) => {
    setSelectedPresupuesto(presupuesto)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (presupuesto: PresupuestoProveedor) => {
    setSelectedPresupuesto(presupuesto)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (presupuesto: PresupuestoProveedor) => {
    setPresupuestoToDelete(presupuesto)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreatePresupuestoProveedorRequest | UpdatePresupuestoProveedorRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreatePresupuestoProveedorRequest)
      } else {
        await updateItem((data as UpdatePresupuestoProveedorRequest).presu_prov_id!, data as UpdatePresupuestoProveedorRequest)
      }
      setIsModalOpen(false)
      setSelectedPresupuesto(null)
    } catch (error) {
      console.error('Error guardando presupuesto:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (presupuestoToDelete) {
      try {
        await deleteItem(presupuestoToDelete.presu_prov_id)
        setIsDeleteModalOpen(false)
        setPresupuestoToDelete(null)
      } catch (error) {
        console.error('Error eliminando presupuesto:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPresupuesto(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setPresupuestoToDelete(null)
  }

  // Métricas calculadas
  const metrics = [
    {
      title: "Total Presupuestos",
      value: pagination?.total?.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: FileCheck,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: presupuestos?.filter(p => p.estado === 'nuevo' || p.estado === 'enviado').length.toString() || "0",
      change: "-3%",
      trend: "down" as const,
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Aprobados",
      value: presupuestos?.filter(p => p.estado === 'aprobado').length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: FileCheck,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Valor Estimado",
      value: `₡${(presupuestos?.reduce((total, p) => total + parseFloat(p.monto_presu_prov?.toString() || '0'), 0) || 0).toLocaleString()}`,
      change: "+18%",
      trend: "up" as const,
      icon: DollarSign,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Presupuestos Proveedor</h1>
            <p className="text-muted-foreground">Gestión de cotizaciones y negociaciones con proveedores</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Solicitar Presupuesto
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
              data={presupuestos || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search={search}
              sort={search}
              onSearch={search}
              onSort={setSorting}
              onPageChange={setPagination}
              onLimitChange={setPagination}
              searchPlaceholder="Buscar presupuestos, proveedores..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Modales */}
      <PresupuestoProveedorModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        presupuesto={selectedPresupuesto}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Presupuesto Proveedor"
        message={`¿Estás seguro de que deseas eliminar el presupuesto "${presupuestoToDelete?.nro_comprobante}"?`}
        itemName={presupuestoToDelete?.nro_comprobante || ''}
      />
    </AppLayout>
  )
}