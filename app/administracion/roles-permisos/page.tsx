"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { RoleModal } from "@/components/modals/role-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Rol, Permiso } from "@/lib/types/auth"
import {
  Shield,
  Key,
  UserCheck,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"

export default function RolesPermisosPage() {
  const {
    data: roles,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteRol,
  } = useApi<Rol>('/api/roles');

  const {
    data: permisos,
    loading: permisosLoading,
  } = useApi<Permiso>('/api/permisos');

  const [searchTerm, setSearchTerm] = useState("")
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Rol | null>(null)
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
    setSelectedRole(null)
    setModalMode('create')
    setRoleModalOpen(true)
  }

  const handleView = (rol: Rol) => {
    setSelectedRole(rol)
    setModalMode('view')
    setRoleModalOpen(true)
  }

  const handleEdit = (rol: Rol) => {
    setSelectedRole(rol)
    setModalMode('edit')
    setRoleModalOpen(true)
  }

  const handleDelete = (rol: Rol) => {
    setSelectedRole(rol)
    setDeleteModalOpen(true)
  }

  const handleSaveRole = async (roleData: Partial<Rol>): Promise<boolean> => {
    try {
      if (modalMode === 'create') {
        return await create(roleData)
      } else if (modalMode === 'edit' && selectedRole) {
        return await update(selectedRole.rol_id, roleData)
      }
      return false
    } catch (error) {
      console.error('Error al guardar rol:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedRole) {
      const success = await deleteRol(selectedRole.rol_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedRole(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Rol'
      case 'edit':
        return 'Editar Rol'
      case 'view':
        return 'Ver Rol'
      default:
        return 'Rol'
    }
  }

  const getEstadoBadge = (activo: boolean) => {
    return activo 
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100"
  }

  const getNivelBadge = (rolNombre: string) => {
    switch (rolNombre) {
      case "Administrador":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Técnico":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      case "Vendedor":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Operador":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const columns = [
    {
      key: 'rol_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'nombre',
      label: 'Nombre del Rol',
      sortable: true,
      render: (rol: Rol) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-gray-900">{rol.nombre}</span>
        </div>
      ),
    },
    {
      key: 'descripcion',
      label: 'Descripción',
      render: (rol: Rol) => (
        <span className="text-gray-600 max-w-xs truncate">
          {rol.descripcion || '-'}
        </span>
      ),
    },
    {
      key: 'permisos',
      label: 'Permisos',
      render: (rol: Rol) => (
        <div className="flex items-center gap-1">
          <Key className="h-3 w-3 text-gray-500" />
          <Badge variant="outline" className="text-xs">
            {rol.permisos?.length || 0} permisos
          </Badge>
        </div>
      ),
    },
    {
      key: 'usuarios',
      label: 'Usuarios',
      render: (rol: Rol) => (
        <div className="flex items-center gap-1">
          <UserCheck className="h-3 w-3 text-gray-500" />
          <Badge variant="outline" className="text-xs">
            Ver usuarios
          </Badge>
        </div>
      ),
    },
    {
      key: 'nivel',
      label: 'Nivel',
      render: (rol: Rol) => (
        <Badge className={getNivelBadge(rol.nombre)}>
          {rol.nombre === 'Administrador' ? 'Alto' : 
           rol.nombre === 'Técnico' ? 'Medio' : 
           rol.nombre === 'Vendedor' ? 'Medio' : 'Básico'}
        </Badge>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (rol: Rol) => (
        <Badge className={getEstadoBadge(rol.activo)}>
          {rol.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'created_at',
      label: 'Fecha Creación',
      sortable: true,
      render: (rol: Rol) => (
        <span className="text-gray-600">
          {new Date(rol.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <AppLayout
      title="Roles y Permisos"
      subtitle="Gestión de roles de usuario y control de permisos del sistema"
      currentModule="Administración"
      currentSubmodule="/administracion/roles-permisos"
    >
      <DataTable
        title="Lista de Roles"
        data={roles}
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
        createButtonText="Nuevo Rol"
        searchPlaceholder="Buscar roles..."
        emptyMessage="No se encontraron roles que coincidan con la búsqueda."
      />

      {/* Modales */}
      <RoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        onSave={handleSaveRole}
        role={modalMode === 'view' ? selectedRole : (modalMode === 'edit' ? selectedRole : null)}
        title={getModalTitle()}
        permisos={permisos}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Rol"
        message="¿Estás seguro de que quieres eliminar este rol?"
        itemName={selectedRole?.nombre || ''}
      />
    </AppLayout>
  )
}
