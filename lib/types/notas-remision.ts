// Tipos para el módulo de notas de remisión
export interface NotaRemision {
  remision_id: number;
  fecha_remision: string;
  usuario_id: number;
  origen_almacen_id: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision: 'compra' | 'venta' | 'transferencia';
  referencia_id?: number;
  nro_timbrado?: string;
  estado: 'activo' | 'anulado';
  observaciones?: string;
  // Campos adicionales de joins
  usuario_nombre?: string;
  origen_almacen_nombre?: string;
  destino_sucursal_nombre?: string;
  destino_almacen_nombre?: string;
  codigo_remision?: string;
  total_productos?: number;
  total_cantidad?: number;
}

export interface DetalleRemision {
  detalle_id: number;
  remision_id: number;
  producto_id: number;
  cantidad: number;
  // Campos adicionales de joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_precio?: number;
  subtotal?: number;
}

export interface NotaRemisionCreate {
  fecha_remision?: string;
  usuario_id: number;
  origen_almacen_id: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision: 'compra' | 'venta' | 'transferencia';
  referencia_id?: number;
  nro_timbrado?: string;
  estado?: 'activo' | 'anulado';
  observaciones?: string;
  detalles?: DetalleRemisionCreate[];
}

export interface DetalleRemisionCreate {
  producto_id: number;
  cantidad: number;
}

export interface NotaRemisionUpdate {
  fecha_remision?: string;
  usuario_id?: number;
  origen_almacen_id?: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision?: 'compra' | 'venta' | 'transferencia';
  referencia_id?: number;
  nro_timbrado?: string;
  estado?: 'activo' | 'anulado';
  observaciones?: string;
  detalles?: DetalleRemisionCreate[];
}

export interface NotasRemisionApiResponse {
  success: boolean;
  message: string;
  data: NotaRemision[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

export interface NotaRemisionApiResponse {
  success: boolean;
  message: string;
  data: NotaRemision;
  error?: string;
}

export interface NotaRemisionDetalleApiResponse {
  success: boolean;
  message: string;
  data: DetalleRemision[];
  error?: string;
}

export interface FiltrosNotasRemision {
  search?: string;
  estado?: string;
  tipo_remision?: string;
  usuario_id?: number;
  origen_almacen_id?: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface NotasRemisionStats {
  general: {
    total_remisiones: number;
    total_productos: number;
    total_cantidad: number;
  };
  hoy: {
    remisiones_hoy: number;
    productos_hoy: number;
    cantidad_hoy: number;
  };
  mes: {
    remisiones_mes: number;
    productos_mes: number;
    cantidad_mes: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    productos: number;
  }>;
  por_tipo: Array<{
    tipo: string;
    cantidad: number;
    productos: number;
  }>;
  por_usuario: Array<{
    usuario: string;
    cantidad: number;
    productos: number;
  }>;
  por_almacen_origen: Array<{
    almacen: string;
    cantidad: number;
    productos: number;
  }>;
  por_dia: Array<{
    fecha: string;
    cantidad: number;
    productos: number;
  }>;
}

export interface NotasRemisionStatsResponse {
  success: boolean;
  message: string;
  data: NotasRemisionStats;
  error?: string;
}

// Tipos para productos y almacenes
export interface ProductoRemision {
  producto_id: number;
  nombre_producto: string;
  cod_product: string;
  precio_unitario: number;
  precio_venta: number;
  stock: number;
  categoria_nombre?: string;
}

export interface AlmacenRemision {
  almacen_id: number;
  nombre: string;
  direccion?: string;
  sucursal_nombre?: string;
}

export interface SucursalRemision {
  sucursal_id: number;
  nombre: string;
  direccion?: string;
}
