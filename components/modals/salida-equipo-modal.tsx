"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/contexts/auth-context"
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { SalidaEquipo, CreateSalidaEquipoRequest, UpdateSalidaEquipoRequest } from "@/lib/types/servicios-tecnicos"
import { PackageCheck, Calendar, User, Building, Phone, MapPin, Truck, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface SalidaEquipoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateSalidaEquipoRequest | UpdateSalidaEquipoRequest) => Promise<void>
  salida?: SalidaEquipo | null
  mode: 'create' | 'edit' | 'view'
}

export function SalidaEquipoModal({ isOpen, onClose, onSave, salida, mode }: SalidaEquipoModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateSalidaEquipoRequest>({
    recepcion_id: 0,
    entregado_por: user?.usuario_id || 0,
    retirado_por: '',
    documento_entrega: '',
    observaciones: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [recepciones, setRecepciones] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (salida && mode !== 'create') {
        setFormData({
          recepcion_id: salida.recepcion_id || 0,
          entregado_por: salida.entregado_por || user?.usuario_id || 0,
          retirado_por: salida.retirado_por || '',
          documento_entrega: salida.documento_entrega || '',
          observaciones: salida.observaciones || ''
        })
      }
    }
  }, [isOpen, salida, mode, user])

  const loadInitialData = async () => {
    try {
      // Cargar recepciones procesadas (listas para retiro)
      const recepcionesRes = await authenticatedFetch('/api/servicios/recepcion-equipos?estado_recepcion=Recepcionada')
      const recepcionesData = await recepcionesRes.json()
      if (recepcionesData.success) {
        setRecepciones(recepcionesData.data)
      }

      // Cargar usuarios
      const usuariosRes = await authenticatedFetch('/api/usuarios')
      const usuariosData = await usuariosRes.json()
      if (usuariosData.success) {
        setUsuarios(usuariosData.data)
      }
    } catch (error) {
      console.error('Error cargando datos iniciales:', error)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.recepcion_id || formData.recepcion_id === 0) {
      newErrors.recepcion_id = 'La recepción es requerida'
    }

    if (!formData.entregado_por || formData.entregado_por === 0) {
      newErrors.entregado_por = 'El usuario que entrega es requerido'
    }

    if (!formData.retirado_por || formData.retirado_por.trim() === '') {
      newErrors.retirado_por = 'El nombre de quien retira es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const dataToSave = mode === 'create' 
        ? formData 
        : { ...formData, salida_equipo_id: salida?.salida_equipo_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando salida de equipo:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRecepcionInfo = (recepcionId: number) => {
    const recepcion = recepciones.find(r => r.recepcion_id === recepcionId)
    return recepcion ? `${recepcion.nro_recepcion} - ${recepcion.cliente_nombre}` : 'Seleccionar recepción'
  }

  const getUsuarioInfo = (usuarioId: number) => {
    const usuario = usuarios.find(u => u.usuario_id === usuarioId)
    return usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Seleccionar usuario'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nuevo Retiro de Equipo' : 
               mode === 'edit' ? 'Editar Retiro de Equipo' : 
               'Ver Retiro de Equipo'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Retiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackageCheck className="h-5 w-5" />
                  Información del Retiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recepcion_id">Recepción de Equipo</Label>
                  <Select
                    value={formData.recepcion_id?.toString()}
                    onValueChange={(value) => handleInputChange('recepcion_id', parseInt(value))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className={errors.recepcion_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar recepción">
                        {formData.recepcion_id ? getRecepcionInfo(formData.recepcion_id) : 'Seleccionar recepción'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {recepciones.map((recepcion) => (
                        <SelectItem key={recepcion.recepcion_id} value={recepcion.recepcion_id.toString()}>
                          {recepcion.nro_recepcion} - {recepcion.cliente_nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.recepcion_id && (
                    <p className="text-sm text-red-500">{errors.recepcion_id}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="entregado_por">Entregado por</Label>
                  <Select
                    value={formData.entregado_por?.toString()}
                    onValueChange={(value) => handleInputChange('entregado_por', parseInt(value))}
                    disabled={mode === 'view'}
                  >
                    <SelectTrigger className={errors.entregado_por ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Seleccionar usuario">
                        {formData.entregado_por ? getUsuarioInfo(formData.entregado_por) : 'Seleccionar usuario'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario.usuario_id} value={usuario.usuario_id.toString()}>
                          {usuario.nombre} {usuario.apellido}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.entregado_por && (
                    <p className="text-sm text-red-500">{errors.entregado_por}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retirado_por">Retirado por</Label>
                  <Input
                    id="retirado_por"
                    type="text"
                    value={formData.retirado_por || ''}
                    onChange={(e) => handleInputChange('retirado_por', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Nombre completo de quien retira el equipo"
                    className={errors.retirado_por ? 'border-red-500' : ''}
                  />
                  {errors.retirado_por && (
                    <p className="text-sm text-red-500">{errors.retirado_por}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documento_entrega">Documento de Entrega</Label>
                  <Input
                    id="documento_entrega"
                    type="text"
                    value={formData.documento_entrega || ''}
                    onChange={(e) => handleInputChange('documento_entrega', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="DNI, Cédula, Pasaporte, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Observaciones sobre el retiro del equipo..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Información de la Recepción Seleccionada */}
            {formData.recepcion_id && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Información de la Recepción
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const recepcion = recepciones.find(r => r.recepcion_id === formData.recepcion_id)
                    if (!recepcion) return null
                    
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Número de Recepción</p>
                          <p className="font-medium">{recepcion.nro_recepcion}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Cliente</p>
                          <p className="font-medium">{recepcion.cliente_nombre}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Fecha de Recepción</p>
                          <p className="font-medium">
                            {new Date(recepcion.fecha_recepcion).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Estado</p>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            {recepcion.estado_recepcion}
                          </Badge>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}

            {/* Botones de Acción */}
            {mode !== 'view' && (
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar Retiro'}
                </Button>
              </div>
            )}

            {mode === 'view' && (
              <div className="flex justify-end">
                <Button type="button" onClick={onClose}>
                  Cerrar
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}