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
import { useUpdateNotaRemision } from '@/hooks/use-notas-remision';
import { useToast } from '@/hooks/use-toast';
import { NotaRemision, NotaRemisionUpdate, DetalleRemisionCreate, ProductoRemision, AlmacenRemision, SucursalRemision } from '@/lib/types/notas-remision';
import { Plus, Search, Calendar, Package, Trash2, Minus, Edit } from 'lucide-react';

interface Usuario {
  usuario_id: number;
  nombre: string;
  username: string;
}

interface ModalEditarNotaRemisionProps {
  notaRemision: NotaRemision;
  onNotaRemisionUpdated: () => void;
}

export function ModalEditarNotaRemision({ notaRemision, onNotaRemisionUpdated }: ModalEditarNotaRemisionProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [almacenes, setAlmacenes] = useState<AlmacenRemision[]>([]);
  const [sucursales, setSucursales] = useState<SucursalRemision[]>([]);
  const [productos, setProductos] = useState<ProductoRemision[]>([]);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [loadingAlmacenes, setLoadingAlmacenes] = useState(false);
  const [loadingSucursales, setLoadingSucursales] = useState(false);
  const [loadingProductos, setLoadingProductos] = useState(false);
  const [searchUsuario, setSearchUsuario] = useState('');
  const [searchProducto, setSearchProducto] = useState('');
  
  const { updateNotaRemision, loading: updatingNotaRemision, error: updateError } = useUpdateNotaRemision();
  const { toast } = useToast();

  const [formData, setFormData] = useState<NotaRemisionUpdate>({
    fecha_remision: notaRemision.fecha_remision,
    usuario_id: notaRemision.usuario_id,
    origen_almacen_id: notaRemision.origen_almacen_id,
    tipo_remision: notaRemision.tipo_remision,
    estado: notaRemision.estado,
    observaciones: notaRemision.observaciones,
    destino_sucursal_id: notaRemision.destino_sucursal_id,
    destino_almacen_id: notaRemision.destino_almacen_id,
    detalles: []
  });

  const [errors, setErrors] = useState<Partial<NotaRemisionUpdate>>({});

  // Filtrar usuarios por búsqueda
  const filteredUsuarios = usuarios.filter(usuario =>
    usuario.nombre.toLowerCase().includes(searchUsuario.toLowerCase()) ||
    usuario.username.toLowerCase().includes(searchUsuario.toLowerCase())
  );

  // Filtrar productos por búsqueda
  const filteredProductos = productos.filter(producto =>
    producto.nombre.toLowerCase().includes(searchProducto.toLowerCase()) ||
    producto.codigo.toLowerCase().includes(searchProducto.toLowerCase()) ||
    producto.categoria_nombre?.toLowerCase().includes(searchProducto.toLowerCase())
  );

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

  // Cargar almacenes
  const loadAlmacenes = async () => {
    setLoadingAlmacenes(true);
    try {
      const response = await fetch('/api/referencias/almacenes');
      if (response.ok) {
        const data = await response.json();
        setAlmacenes(data.data || []);
      }
    } catch (error) {
      console.error('Error loading almacenes:', error);
    } finally {
      setLoadingAlmacenes(false);
    }
  };

  // Cargar sucursales
  const loadSucursales = async () => {
    setLoadingSucursales(true);
    try {
      const response = await fetch('/api/referencias/sucursales');
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

  // Cargar productos
  const loadProductos = async () => {
    setLoadingProductos(true);
    try {
      const response = await fetch('/api/referencias/productos?limit=200');
      if (response.ok) {
        const data = await response.json();
        setProductos(data.data || []);
      }
    } catch (error) {
      console.error('Error loading productos:', error);
    } finally {
      setLoadingProductos(false);
    }
  };

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadUsuarios();
      loadAlmacenes();
      loadSucursales();
      loadProductos();
    }
  }, [open]);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Partial<NotaRemisionUpdate> = {};

    if (!formData.usuario_id || formData.usuario_id === 0) {
      newErrors.usuario_id = 'El usuario es requerido';
    }

    if (!formData.origen_almacen_id || formData.origen_almacen_id === 0) {
      newErrors.origen_almacen_id = 'El almacén de origen es requerido';
    }

    if (!formData.tipo_remision) {
      newErrors.tipo_remision = 'El tipo de remisión es requerido';
    }

    if (formData.tipo_remision === 'compra' || formData.tipo_remision === 'venta') {
      if (!formData.destino_sucursal_id) {
        newErrors.destino_sucursal_id = 'La sucursal de destino es requerida';
      }
    } else if (formData.tipo_remision === 'transferencia') {
      if (!formData.destino_almacen_id) {
        newErrors.destino_almacen_id = 'El almacén de destino es requerido';
      }
    }

    if (!formData.fecha_remision) {
      newErrors.fecha_remision = 'La fecha de remisión es requerida';
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
      const notaRemisionData: NotaRemisionUpdate = {
        ...formData,
        fecha_remision: formData.fecha_remision || notaRemision.fecha_remision,
        observaciones: formData.observaciones || undefined,
        referencia_id: formData.referencia_id || undefined,
        destino_sucursal_id: formData.destino_sucursal_id || undefined,
        destino_almacen_id: formData.destino_almacen_id || undefined
      };

      const result = await updateNotaRemision(notaRemision.remision_id, notaRemisionData);
      
      if (result) {
        toast({
          title: 'Nota de remisión actualizada',
          description: `Nota de remisión ${result.codigo_remision} actualizada exitosamente`,
        });
        
        setOpen(false);
        onNotaRemisionUpdated();
      } else {
        toast({
          title: 'Error',
          description: updateError || 'Error al actualizar la nota de remisión',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating nota remision:', error);
      toast({
        title: 'Error',
        description: 'Error inesperado al actualizar la nota de remisión',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Agregar producto
  const addProducto = (producto: ProductoRemision) => {
    const existingDetalle = formData.detalles?.find(d => d.producto_id === producto.producto_id);
    
    if (existingDetalle) {
      // Incrementar cantidad
      setFormData(prev => ({
        ...prev,
        detalles: prev.detalles?.map(d => 
          d.producto_id === producto.producto_id 
            ? { ...d, cantidad: d.cantidad + 1 }
            : d
        )
      }));
    } else {
      // Agregar nuevo producto
      setFormData(prev => ({
        ...prev,
        detalles: [...(prev.detalles || []), {
          producto_id: producto.producto_id,
          cantidad: 1
        }]
      }));
    }
  };

  // Remover producto
  const removeProducto = (productoId: number) => {
    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles?.filter(d => d.producto_id !== productoId)
    }));
  };

  // Actualizar cantidad
  const updateCantidad = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeProducto(productoId);
      return;
    }

    setFormData(prev => ({
      ...prev,
      detalles: prev.detalles?.map(d => 
        d.producto_id === productoId 
          ? { ...d, cantidad }
          : d
      )
    }));
  };

  // Obtener producto por ID
  const getProductoById = (productoId: number) => {
    return productos.find(p => p.producto_id === productoId);
  };

  // Calcular totales
  const totalProductos = formData.detalles?.length || 0;
  const totalCantidad = formData.detalles?.reduce((sum, d) => sum + d.cantidad, 0) || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Edit className="h-4 w-4" />
        Editar
      </Button>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Nota de Remisión</DialogTitle>
          <DialogDescription>
            Modifica la información de la nota de remisión {notaRemision.codigo_remision}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Información básica */}
            <div className="space-y-4">
              {/* Tipo de Remisión */}
              <div className="space-y-2">
                <Label htmlFor="tipo_remision">Tipo de Remisión *</Label>
                <Select 
                  value={formData.tipo_remision} 
                  onValueChange={(value: 'compra' | 'venta' | 'transferencia') => {
                    setFormData(prev => ({ 
                      ...prev, 
                      tipo_remision: value,
                      destino_sucursal_id: undefined,
                      destino_almacen_id: undefined
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="venta">Venta</SelectItem>
                    <SelectItem value="compra">Compra</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                  </SelectContent>
                </Select>
                {errors.tipo_remision && (
                  <p className="text-sm text-red-500">{errors.tipo_remision}</p>
                )}
              </div>

              {/* Fecha de Remisión */}
              <div className="space-y-2">
                <Label htmlFor="fecha_remision">Fecha de Remisión *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fecha_remision"
                    type="date"
                    value={formData.fecha_remision}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_remision: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                {errors.fecha_remision && (
                  <p className="text-sm text-red-500">{errors.fecha_remision}</p>
                )}
              </div>

              {/* Usuario */}
              <div className="space-y-2">
                <Label htmlFor="usuario">Usuario Responsable *</Label>
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
                        setFormData(prev => ({ ...prev, usuario_id: 0 }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingUsuarios ? (
                        <SelectItem value="loading-usuarios" disabled>Cargando...</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="no-usuario">Seleccionar usuario</SelectItem>
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
                {errors.usuario_id && (
                  <p className="text-sm text-red-500">{errors.usuario_id}</p>
                )}
              </div>

              {/* Almacén de Origen */}
              <div className="space-y-2">
                <Label htmlFor="origen_almacen">Almacén de Origen *</Label>
                <Select 
                  value={formData.origen_almacen_id?.toString() || "no-almacen"} 
                  onValueChange={(value) => {
                    if (value !== "loading-almacenes" && value !== "no-almacen") {
                      setFormData(prev => ({ ...prev, origen_almacen_id: parseInt(value) }));
                    } else if (value === "no-almacen") {
                      setFormData(prev => ({ ...prev, origen_almacen_id: 0 }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar almacén de origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingAlmacenes ? (
                      <SelectItem value="loading-almacenes" disabled>Cargando...</SelectItem>
                    ) : (
                      <>
                        <SelectItem value="no-almacen">Seleccionar almacén</SelectItem>
                        {almacenes.map(almacen => (
                          <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                            {almacen.nombre}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
                {errors.origen_almacen_id && (
                  <p className="text-sm text-red-500">{errors.origen_almacen_id}</p>
                )}
              </div>

              {/* Destino según el tipo */}
              {(formData.tipo_remision === 'compra' || formData.tipo_remision === 'venta') && (
                <div className="space-y-2">
                  <Label htmlFor="destino_sucursal">Sucursal de Destino *</Label>
                  <Select 
                    value={formData.destino_sucursal_id?.toString() || "no-sucursal"} 
                    onValueChange={(value) => {
                      if (value !== "loading-sucursales" && value !== "no-sucursal") {
                        setFormData(prev => ({ ...prev, destino_sucursal_id: parseInt(value) }));
                      } else if (value === "no-sucursal") {
                        setFormData(prev => ({ ...prev, destino_sucursal_id: undefined }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar sucursal de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSucursales ? (
                        <SelectItem value="loading-sucursales" disabled>Cargando...</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="no-sucursal">Seleccionar sucursal</SelectItem>
                          {sucursales.map(sucursal => (
                            <SelectItem key={sucursal.sucursal_id} value={sucursal.sucursal_id.toString()}>
                              {sucursal.nombre}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.destino_sucursal_id && (
                    <p className="text-sm text-red-500">{errors.destino_sucursal_id}</p>
                  )}
                </div>
              )}

              {formData.tipo_remision === 'transferencia' && (
                <div className="space-y-2">
                  <Label htmlFor="destino_almacen">Almacén de Destino *</Label>
                  <Select 
                    value={formData.destino_almacen_id?.toString() || "no-almacen-destino"} 
                    onValueChange={(value) => {
                      if (value !== "loading-almacenes" && value !== "no-almacen-destino") {
                        setFormData(prev => ({ ...prev, destino_almacen_id: parseInt(value) }));
                      } else if (value === "no-almacen-destino") {
                        setFormData(prev => ({ ...prev, destino_almacen_id: undefined }));
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar almacén de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingAlmacenes ? (
                        <SelectItem value="loading-almacenes" disabled>Cargando...</SelectItem>
                      ) : (
                        <>
                          <SelectItem value="no-almacen-destino">Seleccionar almacén</SelectItem>
                          {almacenes.map(almacen => (
                            <SelectItem key={almacen.almacen_id} value={almacen.almacen_id.toString()}>
                              {almacen.nombre}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  {errors.destino_almacen_id && (
                    <p className="text-sm text-red-500">{errors.destino_almacen_id}</p>
                  )}
                </div>
              )}

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select 
                  value={formData.estado} 
                  onValueChange={(value: 'activo' | 'anulado') => {
                    setFormData(prev => ({ ...prev, estado: value }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="anulado">Anulado</SelectItem>
                  </SelectContent>
                </Select>
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
            </div>

            {/* Columna derecha - Productos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Productos</h3>
                <div className="text-sm text-muted-foreground">
                  {totalProductos} productos, {totalCantidad} unidades
                </div>
              </div>

              {/* Búsqueda de productos */}
              <div className="space-y-2">
                <Label htmlFor="search-producto">Buscar Productos</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nombre, código o categoría..."
                    value={searchProducto}
                    onChange={(e) => setSearchProducto(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Lista de productos disponibles */}
              <div className="max-h-60 overflow-y-auto border rounded-lg p-2 space-y-2">
                {loadingProductos ? (
                  <div className="text-center py-4">Cargando productos...</div>
                ) : (
                  filteredProductos.map(producto => (
                    <div key={producto.producto_id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                      <div className="flex-1">
                        <div className="font-medium">{producto.nombre}</div>
                        <div className="text-sm text-muted-foreground">
                          {producto.codigo} - Stock: {producto.stock_actual}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => addProducto(producto)}
                        className="gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Agregar
                      </Button>
                    </div>
                  ))
                )}
              </div>

              {/* Productos seleccionados */}
              {formData.detalles && formData.detalles.length > 0 && (
                <div className="space-y-2">
                  <Label>Productos Seleccionados</Label>
                  <div className="space-y-2">
                    {formData.detalles.map(detalle => {
                      const producto = getProductoById(detalle.producto_id);
                      if (!producto) return null;

                      return (
                        <div key={detalle.producto_id} className="flex items-center justify-between p-2 border rounded bg-muted">
                          <div className="flex-1">
                            <div className="font-medium">{producto.nombre}</div>
                            <div className="text-sm text-muted-foreground">
                              {producto.codigo} - Stock: {producto.stock_actual}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateCantidad(detalle.producto_id, detalle.cantidad - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={detalle.cantidad}
                              onChange={(e) => updateCantidad(detalle.producto_id, parseInt(e.target.value) || 1)}
                              className="w-16 text-center"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => updateCantidad(detalle.producto_id, detalle.cantidad + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              onClick={() => removeProducto(detalle.producto_id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading || updatingNotaRemision}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || updatingNotaRemision}
              className="gap-2"
            >
              {loading || updatingNotaRemision ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Actualizar Nota de Remisión
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
