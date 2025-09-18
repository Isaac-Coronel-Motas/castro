"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { MarcaModal } from "@/components/modals/marca-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Marca } from "@/lib/types/referencias"
import {
  Building,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function MarcasPage() {
  const {
    data: marcas,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteMarca,
  } = useApi<Marca>('/api/referencias/marcas');

  const [searchTerm, setSearchTerm] = useState("")
  const [marcaModalOpen, setMarcaModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedMarca, setSelectedMarca] = useState<Marca | null>(null)
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
    setSelectedMarca(null)
    setModalMode('create')
    setMarcaModalOpen(true)
  }

  const handleView = (marca: Marca) => {
    setSelectedMarca(marca)
    setModalMode('view')
    setMarcaModalOpen(true)
  }

  const handleEdit = (marca: Marca) => {
    setSelectedMarca(marca)
    setModalMode('edit')
    setMarcaModalOpen(true)
  }

  const handleDelete = (marca: Marca) => {
    setSelectedMarca(marca)
    setDeleteModalOpen(true)
  }

  const handleSaveMarca = async (marcaData: Partial<Marca>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(marcaData)
      } else if (modalMode === 'edit' && selectedMarca) {
        return await update(selectedMarca.marca_id, marcaData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar marca:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedMarca) {
      const success = await deleteMarca(selectedMarca.marca_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedMarca(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nueva Marca'
      case 'edit':
        return 'Editar Marca'
      case 'view':
        return 'Ver Marca'
      default:
        return 'Marca'
    }
  }

  const columns = [
    {
      key: 'marca_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'descripcion',
      label: 'Nombre de la Marca',
      sortable: true,
      render: (marca: Marca) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">{marca.descripcion}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (marca: Marca) => (
        <span className="text-gray-600">
          {marca.created_at ? new Date(marca.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  return (
    <AppLayout
      title="Marcas"
      subtitle="Gestión de marcas de productos"
      currentModule="Referencias"
      currentSubmodule="/referencias/marcas"
    >
      <DataTable
        title="Lista de Marcas"
        data={marcas}
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
        createButtonText="Nueva Marca"
        searchPlaceholder="Buscar marcas..."
        emptyMessage="No se encontraron marcas que coincidan con la búsqueda."
      />

      {/* Modales */}
      <MarcaModal
        isOpen={marcaModalOpen}
        onClose={() => setMarcaModalOpen(false)}
        onSave={handleSaveMarca}
        marca={modalMode === 'view' ? selectedMarca : (modalMode === 'edit' ? selectedMarca : null)}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Marca"
        message="¿Estás seguro de que quieres eliminar esta marca?"
        itemName={selectedMarca?.descripcion || ''}
      />
    </AppLayout>
  )
}
