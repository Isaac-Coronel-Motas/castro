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
import { useCreateCobro } from '@/hooks/use-cobros';
import { useToast } from '@/hooks/use-toast';
import { useAuthenticatedFetch } from '@/hooks/use-authenticated-fetch';
import { CobroCreate } from '@/lib/types/cobros';
import { Plus, Search, X } from 'lucide-react';

interface Venta {
  venta_id: number;
  nro_factura: string;
  fecha_venta: string;
  monto_venta: number;
  cliente_nombre: string;
  cliente_telefono: string;
  forma_cobro_nombre: string;
  estado: string;
}

interface Caja {
  caja_id: number;
  nro_caja: string;
  sucursal_nombre: string;
  activo: boolean;
}

interface Usuario {
  usuario_id: number;
  nombre: string;
  username: string;
}

interface ModalNuevoCobroProps {
  onCobroCreated: () => void;
}

export function ModalNuevoCobro({ onCobroCreated }: ModalNuevoCobroProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingVentas, setLoadingVentas] = useState(false);
  const [loadingCajas, setLoadingCajas] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchVenta, setSearchVenta] = useState('');
  const [searchUsuario, setSearchUsuario] = useState('');
  
  const { createCobro, loading: creatingCobro, error: createError } = useCreateCobro();
  const { toast } = useToast();
  const { authenticatedFetch } = useAuthenticatedFetch();

  const [formData, setFormData] = useState<CobroCreate>({
    venta_id: 0,
    fecha_cobro: new Date().toISOString().split('T')[0],
    monto: 0,
    caja_id: 0,
    observacion: ''
  });

  const [errors, setErrors] = useState<Partial<CobroCreate>>({});

  // Filtrar ventas por búsqueda
  const filteredVentas = ventas.filter(venta =>
    venta.nro_factura.toLowerCase().includes(searchVenta.toLowerCase()) ||
    venta.cliente_nombre.toLowerCase().includes(searchVenta.toLowerCase()) ||
    venta.cliente_telefono.includes(searchVenta)
  );

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    usuario.username.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  // Cargar ventas
  const loadVentas = async () => {
    setLoadingVentas(true);
    try {
      const response = await authenticatedFetch('/api/ventas/registro-ventas?limit=100&sort_by=fecha_venta&sort_order=desc');
      if (response.ok) {
        const data = await response.json();
        setVentas(data.data || []);
      }
    } catch (error) {
      console.error('Error loading ventas:', error);
    } finally {
      setLoadingVentas(false);
    }
  };

  // Cargar cajas
  const loadCajas = async () => {
    setLoadingCajas(true);
    try {
      const response = await authenticatedFetch('/api/ventas/cajas');
      if (response.ok) {
        const data = await response.json();
        setCajas(data.data || []);
      }
    } catch (error) {
      console.error('Error loading cajas:', error);
    } finally {
      setLoadingCajas(false);
    }
  };

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

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadVentas();
      loadCajas();
      loadUsuarios();
    }
  }, [open]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<CobroCreate> = {};

    if (!formData.venta_id || formData.venta_id <= 0) {
      newErrors.venta_id = 'Debe seleccionar una venta';
    }

    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.caja_id || formData.caja_id <= 0) {
      newErrors.caja_id = 'Debe seleccionar una caja';
    }

    if (!formData.fecha_cobro) {
      newErrors.fecha_cobro = 'La fecha de cobro es requerida';
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
      const cobroData: CobroCreate = {
        ...formData,
        venta_id: formData.venta_id,
        caja_id: formData.caja_id,
        monto: parseFloat(formData.monto.toString()),
        observacion: formData.observacion || undefined,
        usuario_id: formData.usuario_id || undefined
      };

      const result = await createCobro(cobroData);
      
      if (result) {
        toast({
          title: 'Cobro creado',
          description: `Cobro por $${Number(formData.monto).toFixed(2)} creado exitosamente`,
        });
        
        setOpen(false);
        resetForm();
        onCobroCreated();
      } else {
        toast({
          title: 'Error',
          description: createError || 'Error al crear el cobro',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating cobro:', error);
      toast({
        title: 'Error',
        description: 'Error inesperado al crear el cobro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      venta_id: 0,
      fecha_cobro: new Date().toISOString().split('T')[0],
      monto: 0,
      caja_id: 0,
      observacion: ''
    });
    setErrors({});
    setSearchVenta('');
    setSearchUsuario('');
  };

  // Manejar cambio de venta
  const handleVentaChange = (ventaId: string) => {
    const venta = ventas.find(v => v.venta_id.toString() === ventaId);
    if (venta) {
      setFormData(prev => ({
        ...prev,
        venta_id: venta.venta_id,
        monto: venta.monto_venta // Establecer monto por defecto
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Nuevo Cobro
      </Button>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nuevo Cobro</DialogTitle>
          <DialogDescription>
            Registra un nuevo cobro para una venta existente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Venta */}
          <div className="space-y-2">
            <Label htmlFor="venta">Venta *</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar venta por factura, cliente o teléfono..."
                  value={searchVenta}
                  onChange={(e) => setSearchVenta(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select onValueChange={(value) => {
                if (value !== "loading-ventas") {
                  handleVentaChange(value);
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar venta" />
                </SelectTrigger>
                <SelectContent>
                  {loadingVentas ? (
                    <SelectItem value="loading-ventas" disabled>Cargando...</SelectItem>
                  ) : (
                    filteredVentas.map(venta => (
                      <SelectItem key={venta.venta_id} value={venta.venta_id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{venta.nro_factura}</span>
                          <span className="text-sm text-muted-foreground">
                            {venta.cliente_nombre} - ${Number(venta.monto_venta).toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.venta_id && (
                <p className="text-sm text-red-500">{errors.venta_id}</p>
              )}
            </div>
          </div>

          {/* Información de la venta seleccionada */}
          {formData.venta_id > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Información de la Venta</h4>
              {(() => {
                const venta = ventas.find(v => v.venta_id === formData.venta_id);
                return venta ? (
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Factura:</span> {venta.nro_factura}
                    </div>
                    <div>
                      <span className="font-medium">Cliente:</span> {venta.cliente_nombre}
                    </div>
                    <div>
                      <span className="font-medium">Teléfono:</span> {venta.cliente_telefono}
                    </div>
                    <div>
                      <span className="font-medium">Total:</span> ${Number(venta.monto_venta).toFixed(2)}
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span> {new Date(venta.fecha_venta).toLocaleDateString()}
                    </div>
                    <div>
                      <span className="font-medium">Estado:</span> {venta.estado}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Monto */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0"
              value={formData.monto}
              onChange={(e) => setFormData(prev => ({ ...prev, monto: parseFloat(e.target.value) || 0 }))}
              placeholder="0.00"
            />
            {errors.monto && (
              <p className="text-sm text-red-500">{errors.monto}</p>
            )}
          </div>

          {/* Fecha de Cobro */}
          <div className="space-y-2">
            <Label htmlFor="fecha_cobro">Fecha de Cobro *</Label>
            <Input
              id="fecha_cobro"
              type="date"
              value={formData.fecha_cobro}
              onChange={(e) => setFormData(prev => ({ ...prev, fecha_cobro: e.target.value }))}
            />
            {errors.fecha_cobro && (
              <p className="text-sm text-red-500">{errors.fecha_cobro}</p>
            )}
          </div>

          {/* Caja */}
          <div className="space-y-2">
            <Label htmlFor="caja">Caja *</Label>
            <Select onValueChange={(value) => {
              if (value !== "loading-cajas") {
                setFormData(prev => ({ ...prev, caja_id: parseInt(value) }));
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar caja" />
              </SelectTrigger>
              <SelectContent>
                {loadingCajas ? (
                  <SelectItem value="loading-cajas" disabled>Cargando...</SelectItem>
                ) : (
                  cajas.filter(caja => caja.activo).map(caja => (
                    <SelectItem key={caja.caja_id} value={caja.caja_id.toString()}>
                      Caja {caja.nro_caja} - {caja.sucursal_nombre}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {errors.caja_id && (
              <p className="text-sm text-red-500">{errors.caja_id}</p>
            )}
          </div>

          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario">Usuario</Label>
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
              <Select onValueChange={(value) => {
                if (value !== "loading-usuarios") {
                  setFormData(prev => ({ ...prev, usuario_id: parseInt(value) }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar usuario (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {loadingUsuarios ? (
                    <SelectItem value="loading-usuarios" disabled>Cargando...</SelectItem>
                  ) : (
                    <>
                      <SelectItem value="0">Sin asignar</SelectItem>
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

          {/* Observación */}
          <div className="space-y-2">
            <Label htmlFor="observacion">Observación</Label>
            <Textarea
              id="observacion"
              value={formData.observacion}
              onChange={(e) => setFormData(prev => ({ ...prev, observacion: e.target.value }))}
              placeholder="Observaciones adicionales..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || creatingCobro}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || creatingCobro}
              className="gap-2"
            >
              {loading || creatingCobro ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Crear Cobro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
