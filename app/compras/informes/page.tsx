"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Download, Calendar, Filter, FileText, PieChart, Users, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function InformesComprasPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes")

  // Datos de ejemplo para informes
  const gastosData = [
    { mes: "Ene", gasto: 2500000, presupuesto: 3000000 },
    { mes: "Feb", gasto: 2800000, presupuesto: 3000000 },
    { mes: "Mar", gasto: 3200000, presupuesto: 3000000 },
    { mes: "Abr", gasto: 2900000, presupuesto: 3000000 },
    { mes: "May", gasto: 2600000, presupuesto: 3000000 },
    { mes: "Jun", gasto: 3100000, presupuesto: 3000000 },
  ]

  const topProveedores = [
    { nombre: "Distribuidora Tech SA", gasto: 1250000, pedidos: 15, categoria: "Componentes" },
    { nombre: "Electrónica Central", gasto: 980000, pedidos: 12, categoria: "Accesorios" },
    { nombre: "Componentes del Este", gasto: 750000, pedidos: 8, categoria: "Repuestos" },
    { nombre: "TechParts Import", gasto: 650000, pedidos: 10, categoria: "Herramientas" },
  ]

  const categorias = [
    { nombre: "Componentes", gasto: 1800000, porcentaje: 35, color: "bg-cyan-500" },
    { nombre: "Accesorios", gasto: 1200000, porcentaje: 23, color: "bg-blue-500" },
    { nombre: "Repuestos", gasto: 1000000, porcentaje: 19, color: "bg-green-500" },
    { nombre: "Herramientas", gasto: 800000, porcentaje: 15, color: "bg-amber-500" },
    { nombre: "Otros", gasto: 400000, porcentaje: 8, color: "bg-slate-500" },
  ]

  const reportesDisponibles = [
    {
      titulo: "Reporte de Gastos Mensual",
      descripcion: "Análisis detallado de gastos por mes y categoría",
      icono: <BarChart3 className="w-5 h-5" />,
      tipo: "PDF",
    },
    {
      titulo: "Análisis de Proveedores",
      descripcion: "Rendimiento y evaluación de proveedores",
      icono: <Users className="w-5 h-5" />,
      tipo: "Excel",
    },
    {
      titulo: "Inventario vs Compras",
      descripcion: "Relación entre compras y movimientos de inventario",
      icono: <Package className="w-5 h-5" />,
      tipo: "PDF",
    },
    {
      titulo: "Tendencias de Compra",
      descripcion: "Análisis de tendencias y proyecciones",
      icono: <TrendingUp className="w-5 h-5" />,
      tipo: "Excel",
    },
  ]

  const totalGastos = gastosData.reduce((sum, item) => sum + item.gasto, 0)
  const presupuestoTotal = gastosData.reduce((sum, item) => sum + item.presupuesto, 0)
  const utilizacionPresupuesto = ((totalGastos / presupuestoTotal) * 100).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Informes de Compras</h1>
            <p className="text-slate-600 mt-1">Análisis y reportes del módulo de compras</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="bg-white">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg">
              <Download className="w-4 h-4 mr-2" />
              Exportar Todo
            </Button>
          </div>
        </div>

        {/* Selector de Período */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-slate-600" />
            <span className="font-medium text-slate-900">Período de análisis:</span>
            <div className="flex gap-2">
              {["semana", "mes", "trimestre", "año"].map((period) => (
                <Button
                  key={period}
                  variant={selectedPeriod === period ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPeriod(period)}
                  className={selectedPeriod === period ? "bg-cyan-600 hover:bg-cyan-700" : ""}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Métricas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Total Gastado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">₡{totalGastos.toLocaleString()}</p>
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+12% vs mes anterior</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Utilización Presupuesto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">{utilizacionPresupuesto}%</p>
                <div className="p-2 bg-amber-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-amber-600" />
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${utilizacionPresupuesto}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Proveedores Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">{topProveedores.length}</p>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">En este período</p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Órdenes Procesadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-slate-900">45</p>
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-green-600 mt-2">+8% vs mes anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gastos vs Presupuesto */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-cyan-600" />
                Gastos vs Presupuesto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {gastosData.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{item.mes}</span>
                      <span className="text-slate-600">
                        ₡{item.gasto.toLocaleString()} / ₡{item.presupuesto.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.gasto > item.presupuesto ? "bg-red-500" : "bg-cyan-500"
                        }`}
                        style={{ width: `${Math.min((item.gasto / item.presupuesto) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top Proveedores */}
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Top Proveedores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProveedores.map((proveedor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">{proveedor.nombre}</p>
                      <p className="text-sm text-slate-600">{proveedor.pedidos} pedidos</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₡{proveedor.gasto.toLocaleString()}</p>
                      <Badge variant="outline" className="text-xs">
                        {proveedor.categoria}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribución por Categorías */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-green-600" />
              Distribución por Categorías
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {categorias.map((categoria, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="w-full h-full bg-slate-200 rounded-full"></div>
                    <div
                      className={`absolute inset-0 ${categoria.color} rounded-full transition-all duration-300`}
                      style={{
                        background: `conic-gradient(${categoria.color.replace("bg-", "")} ${
                          categoria.porcentaje * 3.6
                        }deg, #e2e8f0 0deg)`,
                      }}
                    ></div>
                    <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-slate-900">{categoria.porcentaje}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{categoria.nombre}</p>
                    <p className="text-sm text-slate-600">₡{categoria.gasto.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reportes Disponibles */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-600" />
              Reportes Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportesDisponibles.map((reporte, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:border-cyan-200 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">{reporte.icono}</div>
                    <div>
                      <p className="font-medium text-slate-900">{reporte.titulo}</p>
                      <p className="text-sm text-slate-600">{reporte.descripcion}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{reporte.tipo}</Badge>
                    <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700">
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
