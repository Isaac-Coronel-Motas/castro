"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { CiudadModal } from "@/components/modals/ciudad-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Ciudad } from "@/lib/types/referencias"
import {
  MapPin,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function CiudadesPage() {
  const {
    data: ciudades,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteCiudad,
  } = useApi<Ciudad>('/api/referencias/ciudades');

  const [searchTerm, setSearchTerm] = useState("")
  const [ciudadModalOpen, setCiudadModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCiudad, setSelectedCiudad] = useState<Ciudad | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    search(term)
  }

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSorting(column, order)
  }

  const handleCreate = () => {
    setSelectedCiudad(null)
    setModalMode('create')
    setCiudadModalOpen(true)
  }

  const handleEdit = (ciudad: Ciudad) => {
    setSelectedCiudad(ciudad)
    setModalMode('edit')
    setCiudadModalOpen(true)
  }

  const handleView = (ciudad: Ciudad) => {
    setSelectedCiudad(ciudad)
    setModalMode('view')
    setCiudadModalOpen(true)
  }

  const handleDelete = (ciudad: Ciudad) => {
    setSelectedCiudad(ciudad)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedCiudad) {
      await deleteCiudad(selectedCiudad.id)
      setDeleteModalOpen(false)
      setSelectedCiudad(null)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await create(data)
      } else if (modalMode === 'edit' && selectedCiudad) {
        await update(selectedCiudad.id, data)
      }
      setCiudadModalOpen(false)
      setSelectedCiudad(null)
    } catch (error) {
      console.error('Error guardando ciudad:', error)
    }
  }

  const columns = [
    {
      key: 'id',
      label: 'ID',
      sortable: true,
      render: (ciudad: Ciudad) => (
        <span className="font-mono text-sm text-muted-foreground">
          #{ciudad.id}
        </span>
      )
    },
    {
      key: 'nombre',
      label: 'Nombre de la Ciudad',
      sortable: true,
      render: (ciudad: Ciudad) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{ciudad.nombre}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (ciudad: Ciudad) => (
        <span className="text-sm text-muted-foreground">
          {ciudad.created_at ? new Date(ciudad.created_at).toLocaleDateString('es-PY') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (ciudad: Ciudad) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(ciudad)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleEdit(ciudad)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4 text-orange-600" />
          </button>
          <button
            onClick={() => handleDelete(ciudad)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Eliminar"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <AppLayout title="Ciudades" currentModule="Referencias">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Ciudades</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de ciudades del sistema
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nueva Ciudad
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          data={ciudades || []}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onSort={handleSort}
          onPaginationChange={setPagination}
          searchPlaceholder="Buscar ciudades..."
        />

        {/* Modals */}
        <CiudadModal
          open={ciudadModalOpen}
          onOpenChange={setCiudadModalOpen}
          ciudad={selectedCiudad}
          mode={modalMode}
          onSave={handleSave}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Eliminar Ciudad"
          description={`¿Estás seguro de que deseas eliminar la ciudad "${selectedCiudad?.nombre}"?`}
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
