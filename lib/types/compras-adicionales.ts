// Tipos adicionales para APIs de compras

// ===== TIPOS PARA REGISTRO DE COMPRAS =====
export interface CreateRegistroCompraRequest {
  proveedor_id: number;
  usuario_id: number;
  sucursal_id: number;
  tipo_doc_id: number;
  fecha_compra?: string;
  monto_compra: number;
  estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  condicion_pago?: 'contado' | 'credito_15' | 'credito_30' | 'credito_45' | 'credito_60';
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  fecha_vencimiento?: string;
  items?: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface FiltrosRegistroCompras {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  proveedor_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  tipo_documento_id?: number;
  estado_vencimiento?: string;
}

// ===== TIPOS PARA COMPRAS ADICIONALES =====
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

// ===== VALIDACIÓN DE DATOS =====
export interface ValidationResult {
  valid: boolean;
  errors?: { [key: string]: string };
}

// ===== FUNCIONES DE UTILIDAD =====
export interface SearchParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationParams {
  limitParam: number;
  offsetParam: number;
}

export interface SearchWhereClause {
  whereClause: string;
  params: any[];
}

export interface OrderByClause {
  orderByClause: string;
}

// ===== TIPOS PARA GENERACIÓN DE NÚMEROS =====
export type TipoComprobante = 'PC' | 'PP' | 'OC' | 'RC' | 'AI' | 'NC' | 'ND' | 'TS';

// ===== TIPOS PARA CÁLCULOS =====
export interface CalculosProgreso {
  progreso: number;
  dias_restantes: number;
  prioridad: 'alta' | 'media' | 'baja';
  estado_vencimiento: 'vigente' | 'por_vencer' | 'vencida';
}

// ===== TIPOS PARA LOGS DE AUDITORÍA =====
export interface LogAuditoria {
  accion: string;
  tabla: string;
  registro_id: number;
  datos_anteriores?: any;
  datos_nuevos?: any;
  usuario_id: number;
  timestamp: string;
}

// ===== TIPOS PARA DASHBOARD =====
export interface MetricasCompras {
  total_pedidos: number;
  pedidos_pendientes: number;
  pedidos_aprobados: number;
  valor_total_pedidos: number;
  total_presupuestos: number;
  presupuestos_pendientes: number;
  presupuestos_aprobados: number;
  valor_estimado_presupuestos: number;
  total_ordenes: number;
  ordenes_en_proceso: number;
  ordenes_completadas: number;
  valor_total_ordenes: number;
  total_compras: number;
  compras_pendientes: number;
  compras_confirmadas: number;
  valor_total_compras: number;
}

// ===== TIPOS PARA INFORMES =====
export interface InformeCompras {
  periodo: {
    fecha_desde: string;
    fecha_hasta: string;
  };
  resumen: {
    total_pedidos: number;
    total_presupuestos: number;
    total_ordenes: number;
    total_compras: number;
    valor_total_compras: number;
    valor_total_ordenes: number;
  };
  detalles: {
    pedidos: any[];
    presupuestos: any[];
    ordenes: any[];
    compras: any[];
  };
}

// ===== TIPOS PARA ESTADOS =====
export type EstadoPedidoCompra = 'pendiente' | 'procesado' | 'cancelado' | 'aprobado';
export type EstadoPresupuestoProveedor = 'nuevo' | 'enviado' | 'recibido' | 'aprobado' | 'rechazado' | 'vencido';
export type EstadoOrdenCompra = 'pendiente' | 'confirmada' | 'enviada' | 'entregada' | 'cancelada';
export type EstadoCompra = 'pendiente' | 'confirmada' | 'anulada';
export type EstadoAjusteInventario = 'borrador' | 'validado' | 'anulado';
export type EstadoNotaCredito = 'activo' | 'anulado';
export type EstadoNotaDebito = 'activo' | 'anulado';
export type EstadoTransferencia = 'pendiente' | 'enviada' | 'recibida' | 'cancelada';

// ===== TIPOS PARA CONDICIONES DE PAGO =====
export type CondicionPago = 'contado' | 'credito_15' | 'credito_30' | 'credito_45' | 'credito_60';

// ===== TIPOS PARA OPERACIONES =====
export type TipoOperacion = 'compra' | 'venta';

// ===== TIPOS PARA PRIORIDADES =====
export type Prioridad = 'alta' | 'media' | 'baja';

// ===== TIPOS PARA ESTADOS DE VENCIMIENTO =====
export type EstadoVencimiento = 'vigente' | 'por_vencer' | 'vencida';

// ===== TIPOS PARA TENDENCIAS =====
export type Tendencia = 'up' | 'down';

// ===== TIPOS PARA COLORES DE ESTADO =====
export interface ColoresEstado {
  [key: string]: string;
}

// ===== TIPOS PARA ICONOS DE ESTADO =====
export interface IconosEstado {
  [key: string]: string;
}

// ===== TIPOS PARA FILTROS AVANZADOS =====
export interface FiltrosAvanzados {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  usuario_id?: number;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  motivo_id?: number;
  tipo_operacion?: string;
  condicion_pago?: string;
  prioridad?: string;
}

// ===== TIPOS PARA BÚSQUEDA AVANZADA =====
export interface BusquedaAvanzada {
  campos: string[];
  termino: string;
  condiciones_adicionales?: string[];
  parametros?: any[];
}

// ===== TIPOS PARA ORDENAMIENTO AVANZADO =====
export interface OrdenamientoAvanzado {
  campo: string;
  direccion: 'asc' | 'desc';
  campo_default?: string;
}

// ===== TIPOS PARA PAGINACIÓN AVANZADA =====
export interface PaginacionAvanzada {
  pagina: number;
  limite: number;
  offset: number;
  total: number;
  total_paginas: number;
}

// ===== TIPOS PARA RESPUESTAS DE API =====
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginacionAvanzada;
}

// ===== TIPOS PARA ERRORES =====
export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// ===== TIPOS PARA PERMISOS =====
export interface PermisosCompras {
  leer_pedidos_compra: boolean;
  crear_pedidos_compra: boolean;
  actualizar_pedidos_compra: boolean;
  eliminar_pedidos_compra: boolean;
  leer_presupuestos_proveedor: boolean;
  crear_presupuestos_proveedor: boolean;
  actualizar_presupuestos_proveedor: boolean;
  eliminar_presupuestos_proveedor: boolean;
  leer_ordenes_compra: boolean;
  crear_ordenes_compra: boolean;
  actualizar_ordenes_compra: boolean;
  eliminar_ordenes_compra: boolean;
  leer_compras: boolean;
  crear_compras: boolean;
  actualizar_compras: boolean;
  eliminar_compras: boolean;
  leer_ajustes_inventario: boolean;
  crear_ajustes_inventario: boolean;
  actualizar_ajustes_inventario: boolean;
  eliminar_ajustes_inventario: boolean;
  leer_notas_credito: boolean;
  crear_notas_credito: boolean;
  actualizar_notas_credito: boolean;
  eliminar_notas_credito: boolean;
  leer_notas_debito: boolean;
  crear_notas_debito: boolean;
  actualizar_notas_debito: boolean;
  eliminar_notas_debito: boolean;
  leer_transferencias: boolean;
  crear_transferencias: boolean;
  actualizar_transferencias: boolean;
  eliminar_transferencias: boolean;
  leer_informes_compras: boolean;
}

// ===== INTERFACES PARA AJUSTES DE INVENTARIO =====

export interface AjusteInventario {
  ajuste_id: number;
  fecha: string;
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado: EstadoAjusteInventario;
  // Campos adicionales para la vista
  usuario_nombre?: string;
  motivo_descripcion?: string;
  almacen_nombre?: string;
  codigo_ajuste?: string;
  total_productos?: number;
  valor_total?: number;
  detalles?: AjusteInventarioDetalle[];
}

export interface AjusteInventarioDetalle {
  detalle_id: number;
  ajuste_id: number;
  producto_id: number;
  cantidad_ajustada: number;
  comentario?: string;
  // Campos adicionales para la vista
  producto_nombre?: string;
  producto_codigo?: string;
  precio_costo?: number;
  stock_anterior?: number;
  stock_nuevo?: number;
  tipo_movimiento?: 'entrada' | 'salida' | 'correccion';
}

export interface CreateAjusteInventarioRequest {
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado?: EstadoAjusteInventario;
  items?: {
    producto_id: number;
    cantidad_ajustada: number;
    comentario?: string;
  }[];
}

export interface UpdateAjusteInventarioRequest {
  motivo_id?: number;
  observaciones?: string;
  almacen_id?: number;
  estado?: EstadoAjusteInventario;
  items?: {
    producto_id: number;
    cantidad_ajustada: number;
    comentario?: string;
  }[];
}

export interface MotivoAjuste {
  motivo_id: number;
  descripcion: string;
}

export interface FiltrosAjustesInventario {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoAjusteInventario;
  motivo_id?: number;
  almacen_id?: number;
  usuario_id?: number;
  tipo_movimiento?: 'entrada' | 'salida' | 'correccion';
}

// ===== INTERFACES PARA NOTAS DE CRÉDITO/DÉBITO =====

export interface NotaCreditoDebito {
  nota_credito_id: number;
  tipo_operacion: 'compra' | 'venta';
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro: string;
  nro_nota: string;
  motivo?: string;
  estado: EstadoNotaCredito;
  referencia_id: number;
  monto_nc?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  // Campos adicionales para la vista
  proveedor_nombre?: string;
  cliente_nombre?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  total_items?: number;
  monto_total_items?: number;
  tipo_operacion_display?: string;
  estado_display?: string;
  detalles?: NotaCreditoDebitoDetalle[];
}

export interface NotaCreditoDebitoDetalle {
  nota_credito_detalle_id: number;
  nota_credito_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para la vista
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreateNotaCreditoDebitoRequest {
  tipo_operacion: 'compra' | 'venta';
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
  items?: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface UpdateNotaCreditoDebitoRequest {
  tipo_operacion?: 'compra' | 'venta';
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  motivo?: string;
  estado?: EstadoNotaCredito;
  referencia_id?: number;
  monto_nc?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  items?: {
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }[];
}

export interface FiltrosNotasCreditoDebito {
  fecha_desde?: string;
  fecha_hasta?: string;
  tipo_operacion?: 'compra' | 'venta';
  estado?: EstadoNotaCredito;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  usuario_id?: number;
}

// ===== TRANSFERENCIAS DE STOCK =====

export interface TransferenciaStockDetalle {
  transferencia_detalle_id?: number;
  transferencia_id?: number;
  producto_id: number;
  cantidad: number;
  observaciones?: string;
}

export interface TransferenciaStock {
  transferencia_id: number;
  fecha: string;
  usuario_id: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  estado: 'pendiente' | 'en_transito' | 'completada' | 'cancelada';
  motivo?: string;
  // Campos adicionales para la vista
  usuario_nombre?: string;
  almacen_origen_nombre?: string;
  almacen_destino_nombre?: string;
  total_productos?: number;
  valor_total?: number;
  codigo_transferencia?: string;
  estado_display?: string;
  detalles?: TransferenciaStockDetalle[];
}

export interface CreateTransferenciaStockRequest {
  usuario_id: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  fecha?: string;
  estado?: 'pendiente' | 'en_transito' | 'completada' | 'cancelada';
  motivo?: string;
  items: TransferenciaStockDetalle[];
}

export interface UpdateTransferenciaStockRequest extends CreateTransferenciaStockRequest {
  transferencia_id: number;
}

export interface FiltrosTransferencias {
  estado?: 'pendiente' | 'en_transito' | 'completada' | 'cancelada';
  fecha_desde?: string;
  fecha_hasta?: string;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
  usuario_id?: number;
}