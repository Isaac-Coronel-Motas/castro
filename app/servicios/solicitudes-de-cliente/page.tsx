"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { SolicitudServicioModal } from "@/components/modals/solicitud-servicio-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { SolicitudServicio, CreateSolicitudServicioRequest, UpdateSolicitudServicioRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, FileText, Calendar, User, Building, MapPin, Eye, Edit, Trash2, Clock, Wrench } from "lucide-react"

export default function SolicitudesClientePage() {
  const [selectedSolicitud, setSelectedSolicitud] = useState<SolicitudServicio | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [solicitudToDelete, setSolicitudToDelete] = useState<SolicitudServicio | null>(null)

  const apiResult = useApi<SolicitudServicio>('/api/servicios/solicitudes-de-cliente')
  console.log('🔍 API Result:', apiResult)
  console.log('🔍 create function:', typeof apiResult.create)
  console.log('🔍 update function:', typeof apiResult.update)
  console.log('🔍 delete function:', typeof apiResult.delete)
  console.log('🔍 Data received:', apiResult.data)
  console.log('🔍 First item:', apiResult.data?.[0])
  
  const {
    data: solicitudes,
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
    create: createItem,
    update: updateItem,
    delete: deleteItem,
    refresh
  } = apiResult

  const columns = [
    {
      key: 'nro_solicitud',
      label: 'Número',
      sortable: true,
      render: (item: SolicitudServicio) => (
        <span className="font-semibold text-primary">{item.nro_solicitud}</span>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (item: SolicitudServicio) => {
        console.log('🔍 Render cliente_nombre - item:', item)
        console.log('🔍 Render cliente_nombre - item type:', typeof item)
        
        if (!item) {
          console.log('🔍 Item is undefined, returning fallback')
          return <div className="text-muted-foreground">Sin datos</div>
        }
        
        console.log('🔍 Item cliente_telefono:', item.cliente_telefono)
        
        return (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div>
              <div className="font-medium">{item.cliente_nombre}</div>
              <div className="text-sm text-muted-foreground">{item.cliente_telefono || 'Sin teléfono'}</div>
            </div>
          </div>
        )
      }
    },
    {
      key: 'fecha_solicitud',
      label: 'Fecha',
      sortable: true,
      render: (item: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(item.fecha_solicitud).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'descripcion_problema',
      label: 'Descripción',
      render: (item: SolicitudServicio) => (
        <div className="max-w-xs truncate" title={item.descripcion_problema}>
          {item.descripcion_problema || 'Sin descripción'}
        </div>
      )
    },
    {
      key: 'estado_solicitud',
      label: 'Estado',
      render: (item: SolicitudServicio) => {
        const getEstadoBadge = (estado: string) => {
          switch (estado) {
            case 'Pendiente':
              return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            case 'Asignada':
              return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            case 'En proceso':
              return 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            case 'Finalizada':
              return 'bg-green-100 text-green-800 hover:bg-green-100'
            case 'Cancelada':
              return 'bg-red-100 text-red-800 hover:bg-red-100'
            default:
              return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
          }
        }
        return <Badge className={getEstadoBadge(item.estado_solicitud)}>{item.estado_solicitud}</Badge>
      }
    },
    {
      key: 'tipo_atencion',
      label: 'Tipo',
      render: (item: SolicitudServicio) => {
        const getTipoBadge = (tipo: string) => {
          switch (tipo) {
            case 'Visita':
              return 'bg-purple-100 text-purple-800 hover:bg-purple-100'
            case 'Recepcion':
              return 'bg-orange-100 text-orange-800 hover:bg-orange-100'
            default:
              return 'bg-gray-100 text-gray-800 hover:bg-gray-100'
          }
        }
        return <Badge className={getTipoBadge(item.tipo_atencion)}>{item.tipo_atencion}</Badge>
      }
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      render: (item: SolicitudServicio) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{item.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (item: SolicitudServicio) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-primary/10"
            onClick={() => handleView(item)}
          >
            <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-secondary/10"
            onClick={() => handleEdit(item)}
          >
            <Edit className="h-4 w-4 text-muted-foreground hover:text-secondary" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-destructive/10"
            onClick={() => handleDelete(item)}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
          </Button>
        </div>
      )
    }
  ]

  const handleCreate = () => {
    setSelectedSolicitud(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleEdit = (solicitud: SolicitudServicio) => {
    setSelectedSolicitud(solicitud)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleView = (solicitud: SolicitudServicio) => {
    setSelectedSolicitud(solicitud)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleDelete = (solicitud: SolicitudServicio) => {
    setSolicitudToDelete(solicitud)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateSolicitudServicioRequest | UpdateSolicitudServicioRequest) => {
    console.log('🔍 handleSave llamado con:', data)
    console.log('🔍 modalMode:', modalMode)
    console.log('🔍 createItem function:', typeof createItem)
    
    try {
      if (modalMode === 'create') {
        console.log('🔍 Ejecutando createItem...')
        const result = await createItem(data as CreateSolicitudServicioRequest)
        console.log('🔍 Resultado createItem:', result)
      } else {
        console.log('🔍 Ejecutando updateItem...')
        const result = await updateItem(selectedSolicitud!.solicitud_id, data as UpdateSolicitudServicioRequest)
        console.log('🔍 Resultado updateItem:', result)
      }
      setIsModalOpen(false)
      setSelectedSolicitud(null)
    } catch (error) {
      console.error('Error al guardar solicitud:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (solicitudToDelete) {
      try {
        await deleteItem(solicitudToDelete.solicitud_id)
        setIsDeleteModalOpen(false)
        setSolicitudToDelete(null)
      } catch (error) {
        console.error('Error al eliminar solicitud:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSolicitud(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSolicitudToDelete(null)
  }

  return (
    <AppLayout
      title="Solicitudes de Cliente"
      description="Gestión de solicitudes de clientes para servicios técnicos"
      breadcrumbs={[
        { label: "Servicios Técnicos", href: "/servicios" },
        { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente" }
      ]}
    >
      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Solicitudes</p>
                  <p className="text-3xl font-bold text-card-foreground">{pagination?.total || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                    <div className="bg-primary/10 p-3 rounded-full">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {solicitudes?.filter(s => s.estado_solicitud === 'pendiente').length || 0}
                  </p>
                      <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
                    </div>
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">En Proceso</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {solicitudes?.filter(s => s.estado_solicitud === 'en_proceso').length || 0}
                  </p>
                      <p className="text-xs text-muted-foreground mt-1">En desarrollo</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-full">
                  <Wrench className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

          <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completadas</p>
                  <p className="text-3xl font-bold text-card-foreground">
                    {solicitudes?.filter(s => s.estado_solicitud === 'completado').length || 0}
                  </p>
                      <p className="text-xs text-muted-foreground mt-1">Este mes</p>
                    </div>
                    <div className="bg-green-100 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Tabla de datos */}
        <Card>
              <CardContent className="p-0">
            <DataTable
              data={solicitudes || []}
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
              onCreate={handleCreate}
              createButtonText="Nueva Solicitud"
              createButtonIcon={Plus}
              searchPlaceholder="Buscar por número, cliente o descripción..."
              emptyMessage="No se encontraron solicitudes"
              refresh={refresh}
            />
              </CardContent>
            </Card>
      </div>

      {/* Modales */}
      <SolicitudServicioModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        solicitud={selectedSolicitud}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Solicitud"
        message={`¿Estás seguro de que deseas eliminar la solicitud ${solicitudToDelete?.nro_solicitud}?`}
        itemName={solicitudToDelete?.nro_solicitud || ''}
      />
    </AppLayout>
  )
}
