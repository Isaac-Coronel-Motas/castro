"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import { AperturaCajaModal } from "@/components/modals/apertura-caja-modal"
import { CierreCajaModal } from "@/components/modals/cierre-caja-modal"
import { ConfirmDeleteModal } from "@/components/modals/confirm-delete-modal"
import { useApi } from "@/hooks/use-api"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { AperturaCierreCaja } from "@/lib/types/ventas"
import {
  DollarSign,
  TrendingUp,
  Calculator,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react"

interface Caja {
  caja_id: number;
  nro_caja: string;
  sucursal_nombre: string;
}

export default function AperturaCierreCajaPage() {
  const authenticatedFetch = useAuthenticatedFetch();
  const {
    data: aperturas,
    loading,
    error,
    pagination,
    search,
    setSorting,
    setPagination,
    create,
    update,
    delete: deleteApertura,
  } = useApi<AperturaCierreCaja>('/api/ventas/apertura-cierre-caja');

  const [searchTerm, setSearchTerm] = useState("")
  const [aperturaModalOpen, setAperturaModalOpen] = useState(false)
  const [cierreModalOpen, setCierreModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedApertura, setSelectedApertura] = useState<AperturaCierreCaja | null>(null)
  const [cajas, setCajas] = useState<Caja[]>([])

  // Debug logs
  console.log('🔍 AperturaCierreCajaPage: aperturas:', aperturas);
  console.log('🔍 AperturaCierreCajaPage: loading:', loading);
  console.log('🔍 AperturaCierreCajaPage: error:', error);

  // Cargar cajas disponibles
  useEffect(() => {
    const loadCajas = async () => {
      try {
        console.log('🔍 Cargando cajas desde /api/ventas/cajas...');
        
        const response = await authenticatedFetch('/api/ventas/cajas');
        
        console.log('🔍 Respuesta de cajas:', response.status);
        
        if (response.ok) {
          const data = await response.json()
          console.log('🔍 Datos de cajas recibidos:', data);
          setCajas(data.data || [])
        } else {
          console.error('❌ Error al cargar cajas:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('❌ Error al cargar cajas:', error)
      }
    }
    loadCajas()
  }, [authenticatedFetch])

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
    setSelectedApertura(null)
    setAperturaModalOpen(true)
  }

  const handleView = (apertura: AperturaCierreCaja) => {
    setSelectedApertura(apertura)
    setAperturaModalOpen(true)
  }

  const handleEdit = (apertura: AperturaCierreCaja) => {
    setSelectedApertura(apertura)
    setAperturaModalOpen(true)
  }

  const handleDelete = (apertura: AperturaCierreCaja) => {
    setSelectedApertura(apertura)
    setDeleteModalOpen(true)
  }

  const handleCerrarCaja = (apertura: AperturaCierreCaja) => {
    setSelectedApertura(apertura)
    setCierreModalOpen(true)
  }

  const handleSaveApertura = async (aperturaData: any): Promise<boolean> => {
    try {
      return await create(aperturaData)
    } catch (error) {
      console.error('Error al guardar apertura:', error)
      return false
    }
  }

  const handleSaveCierre = async (aperturaId: number, montoCierre: number, observaciones?: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/ventas/apertura-cierre-caja/${aperturaId}/cerrar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          monto_cierre: montoCierre,
          observaciones: observaciones
        })
      })

      if (response.ok) {
        // Recargar los datos
        window.location.reload()
        return true
      }
      return false
    } catch (error) {
      console.error('Error al cerrar caja:', error)
      return false
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedApertura) {
      const success = await deleteApertura(selectedApertura.apertura_cierre_id)
      if (success) {
        setDeleteModalOpen(false)
        setSelectedApertura(null)
      }
    }
  }

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'abierta':
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case 'cerrada':
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'abierta':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cerrada':
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  // Helper function para formatear valores numéricos de forma segura
  const formatPrice = (value: any): string => {
    if (value === null || value === undefined || value === '') {
      return '-'
    }
    const numValue = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(numValue)) {
      return '-'
    }
    return `₡${numValue.toFixed(2)}`
  }

  const columns = [
    {
      key: 'apertura_cierre_id',
      label: 'ID',
      width: '80px',
    },
    {
      key: 'caja_nro',
      label: 'Caja',
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{apertura.caja_nro}</span>
        </div>
      ),
    },
    {
      key: 'sucursal_nombre',
      label: 'Sucursal',
      render: (apertura: AperturaCierreCaja) => (
        <span className="text-gray-600">{apertura.sucursal_nombre}</span>
      ),
    },
    {
      key: 'fecha_apertura',
      label: 'Fecha Apertura',
      sortable: true,
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-gray-500" />
          <span className="text-sm">{apertura.fecha_apertura}</span>
        </div>
      ),
    },
    {
      key: 'monto_apertura',
      label: 'Monto Inicial',
      sortable: true,
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <DollarSign className="h-3 w-3" />
          {formatPrice(apertura.monto_apertura)}
        </div>
      ),
    },
    {
      key: 'total_ventas',
      label: 'Ventas',
      sortable: true,
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-1 text-sm text-green-600">
          <TrendingUp className="h-3 w-3" />
          {formatPrice(apertura.total_ventas)}
        </div>
      ),
    },
    {
      key: 'total_cobros',
      label: 'Cobros',
      sortable: true,
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-1 text-sm text-blue-600">
          <DollarSign className="h-3 w-3" />
          {formatPrice(apertura.total_cobros)}
        </div>
      ),
    },
    {
      key: 'estado',
      label: 'Estado',
      render: (apertura: AperturaCierreCaja) => (
        <div className="flex items-center gap-2">
          {getEstadoIcon(apertura.estado)}
          <Badge className={getEstadoBadge(apertura.estado)}>
            {apertura.estado === 'abierta' ? 'Abierta' : 'Cerrada'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'fecha_cierre',
      label: 'Fecha Cierre',
      render: (apertura: AperturaCierreCaja) => (
        <span className="text-sm text-gray-600">
          {apertura.fecha_cierre || '-'}
        </span>
      ),
    },
  ]

  // Calcular métricas de la caja actual
  const cajaAbierta = aperturas?.find(a => a.estado === 'abierta')
  const totalAperturas = aperturas?.length || 0
  const totalCajasCerradas = aperturas?.filter(a => a.estado === 'cerrada').length || 0

  const cajaMetrics = [
    {
      title: "Estado de Caja",
      value: cajaAbierta ? "Abierta" : "Cerrada",
      subtitle: cajaAbierta ? `Desde ${cajaAbierta.fecha_apertura}` : "No hay caja abierta",
      icon: DollarSign,
      color: cajaAbierta ? "text-green-600" : "text-gray-600",
      bgColor: cajaAbierta ? "bg-green-50" : "bg-gray-50",
      status: cajaAbierta ? "Abierta" : "Cerrada",
    },
    {
      title: "Monto Inicial",
      value: cajaAbierta ? formatPrice(cajaAbierta.monto_apertura) : "₡0.00",
      subtitle: cajaAbierta ? "Apertura del día" : "Sin caja abierta",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Ventas del Día",
      value: cajaAbierta ? formatPrice(cajaAbierta.total_ventas) : "₡0.00",
      subtitle: "Total en efectivo",
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Total Movimientos",
      value: cajaAbierta ? formatPrice((cajaAbierta.total_ventas || 0) + (cajaAbierta.total_cobros || 0)) : "₡0.00",
      subtitle: "Ventas + Cobros",
      icon: Calculator,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ]

  return (
    <AppLayout
      title="Gestión de Caja"
      subtitle="Control de apertura, cierre y arqueo de caja"
      currentModule="Ventas"
      currentSubmodule="/ventas/apertura-cierre-caja"
    >
      {/* Header con acciones */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Caja</h1>
          <p className="text-gray-600">Control de apertura, cierre y arqueo de caja</p>
        </div>
        <div className="flex gap-3">
          {cajaAbierta ? (
            <Button 
              variant="destructive"
              onClick={() => handleCerrarCaja(cajaAbierta)}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Cerrar Caja
            </Button>
          ) : (
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreate}
            >
              <Plus className="h-4 w-4 mr-2" />
              Abrir Caja
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cajaMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    {metric.status && (
                      <Badge className={getEstadoBadge(metric.status)}>{metric.status}</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{metric.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full ${metric.bgColor}`}>
                  <metric.icon className={`h-6 w-6 ${metric.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle className="text-sm text-gray-600">Debug Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Loading: {loading ? 'true' : 'false'}</p>
              <p>Error: {error || 'none'}</p>
              <p>Aperturas count: {aperturas?.length || 0}</p>
              <p>Cajas count: {cajas?.length || 0}</p>
              <p>API Endpoint: /api/ventas/apertura-cierre-caja</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de aperturas/cierres */}
      <DataTable
        title="Historial de Aperturas/Cierres"
        data={aperturas}
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
        createButtonText="Abrir Caja"
        searchPlaceholder="Buscar por caja, sucursal..."
        emptyMessage="No hay aperturas de caja registradas"
        actions={[
          {
            key: 'cerrar',
            label: 'Cerrar',
            icon: XCircle,
            onClick: handleCerrarCaja,
            condition: (apertura: AperturaCierreCaja) => apertura.estado === 'abierta',
            variant: 'destructive'
          }
        ]}
      />

      {/* Modales */}
      <AperturaCajaModal
        isOpen={aperturaModalOpen}
        onClose={() => setAperturaModalOpen(false)}
        onSave={handleSaveApertura}
        cajas={cajas}
        title="Abrir Caja"
      />

      <CierreCajaModal
        isOpen={cierreModalOpen}
        onClose={() => setCierreModalOpen(false)}
        onSave={handleSaveCierre}
        apertura={selectedApertura}
        title="Cerrar Caja"
      />

      <ConfirmDeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Apertura de Caja"
        message="¿Estás seguro de que deseas eliminar esta apertura de caja? Esta acción no se puede deshacer."
      />
    </AppLayout>
  )
}