"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/contexts/auth-context"
import {
  Wrench,
  LayoutDashboard,
  ShoppingCart,
  Settings,
  Receipt,
  FileText,
  Users,
  Search,
  Bell,
  ChevronRight,
  ChevronDown,
  Save,
  Building,
  Shield,
  Mail,
  Database,
  Globe,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", active: false },
  {
    icon: ShoppingCart,
    label: "Compras",
    active: false,
    submenu: [
      { label: "Pedidos de Compra", href: "/compras/pedidos-de-compra", active: false },
      { label: "Presupuestos Proveedor", href: "/compras/presupuestos", active: false },
      { label: "Órdenes de Compra", href: "/compras/ordenes", active: false },
      { label: "Registro de Compras", href: "/compras/registro", active: false },
      { label: "Ajustes de Inventario", href: "/compras/ajustes", active: false },
      { label: "Notas de Crédito/Débito", href: "/compras/notas", active: false },
      { label: "Transferencias", href: "/compras/transferencias", active: false },
      { label: "Informes", href: "/compras/informes", active: false },
    ],
  },
  {
    icon: Settings,
    label: "Servicios Técnicos",
    active: false,
    submenu: [
      { label: "Solicitudes de Cliente", href: "/servicios/solicitudes-de-cliente", active: false },
      { label: "Recepción de Equipos", href: "/servicios/recepcion-equipos", active: false },
      { label: "Diagnósticos", href: "/servicios/diagnosticos", active: false },
      { label: "Presupuestos", href: "/servicios/presupuestos", active: false },
      { label: "Órdenes de Servicio", href: "/servicios/ordenes-servicio", active: false },
      { label: "Retiro de Equipos", href: "/servicios/retiro-equipos", active: false },
      { label: "Reclamos", href: "/servicios/reclamos", active: false },
      { label: "Informes", href: "/servicios/informes", active: false },
    ],
  },
  {
    icon: Receipt,
    label: "Ventas",
    active: false,
    submenu: [
      { label: "Apertura/Cierre Caja", href: "/ventas/apertura-cierre-caja", active: false },
      { label: "Pedidos de Clientes", href: "/ventas/pedidos-clientes", active: false },
      { label: "Registro de Ventas", href: "/ventas/registro-ventas", active: false },
      { label: "Cobros", href: "/ventas/cobros", active: false },
      { label: "Presupuestos", href: "/ventas/presupuestos", active: false },
      { label: "Notas de Remisión", href: "/ventas/notas-remision", active: false },
      { label: "Notas de Crédito/Débito", href: "/ventas/notas-credito-debito", active: false },
      { label: "Informes", href: "/ventas/informes", active: false },
    ],
  },
  {
    icon: FileText,
    label: "Referencias",
    active: false,
    submenu: [
      { label: "Proveedores", href: "/referencias/proveedores", active: false },
      { label: "Productos", href: "/referencias/productos", active: false },
      { label: "Categorías", href: "/referencias/categorias", active: false },
      { label: "Clientes", href: "/referencias/clientes", active: false },
      { label: "Marcas", href: "/referencias/marcas", active: false },
      { label: "Tipos de Servicio", href: "/referencias/tipos-servicio", active: false },
    ],
  },
  {
    icon: Users,
    label: "Administración",
    active: true,
    submenu: [
      { label: "Usuarios", href: "/administracion/usuarios", active: false },
      { label: "Roles y Permisos", href: "/administracion/roles-permisos", active: false },
      { label: "Auditoría", href: "/administracion/auditoria", active: false },
      { label: "Configuración", href: "/administracion/configuracion", active: true },
    ],
  },
]

export default function ConfiguracionPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Compras: false,
    "Servicios Técnicos": false,
    Ventas: false,
    Referencias: false,
    Administración: true,
  })
  const router = useRouter()

  // Estados para las configuraciones
  const [configuraciones, setConfiguraciones] = useState({
    // Configuración General
    nombreEmpresa: "Taller de Electrónica & Informática Jaime Castro E Hijos",
    direccion: "Av. Principal 123, Ciudad",
    telefono: "0981234567",
    email: "info@tallercastro.com",
    sitioWeb: "www.tallercastro.com",

    // Configuración de Sistema
    timezone: "America/Montevideo",
    idioma: "es",
    formatoFecha: "DD/MM/YYYY",
    moneda: "UYU",

    // Configuración de Seguridad
    longitudMinPassword: 8,
    requiereCaracteresEspeciales: true,
    tiempoSesion: 30,
    intentosMaxLogin: 3,

    // Configuración de Notificaciones
    notificacionesEmail: true,
    notificacionesSistema: true,
    alertasStock: true,
    alertasVencimiento: true,

    // Configuración de Backup
    backupAutomatico: true,
    frecuenciaBackup: "diario",
    horaBackup: "02:00",
    retencionBackup: 30,
  })

  const toggleSubmenu = (label: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }))
  }

  const navigateTo = (href: string) => {
    router.push(href)
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfiguraciones((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = () => {
    // Aquí se guardarían las configuraciones
    console.log("Guardando configuraciones:", configuraciones)
    // Mostrar mensaje de éxito
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={cn("bg-slate-800 text-white transition-all duration-300", sidebarOpen ? "w-64" : "w-16")}>
          {/* Logo */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg">
                <Wrench className="h-6 w-6 text-slate-800" />
              </div>
              {sidebarOpen && (
                <div>
                  <h2 className="font-bold text-sm">Taller Castro</h2>
                  <p className="text-xs text-slate-300">Sistema de Gestión</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item, index) => (
                <li key={index}>
                  <div>
                    <button
                      onClick={() => {
                        if (item.submenu) {
                          toggleSubmenu(item.label)
                        } else if (item.href) {
                          navigateTo(item.href)
                        }
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                        item.active ? "bg-slate-700 text-white" : "text-slate-300 hover:bg-slate-700 hover:text-white",
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {sidebarOpen && (
                        <>
                          <span className="text-sm">{item.label}</span>
                          {item.submenu ? (
                            expandedMenus[item.label] ? (
                              <ChevronDown className="h-4 w-4 ml-auto" />
                            ) : (
                              <ChevronRight className="h-4 w-4 ml-auto" />
                            )
                          ) : (
                            <ChevronRight className="h-4 w-4 ml-auto" />
                          )}
                        </>
                      )}
                    </button>

                    {item.submenu && expandedMenus[item.label] && sidebarOpen && (
                      <ul className="mt-2 ml-6 space-y-1">
                        {item.submenu.map((subItem, subIndex) => (
                          <li key={subIndex}>
                            <button
                              onClick={() => navigateTo(subItem.href)}
                              className={cn(
                                "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors text-xs",
                                subItem.active
                                  ? "bg-slate-600 text-white"
                                  : "text-slate-400 hover:bg-slate-600 hover:text-white",
                              )}
                            >
                              <span>{subItem.label}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>

          {sidebarOpen && (
            <div className="absolute bottom-4 left-4 right-4">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full text-white border-slate-600 hover:bg-slate-700 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input placeholder="Buscar pedidos, clientes, productos..." className="pl-10 w-80" />
                </div>
              </div>

              {/* User Profile */}
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-600 text-white">
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <p className="font-medium">{user?.username || "Usuario"}</p>
                    <p className="text-gray-500">{user?.role || "Usuario"}</p>
                  </div>
                </div>
                <Button onClick={logout} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
                <p className="text-gray-600">Configuración general del sistema y parámetros de funcionamiento</p>
              </div>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Configuración General */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Configuración General
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="nombreEmpresa">Nombre de la Empresa</Label>
                    <Input
                      id="nombreEmpresa"
                      value={configuraciones.nombreEmpresa}
                      onChange={(e) => handleConfigChange("nombreEmpresa", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="direccion">Dirección</Label>
                    <Textarea
                      id="direccion"
                      value={configuraciones.direccion}
                      onChange={(e) => handleConfigChange("direccion", e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        value={configuraciones.telefono}
                        onChange={(e) => handleConfigChange("telefono", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={configuraciones.email}
                        onChange={(e) => handleConfigChange("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="sitioWeb">Sitio Web</Label>
                    <Input
                      id="sitioWeb"
                      value={configuraciones.sitioWeb}
                      onChange={(e) => handleConfigChange("sitioWeb", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Configuración de Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select
                      value={configuraciones.timezone}
                      onValueChange={(value) => handleConfigChange("timezone", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Montevideo">America/Montevideo (UTC-3)</SelectItem>
                        <SelectItem value="America/Buenos_Aires">America/Buenos_Aires (UTC-3)</SelectItem>
                        <SelectItem value="America/Sao_Paulo">America/Sao_Paulo (UTC-3)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="idioma">Idioma</Label>
                      <Select
                        value={configuraciones.idioma}
                        onValueChange={(value) => handleConfigChange("idioma", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="pt">Português</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="moneda">Moneda</Label>
                      <Select
                        value={configuraciones.moneda}
                        onValueChange={(value) => handleConfigChange("moneda", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UYU">Peso Uruguayo (UYU)</SelectItem>
                          <SelectItem value="USD">Dólar (USD)</SelectItem>
                          <SelectItem value="EUR">Euro (EUR)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="formatoFecha">Formato de Fecha</Label>
                    <Select
                      value={configuraciones.formatoFecha}
                      onValueChange={(value) => handleConfigChange("formatoFecha", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Seguridad */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Configuración de Seguridad
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="longitudMinPassword">Longitud Mínima de Contraseña</Label>
                      <Input
                        id="longitudMinPassword"
                        type="number"
                        min="6"
                        max="20"
                        value={configuraciones.longitudMinPassword}
                        onChange={(e) => handleConfigChange("longitudMinPassword", Number.parseInt(e.target.value))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tiempoSesion">Tiempo de Sesión (minutos)</Label>
                      <Input
                        id="tiempoSesion"
                        type="number"
                        min="5"
                        max="480"
                        value={configuraciones.tiempoSesion}
                        onChange={(e) => handleConfigChange("tiempoSesion", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="intentosMaxLogin">Intentos Máximos de Login</Label>
                    <Input
                      id="intentosMaxLogin"
                      type="number"
                      min="3"
                      max="10"
                      value={configuraciones.intentosMaxLogin}
                      onChange={(e) => handleConfigChange("intentosMaxLogin", Number.parseInt(e.target.value))}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiereCaracteresEspeciales"
                      checked={configuraciones.requiereCaracteresEspeciales}
                      onCheckedChange={(checked) => handleConfigChange("requiereCaracteresEspeciales", checked)}
                    />
                    <Label htmlFor="requiereCaracteresEspeciales">Requerir caracteres especiales en contraseñas</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Notificaciones */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Configuración de Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificacionesEmail"
                      checked={configuraciones.notificacionesEmail}
                      onCheckedChange={(checked) => handleConfigChange("notificacionesEmail", checked)}
                    />
                    <Label htmlFor="notificacionesEmail">Notificaciones por Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="notificacionesSistema"
                      checked={configuraciones.notificacionesSistema}
                      onCheckedChange={(checked) => handleConfigChange("notificacionesSistema", checked)}
                    />
                    <Label htmlFor="notificacionesSistema">Notificaciones del Sistema</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alertasStock"
                      checked={configuraciones.alertasStock}
                      onCheckedChange={(checked) => handleConfigChange("alertasStock", checked)}
                    />
                    <Label htmlFor="alertasStock">Alertas de Stock Bajo</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="alertasVencimiento"
                      checked={configuraciones.alertasVencimiento}
                      onCheckedChange={(checked) => handleConfigChange("alertasVencimiento", checked)}
                    />
                    <Label htmlFor="alertasVencimiento">Alertas de Vencimiento</Label>
                  </div>
                </CardContent>
              </Card>

              {/* Configuración de Backup */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Configuración de Backup
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="backupAutomatico"
                        checked={configuraciones.backupAutomatico}
                        onCheckedChange={(checked) => handleConfigChange("backupAutomatico", checked)}
                      />
                      <Label htmlFor="backupAutomatico">Backup Automático</Label>
                    </div>
                    <div>
                      <Label htmlFor="frecuenciaBackup">Frecuencia</Label>
                      <Select
                        value={configuraciones.frecuenciaBackup}
                        onValueChange={(value) => handleConfigChange("frecuenciaBackup", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="diario">Diario</SelectItem>
                          <SelectItem value="semanal">Semanal</SelectItem>
                          <SelectItem value="mensual">Mensual</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="horaBackup">Hora de Backup</Label>
                      <Input
                        id="horaBackup"
                        type="time"
                        value={configuraciones.horaBackup}
                        onChange={(e) => handleConfigChange("horaBackup", e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="retencionBackup">Retención (días)</Label>
                      <Input
                        id="retencionBackup"
                        type="number"
                        min="7"
                        max="365"
                        value={configuraciones.retencionBackup}
                        onChange={(e) => handleConfigChange("retencionBackup", Number.parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
