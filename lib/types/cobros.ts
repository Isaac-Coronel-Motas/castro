// Tipos para el módulo de cobros
export interface Cobro {
  cobro_id: number;
  venta_id: number;
  fecha_cobro: string;
  monto: number;
  usuario_id?: number;
  caja_id: number;
  observacion?: string;
  nro_factura?: string;
  venta_total?: number;
  fecha_venta?: string;
  cliente_nombre?: string;
  cliente_telefono?: string;
  usuario_nombre?: string;
  caja_nro?: string;
  sucursal_nombre?: string;
  forma_cobro_nombre?: string;
  codigo_cobro?: string;
}

export interface CobroCreate {
  venta_id: number;
  fecha_cobro?: string;
  monto: number;
  usuario_id?: number;
  caja_id: number;
  observacion?: string;
}

export interface CobroUpdate {
  monto?: number;
  caja_id?: number;
  observacion?: string;
  usuario_id?: number;
}

export interface CobrosApiResponse {
  success: boolean;
  message: string;
  data: Cobro[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  error?: string;
}

export interface CobroApiResponse {
  success: boolean;
  message: string;
  data: Cobro;
  error?: string;
}

export interface FiltrosCobros {
  search?: string;
  venta_id?: number;
  caja_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: number;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface CobroStats {
  general: {
    total_cobros: number;
    monto_total: number;
    promedio_cobro: number;
  };
  hoy: {
    cobros_hoy: number;
    monto_hoy: number;
  };
  mes: {
    cobros_mes: number;
    monto_mes: number;
  };
  por_forma_cobro: Array<{
    forma_cobro: string;
    cantidad: number;
    monto_total: number;
  }>;
  por_caja: Array<{
    caja: string;
    sucursal: string;
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

export interface CobroStatsResponse {
  success: boolean;
  message: string;
  data: CobroStats;
  error?: string;
}
