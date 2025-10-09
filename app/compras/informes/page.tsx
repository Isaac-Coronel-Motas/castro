"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppLayout } from "@/components/app-layout"
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  FileText, 
  Users, 
  Building,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Filter,
  Download as DownloadIcon,
  Printer
} from "lucide-react"

// Componentes de informes específicos
import { InformePedidosComponent } from "@/components/informes/informe-pedidos"
import { InformePresupuestosComponent } from "@/components/informes/informe-presupuestos"
import { InformeOrdenesComponent } from "@/components/informes/informe-ordenes"
import { InformeRegistroComponent } from "@/components/informes/informe-registro"
import { InformeAjustesComponent } from "@/components/informes/informe-ajustes"
import { InformeNotasComponent } from "@/components/informes/informe-notas"
import { InformeTransferenciasComponent } from "@/components/informes/informe-transferencias"
import { DashboardComprasComponent } from "@/components/informes/dashboard-compras"

export default function InformesComprasPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [loading, setLoading] = useState(false)

  const tabs = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Vista general consolidada"
    },
    {
      id: "pedidos",
      label: "Pedidos de Compra",
      icon: ShoppingCart,
      description: "Análisis de pedidos de compra"
    },
    {
      id: "presupuestos",
      label: "Presupuestos Proveedor",
      icon: FileText,
      description: "Análisis de presupuestos"
    },
    {
      id: "ordenes",
      label: "Órdenes de Compra",
      icon: Package,
      description: "Análisis de órdenes de compra"
    },
    {
      id: "registro",
      label: "Registro de Compras",
      icon: DollarSign,
      description: "Análisis de compras registradas"
    },
    {
      id: "ajustes",
      label: "Ajustes de Inventario",
      icon: Settings,
      description: "Análisis de ajustes de inventario"
    },
    {
      id: "notas",
      label: "Notas Crédito/Débito",
      icon: FileText,
      description: "Análisis de notas de crédito y débito"
    },
    {
      id: "transferencias",
      label: "Transferencias",
      icon: Package,
      description: "Análisis de transferencias de stock"
    }
  ]

  const handleExportAll = () => {
    console.log('Exportar todos los informes')
    // Implementar exportación masiva
  }

  const handlePrintAll = () => {
    console.log('Imprimir todos los informes')
    // Implementar impresión masiva
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Informes de Compras</h1>
            <p className="text-muted-foreground">
              Análisis detallado y reportes de todos los módulos de compras
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportAll} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Exportar Todo
            </Button>
            <Button 
              onClick={handlePrintAll} 
              variant="outline"
              className="flex items-center gap-2"
            >
              <Printer className="h-4 w-4" />
              Imprimir Todo
            </Button>
          </div>
        </div>

        {/* Información de módulos disponibles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Módulos Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tabs.map((tab) => {
                const IconComponent = tab.icon
                return (
                  <div
                    key={tab.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      activeTab === tab.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activeTab === tab.id 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{tab.label}</h3>
                        <p className="text-xs text-muted-foreground">{tab.description}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tabs de informes */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
            {tabs.map((tab) => {
              const IconComponent = tab.icon
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {/* Dashboard Consolidado */}
          <TabsContent value="dashboard">
            <DashboardComprasComponent />
          </TabsContent>

          {/* Informe de Pedidos */}
          <TabsContent value="pedidos">
            <InformePedidosComponent />
          </TabsContent>

          {/* Informe de Presupuestos */}
          <TabsContent value="presupuestos">
            <InformePresupuestosComponent />
          </TabsContent>

          {/* Informe de Órdenes */}
          <TabsContent value="ordenes">
            <InformeOrdenesComponent />
          </TabsContent>

          {/* Informe de Registro */}
          <TabsContent value="registro">
            <InformeRegistroComponent />
          </TabsContent>

          {/* Informe de Ajustes */}
          <TabsContent value="ajustes">
            <InformeAjustesComponent />
          </TabsContent>

          {/* Informe de Notas */}
          <TabsContent value="notas">
            <InformeNotasComponent />
          </TabsContent>

          {/* Informe de Transferencias */}
          <TabsContent value="transferencias">
            <InformeTransferenciasComponent />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}