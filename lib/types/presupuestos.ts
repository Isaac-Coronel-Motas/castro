// Tipos para el módulo de presupuestos
export interface PresupuestoServicio {
  presu_serv_id: number;
  fecha_presupuesto: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  monto_presu_ser: number;
  observaciones?: string;
  descuento_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  promocion_id?: number;
  nro_presupuesto?: string;
  diagnostico_id?: number;
  valido_desde?: string;
  valido_hasta?: string;
  tipo_presu: 'con_diagnostico' | 'sin_diagnostico';
  // Campos adicionales de joins
  usuario_nombre?: string;
  sucursal_nombre?: string;
  diagnostico_descripcion?: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  codigo_presupuesto?: string;
}

export interface PresupuestoProveedor {
  presu_prov_id: number;
  usuario_id?: number;
  fecha_presupuesto: string;
  estado: 'nuevo' | 'enviado' | 'recibido' | 'aprobado' | 'rechazado';
  observaciones?: string;
  monto_presu_prov: number;
  nro_comprobante?: string;
  pedido_prov_id?: number;
  // Campos adicionales de joins
  usuario_nombre?: string;
  proveedor_nombre?: string;
  proveedor_telefono?: string;
  proveedor_email?: string;
  codigo_presupuesto?: string;
}

export interface PresupuestoServicioCreate {
  fecha_presupuesto?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  monto_presu_ser: number;
  observaciones?: string;
  descuento_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  promocion_id?: number;
  nro_presupuesto?: string;
  diagnostico_id?: number;
  valido_desde?: string;
  valido_hasta?: string;
  tipo_presu: 'con_diagnostico' | 'sin_diagnostico';
}

export interface PresupuestoProveedorCreate {
  usuario_id?: number;
  fecha_presupuesto?: string;
  estado?: 'nuevo' | 'enviado' | 'recibido' | 'aprobado' | 'rechazado';
  observaciones?: string;
  monto_presu_prov: number;
  nro_comprobante?: string;
  pedido_prov_id?: number;
}

export interface PresupuestoServicioUpdate {
  estado?: 'pendiente' | 'aprobado' | 'rechazado';
  monto_presu_ser?: number;
  observaciones?: string;
  descuento_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  promocion_id?: number;
  nro_presupuesto?: string;
  diagnostico_id?: number;
  valido_desde?: string;
  valido_hasta?: string;
  tipo_presu?: 'con_diagnostico' | 'sin_diagnostico';
}

export interface PresupuestoProveedorUpdate {
  estado?: 'nuevo' | 'enviado' | 'recibido' | 'aprobado' | 'rechazado';
  observaciones?: string;
  monto_presu_prov?: number;
  nro_comprobante?: string;
  pedido_prov_id?: number;
}

export interface PresupuestosServiciosApiResponse {
  success: boolean;
  message: string;
  data: PresupuestoServicio[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

export interface PresupuestosProveedoresApiResponse {
  success: boolean;
  message: string;
  data: PresupuestoProveedor[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

export interface PresupuestoServicioApiResponse {
  success: boolean;
  message: string;
  data: PresupuestoServicio;
  error?: string;
}

export interface PresupuestoProveedorApiResponse {
  success: boolean;
  message: string;
  data: PresupuestoProveedor;
  error?: string;
}

export interface FiltrosPresupuestosServicios {
  search?: string;
  estado?: string;
  tipo_presu?: string;
  usuario_id?: number;
  sucursal_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface FiltrosPresupuestosProveedores {
  search?: string;
  estado?: string;
  usuario_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PresupuestosServiciosStats {
  general: {
    total_presupuestos: number;
    monto_total: number;
    promedio_presupuesto: number;
  };
  hoy: {
    presupuestos_hoy: number;
    monto_hoy: number;
  };
  mes: {
    presupuestos_mes: number;
    monto_mes: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_tipo: Array<{
    tipo: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_usuario: Array<{
    usuario: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_dia: Array<{
    fecha: string;
    cantidad: number;
    monto_total: number;
  }>;
}

export interface PresupuestosProveedoresStats {
  general: {
    total_presupuestos: number;
    monto_total: number;
    promedio_presupuesto: number;
  };
  hoy: {
    presupuestos_hoy: number;
    monto_hoy: number;
  };
  mes: {
    presupuestos_mes: number;
    monto_mes: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_usuario: Array<{
    usuario: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_dia: Array<{
    fecha: string;
    cantidad: number;
    monto_total: number;
  }>;
}

export interface PresupuestosServiciosStatsResponse {
  success: boolean;
  message: string;
  data: PresupuestosServiciosStats;
  error?: string;
}

export interface PresupuestosProveedoresStatsResponse {
  success: boolean;
  message: string;
  data: PresupuestosProveedoresStats;
  error?: string;
}
