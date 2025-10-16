"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { DepartamentoModal } from "@/components/modals/departamento-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Departamento } from "@/lib/types/referencias"
import {
  Building,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function DepartamentosPage() {
  const {
    data: departamentos,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteDepartamento,
  } = useApi<Departamento>('/api/referencias/departamentos');

  const [searchTerm, setSearchTerm] = useState("")
  const [departamentoModalOpen, setDepartamentoModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    search(term)
  }

  const handleSort = (column: string, order: 'asc' | 'desc') => {
    setSorting(column, order)
  }

  const handleCreate = () => {
    setSelectedDepartamento(null)
    setModalMode('create')
    setDepartamentoModalOpen(true)
  }

  const handleEdit = (departamento: Departamento) => {
    setSelectedDepartamento(departamento)
    setModalMode('edit')
    setDepartamentoModalOpen(true)
  }

  const handleView = (departamento: Departamento) => {
    setSelectedDepartamento(departamento)
    setModalMode('view')
    setDepartamentoModalOpen(true)
  }

  const handleDelete = (departamento: Departamento) => {
    setSelectedDepartamento(departamento)
    setDeleteModalOpen(true)
  }

  const confirmDelete = async () => {
    if (selectedDepartamento) {
      await deleteDepartamento(selectedDepartamento.departamento_id)
      setDeleteModalOpen(false)
      setSelectedDepartamento(null)
    }
  }

  const handleSave = async (data: any) => {
    try {
      if (modalMode === 'create') {
        await create(data)
      } else if (modalMode === 'edit' && selectedDepartamento) {
        await update(selectedDepartamento.departamento_id, data)
      }
      setDepartamentoModalOpen(false)
      setSelectedDepartamento(null)
    } catch (error) {
      console.error('Error guardando departamento:', error)
    }
  }

  const columns = [
    {
      key: 'departamento_id',
      label: 'ID',
      sortable: true,
      render: (departamento: Departamento) => (
        <span className="font-mono text-sm text-muted-foreground">
          #{departamento.departamento_id}
        </span>
      )
    },
    {
      key: 'nombre_departamento',
      label: 'Nombre del Departamento',
      sortable: true,
      render: (departamento: Departamento) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{departamento.nombre_departamento}</span>
        </div>
      )
    },
    {
      key: 'created_at',
      label: 'Fecha de Creación',
      sortable: true,
      render: (departamento: Departamento) => (
        <span className="text-sm text-muted-foreground">
          {departamento.created_at ? new Date(departamento.created_at).toLocaleDateString('es-PY') : '-'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (departamento: Departamento) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(departamento)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Ver detalles"
          >
            <Eye className="h-4 w-4 text-blue-600" />
          </button>
          <button
            onClick={() => handleEdit(departamento)}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            title="Editar"
          >
            <Edit className="h-4 w-4 text-orange-600" />
          </button>
          <button
            onClick={() => handleDelete(departamento)}
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
    <AppLayout title="Departamentos" currentModule="Referencias">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Departamentos</h1>
            <p className="text-muted-foreground mt-2">
              Gestión de departamentos del sistema
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Departamento
          </button>
        </div>

        {/* Data Table */}
        <DataTable
          data={departamentos || []}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onSort={handleSort}
          onPaginationChange={setPagination}
          searchPlaceholder="Buscar departamentos..."
        />

        {/* Modals */}
        <DepartamentoModal
          open={departamentoModalOpen}
          onOpenChange={setDepartamentoModalOpen}
          departamento={selectedDepartamento}
          mode={modalMode}
          onSave={handleSave}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          title="Eliminar Departamento"
          description={`¿Estás seguro de que deseas eliminar el departamento "${selectedDepartamento?.nombre_departamento}"?`}
          onConfirm={confirmDelete}
        />
      </div>
    </AppLayout>
  )
}
