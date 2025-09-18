"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { PresupuestoServicioModal } from "@/components/modals/presupuesto-servicio-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { PresupuestoServicio, CreatePresupuestoServicioRequest, UpdatePresupuestoServicioRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, FileText, Calendar, User, Building, Eye, Edit, Trash2, DollarSign, Clock } from "lucide-react"

export default function PresupuestosPage() {
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<PresupuestoServicio | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [presupuestoToDelete, setPresupuestoToDelete] = useState<PresupuestoServicio | null>(null)

  const {
    data: presupuestos,
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
  } = useApi<PresupuestoServicio>('/api/servicios/presupuestos')

  const columns = [
    {
      key: 'nro_presupuesto',
      label: 'Número',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        <div className="font-medium text-foreground">
          {presupuesto.nro_presupuesto || `#${presupuesto.presu_serv_id}`}
        </div>
      )
    },
    {
      key: 'fecha_presupuesto',
      label: 'Fecha',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
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
      render: (presupuesto: PresupuestoServicio) => (
        <Badge className={getEstadoColor(presupuesto.estado)}>
          {getEstadoLabel(presupuesto.estado)}
        </Badge>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.cliente_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{presupuesto.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'monto_presu_ser',
      label: 'Monto',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>₡{presupuesto.monto_presu_ser.toLocaleString()}</span>
        </div>
      )
    },
    {
      key: 'tipo_presu',
      label: 'Tipo',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        <Badge variant="outline">
          {presupuesto.tipo_presu === 'con_diagnostico' ? 'Con Diagnóstico' : 'Sin Diagnóstico'}
        </Badge>
      )
    },
    {
      key: 'valido_hasta',
      label: 'Válido Hasta',
      sortable: true,
      render: (presupuesto: PresupuestoServicio) => (
        presupuesto.valido_hasta ? (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className={getVencimientoColor(presupuesto.valido_hasta)}>
              {new Date(presupuesto.valido_hasta).toLocaleDateString('es-CR')}
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
      render: (presupuesto: PresupuestoServicio) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(presupuesto)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {presupuesto.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(presupuesto)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {presupuesto.estado === 'pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(presupuesto)}
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
    setSelectedPresupuesto(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (presupuesto: PresupuestoServicio) => {
    setSelectedPresupuesto(presupuesto)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (presupuesto: PresupuestoServicio) => {
    setSelectedPresupuesto(presupuesto)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (presupuesto: PresupuestoServicio) => {
    setPresupuestoToDelete(presupuesto)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreatePresupuestoServicioRequest | UpdatePresupuestoServicioRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreatePresupuestoServicioRequest)
      } else {
        await updateItem((data as UpdatePresupuestoServicioRequest).presu_serv_id!, data as UpdatePresupuestoServicioRequest)
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
        await deleteItem(presupuestoToDelete.presu_serv_id)
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

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente': 'bg-secondary text-secondary-foreground',
      'aprobado': 'bg-green-500 text-white',
      'rechazado': 'bg-destructive text-destructive-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado.charAt(0).toUpperCase() + estado.slice(1)
  }

  const getVencimientoColor = (fechaVencimiento: string) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diasRestantes = Math.ceil((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diasRestantes < 0) return 'text-red-500'
    if (diasRestantes <= 7) return 'text-yellow-500'
    return 'text-muted-foreground'
  }

  const metrics = [
    {
      title: "Total Presupuestos",
      value: pagination?.total?.toString() || "0",
      change: "+25%",
      trend: "up" as const,
      icon: FileText,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: presupuestos?.filter(p => p.estado === 'pendiente').length.toString() || "0",
      change: "+18%",
      trend: "up" as const,
      icon: Clock,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Aprobados",
      value: presupuestos?.filter(p => p.estado === 'aprobado').length.toString() || "0",
      change: "+32%",
      trend: "up" as const,
      icon: Calendar,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Monto Total",
      value: presupuestos?.reduce((total, p) => total + p.monto_presu_ser, 0).toLocaleString() || "0",
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
            <h1 className="text-3xl font-bold text-foreground">Presupuestos de Servicio</h1>
            <p className="text-muted-foreground">Gestión de presupuestos para servicios técnicos</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Presupuesto
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
              data={presupuestos || []}
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
              searchPlaceholder="Buscar presupuestos..."
            />
          </CardContent>
        </Card>
      </div>

      <PresupuestoServicioModal
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
        title="Eliminar Presupuesto"
        message={`¿Estás seguro de que deseas eliminar el presupuesto "${presupuestoToDelete?.nro_presupuesto || `#${presupuestoToDelete?.presu_serv_id}`}"?`}
        itemName={presupuestoToDelete?.nro_presupuesto || `Presupuesto #${presupuestoToDelete?.presu_serv_id}`}
      />
    </AppLayout>
  )
}
