"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { UserModal } from "@/components/modals/user-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { Usuario, Rol } from "@/lib/types/auth"
import {
  Mail,
  Calendar,
  Shield,
  Settings,
  Receipt,
  User,
  Eye,
  Edit,
  Trash2,
  Plus,
} from "lucide-react"

export default function UsuariosPage() {
  const {
    data: usuarios,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteUsuario,
  } = useApi<Usuario>('/api/usuarios');

  const {
    data: roles,
    loading: rolesLoading,
  } = useApi<Rol>('/api/roles');

  const [searchTerm, setSearchTerm] = useState("")
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null)
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
    setSelectedUser(null)
    setModalMode('create')
    setUserModalOpen(true)
  }

  const handleView = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setModalMode('view')
    setUserModalOpen(true)
  }

  const handleEdit = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setModalMode('edit')
    setUserModalOpen(true)
  }

  const handleDelete = (usuario: Usuario) => {
    setSelectedUser(usuario)
    setDeleteModalOpen(true)
  }

  const handleSaveUser = async (userData: Partial<Usuario>): Promise<{ success: boolean; errors?: any[] }> => {
    try {
      let result = { success: false, errors: undefined as any[] | undefined }
      if (modalMode === 'create') {
        result = await create(userData)
      } else if (modalMode === 'edit' && selectedUser) {
        result = await update(selectedUser.usuario_id, userData)
      }
      return result
    } catch (error) {
      console.error('Error al guardar usuario:', error)
      return { success: false }
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedUser) {
      const success = await deleteUsuario(selectedUser.usuario_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedUser(null)
      }
    }
  }

  const getModalTitle = () => {
    switch (modalMode) {
      case 'create':
        return 'Crear Nuevo Usuario'
      case 'edit':
        return 'Editar Usuario'
      case 'view':
        return 'Ver Usuario'
      default:
        return 'Usuario'
    }
  }

  const getEstadoBadge = (activo: boolean) => {
    return activo 
      ? "bg-green-100 text-green-800 hover:bg-green-100"
      : "bg-red-100 text-red-800 hover:bg-red-100"
  }

  const getRolBadge = (rolNombre: string) => {
    switch (rolNombre) {
      case "Administrador":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "Técnico":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Vendedor":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Operador":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getRolIcon = (rolNombre: string) => {
    switch (rolNombre) {
      case "Administrador":
        return <Shield className="h-3 w-3" />
      case "Técnico":
        return <Settings className="h-3 w-3" />
      case "Vendedor":
        return <Receipt className="h-3 w-3" />
      case "Operador":
        return <User className="h-3 w-3" />
      default:
        return <User className="h-3 w-3" />
    }
  }

  const columns = [
    {
      key: 'usuario',
      label: 'Usuario',
      render: (usuario: Usuario) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
              {usuario.nombre
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{usuario.username}</p>
            <p className="text-xs text-gray-500">ID: {usuario.usuario_id}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'nombre',
      label: 'Nombre Completo',
      sortable: true,
    },
    {
      key: 'email',
      label: 'Email',
      render: (usuario: Usuario) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Mail className="h-3 w-3" />
          {usuario.email}
        </div>
      ),
    },
    {
      key: 'rol_nombre',
      label: 'Rol',
      render: (usuario: Usuario) => (
        <Badge className={getRolBadge(usuario.rol_nombre || 'Usuario')}>
          <div className="flex items-center gap-1">
            {getRolIcon(usuario.rol_nombre || 'Usuario')}
            {usuario.rol_nombre || 'Usuario'}
          </div>
        </Badge>
      ),
    },
    {
      key: 'last_login_attempt',
      label: 'Último Acceso',
      render: (usuario: Usuario) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Calendar className="h-3 w-3" />
          {usuario.last_login_attempt ? new Date(usuario.last_login_attempt).toLocaleString() : 'Nunca'}
        </div>
      ),
    },
    {
      key: 'activo',
      label: 'Estado',
      render: (usuario: Usuario) => (
        <Badge className={getEstadoBadge(usuario.activo)}>
          {usuario.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
  ]

  return (
    <AppLayout
      title="Usuarios"
      subtitle="Gestión de usuarios del sistema y control de accesos"
      currentModule="Administración"
      currentSubmodule="/administracion/usuarios"
    >
      <DataTable
        title="Lista de Usuarios"
        data={usuarios}
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
        createButtonText="Nuevo Usuario"
        searchPlaceholder="Buscar usuarios..."
        emptyMessage="No se encontraron usuarios que coincidan con la búsqueda."
      />

      {/* Modales */}
      <UserModal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        onSave={handleSaveUser}
        user={modalMode === 'view' ? selectedUser : (modalMode === 'edit' ? selectedUser : null)}
        roles={roles}
        title={getModalTitle()}
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Usuario"
        message="¿Estás seguro de que quieres eliminar este usuario?"
        itemName={selectedUser?.nombre || ''}
      />
    </AppLayout>
  )
}
