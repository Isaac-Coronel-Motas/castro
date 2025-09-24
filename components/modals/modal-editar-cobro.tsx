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
import { useUpdateCobro } from '@/hooks/use-cobros';
import { useToast } from '@/hooks/use-toast';
import { Cobro, CobroUpdate } from '@/lib/types/cobros';
import { Edit, Search, X } from 'lucide-react';

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

interface ModalEditarCobroProps {
  cobro: Cobro | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCobroUpdated: () => void;
}

export function ModalEditarCobro({ 
  cobro, 
  open, 
  onOpenChange, 
  onCobroUpdated 
}: ModalEditarCobroProps) {
  const [loading, setLoading] = useState(false);
  const [cajas, setCajas] = useState<Caja[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingCajas, setLoadingCajas] = useState(false);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState('');
  
  const { updateCobro, loading: updatingCobro, error: updateError } = useUpdateCobro();
  const { toast } = useToast();

  const [formData, setFormData] = useState<CobroUpdate>({
    monto: 0,
    caja_id: 0,
    observacion: '',
    usuario_id: undefined
  });

  const [errors, setErrors] = useState<Partial<CobroUpdate>>({});

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    usuario.username.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  // Cargar cajas
  const loadCajas = async () => {
    setLoadingCajas(true);
    try {
      const response = await fetch('/api/ventas/cajas');
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
      const response = await fetch('/api/usuarios');
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
      loadCajas();
      loadUsuarios();
    }
  }, [open]);

  // Actualizar formulario cuando cambia el cobro
  useEffect(() => {
    if (cobro) {
      setFormData({
        monto: cobro.monto,
        caja_id: cobro.caja_id,
        observacion: cobro.observacion || '',
        usuario_id: cobro.usuario_id || undefined
      });
      setErrors({});
    }
  }, [cobro]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<CobroUpdate> = {};

    if (!formData.monto || formData.monto <= 0) {
      newErrors.monto = 'El monto debe ser mayor a 0';
    }

    if (!formData.caja_id || formData.caja_id <= 0) {
      newErrors.caja_id = 'Debe seleccionar una caja';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cobro || !validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const cobroData: CobroUpdate = {
        monto: parseFloat(formData.monto.toString()),
        caja_id: formData.caja_id,
        observacion: formData.observacion || undefined,
        usuario_id: formData.usuario_id || undefined
      };

      const result = await updateCobro(cobro.cobro_id, cobroData);
      
      if (result) {
        toast({
          title: 'Cobro actualizado',
          description: `Cobro actualizado exitosamente`,
        });
        
        onOpenChange(false);
        onCobroUpdated();
      } else {
        toast({
          title: 'Error',
          description: updateError || 'Error al actualizar el cobro',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating cobro:', error);
      toast({
        title: 'Error',
        description: 'Error inesperado al actualizar el cobro',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!cobro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Cobro</DialogTitle>
          <DialogDescription>
            Modifica la información del cobro {cobro.codigo_cobro}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de la venta (solo lectura) */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Información de la Venta</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Factura:</span> {cobro.nro_factura}
              </div>
              <div>
                <span className="font-medium">Cliente:</span> {cobro.cliente_nombre}
              </div>
              <div>
                <span className="font-medium">Teléfono:</span> {cobro.cliente_telefono}
              </div>
              <div>
                <span className="font-medium">Total Venta:</span> ${cobro.venta_total?.toFixed(2)}
              </div>
              <div>
                <span className="font-medium">Fecha Venta:</span> {cobro.fecha_venta ? new Date(cobro.fecha_venta).toLocaleDateString() : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Forma de Cobro:</span> {cobro.forma_cobro_nombre}
              </div>
            </div>
          </div>

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

          {/* Fecha de Cobro (solo lectura) */}
          <div className="space-y-2">
            <Label htmlFor="fecha_cobro">Fecha de Cobro</Label>
            <Input
              id="fecha_cobro"
              type="date"
              value={cobro.fecha_cobro}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">La fecha de cobro no se puede modificar</p>
          </div>

          {/* Caja */}
          <div className="space-y-2">
            <Label htmlFor="caja">Caja *</Label>
            <Select 
              value={formData.caja_id.toString()} 
              onValueChange={(value) => {
                if (value !== "loading-cajas") {
                  setFormData(prev => ({ ...prev, caja_id: parseInt(value) }));
                }
              }}
            >
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
              <Select 
                value={formData.usuario_id?.toString() || "0"} 
                onValueChange={(value) => {
                  if (value !== "loading-usuarios") {
                    setFormData(prev => ({ 
                      ...prev, 
                      usuario_id: value === "0" ? undefined : parseInt(value) 
                    }));
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
              onClick={() => onOpenChange(false)}
              disabled={loading || updatingCobro}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || updatingCobro}
              className="gap-2"
            >
              {loading || updatingCobro ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Actualizar Cobro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
