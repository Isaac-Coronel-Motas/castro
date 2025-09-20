"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { CategoriaModal } from "@/components/modals/categoria-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import {
  Tag,
  Package,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

interface Categoria {
  categoria_id: number;
  nombre_categoria: string;
  estado: boolean;
  productos_count?: number;
}

export default function CategoriasPage() {
  const {
    data: categorias,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteCategoria,
  } = useApi<Categoria>('/api/referencias/categorias');

  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaModalOpen, setCategoriaModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null)
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
    setSelectedCategoria(null)
    setModalMode('create')
    setCategoriaModalOpen(true)
  }

  const handleView = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setModalMode('view')
    setCategoriaModalOpen(true)
  }

  const handleEdit = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setModalMode('edit')
    setCategoriaModalOpen(true)
  }

  const handleDelete = (categoria: Categoria) => {
    setSelectedCategoria(categoria)
    setDeleteModalOpen(true)
  }

  const handleSaveCategoria = async (categoriaData: Partial<Categoria>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(categoriaData)
      } else if (modalMode === 'edit' && selectedCategoria) {
        return await update(selectedCategoria.categoria_id, categoriaData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar categoría:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedCategoria) {
      const success = await deleteCategoria(selectedCategoria.categoria_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedCategoria(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nueva Categoría'
      case 'edit':
        return 'Editar Categoría'
      case 'view':
        return 'Ver Categoría'
      default:
        return 'Categoría'
    }
  }

  const getEstadoBadge = (estado: boolean) => {
    return estado 
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100"
  }

  const columns = [
    {
      key: 'categoria_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre_categoria',
      label: 'Nombre',
      sortable: true,
      render: (categoria: Categoria) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-600" />
          <span className="text-gray-900 font-medium">{categoria.nombre_categoria}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (categoria: Categoria) => (
        <Badge className={getEstadoBadge(categoria.estado)}>
          {categoria.estado ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'productos_count',
      label: 'Productos',
      render: (categoria: Categoria) => (
        <div className="flex items-center gap-1">
          <Package className="h-3 w-3 text-gray-500" />
          <span className="text-sm text-gray-600">{categoria.productos_count || 0}</span>
        </div>
      ),
    },
  ]

  return (
    <AppLayout
      title="Categorías"
      subtitle="Gestión de categorías de productos y servicios"
      currentModule="Referencias"
      currentSubmodule="/referencias/categorias"
    >
      <DataTable
        title="Lista de Categorías"
        data={categorias}
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
        createButtonText="Nueva Categoría"
        searchPlaceholder="Buscar categorías..."
        emptyMessage="No se encontraron categorías que coincidan con la búsqueda."
      />

      {/* Modales */}
      <CategoriaModal
        isOpen={categoriaModalOpen}
        onClose={() => setCategoriaModalOpen(false)}
        onSave={handleSaveCategoria}
        categoria={modalMode === 'view' ? selectedCategoria : (modalMode === 'edit' ? selectedCategoria : null)}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Categoría"
        message="¿Estás seguro de que quieres eliminar esta categoría?"
        itemName={selectedCategoria?.nombre || ''}
      />
    </AppLayout>
  )
}
