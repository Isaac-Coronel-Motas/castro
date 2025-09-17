// Tipos para módulos adicionales de Compras

// ===== ENUMS ADICIONALES =====
export type EstadoAjusteInventario = 'borrador' | 'validado' | 'anulado';
export type EstadoTransferencia = 'pendiente' | 'en_transito' | 'completada' | 'cancelada';
export type EstadoNotaCredito = 'activo' | 'inactivo' | 'anulado';
export type EstadoCuentaPagar = 'pendiente' | 'pagada' | 'vencida' | 'cancelada';
export type TipoOperacionNota = 'credito' | 'debito';
export type TipoMovimientoInventario = 'entrada' | 'salida' | 'correccion' | 'transferencia';

// ===== REGISTRO DE COMPRAS =====
export interface RegistroCompra {
  compra_id: number;
  proveedor_id: number;
  usuario_id?: number;
  fecha_compra: string;
  monto_compra: number;
  estado: string;
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: string;
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  tipo_doc_id: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exenta: number;
  monto_iva: number;
  // Campos adicionales para joins
  proveedor_nombre?: string;
  usuario_nombre?: string;
  almacen_nombre?: string;
  sucursal_nombre?: string;
  tipo_documento_nombre?: string;
  items?: DetalleCompra[];
  cuenta_por_pagar?: CuentaPorPagar;
  dias_vencimiento?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencida';
}

export interface CuentaPorPagar {
  cuenta_pagar_id: number;
  compra_id: number;
  proveedor_id: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  monto_adeudado: number;
  saldo_pendiente: number;
  estado: EstadoCuentaPagar;
  // Campos adicionales
  proveedor_nombre?: string;
  dias_vencimiento?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencida';
}

export interface CreateRegistroCompraRequest {
  proveedor_id: number;
  usuario_id?: number;
  fecha_compra?: string;
  monto_compra: number;
  estado?: string;
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: string;
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  tipo_doc_id: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  fecha_vencimiento?: string;
}

// ===== AJUSTES DE INVENTARIO =====
export interface AjusteInventario {
  ajuste_id: number;
  fecha: string;
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado: EstadoAjusteInventario;
  // Campos adicionales para joins
  usuario_nombre?: string;
  motivo_descripcion?: string;
  almacen_nombre?: string;
  items?: AjusteInventarioDetalle[];
  total_productos?: number;
  valor_total?: number;
  referencia?: string;
}

export interface AjusteInventarioDetalle {
  detalle_id: number;
  ajuste_id: number;
  producto_id: number;
  cantidad_ajustada: number;
  comentario?: string;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  stock_anterior?: number;
  stock_nuevo?: number;
  tipo_movimiento?: TipoMovimientoInventario;
  valor_unitario?: number;
  valor_total?: number;
}

export interface MotivoAjuste {
  motivo_id: number;
  descripcion: string;
}

export interface CreateAjusteInventarioRequest {
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado?: EstadoAjusteInventario;
  items: Array<{
    producto_id: number;
    cantidad_ajustada: number;
    comentario?: string;
  }>;
  referencia?: string;
}

// ===== NOTAS DE CRÉDITO/DÉBITO =====
export interface NotaCredito {
  nota_credito_id: number;
  tipo_operacion: TipoOperacionNota;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro: string;
  nro_nota?: string;
  motivo?: string;
  estado: EstadoNotaCredito;
  referencia_id: number;
  monto_nc?: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exenta: number;
  monto_iva: number;
  // Campos adicionales para joins
  proveedor_nombre?: string;
  cliente_nombre?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  items?: NotaCreditoDetalle[];
  total_items?: number;
  monto_total?: number;
  referencia_factura?: string;
  aprobado_por?: string;
}

export interface NotaCreditoDetalle {
  nota_credito_detalle_id: number;
  nota_credito_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreateNotaCreditoRequest {
  tipo_operacion: TipoOperacionNota;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro?: string;
  motivo?: string;
  estado?: EstadoNotaCredito;
  referencia_id: number;
  monto_nc?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario?: number;
  }>;
  referencia_factura?: string;
}

// ===== TRANSFERENCIAS =====
export interface TransferenciaStock {
  transferencia_id: number;
  fecha: string;
  usuario_id?: number;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
  estado: EstadoTransferencia;
  motivo?: string;
  // Campos adicionales para joins
  usuario_nombre?: string;
  almacen_origen_nombre?: string;
  almacen_destino_nombre?: string;
  items?: TransferenciaStockDetalle[];
  total_productos?: number;
  valor_total?: number;
  codigo_transferencia?: string;
  responsable?: string;
  observaciones?: string;
}

export interface TransferenciaStockDetalle {
  transferencia_detalle_id: number;
  transferencia_id: number;
  producto_id: number;
  cantidad: number;
  observaciones?: string;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  stock_disponible?: number;
  valor_unitario?: number;
  valor_total?: number;
}

export interface CreateTransferenciaStockRequest {
  usuario_id?: number;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
  estado?: EstadoTransferencia;
  motivo?: string;
  items: Array<{
    producto_id: number;
    cantidad: number;
    observaciones?: string;
  }>;
  responsable?: string;
  observaciones?: string;
}

// ===== INFORMES Y REPORTES =====
export interface InformeCompras {
  periodo: {
    desde: string;
    hasta: string;
  };
  resumen: {
    total_gastado: number;
    total_compras: number;
    promedio_compra: number;
    proveedores_activos: number;
    utilizacion_presupuesto: number;
    ordenes_procesadas: number;
  };
  gastos_vs_presupuesto: Array<{
    mes: string;
    gasto_real: number;
    presupuesto: number;
    diferencia: number;
    porcentaje_utilizacion: number;
  }>;
  top_proveedores: Array<{
    proveedor_id: number;
    proveedor_nombre: string;
    total_pedidos: number;
    monto_total: number;
    categoria_principal: string;
    porcentaje: number;
  }>;
  distribucion_categorias: Array<{
    categoria: string;
    porcentaje: number;
    monto_total: number;
    color: string;
  }>;
  tendencias: {
    gastos_mensuales: Array<{
      mes: string;
      monto: number;
      tendencia: 'up' | 'down' | 'stable';
    }>;
    compras_por_estado: Array<{
      estado: string;
      cantidad: number;
      porcentaje: number;
    }>;
  };
}

export interface FiltrosInforme {
  fecha_desde?: string;
  fecha_hasta?: string;
  sucursal_id?: number;
  proveedor_id?: number;
  categoria_id?: number;
  estado?: string;
  tipo_periodo?: 'semana' | 'mes' | 'trimestre' | 'año';
}

// ===== TIPOS DE RESPUESTA ADICIONALES =====
export interface ComprasAdicionalesApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ===== TIPOS DE DASHBOARD ADICIONALES =====
export interface DashboardRegistroCompras {
  compras_mes: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  gastos_acumulados: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  facturas_pagadas: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  pendientes_pago: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
}

export interface DashboardAjustesInventario {
  ajustes_mes: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  productos_afectados: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  entradas: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  valor_ajustado: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
}

export interface DashboardNotasCredito {
  total_notas: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  notas_credito: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  notas_debito: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  valor_neto: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
}

export interface DashboardTransferencias {
  total_transferencias: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  en_transito: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  completadas: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
  valor_total: {
    title: string;
    value: number;
    trend: number;
    trend_direction: 'up' | 'down';
    icon: string;
    color: string;
  };
}

// ===== TIPOS DE VALIDACIÓN ADICIONALES =====
export interface ComprasAdicionalesValidationError {
  field: string;
  message: string;
}

export interface ComprasAdicionalesValidationResult {
  valid: boolean;
  errors: ComprasAdicionalesValidationError[];
}

// ===== TIPOS DE FILTROS ADICIONALES =====
export interface FiltrosRegistroCompras {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  proveedor_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  tipo_documento_id?: number;
  monto_min?: number;
  monto_max?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencida';
}

export interface FiltrosAjustesInventario {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoAjusteInventario;
  motivo_id?: number;
  almacen_id?: number;
  usuario_id?: number;
  tipo_movimiento?: TipoMovimientoInventario;
}

export interface FiltrosNotasCredito {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_operacion?: TipoOperacionNota;
  estado?: EstadoNotaCredito;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

export interface FiltrosTransferencias {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoTransferencia;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
  usuario_id?: number;
}
