'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  ClipboardList, 
  Package, 
  Search, 
  FileText, 
  Wrench, 
  Truck, 
  AlertTriangle,
  TrendingUp
} from 'lucide-react'

// Importar componentes de informes
import { DashboardServiciosComponent } from '@/components/informes-servicios/dashboard-servicios'
import { InformeSolicitudesComponent } from '@/components/informes-servicios/informe-solicitudes'
import { InformeRecepcionComponent } from '@/components/informes-servicios/informe-recepcion'
import { InformeDiagnosticosComponent } from '@/components/informes-servicios/informe-diagnosticos'
import { InformePresupuestosComponent } from '@/components/informes-servicios/informe-presupuestos'
import { InformeOrdenesComponent } from '@/components/informes-servicios/informe-ordenes'
import { InformeRetiroComponent } from '@/components/informes-servicios/informe-retiro'
import { InformeReclamosComponent } from '@/components/informes-servicios/informe-reclamos'

export default function InformesServiciosPage() {
  const [activeTab, setActiveTab] = useState('dashboard') // 'dashboard', 'solicitudes', 'recepcion', etc.

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardServiciosComponent />
      case 'solicitudes':
        return <InformeSolicitudesComponent />
      case 'recepcion':
        return <InformeRecepcionComponent />
      case 'diagnosticos':
        return <InformeDiagnosticosComponent />
      case 'presupuestos':
        return <InformePresupuestosComponent />
      case 'ordenes':
        return <InformeOrdenesComponent />
      case 'retiro':
        return <InformeRetiroComponent />
      case 'reclamos':
        return <InformeReclamosComponent />
      default:
        return <DashboardServiciosComponent />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes de Servicios Técnicos</h1>
          <p className="text-gray-600 mt-2">
            Análisis y reportes completos del módulo de servicios técnicos
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <TrendingUp className="h-4 w-4" />
          <span>Última actualización: {new Date().toLocaleString('es-CR')}</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="solicitudes" className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" />
            <span className="hidden sm:inline">Solicitudes</span>
          </TabsTrigger>
          <TabsTrigger value="recepcion" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Recepción</span>
          </TabsTrigger>
          <TabsTrigger value="diagnosticos" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Diagnósticos</span>
          </TabsTrigger>
          <TabsTrigger value="presupuestos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Presupuestos</span>
          </TabsTrigger>
          <TabsTrigger value="ordenes" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">Órdenes</span>
          </TabsTrigger>
          <TabsTrigger value="retiro" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Retiro</span>
          </TabsTrigger>
          <TabsTrigger value="reclamos" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Reclamos</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab Content */}
        <div className="mt-6">
          <TabsContent value={activeTab} className="space-y-6">
            {renderContent()}
          </TabsContent>
        </div>
      </Tabs>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Solicitudes</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Solicitudes de servicio registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipos Recibidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Equipos recibidos para servicio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Órdenes Activas</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Órdenes de servicio en proceso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reclamos Pendientes</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Reclamos sin resolver
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}