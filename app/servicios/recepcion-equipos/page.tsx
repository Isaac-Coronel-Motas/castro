"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { RecepcionEquipoModal } from "@/components/modals/recepcion-equipo-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { RecepcionEquipo, CreateRecepcionEquipoRequest, UpdateRecepcionEquipoRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, Package, Calendar, User, Building, Eye, Edit, Trash2, CheckCircle, Wrench } from "lucide-react"

export default function RecepcionEquiposPage() {
  const [selectedRecepcion, setSelectedRecepcion] = useState<RecepcionEquipo | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [recepcionToDelete, setRecepcionToDelete] = useState<RecepcionEquipo | null>(null)

  const {
    data: recepciones,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteItem,
    refetch: refresh
  } = useApi<RecepcionEquipo>('/api/servicios/recepcion-equipos')

  const columns = [
    {
      key: 'nro_recepcion',
      label: 'Número',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <div className="font-medium text-foreground">
          {recepcion.nro_recepcion || `#${recepcion.recepcion_id}`}
        </div>
      )
    },
    {
      key: 'fecha_recepcion',
      label: 'Fecha',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(recepcion.fecha_recepcion).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado_recepcion',
      label: 'Estado',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <Badge className={getEstadoColor(recepcion.estado_recepcion)}>
          {getEstadoLabel(recepcion.estado_recepcion)}
        </Badge>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{recepcion.cliente_nombre || 'N/A'}</span>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{recepcion.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'total_equipos',
      label: 'Equipos',
      sortable: true,
      render: (recepcion: RecepcionEquipo) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span>{recepcion.total_equipos || 0}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (recepcion: RecepcionEquipo) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(recepcion)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {recepcion.estado_recepcion === 'En revisión' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(recepcion)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {recepcion.estado_recepcion === 'En revisión' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleProcess(recepcion)}
              className="h-8 w-8 p-0 text-green-500 hover:text-green-700"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          {recepcion.estado_recepcion === 'En revisión' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(recepcion)}
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
    setSelectedRecepcion(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (recepcion: RecepcionEquipo) => {
    setSelectedRecepcion(recepcion)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (recepcion: RecepcionEquipo) => {
    setSelectedRecepcion(recepcion)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (recepcion: RecepcionEquipo) => {
    setRecepcionToDelete(recepcion)
    setIsDeleteModalOpen(true)
  }

  const handleProcess = async (recepcion: RecepcionEquipo) => {
    try {
      await fetch(`/api/servicios/recepcion-equipos/${recepcion.recepcion_id}/procesar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      refresh()
    } catch (error) {
      console.error('Error procesando recepción:', error)
    }
  }

  const handleSave = async (data: CreateRecepcionEquipoRequest | UpdateRecepcionEquipoRequest) => {
    console.log('handleSave llamado con:', data)
    console.log('modalMode:', modalMode)
    try {
      if (modalMode === 'create') {
        console.log('Creando nueva recepción...')
        const result = await create(data as CreateRecepcionEquipoRequest)
        if (result.success) {
          setIsModalOpen(false)
          setSelectedRecepcion(null)
        } else {
          console.error('Error creando recepción:', result.errors)
        }
      } else {
        console.log('Actualizando recepción...')
        const result = await update((data as UpdateRecepcionEquipoRequest).recepcion_id!, data as UpdateRecepcionEquipoRequest)
        if (result.success) {
          setIsModalOpen(false)
          setSelectedRecepcion(null)
        } else {
          console.error('Error actualizando recepción:', result.errors)
        }
      }
    } catch (error) {
      console.error('Error guardando recepción:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (recepcionToDelete) {
      try {
        await deleteItem(recepcionToDelete.recepcion_id)
        setIsDeleteModalOpen(false)
        setRecepcionToDelete(null)
      } catch (error) {
        console.error('Error eliminando recepción:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRecepcion(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setRecepcionToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'En revisión': 'bg-secondary text-secondary-foreground',
      'Cancelada': 'bg-destructive text-destructive-foreground',
      'Recepcionada': 'bg-green-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado
  }

  const metrics = [
    {
      title: "Total Recepciones",
      value: pagination?.total?.toString() || "0",
      change: "+18%",
      trend: "up" as const,
      icon: Package,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "En Revisión",
      value: recepciones?.filter(r => r.estado_recepcion === 'En revisión').length.toString() || "0",
      change: "+12%",
      trend: "up" as const,
      icon: Calendar,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Recepcionadas",
      value: recepciones?.filter(r => r.estado_recepcion === 'Recepcionada').length.toString() || "0",
      change: "+25%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Canceladas",
      value: recepciones?.filter(r => r.estado_recepcion === 'Cancelada').length.toString() || "0",
      change: "-5%",
      trend: "down" as const,
      icon: Package,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recepción de Equipos</h1>
            <p className="text-muted-foreground">Gestión de recepción de equipos para servicios técnicos</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Recepción
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
              data={recepciones || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search={search}
              onSearch={search}
              onSort={(sortBy, sortOrder) => setSorting(sortBy, sortOrder)}
              onPageChange={(page) => setPagination(page, pagination?.limit || 10)}
              onLimitChange={(limit) => setPagination(pagination?.page || 1, limit)}
              searchPlaceholder="Buscar recepciones..."
            />
          </CardContent>
        </Card>
      </div>

      <RecepcionEquipoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        recepcion={selectedRecepcion}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Recepción"
        message={`¿Estás seguro de que deseas eliminar la recepción "${recepcionToDelete?.nro_recepcion || `#${recepcionToDelete?.recepcion_id}`}"?`}
        itemName={recepcionToDelete?.nro_recepcion || `Recepción #${recepcionToDelete?.recepcion_id}`}
      />
    </AppLayout>
  )
}
