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
import { RecepcionEquipo, CreateRecepcionEquipoRequest, UpdateRecepcionEquipoRequest, RecepcionEquipoDetalle } from "@/lib/types/servicios-tecnicos"
import { Package, Calendar, User, Building, Plus, Trash2, Wrench, CheckCircle } from "lucide-react"

interface RecepcionEquipoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateRecepcionEquipoRequest | UpdateRecepcionEquipoRequest) => Promise<void>
  recepcion?: RecepcionEquipo | null
  mode: 'create' | 'edit' | 'view'
}

export function RecepcionEquipoModal({ isOpen, onClose, onSave, recepcion, mode }: RecepcionEquipoModalProps) {
  const { user } = useAuth()
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateRecepcionEquipoRequest>({
    usuario_id: user?.usuario_id || 0,
    sucursal_id: 0,
    estado_recepcion: 'En revisión',
    observaciones: '',
    solicitud_id: 0,
    equipos: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [sucursales, setSucursales] = useState<any[]>([])
  const [equipos, setEquipos] = useState<any[]>([])
  const [solicitudes, setSolicitudes] = useState<any[]>([])
  const [usuarios, setUsuarios] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (recepcion && mode !== 'create') {
        setFormData({
          usuario_id: recepcion.usuario_id,
          sucursal_id: recepcion.sucursal_id,
          estado_recepcion: recepcion.estado_recepcion,
          observaciones: recepcion.observaciones || '',
          solicitud_id: recepcion.solicitud_id || 0,
          equipos: recepcion.equipos?.map(e => ({
            equipo_id: e.equipo_id,
            cantidad: e.cantidad,
            observaciones: e.observaciones || ''
          })) || []
        })
      }
    }
  }, [isOpen, recepcion, mode])

  const loadInitialData = async () => {
    try {
      // Cargar sucursales
      const sucursalesRes = await authenticatedFetch('/api/sucursales')
      const sucursalesData = await sucursalesRes.json()
      if (sucursalesData.success) {
        setSucursales(sucursalesData.data)
      }

      // Cargar equipos
      const equiposRes = await authenticatedFetch('/api/referencias/equipos')
      const equiposData = await equiposRes.json()
      if (equiposData.success) {
        setEquipos(equiposData.data)
      }

      // Cargar solicitudes pendientes
      const solicitudesRes = await authenticatedFetch('/api/servicios/solicitudes?estado_solicitud=Pendiente')
      const solicitudesData = await solicitudesRes.json()
      if (solicitudesData.success) {
        setSolicitudes(solicitudesData.data)
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

  const handleEquipoChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      equipos: prev.equipos?.map((equipo, i) => 
        i === index ? { ...equipo, [field]: value } : equipo
      ) || []
    }))
  }

  const addEquipo = () => {
    setFormData(prev => ({
      ...prev,
      equipos: [
        ...(prev.equipos || []),
        {
          equipo_id: 0,
          cantidad: 1,
          observaciones: ''
        }
      ]
    }))
  }

  const removeEquipo = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipos: prev.equipos?.filter((_, i) => i !== index) || []
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {}

    if (!formData.usuario_id) {
      newErrors.usuario_id = 'El usuario es requerido'
    }

    if (!formData.sucursal_id) {
      newErrors.sucursal_id = 'La sucursal es requerida'
    }

    if (!formData.equipos || formData.equipos.length === 0) {
      newErrors.equipos = 'Debe agregar al menos un equipo'
    }

    formData.equipos?.forEach((equipo, index) => {
      if (!equipo.equipo_id) {
        newErrors[`equipo_${index}_equipo`] = 'El equipo es requerido'
      }
      if (!equipo.cantidad || equipo.cantidad <= 0) {
        newErrors[`equipo_${index}_cantidad`] = 'La cantidad debe ser mayor a 0'
      }
    })

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
        : { ...formData, recepcion_id: recepcion?.recepcion_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando recepción:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateTotalEquipos = () => {
    return formData.equipos?.length || 0
  }

  const calculateTotalCantidad = () => {
    return formData.equipos?.reduce((total, equipo) => total + (equipo.cantidad || 0), 0) || 0
  }

  const getEstadoColor = (estado: string) => {
    const colores: { [key: string]: string } = {
      'En revisión': 'bg-secondary text-secondary-foreground',
      'Cancelada': 'bg-destructive text-destructive-foreground',
      'Recepcionada': 'bg-green-500 text-white'
    }
    return colores[estado] || 'bg-muted text-muted-foreground'
  }

  const getEstadoLabel = (estado: string) => {
    return estado
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              {mode === 'create' ? 'Nueva Recepción de Equipos' : 
               mode === 'edit' ? 'Editar Recepción de Equipos' : 
               'Ver Recepción de Equipos'}
            </h2>
            <Button variant="ghost" onClick={onClose}>
              ✕
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sucursal_id">Sucursal</Label>
                    <Select
                      value={formData.sucursal_id?.toString()}
                      onValueChange={(value) => handleInputChange('sucursal_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.sucursal_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar sucursal" />
                      </SelectTrigger>
                      <SelectContent>
                        {sucursales.map((sucursal) => (
                          <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id.toString()}>
                            {sucursal.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sucursal_id && (
                      <p className="text-sm text-red-500">{errors.sucursal_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_recepcion">Estado</Label>
                    <Select
                      value={formData.estado_recepcion}
                      onValueChange={(value) => handleInputChange('estado_recepcion', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="En revisión">En revisión</SelectItem>
                        <SelectItem value="Cancelada">Cancelada</SelectItem>
                        <SelectItem value="Recepcionada">Recepcionada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solicitud_id">Solicitud Relacionada</Label>
                    <Select
                      value={formData.solicitud_id?.toString()}
                      onValueChange={(value) => handleInputChange('solicitud_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar solicitud (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin solicitud</SelectItem>
                        {solicitudes.map((solicitud) => (
                          <SelectItem key={solicitud.solicitud_id} value={solicitud.solicitud_id.toString()}>
                            {solicitud.nro_solicitud || `#${solicitud.solicitud_id}`} - {solicitud.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="usuario_id">Usuario</Label>
                    <Select
                      value={formData.usuario_id?.toString()}
                      onValueChange={(value) => handleInputChange('usuario_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.usuario_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar usuario" />
                      </SelectTrigger>
                      <SelectContent>
                        {usuarios.map((usuario) => (
                          <SelectItem key={usuario.usuario_id} value={usuario.usuario_id.toString()}>
                            {usuario.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.usuario_id && (
                      <p className="text-sm text-red-500">{errors.usuario_id}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones || ''}
                    onChange={(e) => handleInputChange('observaciones', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Observaciones sobre la recepción..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Equipos Recibidos */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipos Recibidos
                  </CardTitle>
                  {mode !== 'view' && (
                    <Button type="button" onClick={addEquipo} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar Equipo
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {formData.equipos && formData.equipos.length > 0 ? (
                  <div className="space-y-4">
                    {formData.equipos.map((equipo, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Equipo {index + 1}</h4>
                          {mode !== 'view' && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEquipo(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>Equipo</Label>
                            <Select
                              value={equipo.equipo_id?.toString()}
                              onValueChange={(value) => handleEquipoChange(index, 'equipo_id', parseInt(value))}
                              disabled={mode === 'view'}
                            >
                              <SelectTrigger className={errors[`equipo_${index}_equipo`] ? 'border-red-500' : ''}>
                                <SelectValue placeholder="Seleccionar equipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {equipos.map((eq) => (
                                  <SelectItem key={eq.equipo_id} value={eq.equipo_id.toString()}>
                                    {eq.numero_serie} - {eq.tipo_equipo_nombre}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {errors[`equipo_${index}_equipo`] && (
                              <p className="text-sm text-red-500">{errors[`equipo_${index}_equipo`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Cantidad</Label>
                            <Input
                              type="number"
                              min="1"
                              value={equipo.cantidad || ''}
                              onChange={(e) => handleEquipoChange(index, 'cantidad', parseInt(e.target.value) || 1)}
                              disabled={mode === 'view'}
                              className={errors[`equipo_${index}_cantidad`] ? 'border-red-500' : ''}
                            />
                            {errors[`equipo_${index}_cantidad`] && (
                              <p className="text-sm text-red-500">{errors[`equipo_${index}_cantidad`]}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Observaciones</Label>
                            <Input
                              type="text"
                              value={equipo.observaciones || ''}
                              onChange={(e) => handleEquipoChange(index, 'observaciones', e.target.value)}
                              disabled={mode === 'view'}
                              placeholder="Observaciones del equipo..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-end">
                      <div className="text-right space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Total de equipos: {calculateTotalEquipos()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total de cantidad: {calculateTotalCantidad()}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay equipos agregados</p>
                    {mode !== 'view' && (
                      <Button type="button" onClick={addEquipo} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar Primer Equipo
                      </Button>
                    )}
                  </div>
                )}

                {errors.equipos && (
                  <p className="text-sm text-red-500 mt-2">{errors.equipos}</p>
                )}
              </CardContent>
            </Card>

            {/* Botones de Acción */}
            {mode !== 'view' && (
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : 'Guardar'}
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
