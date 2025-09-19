"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ProveedorModal } from "@/components/modals/proveedor-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Proveedor } from "@/lib/types/referencias"
import {
  Building,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function ProveedoresPage() {
  const {
    data: proveedores,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteProveedor,
  } = useApi<Proveedor>('/api/proveedores');

  const [searchTerm, setSearchTerm] = useState("")
  const [proveedorModalOpen, setProveedorModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedProveedor, setSelectedProveedor] = useState<Proveedor | null>(null)
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
    setSelectedProveedor(null)
    setModalMode('create')
    setProveedorModalOpen(true)
  }

  const handleView = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setModalMode('view')
    setProveedorModalOpen(true)
  }

  const handleEdit = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setModalMode('edit')
    setProveedorModalOpen(true)
  }

  const handleDelete = (proveedor: Proveedor) => {
    setSelectedProveedor(proveedor)
    setDeleteModalOpen(true)
  }

  const handleSaveProveedor = async (proveedorData: Partial<Proveedor>): Promise<{ success: boolean; errors?: any[] }> => {
    try {
      let result = { success: false, errors: undefined as any[] | undefined }
      if (modalMode === 'create') {
        result = await create(proveedorData)
      } else if (modalMode === 'edit' && selectedProveedor) {
        result = await update(selectedProveedor.proveedor_id, proveedorData)
      }
      return result
    } catch (error) {
      console.error('Error al guardar proveedor:', error)
      return { success: false }
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedProveedor) {
      const success = await deleteProveedor(selectedProveedor.proveedor_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedProveedor(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Proveedor'
      case 'edit':
        return 'Editar Proveedor'
      case 'view':
        return 'Ver Proveedor'
      default:
        return 'Proveedor'
    }
  }

  const columns = [
    {
      key: 'proveedor_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre_proveedor',
      label: 'Nombre del Proveedor',
      sortable: true,
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">{proveedor.nombre_proveedor}</span>
        </div>
      ),
    },
    {
      key: 'ruc',
      label: 'RUC',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <CreditCard className="h-3 w-3" />
          {proveedor.ruc || '-'}
        </div>
      ),
    },
    {
      key: 'contacto',
      label: 'Información de Contacto',
      render: (proveedor: Proveedor) => (
        <div className="space-y-1">
          {proveedor.correo && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              {proveedor.correo}
            </div>
          )}
          {proveedor.telefono && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              {proveedor.telefono}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (proveedor: Proveedor) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className="max-w-xs truncate">{proveedor.direccion || '-'}</span>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      render: (proveedor: Proveedor) => (
        <span className="text-gray-600">
          {proveedor.created_at ? new Date(proveedor.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  return (
    <AppLayout
      title="Proveedores"
      subtitle="Gestión de proveedores y empresas suministradoras"
      currentModule="Referencias"
      currentSubmodule="/referencias/proveedores"
    >
      <DataTable
        title="Lista de Proveedores"
        data={proveedores}
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
        createButtonText="Nuevo Proveedor"
        searchPlaceholder="Buscar proveedores..."
        emptyMessage="No se encontraron proveedores que coincidan con la búsqueda."
      />

      {/* Modales */}
      <ProveedorModal
        isOpen={proveedorModalOpen}
        onClose={() => setProveedorModalOpen(false)}
        onSave={handleSaveProveedor}
        proveedor={modalMode === 'view' ? selectedProveedor : (modalMode === 'edit' ? selectedProveedor : null)}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Proveedor"
        message="¿Estás seguro de que quieres eliminar este proveedor?"
        itemName={selectedProveedor?.nombre_proveedor || ''}
      />
    </AppLayout>
  )
}