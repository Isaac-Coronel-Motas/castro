"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ProductoModal } from "@/components/modals/producto-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Producto, Categoria, Marca } from "@/lib/types/referencias"
import {
  Package,
  DollarSign,
  Hash,
  Tag,
  Building,
  Eye,
  Edit,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react"

export default function ProductosPage() {
  const {
    data: productos,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteProducto,
  } = useApi<Producto>('/api/productos');

  const {
    data: categorias,
    loading: categoriasLoading,
  } = useApi<Categoria>('/api/referencias/categorias');

  const {
    data: marcas,
    loading: marcasLoading,
  } = useApi<Marca>('/api/referencias/marcas');

  const [searchTerm, setSearchTerm] = useState("")
  const [productoModalOpen, setProductoModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)
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
    setSelectedProducto(null)
    setModalMode('create')
    setProductoModalOpen(true)
  }

  const handleView = (producto: Producto) => {
    setSelectedProducto(producto)
    setModalMode('view')
    setProductoModalOpen(true)
  }

  const handleEdit = (producto: Producto) => {
    setSelectedProducto(producto)
    setModalMode('edit')
    setProductoModalOpen(true)
  }

  const handleDelete = (producto: Producto) => {
    setSelectedProducto(producto)
    setDeleteModalOpen(true)
  }

  const handleSaveProducto = async (productoData: Partial<Producto>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(productoData)
      } else if (modalMode === 'edit' && selectedProducto) {
        return await update(selectedProducto.producto_id, productoData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar producto:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedProducto) {
      const success = await deleteProducto(selectedProducto.producto_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedProducto(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Producto'
      case 'edit':
        return 'Editar Producto'
      case 'view':
        return 'Ver Producto'
      default:
        return 'Producto'
    }
  }

  const getStockBadge = (stock: number, stockMinimo?: number) => {
    if (stockMinimo && stock <= stockMinimo) {
      return "bg-red-100 text-red-800 hover:bg-red-100"
    } else if (stock <= (stockMinimo || 0) * 2) {
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
    } else {
      return "bg-green-100 text-green-800 hover:bg-green-100"
    }
  }

  const getEstadoBadge = (estado: boolean) => {
    return estado
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100"
  }

  const columns = [
    {
      key: 'producto_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre_producto',
      label: 'Producto',
      sortable: true,
      render: (producto: Producto) => (
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-blue-600" />
          <div>
            <p className="font-medium text-gray-900">{producto.nombre_producto}</p>
            {producto.cod_product && (
              <p className="text-xs text-gray-500">Código: {producto.cod_product}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria_id',
      label: 'Categoría',
      render: (producto: Producto) => (
        <div className="flex items-center gap-1">
          <Tag className="h-3 w-3 text-gray-500" />
          <Badge variant="outline" className="text-xs">
            Ver categoría
          </Badge>
        </div>
      ),
    },
    {
      key: 'marca_id',
      label: 'Marca',
      render: (producto: Producto) => (
        <div className="flex items-center gap-1">
          <Building className="h-3 w-3 text-gray-500" />
          <Badge variant="outline" className="text-xs">
            Ver marca
          </Badge>
        </div>
      ),
    },
    {
      key: 'precio_venta',
      label: 'Precio',
      sortable: true,
      render: (producto: Producto) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign className="h-3 w-3" />
          {producto.precio_venta ? `$${producto.precio_venta.toFixed(2)}` : '-'}
        </div>
      ),
    },
    {
      key: 'stock',
      label: 'Stock',
      sortable: true,
      render: (producto: Producto) => (
        <div className="flex items-center gap-2">
          <Badge className={getStockBadge(producto.stock, producto.stock_minimo)}>
            {producto.stock}
          </Badge>
          {producto.stock_minimo && producto.stock <= producto.stock_minimo && (
            <AlertTriangle className="h-3 w-3 text-red-500" />
          )}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (producto: Producto) => (
        <Badge className={getEstadoBadge(producto.estado)}>
          {producto.estado ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ]

  return (
    <AppLayout
      title="Productos"
      subtitle="Gestión de productos e inventario"
      currentModule="Referencias"
      currentSubmodule="/referencias/productos"
    >
      <DataTable
        title="Lista de Productos"
        data={productos}
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
        createButtonText="Nuevo Producto"
        searchPlaceholder="Buscar productos..."
        emptyMessage="No se encontraron productos que coincidan con la búsqueda."
      />

      {/* Modales */}
      <ProductoModal
        isOpen={productoModalOpen}
        onClose={() => setProductoModalOpen(false)}
        onSave={handleSaveProducto}
        producto={modalMode === 'view' ? selectedProducto : (modalMode === 'edit' ? selectedProducto : null)}
        categorias={categorias}
        marcas={marcas}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Producto"
        message="¿Estás seguro de que quieres eliminar este producto?"
        itemName={selectedProducto?.nombre_producto || ''}
      />
    </AppLayout>
  )
}