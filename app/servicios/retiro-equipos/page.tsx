"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { SalidaEquipoModal } from "@/components/modals/salida-equipo-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { SalidaEquipo, CreateSalidaEquipoRequest, UpdateSalidaEquipoRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, PackageCheck, Calendar, User, Building, Eye, Edit, Trash2, Clock, Phone, MapPin, Truck, CheckCircle, AlertCircle } from "lucide-react"

export default function RetiroEquiposPage() {
  const [selectedSalida, setSelectedSalida] = useState<SalidaEquipo | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [salidaToDelete, setSalidaToDelete] = useState<SalidaEquipo | null>(null)

  const {
    data: salidas,
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
  } = useApi<SalidaEquipo>('/api/servicios/retiro-equipos')

  const columns = [
    {
      key: 'nro_salida',
      label: 'Número',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <div className="font-medium text-foreground">
          {salida.nro_salida || `#${salida.salida_equipo_id}`}
        </div>
      )
    },
    {
      key: 'fecha_salida',
      label: 'Fecha',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(salida.fecha_salida).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <Badge className={getEstadoColor(salida.estado)}>
          {getEstadoLabel(salida.estado)}
        </Badge>
      )
    },
    {
      key: 'cliente_nombre',
      label: 'Cliente',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div>
            <span className="font-medium text-foreground block">{salida.cliente_nombre || 'N/A'}</span>
            {salida.telefono_contacto && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="h-3 w-3" />
                {salida.telefono_contacto}
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'equipo_info',
      label: 'Equipo',
      sortable: false,
      render: (salida: SalidaEquipo) => (
        <div>
          <span className="font-medium text-foreground block">{salida.equipo_info || 'N/A'}</span>
          <span className="text-sm text-muted-foreground">{salida.descripcion_reparacion || ''}</span>
        </div>
      )
    },
    {
      key: 'metodo_entrega',
      label: 'Método',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <div className="flex items-center gap-2">
          {salida.metodo_entrega === 'entrega_domicilio' ? (
            <Truck className="h-4 w-4 text-purple-600" />
          ) : salida.metodo_entrega === 'envio_courier' ? (
            <MapPin className="h-4 w-4 text-orange-600" />
          ) : (
            <User className="h-4 w-4 text-blue-600" />
          )}
          <Badge className={getMetodoEntregaColor(salida.metodo_entrega)}>
            {getMetodoEntregaLabel(salida.metodo_entrega)}
          </Badge>
        </div>
      )
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span>{salida.sucursal_nombre}</span>
        </div>
      )
    },
    {
      key: 'costo_envio',
      label: 'Costo Envío',
      sortable: true,
      render: (salida: SalidaEquipo) => (
        salida.costo_envio && salida.costo_envio > 0 ? (
          <span className="font-medium text-foreground">₡{salida.costo_envio.toLocaleString()}</span>
        ) : (
          <span className="text-muted-foreground">Sin costo</span>
        )
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (salida: SalidaEquipo) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(salida)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {salida.estado !== 'retirado' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(salida)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {salida.estado === 'pendiente_notificacion' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(salida)}
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
    setSelectedSalida(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (salida: SalidaEquipo) => {
    setSelectedSalida(salida)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (salida: SalidaEquipo) => {
    setSelectedSalida(salida)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (salida: SalidaEquipo) => {
    setSalidaToDelete(salida)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateSalidaEquipoRequest | UpdateSalidaEquipoRequest) => {
    try {
      if (modalMode === 'create') {
        const result = await create(data as CreateSalidaEquipoRequest)
        if (result.success) {
          setIsModalOpen(false)
          setSelectedSalida(null)
        } else {
          console.error('Error creando salida de equipo:', result.errors)
        }
      } else {
        const result = await update((data as UpdateSalidaEquipoRequest).salida_equipo_id!, data as UpdateSalidaEquipoRequest)
        if (result.success) {
          setIsModalOpen(false)
          setSelectedSalida(null)
        } else {
          console.error('Error actualizando salida de equipo:', result.errors)
        }
      }
    } catch (error) {
      console.error('Error guardando salida de equipo:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (salidaToDelete) {
      try {
        await deleteItem(salidaToDelete.salida_equipo_id)
        setIsDeleteModalOpen(false)
        setSalidaToDelete(null)
      } catch (error) {
        console.error('Error eliminando salida de equipo:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedSalida(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setSalidaToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'pendiente_notificacion': 'bg-yellow-500 text-white',
      'cliente_notificado': 'bg-blue-500 text-white',
      'listo_retiro': 'bg-green-500 text-white',
      'retirado': 'bg-gray-500 text-white',
      'entrega_domicilio': 'bg-purple-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    const labels: { [key: string]: string } = {
      'pendiente_notificacion': 'Pendiente Notificación',
      'cliente_notificado': 'Cliente Notificado',
      'listo_retiro': 'Listo para Retiro',
      'retirado': 'Retirado',
      'entrega_domicilio': 'Entrega a Domicilio'
    }
    return labels[estado] || estado
  }

  const getMetodoEntregaColor = (metodo: string) => {
    const colores: { [key: string]: string } = {
      'retiro_taller': 'bg-blue-500 text-white',
      'entrega_domicilio': 'bg-purple-500 text-white',
      'envio_courier': 'bg-orange-500 text-white'
    }
    return colores[metodo] || 'bg-muted text-muted-foreground'
  }

  const getMetodoEntregaLabel = (metodo: string) => {
    const labels: { [key: string]: string } = {
      'retiro_taller': 'Retiro en Taller',
      'entrega_domicilio': 'Entrega a Domicilio',
      'envio_courier': 'Envío por Courier'
    }
    return labels[metodo] || metodo
  }

  const metrics = [
    {
      title: "Total Retiros",
      value: pagination?.total?.toString() || "0",
      change: "+20%",
      trend: "up" as const,
      icon: PackageCheck,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Listos para Retiro",
      value: salidas?.filter(s => s.estado === 'listo_retiro').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: CheckCircle,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "Retirados Hoy",
      value: salidas?.filter(s => {
        const hoy = new Date().toDateString()
        return s.estado === 'retirado' && new Date(s.fecha_salida).toDateString() === hoy
      }).length.toString() || "0",
      change: "+25%",
      trend: "up" as const,
      icon: Truck,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Pendientes Notificación",
      value: salidas?.filter(s => s.estado === 'pendiente_notificacion').length.toString() || "0",
      change: "+8%",
      trend: "up" as const,
      icon: Phone,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Retiro de Equipos</h1>
            <p className="text-muted-foreground">Gestión de entrega de equipos reparados a clientes</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Retiro
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
              data={salidas || []}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              search={search}
              onSearch={search}
              onSort={(sortBy, sortOrder) => setSorting(sortBy, sortOrder)}
              onPageChange={(page) => setPagination(page, pagination?.limit || 10)}
              onLimitChange={(limit) => setPagination(pagination?.page || 1, limit)}
              searchPlaceholder="Buscar retiros..."
            />
          </CardContent>
        </Card>
      </div>

      <SalidaEquipoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        salida={selectedSalida}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Salida de Equipo"
        message={`¿Estás seguro de que deseas eliminar la salida "${salidaToDelete?.nro_salida || `#${salidaToDelete?.salida_equipo_id}`}"?`}
        itemName={salidaToDelete?.nro_salida || `Salida #${salidaToDelete?.salida_equipo_id}`}
      />
    </AppLayout>
  )
}
