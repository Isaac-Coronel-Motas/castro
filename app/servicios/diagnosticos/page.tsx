"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { DiagnosticoModal } from "@/components/modals/diagnostico-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Diagnostico, CreateDiagnosticoRequest, UpdateDiagnosticoRequest } from "@/lib/types/servicios-tecnicos"
import { Plus, Stethoscope, Calendar, User, Eye, Edit, Trash2, Wrench, AlertCircle } from "lucide-react"

export default function DiagnosticosPage() {
  const [selectedDiagnostico, setSelectedDiagnostico] = useState<Diagnostico | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [diagnosticoToDelete, setDiagnosticoToDelete] = useState<Diagnostico | null>(null)

  const {
    data: diagnosticos,
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
  } = useApi<Diagnostico>('/api/servicios/diagnosticos')

  const columns = [
    {
      key: 'diagnostico_id',
      label: 'ID',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <div className="font-medium text-foreground">
          #{diagnostico.diagnostico_id}
        </div>
      )
    },
    {
      key: 'fecha_diagnostico',
      label: 'Fecha',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{new Date(diagnostico.fecha_diagnostico).toLocaleDateString('es-CR')}</span>
        </div>
      )
    },
    {
      key: 'estado_diagnostico',
      label: 'Estado',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <Badge className={getEstadoColor(diagnostico.estado_diagnostico)}>
          {getEstadoLabel(diagnostico.estado_diagnostico)}
        </Badge>
      )
    },
    {
      key: 'tecnico_nombre',
      label: 'Técnico',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span>{diagnostico.tecnico_nombre}</span>
        </div>
      )
    },
    {
      key: 'tipo_diagnostico_nombre',
      label: 'Tipo',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
          <span>{diagnostico.tipo_diagnostico_nombre}</span>
        </div>
      )
    },
    {
      key: 'total_equipos',
      label: 'Equipos',
      sortable: true,
      render: (diagnostico: Diagnostico) => (
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span>{diagnostico.total_equipos || 0}</span>
        </div>
      )
    },
    {
      key: 'observacion',
      label: 'Observación',
      sortable: false,
      render: (diagnostico: Diagnostico) => (
        <div className="max-w-xs truncate" title={diagnostico.observacion}>
          {diagnostico.observacion}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (diagnostico: Diagnostico) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleView(diagnostico)}
            className="h-8 w-8 p-0"
          >
            <Eye className="h-4 w-4" />
          </Button>
          {diagnostico.estado_diagnostico === 'Pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(diagnostico)}
              className="h-8 w-8 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {diagnostico.estado_diagnostico === 'Pendiente' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(diagnostico)}
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
    setSelectedDiagnostico(null)
    setModalMode('create')
    setIsModalOpen(true)
  }

  const handleView = (diagnostico: Diagnostico) => {
    setSelectedDiagnostico(diagnostico)
    setModalMode('view')
    setIsModalOpen(true)
  }

  const handleEdit = (diagnostico: Diagnostico) => {
    setSelectedDiagnostico(diagnostico)
    setModalMode('edit')
    setIsModalOpen(true)
  }

  const handleDelete = (diagnostico: Diagnostico) => {
    setDiagnosticoToDelete(diagnostico)
    setIsDeleteModalOpen(true)
  }

  const handleSave = async (data: CreateDiagnosticoRequest | UpdateDiagnosticoRequest) => {
    try {
      if (modalMode === 'create') {
        await createItem(data as CreateDiagnosticoRequest)
      } else {
        await updateItem((data as UpdateDiagnosticoRequest).diagnostico_id!, data as UpdateDiagnosticoRequest)
      }
      setIsModalOpen(false)
      setSelectedDiagnostico(null)
    } catch (error) {
      console.error('Error guardando diagnóstico:', error)
    }
  }

  const handleConfirmDelete = async () => {
    if (diagnosticoToDelete) {
      try {
        await deleteItem(diagnosticoToDelete.diagnostico_id)
        setIsDeleteModalOpen(false)
        setDiagnosticoToDelete(null)
      } catch (error) {
        console.error('Error eliminando diagnóstico:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDiagnostico(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDiagnosticoToDelete(null)
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'Pendiente': 'bg-secondary text-secondary-foreground',
      'En proceso': 'bg-chart-1 text-white',
      'Completado': 'bg-green-500 text-white',
      'Rechazado': 'bg-destructive text-destructive-foreground',
      'Cancelado': 'bg-muted text-muted-foreground'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado
  }

  const metrics = [
    {
      title: "Total Diagnósticos",
      value: pagination?.total?.toString() || "0",
      change: "+22%",
      trend: "up" as const,
      icon: Stethoscope,
      color: "bg-primary text-primary-foreground",
    },
    {
      title: "Pendientes",
      value: diagnosticos?.filter(d => d.estado_diagnostico === 'Pendiente').length.toString() || "0",
      change: "+15%",
      trend: "up" as const,
      icon: AlertCircle,
      color: "bg-secondary text-secondary-foreground",
    },
    {
      title: "En Proceso",
      value: diagnosticos?.filter(d => d.estado_diagnostico === 'En proceso').length.toString() || "0",
      change: "+18%",
      trend: "up" as const,
      icon: Calendar,
      color: "bg-chart-1 text-white",
    },
    {
      title: "Completados",
      value: diagnosticos?.filter(d => d.estado_diagnostico === 'Completado').length.toString() || "0",
      change: "+30%",
      trend: "up" as const,
      icon: Wrench,
      color: "bg-chart-2 text-white",
    },
  ]

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diagnósticos</h1>
            <p className="text-muted-foreground">Gestión de diagnósticos técnicos de equipos</p>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Diagnóstico
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
              data={diagnosticos || []}
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
              searchPlaceholder="Buscar diagnósticos..."
            />
          </CardContent>
        </Card>
      </div>

      <DiagnosticoModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        diagnostico={selectedDiagnostico}
        mode={modalMode}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        title="Eliminar Diagnóstico"
        message={`¿Estás seguro de que deseas eliminar el diagnóstico #${diagnosticoToDelete?.diagnostico_id}?`}
        itemName={`Diagnóstico #${diagnosticoToDelete?.diagnostico_id}`}
      />
    </AppLayout>
  )
}
