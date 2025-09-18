"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { ClienteModal } from "@/components/modals/cliente-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Cliente } from "@/lib/types/referencias"
import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react"

export default function ClientesPage() {
  const {
    data: clientes,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteCliente,
  } = useApi<Cliente>('/api/clientes');

  const [searchTerm, setSearchTerm] = useState("")
  const [clienteModalOpen, setClienteModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
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
    setSelectedCliente(null)
    setModalMode('create')
    setClienteModalOpen(true)
  }

  const handleView = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setModalMode('view')
    setClienteModalOpen(true)
  }

  const handleEdit = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setModalMode('edit')
    setClienteModalOpen(true)
  }

  const handleDelete = (cliente: Cliente) => {
    setSelectedCliente(cliente)
    setDeleteModalOpen(true)
  }

  const handleSaveCliente = async (clienteData: Partial<Cliente>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(clienteData)
      } else if (modalMode === 'edit' && selectedCliente) {
        return await update(selectedCliente.cliente_id, clienteData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar cliente:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedCliente) {
      const success = await deleteCliente(selectedCliente.cliente_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedCliente(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Cliente'
      case 'edit':
        return 'Editar Cliente'
      case 'view':
        return 'Ver Cliente'
      default:
        return 'Cliente'
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "activo":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "inactivo":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "activo":
        return <CheckCircle className="h-3 w-3" />
      case "inactivo":
        return <XCircle className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const columns = [
    {
      key: 'cliente_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre',
      label: 'Cliente',
      sortable: true,
      render: (cliente: Cliente) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">{cliente.nombre}</span>
        </div>
      ),
    },
    {
      key: 'ruc',
      label: 'RUC',
      render: (cliente: Cliente) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <CreditCard className="h-3 w-3" />
          {cliente.ruc || '-'}
        </div>
      ),
    },
    {
      key: 'contacto',
      label: 'Información de Contacto',
      render: (cliente: Cliente) => (
        <div className="space-y-1">
          {cliente.email && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              {cliente.email}
            </div>
          )}
          {cliente.telefono && (
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              {cliente.telefono}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'direccion',
      label: 'Dirección',
      render: (cliente: Cliente) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <MapPin className="h-3 w-3" />
          <span className="max-w-xs truncate">{cliente.direccion || '-'}</span>
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      sortable: true,
      render: (cliente: Cliente) => (
        <Badge className={getEstadoBadge(cliente.estado)}>
          <div className="flex items-center gap-1">
            {getEstadoIcon(cliente.estado)}
            {cliente.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </div>
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha Registro',
      sortable: true,
      render: (cliente: Cliente) => (
        <span className="text-gray-600">
          {cliente.created_at ? new Date(cliente.created_at).toLocaleDateString() : '-'}
        </span>
      ),
    },
  ]

  return (
    <AppLayout
      title="Clientes"
      subtitle="Gestión de clientes y base de datos de contactos"
      currentModule="Referencias"
      currentSubmodule="/referencias/clientes"
    >
      <DataTable
        title="Lista de Clientes"
        data={clientes}
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
        createButtonText="Nuevo Cliente"
        searchPlaceholder="Buscar clientes..."
        emptyMessage="No se encontraron clientes que coincidan con la búsqueda."
      />

      {/* Modales */}
      <ClienteModal
        isOpen={clienteModalOpen}
        onClose={() => setClienteModalOpen(false)}
        onSave={handleSaveCliente}
        cliente={modalMode === 'view' ? selectedCliente : (modalMode === 'edit' ? selectedCliente : null)}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cliente"
        message="¿Estás seguro de que quieres eliminar este cliente?"
        itemName={selectedCliente?.nombre || ''}
      />
    </AppLayout>
  )
}