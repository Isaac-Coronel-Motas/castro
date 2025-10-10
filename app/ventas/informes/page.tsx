'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  FileText, 
  TrendingUp, 
  CreditCard, 
  Receipt, 
  Package, 
  FileX, 
  Calculator,
  ShoppingCart,
  Users,
  Building,
  AlertCircle
} from 'lucide-react'

// Importar componentes de informes
import DashboardVentasComponent from '@/components/informes-ventas/dashboard-ventas'
import InformePedidosComponent from '@/components/informes-ventas/informe-pedidos'
import InformeVentasComponent from '@/components/informes-ventas/informe-ventas'
import InformeCobrosComponent from '@/components/informes-ventas/informe-cobros'
import InformePresupuestosComponent from '@/components/informes-ventas/informe-presupuestos'
import InformeRemisionesComponent from '@/components/informes-ventas/informe-remisiones'
import InformeNotasComponent from '@/components/informes-ventas/informe-notas'
import InformeCajasComponent from '@/components/informes-ventas/informe-cajas'

export default function InformesVentasPage() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardVentasComponent />
      case 'pedidos':
        return <InformePedidosComponent />
      case 'ventas':
        return <InformeVentasComponent />
      case 'cobros':
        return <InformeCobrosComponent />
      case 'presupuestos':
        return <InformePresupuestosComponent />
      case 'remisiones':
        return <InformeRemisionesComponent />
      case 'notas':
        return <InformeNotasComponent />
      case 'cajas':
        return <InformeCajasComponent />
      default:
        return <DashboardVentasComponent />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Informes de Ventas</h1>
          <p className="text-gray-600 mt-2">
            Análisis y reportes completos del módulo de ventas
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
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Pedidos</span>
          </TabsTrigger>
          <TabsTrigger value="ventas" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Ventas</span>
          </TabsTrigger>
          <TabsTrigger value="cobros" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Cobros</span>
          </TabsTrigger>
          <TabsTrigger value="presupuestos" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">Presupuestos</span>
          </TabsTrigger>
          <TabsTrigger value="remisiones" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="hidden sm:inline">Remisiones</span>
          </TabsTrigger>
          <TabsTrigger value="notas" className="flex items-center gap-2">
            <FileX className="h-4 w-4" />
            <span className="hidden sm:inline">Notas</span>
          </TabsTrigger>
          <TabsTrigger value="cajas" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Cajas</span>
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
            <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Ventas registradas en el período
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Pedidos de clientes pendientes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cobros Realizados</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Cobros procesados exitosamente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cajas Activas</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              Cajas registradoras operativas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}