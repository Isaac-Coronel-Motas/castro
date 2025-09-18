"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AppLayout } from "@/components/app-layout"
import { DataTable } from "@/components/data-table"
import {
  Clock,
  Activity,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
} from "lucide-react"

interface LogAuditoria {
  id: number;
  fecha_hora: string;
  usuario: string;
  accion: string;
  modulo: string;
  detalles: string;
  ip: string;
  resultado: string;
  created_at: string;
}

export default function AuditoriaPage() {
  // Simulamos datos de auditoría ya que no hay API específica implementada
  const [logsAuditoria] = useState<LogAuditoria[]>([
    {
      id: 1,
      fecha_hora: "2024-01-15 14:32:15",
      usuario: "jcastro",
      accion: "Inicio de Sesión",
      modulo: "Sistema",
      detalles: "Usuario administrador inició sesión correctamente",
      ip: "192.168.1.100",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:32:15Z",
    },
    {
      id: 2,
      fecha_hora: "2024-01-15 14:30:45",
      usuario: "mrodriguez",
      accion: "Crear Usuario",
      modulo: "Usuarios",
      detalles: "Creó nuevo usuario: cperez con rol Vendedor",
      ip: "192.168.1.105",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:30:45Z",
    },
    {
      id: 3,
      fecha_hora: "2024-01-15 14:28:20",
      usuario: "cperez",
      accion: "Generar Venta",
      modulo: "Ventas",
      detalles: "Procesó venta #V-001 por ₡350,000",
      ip: "192.168.1.110",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:28:20Z",
    },
    {
      id: 4,
      fecha_hora: "2024-01-15 14:25:10",
      usuario: "agarcia",
      accion: "Acceso Denegado",
      modulo: "Sistema",
      detalles: "Intento de acceso a módulo sin permisos: Administración",
      ip: "192.168.1.115",
      resultado: "Fallido",
      created_at: "2024-01-15T14:25:10Z",
    },
    {
      id: 5,
      fecha_hora: "2024-01-15 14:22:30",
      usuario: "lmartinez",
      accion: "Actualizar Servicio",
      modulo: "Servicios",
      detalles: "Cambió estado de servicio SS-002 a En Proceso",
      ip: "192.168.1.120",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:22:30Z",
    },
    {
      id: 6,
      fecha_hora: "2024-01-15 14:20:15",
      usuario: "jcastro",
      accion: "Modificar Permisos",
      modulo: "Usuarios",
      detalles: "Actualizó permisos del rol Técnico Senior",
      ip: "192.168.1.100",
      resultado: "Advertencia",
      created_at: "2024-01-15T14:20:15Z",
    },
    {
      id: 7,
      fecha_hora: "2024-01-15 14:18:45",
      usuario: "mrodriguez",
      accion: "Crear Pedido",
      modulo: "Compras",
      detalles: "Generó pedido de compra PC-004 a Distribuidora Tech SA",
      ip: "192.168.1.105",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:18:45Z",
    },
    {
      id: 8,
      fecha_hora: "2024-01-15 14:15:30",
      usuario: "sistema",
      accion: "Backup Automático",
      modulo: "Sistema",
      detalles: "Respaldo automático de base de datos completado",
      ip: "127.0.0.1",
      resultado: "Exitoso",
      created_at: "2024-01-15T14:15:30Z",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("")
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleView = (log: LogAuditoria) => {
    // TODO: Implement view log modal
    console.log('View log:', log)
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export logs')
  }

  const getResultadoBadge = (resultado: string) => {
    switch (resultado) {
      case "Exitoso":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Fallido":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "Advertencia":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getResultadoIcon = (resultado: string) => {
    switch (resultado) {
      case "Exitoso":
        return <CheckCircle className="h-3 w-3" />
      case "Fallido":
        return <XCircle className="h-3 w-3" />
      case "Advertencia":
        return <AlertTriangle className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case "Usuarios":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "Ventas":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "Servicios":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "Compras":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "Sistema":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const filteredLogs = logsAuditoria.filter(
    (log) =>
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.accion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalles.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const columns = [
    {
      key: 'fecha_hora',
      label: 'Fecha/Hora',
      sortable: true,
      render: (log: LogAuditoria) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          {log.fecha_hora}
        </div>
      ),
    },
    {
      key: 'usuario',
      label: 'Usuario',
      sortable: true,
      render: (log: LogAuditoria) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
              {log.usuario.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="font-medium text-gray-900">{log.usuario}</span>
        </div>
      ),
    },
    {
      key: 'accion',
      label: 'Acción',
      sortable: true,
      render: (log: LogAuditoria) => (
        <div className="flex items-center gap-1">
          <Activity className="h-3 w-3 text-gray-500" />
          <span className="text-gray-900">{log.accion}</span>
        </div>
      ),
    },
    {
      key: 'modulo',
      label: 'Módulo',
      render: (log: LogAuditoria) => (
        <Badge className={getModuloBadge(log.modulo)}>{log.modulo}</Badge>
      ),
    },
    {
      key: 'detalles',
      label: 'Detalles',
      render: (log: LogAuditoria) => (
        <span className="text-sm text-gray-600 max-w-xs truncate block">
          {log.detalles}
        </span>
      ),
    },
    {
      key: 'ip',
      label: 'IP',
      render: (log: LogAuditoria) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Globe className="h-3 w-3" />
          {log.ip}
        </div>
      ),
    },
    {
      key: 'resultado',
      label: 'Resultado',
      render: (log: LogAuditoria) => (
        <Badge className={getResultadoBadge(log.resultado)}>
          <div className="flex items-center gap-1">
            {getResultadoIcon(log.resultado)}
            {log.resultado}
          </div>
        </Badge>
      ),
    },
  ]

  return (
    <AppLayout
      title="Auditoría"
      subtitle="Registro de actividades y seguimiento de acciones del sistema"
      currentModule="Administración"
      currentSubmodule="/administracion/auditoria"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Registro de Auditoría</h2>
            <p className="text-gray-600">Historial de todas las acciones realizadas en el sistema</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            Exportar Logs
          </button>
        </div>
      </div>

      <DataTable
        title="Logs de Auditoría"
        data={filteredLogs}
        columns={columns}
        loading={loading}
        error={error}
        pagination={null}
        searchTerm={searchTerm}
        onSearch={handleSearch}
        onView={handleView}
        createButtonText=""
        searchPlaceholder="Buscar en logs de auditoría..."
        emptyMessage="No se encontraron registros de auditoría que coincidan con la búsqueda."
      />
    </AppLayout>
  )
}
