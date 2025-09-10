"use client"

import { useState } from "react"
import { Search, Plus, ArrowRight, Package, MapPin, Clock, CheckCircle, AlertCircle, Truck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export default function TransferenciasPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("todos")

  // Datos de ejemplo para transferencias
  const transferencias = [
    {
      id: "TRF-001",
      origen: "Almacén Principal",
      destino: "Taller Reparaciones",
      productos: 5,
      estado: "En Tránsito",
      fecha: "2024-01-15",
      responsable: "Carlos Méndez",
      observaciones: "Componentes para reparación Samsung Galaxy",
      valor: 450000,
    },
    {
      id: "TRF-002",
      origen: "Taller Reparaciones",
      destino: "Almacén Principal",
      productos: 3,
      estado: "Completada",
      fecha: "2024-01-14",
      responsable: "Ana Rodríguez",
      observaciones: "Devolución de piezas no utilizadas",
      valor: 280000,
    },
    {
      id: "TRF-003",
      origen: "Almacén Principal",
      destino: "Sucursal Centro",
      productos: 8,
      estado: "Pendiente",
      fecha: "2024-01-16",
      responsable: "Luis García",
      observaciones: "Stock para venta directa",
      valor: 750000,
    },
    {
      id: "TRF-004",
      origen: "Sucursal Centro",
      destino: "Taller Reparaciones",
      productos: 2,
      estado: "En Tránsito",
      fecha: "2024-01-15",
      responsable: "María González",
      observaciones: "Equipos para diagnóstico",
      valor: 320000,
    },
  ]

  const filteredTransferencias = transferencias.filter((transferencia) => {
    const matchesSearch =
      transferencia.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transferencia.responsable.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter =
      selectedFilter === "todos" || transferencia.estado.toLowerCase().replace(" ", "-") === selectedFilter

    return matchesSearch && matchesFilter
  })

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case "Completada":
        return <CheckCircle className="w-4 h-4" />
      case "En Tránsito":
        return <Truck className="w-4 h-4" />
      case "Pendiente":
        return <Clock className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case "Completada":
        return "bg-green-100 text-green-800 border-green-200"
      case "En Tránsito":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Pendiente":
        return "bg-amber-100 text-amber-800 border-amber-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Métricas calculadas
  const totalTransferencias = transferencias.length
  const enTransito = transferencias.filter((t) => t.estado === "En Tránsito").length
  const completadas = transferencias.filter((t) => t.estado === "Completada").length
  const valorTotal = transferencias.reduce((sum, t) => sum + t.valor, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Transferencias</h1>
            <p className="text-slate-600 mt-1">Gestión de movimientos entre ubicaciones</p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Transferencia
          </Button>
        </div>

        {/* Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Transferencias</p>
                <p className="text-2xl font-bold text-slate-900">{totalTransferencias}</p>
              </div>
              <div className="p-3 bg-cyan-100 rounded-lg">
                <Package className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">En Tránsito</p>
                <p className="text-2xl font-bold text-blue-600">{enTransito}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Completadas</p>
                <p className="text-2xl font-bold text-green-600">{completadas}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Valor Total</p>
                <p className="text-2xl font-bold text-slate-900">₡{valorTotal.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <MapPin className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por código, origen, destino o responsable..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              {["todos", "pendiente", "en-tránsito", "completada"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                  className={selectedFilter === filter ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1).replace("-", " ")}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Transferencias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTransferencias.map((transferencia) => (
            <div
              key={transferencia.id}
              className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-cyan-200"
            >
              <div className="space-y-4">
                {/* Header de la transferencia */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">{transferencia.id}</h3>
                    <p className="text-sm text-slate-600">{transferencia.fecha}</p>
                  </div>
                  <Badge className={`${getStatusColor(transferencia.estado)} flex items-center gap-1`}>
                    {getStatusIcon(transferencia.estado)}
                    {transferencia.estado}
                  </Badge>
                </div>

                {/* Ruta de transferencia */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Origen</p>
                    <p className="font-medium text-slate-900">{transferencia.origen}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Destino</p>
                    <p className="font-medium text-slate-900">{transferencia.destino}</p>
                  </div>
                </div>

                {/* Detalles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Productos</p>
                    <p className="font-semibold text-slate-900">{transferencia.productos} items</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wide">Valor</p>
                    <p className="font-semibold text-slate-900">₡{transferencia.valor.toLocaleString()}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Responsable</p>
                  <p className="font-medium text-slate-900">{transferencia.responsable}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Observaciones</p>
                  <p className="text-sm text-slate-700">{transferencia.observaciones}</p>
                </div>

                {/* Acciones */}
                <div className="flex gap-2 pt-2 border-t border-slate-100">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Ver Detalles
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    Editar
                  </Button>
                  {transferencia.estado === "En Tránsito" && (
                    <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                      Completar
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTransferencias.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron transferencias</h3>
            <p className="text-slate-600">Intenta ajustar los filtros de búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
