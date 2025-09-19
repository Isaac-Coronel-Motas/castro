"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AppLayout } from "@/components/app-layout"
import { useAuth } from "@/contexts/auth-context"
import {
  Save,
  Building,
  Shield,
  Mail,
  Database,
  Globe,
} from "lucide-react"

export default function ConfiguracionPage() {
  const { token } = useAuth()
  const [configuraciones, setConfiguraciones] = useState<Record<string, any>>({})
  const [configIds, setConfigIds] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Cargar configuraciones al montar el componente
  useEffect(() => {
    loadConfiguraciones()
  }, [])

  const loadConfiguraciones = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/configuracion', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al cargar configuraciones')
      }

      const result = await response.json()
      
      if (result.success) {
        // Convertir array de configuraciones a objeto
        const configObj: Record<string, any> = {}
        const configIdsObj: Record<string, number> = {}
        result.data.forEach((config: any) => {
          configObj[config.clave] = config.valor
          configIdsObj[config.clave] = config.config_id
        })
        setConfiguraciones(configObj)
        setConfigIds(configIdsObj)
      } else {
        throw new Error(result.message || 'Error al cargar configuraciones')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Error al cargar configuraciones:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleConfigChange = (key: string, value: any) => {
    setConfiguraciones((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Preparar configuraciones para enviar
      const configsToSave = Object.entries(configuraciones).map(([clave, valor]) => ({
        config_id: configIds[clave],
        clave,
        valor,
        tipo: typeof valor === 'boolean' ? 'boolean' : 
              typeof valor === 'number' ? 'number' : 'string',
        categoria: getCategoriaByClave(clave),
        activo: true
      }))

      // Enviar cada configuración
      const promises = configsToSave.map(config => 
        fetch('/api/configuracion', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(config)
        })
      )

      const results = await Promise.allSettled(promises)
      
      // Verificar si alguna petición falló
      const failedRequests = results.filter(result => result.status === 'rejected')
      const failedResponses = results.filter(result => 
        result.status === 'fulfilled' && !result.value.ok
      )
      
      if (failedRequests.length > 0 || failedResponses.length > 0) {
        const errorMessages = []
        
        failedRequests.forEach((result: any) => {
          errorMessages.push(result.reason?.message || 'Error de red')
        })
        
        failedResponses.forEach(async (result: any) => {
          try {
            const errorData = await result.value.json()
            errorMessages.push(errorData.message || 'Error del servidor')
          } catch {
            errorMessages.push('Error del servidor')
          }
        })
        
        throw new Error(`Error al guardar configuraciones: ${errorMessages.join(', ')}`)
      }
      
      setSuccess('Configuraciones guardadas exitosamente')
      
      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => setSuccess(null), 3000)
      
    } catch (err: any) {
      setError(err.message || 'Error al guardar configuraciones')
      console.error('Error al guardar configuraciones:', err)
    } finally {
      setSaving(false)
    }
  }

  const getCategoriaByClave = (clave: string): string => {
    if (clave.includes('empresa') || clave.includes('sitio_web')) return 'general'
    if (clave.includes('timezone') || clave.includes('idioma') || clave.includes('formato') || clave.includes('moneda')) return 'sistema'
    if (clave.includes('password') || clave.includes('sesion') || clave.includes('login')) return 'seguridad'
    if (clave.includes('notificacion') || clave.includes('alerta')) return 'notificaciones'
    if (clave.includes('backup')) return 'backup'
    return 'general'
  }

  return (
    <AppLayout
      title="Configuración"
      subtitle="Configuración general del sistema y parámetros de funcionamiento"
      currentModule="Administración"
      currentSubmodule="/administracion/configuracion"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Configuraciones del Sistema</h2>
            <p className="text-gray-600">Ajusta los parámetros generales del sistema</p>
          </div>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700" disabled={saving || loading}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
        
        {/* Mensajes de estado */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando configuraciones...</div>
      ) : (
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
                  value={configuraciones.nombre_empresa || ''}
                  onChange={(e) => handleConfigChange("nombre_empresa", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="direccion">Dirección</Label>
                <Textarea
                  id="direccion"
                  value={configuraciones.direccion_empresa || ''}
                  onChange={(e) => handleConfigChange("direccion_empresa", e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={configuraciones.telefono_empresa || ''}
                    onChange={(e) => handleConfigChange("telefono_empresa", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={configuraciones.email_empresa || ''}
                    onChange={(e) => handleConfigChange("email_empresa", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sitioWeb">Sitio Web</Label>
                <Input
                  id="sitioWeb"
                  value={configuraciones.sitio_web || ''}
                  onChange={(e) => handleConfigChange("sitio_web", e.target.value)}
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
                  value={configuraciones.timezone || 'America/Montevideo'}
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
                    value={configuraciones.idioma || 'es'}
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
                    value={configuraciones.moneda || 'UYU'}
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
                  value={configuraciones.formato_fecha || 'DD/MM/YYYY'}
                  onValueChange={(value) => handleConfigChange("formato_fecha", value)}
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
                    value={configuraciones.longitud_min_password || 8}
                    onChange={(e) => handleConfigChange("longitud_min_password", Number.parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="tiempoSesion">Tiempo de Sesión (minutos)</Label>
                  <Input
                    id="tiempoSesion"
                    type="number"
                    min="5"
                    max="480"
                    value={configuraciones.tiempo_sesion || 30}
                    onChange={(e) => handleConfigChange("tiempo_sesion", Number.parseInt(e.target.value))}
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
                  value={configuraciones.intentos_max_login || 3}
                  onChange={(e) => handleConfigChange("intentos_max_login", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="requiereCaracteresEspeciales"
                  checked={configuraciones.requiere_caracteres_especiales || false}
                  onCheckedChange={(checked) => handleConfigChange("requiere_caracteres_especiales", checked)}
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
                  checked={configuraciones.notificaciones_email || false}
                  onCheckedChange={(checked) => handleConfigChange("notificaciones_email", checked)}
                />
                <Label htmlFor="notificacionesEmail">Notificaciones por Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="notificacionesSistema"
                  checked={configuraciones.notificaciones_sistema || false}
                  onCheckedChange={(checked) => handleConfigChange("notificaciones_sistema", checked)}
                />
                <Label htmlFor="notificacionesSistema">Notificaciones del Sistema</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="alertasStock"
                  checked={configuraciones.alertas_stock || false}
                  onCheckedChange={(checked) => handleConfigChange("alertas_stock", checked)}
                />
                <Label htmlFor="alertasStock">Alertas de Stock Bajo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="alertasVencimiento"
                  checked={configuraciones.alertas_vencimiento || false}
                  onCheckedChange={(checked) => handleConfigChange("alertas_vencimiento", checked)}
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
                    checked={configuraciones.backup_automatico || false}
                    onCheckedChange={(checked) => handleConfigChange("backup_automatico", checked)}
                  />
                  <Label htmlFor="backupAutomatico">Backup Automático</Label>
                </div>
                <div>
                  <Label htmlFor="frecuenciaBackup">Frecuencia</Label>
                  <Select
                    value={configuraciones.frecuencia_backup || 'diario'}
                    onValueChange={(value) => handleConfigChange("frecuencia_backup", value)}
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
                    value={configuraciones.hora_backup || '02:00'}
                    onChange={(e) => handleConfigChange("hora_backup", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="retencionBackup">Retención (días)</Label>
                  <Input
                    id="retencionBackup"
                    type="number"
                    min="7"
                    max="365"
                    value={configuraciones.retencion_backup || 30}
                    onChange={(e) => handleConfigChange("retencion_backup", Number.parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  )
}
