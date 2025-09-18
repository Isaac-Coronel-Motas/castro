"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
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
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
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
    // TODO: Implement create categoria modal
    console.log('Create categoria')
  }

  const handleView = (categoria: Categoria) => {
    // TODO: Implement view categoria modal
    console.log('View categoria:', categoria)
  }

  const handleEdit = (categoria: Categoria) => {
    // TODO: Implement edit categoria modal
    console.log('Edit categoria:', categoria)
  }

  const handleDelete = async (categoria: Categoria) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la categoría ${categoria.nombre}?`)) {
      const success = await deleteCategoria(categoria.categoria_id)
      if (success) {
        // Success handled by the hook
      }
    }
  }

  const getEstadoBadge = (activo: boolean) => {
    return activo 
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
      key: 'nombre',
      label: 'Nombre',
      sortable: true,
      render: (categoria: Categoria) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-blue-600" />
          <span className="text-gray-900 font-medium">{categoria.nombre}</span>
        </div>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (categoria: Categoria) => (
        <span className="text-gray-600 max-w-xs truncate">
          {categoria.descripcion || '-'}
        </span>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (categoria: Categoria) => (
        <Badge className={getEstadoBadge(categoria.activo)}>
          {categoria.activo ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (categoria: Categoria) => (
        <span className="text-gray-600">
          {new Date(categoria.created_at).toLocaleDateString()}
        </span>
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
    </AppLayout>
  )
}
