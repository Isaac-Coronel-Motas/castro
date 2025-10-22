'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreatePresupuestoServicio } from '@/hooks/use-presupuestos';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/use-authenticated-fetch';
import { PresupuestoServicioCreate } from '@/lib/types/presupuestos';
import { Plus, Search, Calendar, DollarSign } from 'lucide-react';

interface Usuario {
  usuario_id: number;
  nombre: string;
  username: string;
}

interface Sucursal {
  sucursal_id: number;
  nombre: string;
  direccion?: string;
}

interface Diagnostico {
  diagnostico_id: number;
  descripcion: string;
  cliente_nombre: string;
  cliente_telefono?: string;
  fecha_diagnostico: string;
}

interface ModalNuevoPresupuestoServicioProps {
  onPresupuestoCreated: () => void;
}

export function ModalNuevoPresupuestoServicio({ onPresupuestoCreated }: ModalNuevoPresupuestoServicioProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loadingDiagnosticos, setLoadingDiagnosticos] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [searchDiagnostico, setSearchDiagnostico] = useState('');
  
  const { createPresupuesto, loading: creatingPresupuesto, error: createError } = useCreatePresupuestoServicio();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [formData, setFormData] = useState<PresupuestoServicioCreate>({
    fecha_presupuesto: new Date().toISOString().split('T')[0],
    estado: 'pendiente',
    monto_presu_ser: 0,
    observaciones: '',
    tipo_presu: 'con_diagnostico'
  });

  const [errors, setErrors] = useState<Partial<PresupuestoServicioCreate>>({});

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    usuario.username.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  // Filtrar diagnósticos por búsqueda
  const filteredDiagnosticos = diagnosticos.filter(diagnostico =>
    diagnostico.descripcion.toLowerCase().includes(searchDiagnostico.toLowerCase()) ||
    diagnostico.cliente_nombre.toLowerCase().includes(searchDiagnostico.toLowerCase()) ||
    diagnostico.cliente_telefono?.includes(searchDiagnostico)
  );

  // Cargar usuarios
  const loadUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await authenticatedFetch('/api/usuarios');
      if (response.ok) {
        const data = await response.json();
        setUsuarios(data.data || []);
      }
    } catch (error) {
      console.error('Error loading usuarios:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  // Cargar sucursales
  const loadSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const response = await authenticatedFetch('/api/referencias/sucursales');
      if (response.ok) {
        const data = await response.json();
        setSucursales(data.data || []);
      }
    } catch (error) {
      console.error('Error loading sucursales:', error);
    } finally {
      setLoadingSucursales(false);
    }
  };

  // Cargar diagnósticos
  const loadDiagnosticos = async () => {
    setLoadingDiagnosticos(true);
    try {
      const response = await authenticatedFetch('/api/servicios/diagnosticos?limit=100');
      if (response.ok) {
        const data = await response.json();
        setDiagnosticos(data.data || []);
      }
    } catch (error) {
      console.error('Error loading diagnosticos:', error);
    } finally {
      setLoadingDiagnosticos(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadUsuarios();
      loadSucursales();
      loadDiagnosticos();
    }
  }, [open]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<PresupuestoServicioCreate> = {};

    if (!formData.monto_presu_ser || formData.monto_presu_ser <= 0) {
      newErrors.monto_presu_ser = 'El monto debe ser mayor a 0';
    }

    if (!formData.tipo_presu) {
      newErrors.tipo_presu = 'El tipo de presupuesto es requerido';
    }

    if (formData.tipo_presu === 'con_diagnostico' && !formData.diagnostico_id) {
      newErrors.diagnostico_id = 'Debe seleccionar un diagnóstico';
    }

    if (!formData.fecha_presupuesto) {
      newErrors.fecha_presupuesto = 'La fecha del presupuesto es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const presupuestoData: PresupuestoServicioCreate = {
        ...formData,
        monto_presu_ser: parseFloat(formData.monto_presu_ser.toString()),
        observaciones: formData.observaciones || undefined,
        usuario_id: formData.usuario_id || undefined,
        sucursal_id: formData.sucursal_id || undefined,
        diagnostico_id: formData.diagnostico_id || undefined,
        valido_desde: formData.valido_desde || undefined,
        valido_hasta: formData.valido_hasta || undefined
      };

      const result = await createPresupuesto(presupuestoData);
      
      if (result) {
        toast({
          title: 'Presupuesto creado',
          description: `Presupuesto por $${formData.monto_presu_ser.toFixed(2)} creado exitosamente`,
        });
        
        setOpen(false);
        resetForm();
        onPresupuestoCreated();
      } else {
        toast({
          title: 'Error',
          description: createError || 'Error al crear el presupuesto',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating presupuesto:', error);
      toast({
        title: 'Error',
        description: 'Error inesperado al crear el presupuesto',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      fecha_presupuesto: new Date().toISOString().split('T')[0],
      estado: 'pendiente',
      monto_presu_ser: 0,
      observaciones: '',
      tipo_presu: 'con_diagnostico'
    });
    setErrors({});
    setSearchUsuario('');
    setSearchDiagnostico('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Nuevo Presupuesto
      </Button>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Presupuesto de Servicio</DialogTitle>
          <DialogDescription>
            Crea un nuevo presupuesto para servicios técnicos
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="tipo_presu">Tipo de Presupuesto *</Label>
            <Select 
              value={formData.tipo_presu} 
              onValueChange={(value: 'con_diagnostico' | 'sin_diagnostico') => {
                setFormData(prev => ({ 
                  ...prev, 
                  tipo_presu: value,
                  diagnostico_id: value === 'sin_diagnostico' ? undefined : prev.diagnostico_id
                }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="con_diagnostico">Con Diagnóstico</SelectItem>
                <SelectItem value="sin_diagnostico">Sin Diagnóstico</SelectItem>
              </SelectContent>
            </Select>
            {errors.tipo_presu && (
              <p className="text-sm text-red-500">{errors.tipo_presu}</p>
            )}
          </div>

          {/* Diagnóstico (solo si es con diagnóstico) */}
          {formData.tipo_presu === 'con_diagnostico' && (
            <div className="space-y-2">
              <Label htmlFor="diagnostico">Diagnóstico *</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar diagnóstico..."
                    value={searchDiagnostico}
                    onChange={(e) => setSearchDiagnostico(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select 
                  value={formData.diagnostico_id?.toString() || "no-diagnostico"} 
                  onValueChange={(value) => {
                    if (value !== "loading-diagnosticos" && value !== "no-diagnostico") {
                      setFormData(prev => ({ ...prev, diagnostico_id: parseInt(value) }));
                    } else if (value === "no-diagnostico") {
                      setFormData(prev => ({ ...prev, diagnostico_id: undefined }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar diagnóstico" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingDiagnosticos ? (
                      <SelectItem value="loading-diagnosticos" disabled>Cargando...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="no-diagnostico">Sin diagnóstico</SelectItem>
                        {filteredDiagnosticos.map(diagnostico => (
                          <SelectItem key={diagnostico.diagnostico_id} value={diagnostico.diagnostico_id.toString()}>
                            <div className="flex flex-col">
                              <span className="font-medium">{diagnostico.descripcion}</span>
                              <span className="text-sm text-muted-foreground">
                                {diagnostico.cliente_nombre} - {new Date(diagnostico.fecha_diagnostico).toLocaleDateString()}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.diagnostico_id && (
                  <p className="text-sm text-red-500">{errors.diagnostico_id}</p>
                )}
              </div>
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto_presu_ser">Monto del Presupuesto *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="monto_presu_ser"
                type="number"
                step="0.01"
                min="0"
                value={formData.monto_presu_ser}
                onChange={(e) => setFormData(prev => ({ ...prev, monto_presu_ser: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00"
                className="pl-10"
              />
            </div>
            {errors.monto_presu_ser && (
              <p className="text-sm text-red-500">{errors.monto_presu_ser}</p>
            )}
          </div>

          {/* Fecha del Presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="fecha_presupuesto">Fecha del Presupuesto *</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="fecha_presupuesto"
                type="date"
                value={formData.fecha_presupuesto}
                onChange={(e) => setFormData(prev => ({ ...prev, fecha_presupuesto: e.target.value }))}
                className="pl-10"
              />
            </div>
            {errors.fecha_presupuesto && (
              <p className="text-sm text-red-500">{errors.fecha_presupuesto}</p>
            )}
          </div>

          {/* Validez del Presupuesto */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="valido_desde">Válido Desde</Label>
              <Input
                id="valido_desde"
                type="date"
                value={formData.valido_desde || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, valido_desde: e.target.value || undefined }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valido_hasta">Válido Hasta</Label>
              <Input
                id="valido_hasta"
                type="date"
                value={formData.valido_hasta || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, valido_hasta: e.target.value || undefined }))}
              />
            </div>
          </div>

          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario Responsable</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar usuario..."
                  value={searchUsuario}
                  onChange={(e) => setSearchUsuario(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select 
                value={formData.usuario_id?.toString() || "no-usuario"} 
                onValueChange={(value) => {
                  if (value !== "loading-usuarios" && value !== "no-usuario") {
                    setFormData(prev => ({ ...prev, usuario_id: parseInt(value) }));
                  } else if (value === "no-usuario") {
                    setFormData(prev => ({ ...prev, usuario_id: undefined }));
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsuarios ? (
                    <SelectItem value="loading-usuarios" disabled>Cargando...</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="no-usuario">Sin asignar</SelectItem>
                      {filteredUsuarios.map(usuario => (
                        <SelectItem key={usuario.usuario_id} value={usuario.usuario_id.toString()}>
                          {usuario.nombre} ({usuario.username})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Sucursal */}
          <div className="space-y-2">
            <Label htmlFor="sucursal">Sucursal</Label>
            <Select 
              value={formData.sucursal_id?.toString() || "no-sucursal"} 
              onValueChange={(value) => {
                if (value !== "loading-sucursales" && value !== "no-sucursal") {
                  setFormData(prev => ({ ...prev, sucursal_id: parseInt(value) }));
                } else if (value === "no-sucursal") {
                  setFormData(prev => ({ ...prev, sucursal_id: undefined }));
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sucursal (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {loadingSucursales ? (
                  <SelectItem value="loading-sucursales" disabled>Cargando...</SelectItem>
                ) : (
                  <>
                    <SelectItem value="no-sucursal">Sin especificar</SelectItem>
                    {sucursales.map(sucursal => (
                      <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id.toString()}>
                        {sucursal.nombre}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Estado */}
          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select 
              value={formData.estado} 
              onValueChange={(value: 'pendiente' | 'aprobado' | 'rechazado') => {
                setFormData(prev => ({ ...prev, estado: value }));
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Número de Presupuesto */}
          <div className="space-y-2">
            <Label htmlFor="nro_presupuesto">Número de Presupuesto</Label>
            <Input
              id="nro_presupuesto"
              value={formData.nro_presupuesto || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, nro_presupuesto: e.target.value || undefined }))}
              placeholder="Número de presupuesto (opcional)"
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={formData.observaciones || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value || undefined }))}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || creatingPresupuesto}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || creatingPresupuesto}
              className="gap-2"
            >
              {loading || creatingPresupuesto ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Crear Presupuesto
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
