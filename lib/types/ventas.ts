// Tipos para módulo de Ventas

// ===== ENUMS =====
export type EstadoVenta = 'cerrado' | 'abierto' | 'cancelado';
export type EstadoPedidoVenta = 'pendiente' | 'confirmado' | 'cancelado';
export type EstadoPresupuestoVenta = 'pendiente' | 'aceptado' | 'rechazado';
export type EstadoRemision = 'pendiente' | 'enviado' | 'anulado';
export type EstadoNotaCredito = 'pendiente' | 'aprobada' | 'rechazada' | 'anulada';
export type EstadoNotaDebito = 'pendiente' | 'aprobada' | 'rechazada' | 'anulada';
export type EstadoCuenta = 'pendiente' | 'parcial' | 'pagada' | 'vencida';
export type CondicionPago = 'contado' | 'crédito';
export type EstadoCaja = 'abierta' | 'cerrada';

// ===== APERTURA/CIERRE CAJA =====
export interface AperturaCierreCaja {
  apertura_cierre_id: number;
  caja_id: number;
  fecha_apertura: string;
  monto_apertura: number;
  fecha_cierre?: string;
  hora_cierre?: string;
  monto_cierre?: number;
  estado: EstadoCaja;
  // Campos adicionales para joins
  caja_nro?: string;
  sucursal_nombre?: string;
  usuario_nombre?: string;
  diferencia?: number;
  total_ventas?: number;
  total_cobros?: number;
  total_movimientos?: number;
}

export interface CreateAperturaCierreCajaRequest {
  caja_id: number;
  fecha_apertura?: string;
  monto_apertura: number;
  fecha_cierre?: string;
  hora_cierre?: string;
  monto_cierre?: number;
  estado?: EstadoCaja;
}

// ===== PEDIDOS DE CLIENTES =====
export interface PedidoVenta {
  pedido_id: number;
  cliente_id: number;
  fecha_pedido: string;
  fecha_entrega?: string;
  estado: EstadoPedidoVenta;
  monto_total: number;
  observaciones?: string;
  usuario_id: number;
  sucursal_id: number;
  forma_cobro_id?: number;
  condicion_pago: CondicionPago;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  forma_cobro_nombre?: string;
  productos?: PedidoVentaDetalle[];
  total_productos?: number;
  dias_restantes?: number;
  estado_entrega?: 'por_vencer' | 'vencida' | 'vigente';
}

export interface PedidoVentaDetalle {
  detalle_id: number;
  pedido_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  subtotal?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_descripcion?: string;
}

export interface CreatePedidoVentaRequest {
  cliente_id: number;
  fecha_pedido?: string;
  fecha_entrega?: string;
  estado?: EstadoPedidoVenta;
  monto_total?: number;
  observaciones?: string;
  usuario_id: number;
  sucursal_id: number;
  forma_cobro_id?: number;
  condicion_pago?: CondicionPago;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }>;
}

// ===== REGISTRO DE VENTAS =====
export interface Venta {
  venta_id: number;
  cliente_id?: number;
  fecha_venta: string;
  estado: EstadoVenta;
  tipo_documento?: string;
  monto_venta: number;
  caja_id?: number;
  tipo_doc_id?: number;
  nro_factura?: number;
  forma_cobro_id?: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exenta: number;
  monto_iva: number;
  condicion_pago: CondicionPago;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  caja_nro?: string;
  sucursal_nombre?: string;
  forma_cobro_nombre?: string;
  tipo_documento_nombre?: string;
  productos?: VentaDetalle[];
  total_productos?: number;
  cobros?: Cobro[];
  total_cobros?: number;
  saldo_pendiente?: number;
}

export interface VentaDetalle {
  detalle_venta_id: number;
  venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  subtotal?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_descripcion?: string;
}

export interface CreateVentaRequest {
  cliente_id?: number;
  fecha_venta?: string;
  estado?: EstadoVenta;
  tipo_documento?: string;
  monto_venta?: number;
  caja_id?: number;
  tipo_doc_id?: number;
  nro_factura?: number;
  forma_cobro_id?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  condicion_pago?: CondicionPago;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }>;
}

// ===== COBROS =====
export interface Cobro {
  cobro_id: number;
  venta_id: number;
  fecha_cobro: string;
  monto: number;
  usuario_id?: number;
  caja_id: number;
  observacion?: string;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  venta_nro_factura?: number;
  usuario_nombre?: string;
  caja_nro?: string;
  sucursal_nombre?: string;
  forma_cobro_nombre?: string;
}

export interface CreateCobroRequest {
  venta_id: number;
  fecha_cobro?: string;
  monto: number;
  usuario_id?: number;
  caja_id: number;
  observacion?: string;
}

// ===== PRESUPUESTOS DE VENTAS =====
export interface PresupuestoVenta {
  presupuesto_id: number;
  cliente_id: number;
  fecha_presupuesto: string;
  fecha_vencimiento?: string;
  estado: EstadoPresupuestoVenta;
  monto_total: number;
  observaciones?: string;
  usuario_id: number;
  sucursal_id: number;
  forma_cobro_id?: number;
  condicion_pago: CondicionPago;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  forma_cobro_nombre?: string;
  productos?: PresupuestoVentaDetalle[];
  total_productos?: number;
  dias_validez?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencido';
}

export interface PresupuestoVentaDetalle {
  detalle_id: number;
  presupuesto_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  descuento?: number;
  subtotal?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_descripcion?: string;
}

export interface CreatePresupuestoVentaRequest {
  cliente_id: number;
  fecha_presupuesto?: string;
  fecha_vencimiento?: string;
  estado?: EstadoPresupuestoVenta;
  monto_total?: number;
  observaciones?: string;
  usuario_id: number;
  sucursal_id: number;
  forma_cobro_id?: number;
  condicion_pago?: CondicionPago;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }>;
}

// ===== NOTAS DE REMISIÓN =====
export interface NotaRemision {
  remision_id: number;
  fecha_remision: string;
  usuario_id: number;
  origen_almacen_id: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision: string;
  referencia_id?: number;
  estado: EstadoRemision;
  observaciones?: string;
  // Campos adicionales para joins
  usuario_nombre?: string;
  origen_almacen_nombre?: string;
  destino_sucursal_nombre?: string;
  destino_almacen_nombre?: string;
  productos?: NotaRemisionDetalle[];
  total_productos?: number;
}

export interface NotaRemisionDetalle {
  detalle_id: number;
  remision_id: number;
  producto_id: number;
  cantidad: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_descripcion?: string;
}

export interface CreateNotaRemisionRequest {
  fecha_remision?: string;
  usuario_id: number;
  origen_almacen_id: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision: string;
  referencia_id?: number;
  estado?: EstadoRemision;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
  }>;
}

// ===== NOTAS DE CRÉDITO/DÉBITO =====
export interface NotaCreditoCabecera {
  nota_credito_id: number;
  tipo_operacion: string;
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
  monto_iva_5: number;
  monto_iva_10: number;
  monto_iva: number;
  monto_total: number;
  // Campos adicionales para joins
  cliente_nombre?: string;
  proveedor_nombre?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  productos?: NotaCreditoDetalle[];
  total_productos?: number;
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
  producto_descripcion?: string;
}

export interface NotaDebitoCabecera {
  nota_debito_id: number;
  tipo_operacion: string;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro: string;
  nro_nota?: string;
  motivo?: string;
  estado: EstadoNotaDebito;
  referencia_id: number;
  monto_nd?: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exenta: number;
  monto_iva_5: number;
  monto_iva_10: number;
  monto_iva: number;
  monto_total: number;
  // Campos adicionales para joins
  cliente_nombre?: string;
  proveedor_nombre?: string;
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  productos?: NotaDebitoDetalle[];
  total_productos?: number;
}

export interface NotaDebitoDetalle {
  nota_debito_detalle_id: number;
  nota_debito_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  producto_descripcion?: string;
}

export interface CreateNotaCreditoRequest {
  tipo_operacion: string;
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
  monto_iva_5?: number;
  monto_iva_10?: number;
  monto_iva?: number;
  monto_total?: number;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario?: number;
  }>;
}

export interface CreateNotaDebitoRequest {
  tipo_operacion: string;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro?: string;
  motivo?: string;
  estado?: EstadoNotaDebito;
  referencia_id: number;
  monto_nd?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva_5?: number;
  monto_iva_10?: number;
  monto_iva?: number;
  monto_total?: number;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario?: number;
  }>;
}

// ===== CUENTAS POR COBRAR =====
export interface CuentaPorCobrar {
  cuenta_cobrar_id: number;
  venta_id: number;
  cliente_id: number;
  fecha_emision: string;
  fecha_vencimiento?: string;
  monto_total: number;
  saldo_pendiente: number;
  estado: EstadoCuenta;
  usuario_id: number;
  // Campos adicionales para joins
  cliente_nombre?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  venta_nro_factura?: number;
  usuario_nombre?: string;
  dias_vencimiento?: number;
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencida';
}

// ===== MOVIMIENTOS DE CAJA =====
export interface MovimientoCaja {
  movimiento_id: number;
  caja_id: number;
  fecha: string;
  tipo_movimiento_id: number;
  monto: number;
  descripcion?: string;
  forma_pago_id?: number;
  referencia_id?: number;
  referencia_tipo?: string;
  usuario_id: number;
  // Campos adicionales para joins
  caja_nro?: string;
  sucursal_nombre?: string;
  tipo_movimiento_nombre?: string;
  forma_pago_nombre?: string;
  usuario_nombre?: string;
}

// ===== TIPOS DE RESPUESTA =====
export interface VentasApiResponse<T = any> {
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

// ===== TIPOS DE VALIDACIÓN =====
export interface VentasValidationError {
  field: string;
  message: string;
}

export interface VentasValidationResult {
  valid: boolean;
  errors: VentasValidationError[];
}

// ===== TIPOS DE FILTROS =====
export interface FiltrosAperturaCierreCaja {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoCaja;
  caja_id?: number;
  sucursal_id?: number;
}

export interface FiltrosPedidosVenta {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoPedidoVenta;
  cliente_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
  forma_cobro_id?: number;
  condicion_pago?: CondicionPago;
}

export interface FiltrosVentas {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoVenta;
  cliente_id?: number;
  caja_id?: number;
  sucursal_id?: number;
  forma_cobro_id?: number;
  condicion_pago?: CondicionPago;
  tipo_documento?: string;
}

export interface FiltrosCobros {
  fecha_desde?: string;
  fecha_hasta?: string;
  cliente_id?: number;
  caja_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
}

export interface FiltrosPresupuestosVenta {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoPresupuestoVenta;
  cliente_id?: number;
  sucursal_id?: number;
  usuario_id?: number;
  forma_cobro_id?: number;
  condicion_pago?: CondicionPago;
}

export interface FiltrosNotasRemision {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoRemision;
  usuario_id?: number;
  origen_almacen_id?: number;
  destino_sucursal_id?: number;
  destino_almacen_id?: number;
  tipo_remision?: string;
}

export interface FiltrosNotasCreditoDebito {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: EstadoNotaCredito | EstadoNotaDebito;
  cliente_id?: number;
  proveedor_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  usuario_id?: number;
  tipo_operacion?: string;
}

// ===== TIPOS DE ESTADÍSTICAS =====
export interface VentasStats {
  total_ventas: number;
  total_cobros: number;
  total_pedidos: number;
  total_presupuestos: number;
  total_remisiones: number;
  total_notas_credito: number;
  total_notas_debito: number;
  monto_total_ventas: number;
  monto_total_cobros: number;
  monto_total_pedidos: number;
  monto_total_presupuestos: number;
  ventas_pendientes: number;
  cobros_pendientes: number;
  pedidos_pendientes: number;
  presupuestos_pendientes: number;
  cuentas_por_cobrar: number;
  monto_cuentas_por_cobrar: number;
  promedio_venta: number;
  ticket_promedio: number;
}

// ===== TIPOS DE INFORMES =====
export interface InformeVentas {
  periodo: {
    desde: string;
    hasta: string;
  };
  resumen: {
    total_ventas: number;
    total_cobros: number;
    total_pedidos: number;
    total_presupuestos: number;
    total_remisiones: number;
    total_notas_credito: number;
    total_notas_debito: number;
    monto_total_ventas: number;
    monto_total_cobros: number;
    monto_total_pedidos: number;
    monto_total_presupuestos: number;
    cuentas_por_cobrar: number;
    monto_cuentas_por_cobrar: number;
    promedio_venta: number;
    ticket_promedio: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  por_cliente: Array<{
    cliente_id: number;
    cliente_nombre: string;
    total_ventas: number;
    monto_total: number;
    porcentaje: number;
  }>;
  por_sucursal: Array<{
    sucursal_id: number;
    sucursal_nombre: string;
    total_ventas: number;
    monto_total: number;
    porcentaje: number;
  }>;
  por_producto: Array<{
    producto_id: number;
    producto_nombre: string;
    total_vendido: number;
    monto_total: number;
    porcentaje: number;
  }>;
  por_forma_cobro: Array<{
    forma_cobro_id: number;
    forma_cobro_nombre: string;
    total_ventas: number;
    monto_total: number;
    porcentaje: number;
  }>;
  tendencias: {
    ventas_mensuales: Array<{
      mes: string;
      cantidad: number;
      monto: number;
      tendencia: 'up' | 'down' | 'stable';
    }>;
    cobros_mensuales: Array<{
      mes: string;
      cantidad: number;
      monto: number;
      tendencia: 'up' | 'down' | 'stable';
    }>;
  };
}
