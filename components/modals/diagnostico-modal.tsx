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
import { useAuthenticatedFetch } from "@/hooks/use-authenticated-fetch"
import { Diagnostico, CreateDiagnosticoRequest, UpdateDiagnosticoRequest, DiagnosticoDetalle } from "@/lib/types/servicios-tecnicos"
import { Stethoscope, Calendar, User, Plus, Trash2, Wrench, AlertCircle } from "lucide-react"

interface DiagnosticoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: CreateDiagnosticoRequest | UpdateDiagnosticoRequest) => Promise<void>
  diagnostico?: Diagnostico | null
  mode: 'create' | 'edit' | 'view'
}

export function DiagnosticoModal({ isOpen, onClose, onSave, diagnostico, mode }: DiagnosticoModalProps) {
  const { authenticatedFetch } = useAuthenticatedFetch()
  const [formData, setFormData] = useState<CreateDiagnosticoRequest>({
    recepcion_id: 0,
    tecnico_id: 0,
    observacion: '',
    estado_diagnostico: 'Pendiente',
    visita_tecnica_id: 0,
    tipo_diag_id: 0,
    motivo: '',
    equipos: []
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [recepciones, setRecepciones] = useState<any[]>([])
  const [equipos, setEquipos] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [tiposDiagnostico, setTiposDiagnostico] = useState<any[]>([])
  const [visitasTecnicas, setVisitasTecnicas] = useState<any[]>([])

  // Cargar datos iniciales
  useEffect(() => {
    if (isOpen) {
      loadInitialData()
      if (diagnostico && mode !== 'create') {
        setFormData({
          recepcion_id: diagnostico.recepcion_id || 0,
          tecnico_id: diagnostico.tecnico_id,
          observacion: diagnostico.observacion,
          estado_diagnostico: diagnostico.estado_diagnostico,
          visita_tecnica_id: diagnostico.visita_tecnica_id || 0,
          tipo_diag_id: diagnostico.tipo_diag_id,
          motivo: diagnostico.motivo || '',
          equipos: diagnostico.equipos?.map(e => ({
            equipo_id: e.equipo_id,
            observacion: e.observacion || '',
            cantidad: e.cantidad
          })) || []
        })
      }
    }
  }, [isOpen, diagnostico, mode])

  const loadInitialData = async () => {
    try {
      // Cargar recepciones
      const recepcionesRes = await authenticatedFetch('/api/servicios/recepcion-equipos')
      const recepcionesData = await recepcionesRes.json()
      if (recepcionesData.success) {
        setRecepciones(recepcionesData.data)
      }

      // Cargar equipos
      const equiposRes = await authenticatedFetch('/api/referencias/equipos')
      const equiposData = await equiposRes.json()
      if (equiposData.success) {
        setEquipos(equiposData.data)
      }

      // Cargar técnicos (usuarios con rol técnico)
      const tecnicosRes = await authenticatedFetch('/api/usuarios')
      const tecnicosData = await tecnicosRes.json()
      if (tecnicosData.success) {
        setTecnicos(tecnicosData.data)
      }

      // Cargar tipos de diagnóstico
      const tiposRes = await authenticatedFetch('/api/referencias/tipos-diagnostico')
      const tiposData = await tiposRes.json()
      if (tiposData.success) {
        setTiposDiagnostico(tiposData.data)
      }

      // Cargar visitas técnicas
      const visitasRes = await authenticatedFetch('/api/servicios/visitas-tecnicas')
      const visitasData = await visitasRes.json()
      if (visitasData.success) {
        setVisitasTecnicas(visitasData.data)
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
          observacion: '',
          cantidad: 1
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

    if (!formData.tecnico_id) {
      newErrors.tecnico_id = 'El técnico es requerido'
    }

    if (!formData.observacion.trim()) {
      newErrors.observacion = 'La observación es requerida'
    }

    if (!formData.tipo_diag_id) {
      newErrors.tipo_diag_id = 'El tipo de diagnóstico es requerido'
    }

    if (!formData.recepcion_id && !formData.visita_tecnica_id) {
      newErrors.recepcion_id = 'Debe seleccionar una recepción o visita técnica'
    }

    if (formData.recepcion_id && formData.visita_tecnica_id) {
      newErrors.recepcion_id = 'Solo puede seleccionar recepción o visita técnica, no ambas'
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
        : { ...formData, diagnostico_id: diagnostico?.diagnostico_id }
      
      await onSave(dataToSave)
      onClose()
    } catch (error) {
      console.error('Error guardando diagnóstico:', error)
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
      'Pendiente': 'bg-secondary text-secondary-foreground',
      'En proceso': 'bg-chart-1 text-white',
      'Completado': 'bg-green-500 text-white',
      'Rechazado': 'bg-destructive text-destructive-foreground',
      'Cancelado': 'bg-muted text-muted-foreground'
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
              {mode === 'create' ? 'Nuevo Diagnóstico' : 
               mode === 'edit' ? 'Editar Diagnóstico' : 
               'Ver Diagnóstico'}
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
                  <Stethoscope className="h-5 w-5" />
                  Información General
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tecnico_id">Técnico</Label>
                    <Select
                      value={formData.tecnico_id?.toString()}
                      onValueChange={(value) => handleInputChange('tecnico_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.tecnico_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar técnico" />
                      </SelectTrigger>
                      <SelectContent>
                        {tecnicos.map((tecnico) => (
                          <SelectItem key={tecnico.usuario_id} value={tecnico.usuario_id.toString()}>
                            {tecnico.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tecnico_id && (
                      <p className="text-sm text-red-500">{errors.tecnico_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado_diagnostico">Estado</Label>
                    <Select
                      value={formData.estado_diagnostico}
                      onValueChange={(value) => handleInputChange('estado_diagnostico', value)}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="En proceso">En proceso</SelectItem>
                        <SelectItem value="Completado">Completado</SelectItem>
                        <SelectItem value="Rechazado">Rechazado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo_diag_id">Tipo de Diagnóstico</Label>
                    <Select
                      value={formData.tipo_diag_id?.toString()}
                      onValueChange={(value) => handleInputChange('tipo_diag_id', parseInt(value))}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.tipo_diag_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDiagnostico.map((tipo) => (
                          <SelectItem key={tipo.tipo_diag_id} value={tipo.tipo_diag_id.toString()}>
                            {tipo.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.tipo_diag_id && (
                      <p className="text-sm text-red-500">{errors.tipo_diag_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo</Label>
                    <Input
                      id="motivo"
                      value={formData.motivo || ''}
                      onChange={(e) => handleInputChange('motivo', e.target.value)}
                      disabled={mode === 'view'}
                      placeholder="Motivo del diagnóstico..."
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacion">Observación</Label>
                  <Textarea
                    id="observacion"
                    value={formData.observacion}
                    onChange={(e) => handleInputChange('observacion', e.target.value)}
                    disabled={mode === 'view'}
                    placeholder="Describe el diagnóstico realizado..."
                    rows={4}
                    className={errors.observacion ? 'border-red-500' : ''}
                  />
                  {errors.observacion && (
                    <p className="text-sm text-red-500">{errors.observacion}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Origen del Diagnóstico */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Origen del Diagnóstico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="recepcion_id">Recepción de Equipos</Label>
                    <Select
                      value={formData.recepcion_id?.toString()}
                      onValueChange={(value) => {
                        handleInputChange('recepcion_id', parseInt(value))
                        handleInputChange('visita_tecnica_id', 0)
                      }}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger className={errors.recepcion_id ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar recepción (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin recepción</SelectItem>
                        {recepciones.map((recepcion) => (
                          <SelectItem key={recepcion.recepcion_id} value={recepcion.recepcion_id.toString()}>
                            {recepcion.nro_recepcion || `#${recepcion.recepcion_id}`} - {recepcion.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.recepcion_id && (
                      <p className="text-sm text-red-500">{errors.recepcion_id}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="visita_tecnica_id">Visita Técnica</Label>
                    <Select
                      value={formData.visita_tecnica_id?.toString()}
                      onValueChange={(value) => {
                        handleInputChange('visita_tecnica_id', parseInt(value))
                        handleInputChange('recepcion_id', 0)
                      }}
                      disabled={mode === 'view'}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar visita (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sin visita</SelectItem>
                        {visitasTecnicas.map((visita) => (
                          <SelectItem key={visita.visita_id} value={visita.visita_id.toString()}>
                            {visita.nro_visita || `#${visita.visita_id}`} - {visita.cliente_nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipos Diagnosticados */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    Equipos Diagnosticados
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
                            <Label>Observación del Equipo</Label>
                            <Input
                              type="text"
                              value={equipo.observacion || ''}
                              onChange={(e) => handleEquipoChange(index, 'observacion', e.target.value)}
                              disabled={mode === 'view'}
                              placeholder="Observación específica del equipo..."
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
