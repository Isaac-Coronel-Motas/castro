"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ServicioModal } from "@/components/modals/servicio-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Servicio } from "@/lib/types/referencias"
import {
  Settings,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function TiposServicioPage() {
  const {
    data: servicios,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteServicio,
  } = useApi<Servicio>('/api/referencias/servicios');

  const [searchTerm, setSearchTerm] = useState("")
  const [servicioModalOpen, setServicioModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    search(term)
  }

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSorting(column, order)
  }

  const handlePageChange = (page: number) => {
    setPagination(page, pagination?.limit || 10)
  }

  const handleLimitChange = (limit: number) => {
    setPagination(1, limit)
  }

  const handleCreate = () => {
    setSelectedServicio(null)
    setModalMode('create')
    setServicioModalOpen(true)
  }

  const handleView = (servicio: Servicio) => {
    setSelectedServicio(servicio)
    setModalMode('view')
    setServicioModalOpen(true)
  }

  const handleEdit = (servicio: Servicio) => {
    setSelectedServicio(servicio)
    setModalMode('edit')
    setServicioModalOpen(true)
  }

  const handleDelete = (servicio: Servicio) => {
    setSelectedServicio(servicio)
    setDeleteModalOpen(true)
  }

  const handleSaveServicio = async (servicioData: Partial<Servicio>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(servicioData)
      } else if (modalMode === 'edit' && selectedServicio) {
        return await update(selectedServicio.servicio_id, servicioData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar servicio:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedServicio) {
      const success = await deleteServicio(selectedServicio.servicio_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedServicio(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Servicio'
      case 'edit':
        return 'Editar Servicio'
      case 'view':
        return 'Ver Servicio'
      default:
        return 'Servicio'
    }
  }

  const columns = [
    {
      key: 'servicio_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre',
      label: 'Nombre del Servicio',
      sortable: true,
      render: (servicio: Servicio) => (
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">{servicio.nombre}</span>
        </div>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (servicio: Servicio) => (
        <span className="text-gray-600 max-w-xs truncate">
          {servicio.descripcion || '-'}
        </span>
      ),
    },
    {
      key: 'precio_base',
      label: 'Precio Base',
      sortable: true,
      render: (servicio: Servicio) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign className="h-3 w-3" />
          {servicio.precio_base ? `$${servicio.precio_base.toFixed(2)}` : '-'}
        </div>
      ),
    },
    {
      key: 'tipo_serv_id',
      label: 'Tipo',
      render: (servicio: Servicio) => {
        const tipos = {
          1: 'Reparación',
          2: 'Instalación',
          3: 'Mantenimiento',
          4: 'Diagnóstico',
          5: 'Otros'
        }
        return (
          <Badge variant="outline" className="text-xs">
            {tipos[servicio.tipo_serv_id as keyof typeof tipos] || 'Sin tipo'}
          </Badge>
        )
      },
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (servicio: Servicio) => (
        <span className="text-gray-600">
          {servicio.created_at ? new Date(servicio.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  return (
    <AppLayout
      title="Tipos de Servicio"
      subtitle="Gestión de servicios técnicos disponibles"
      currentModule="Referencias"
      currentSubmodule="/referencias/tipos-servicio"
    >
      <DataTable
        title="Lista de Servicios"
        data={servicios}
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
        createButtonText="Nuevo Servicio"
        searchPlaceholder="Buscar servicios..."
        emptyMessage="No se encontraron servicios que coincidan con la búsqueda."
      />

      {/* Modales */}
      <ServicioModal
        isOpen={servicioModalOpen}
        onClose={() => setServicioModalOpen(false)}
        onSave={handleSaveServicio}
        servicio={modalMode === 'view' ? selectedServicio : (modalMode === 'edit' ? selectedServicio : null)}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Servicio"
        message="¿Estás seguro de que quieres eliminar este servicio?"
        itemName={selectedServicio?.nombre || ''}
      />
    </AppLayout>
  )
}
