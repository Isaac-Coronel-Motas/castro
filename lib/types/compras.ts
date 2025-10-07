// Tipos para el módulo de Compras

// ===== PEDIDOS DE COMPRA =====
export interface PedidoCompra {
  pedido_compra_id: number;
  fecha_pedido: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  usuario_id: number;
  comentario?: string;
  sucursal_id: number;
  almacen_id: number;
  nro_comprobante: string;
  // Campos adicionales para la vista
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  total_items?: number;
  monto_total?: number;
}

export interface CreatePedidoCompraRequest {
  fecha_pedido?: string;
  estado?: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  usuario_id: number;
  comentario?: string;
  sucursal_id: number;
  almacen_id: number;
  detalles?: PedidoCompraDetalle[];
  proveedores?: PedidoProveedor[];
}

export interface PedidoProveedor {
  proveedor_id: number;
  fecha_envio?: string;
}

export interface UpdatePedidoCompraRequest extends CreatePedidoCompraRequest {
  pedido_compra_id: number;
}

export interface PedidoCompraDetalle {
  detalle_id?: number;
  pedido_compra_id?: number;
  producto_id: number;
  cantidad: number;
  precio_unitario?: number;
  subtotal?: number;
  // Campos adicionales
  producto_nombre?: string;
  cod_product?: string;
}

// ===== PRESUPUESTOS PROVEEDOR =====
export interface PresupuestoProveedor {
  presu_prov_id: number;
  usuario_id: number;
  fecha_presupuesto: string;
  estado: 'nuevo' | 'pendiente' | 'aprobado' | 'rechazado';
  observaciones?: string;
  monto_presu_prov: number;
  nro_comprobante: string;
  pedido_prov_id?: number;
  // Campos adicionales para la vista
  usuario_nombre?: string;
  proveedor_nombre?: string;
  proveedor_id?: number;
  total_detalles?: number;
}

export interface DetallePresupuesto {
  detalle_presup_id: number;
  presu_prov_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  nombre_producto?: string;
  cod_product?: string;
  descripcion_producto?: string;
  subtotal?: number;
}

export interface CreatePresupuestoProveedorRequest {
  usuario_id: number;
  fecha_presupuesto?: string;
  estado?: 'nuevo' | 'pendiente' | 'aprobado' | 'rechazado';
  observaciones?: string;
  monto_presu_prov?: number;
  pedido_prov_id?: number;
  proveedor_id?: number; // Agregado para selección directa de proveedor
  detalles?: DetallePresupuesto[];
}

export interface UpdatePresupuestoProveedorRequest extends CreatePresupuestoProveedorRequest {
  presu_prov_id: number;
}

// ===== ÓRDENES DE COMPRA =====
export interface OrdenCompra {
  orden_compra_id: number;
  proveedor_id: number;
  usuario_id: number;
  presu_prov_id?: number;
  fecha_orden: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  monto_oc: number;
  observaciones?: string;
  almacen_id?: number;
  nro_comprobante: string;
  // Campos adicionales para la vista
  proveedor_nombre?: string;
  usuario_nombre?: string;
  almacen_nombre?: string;
  fecha_entrega?: string;
  progreso?: number;
  dias_restantes?: number;
  prioridad?: 'alta' | 'media' | 'baja';
  estado_vencimiento?: 'vigente' | 'por_vencer' | 'vencida';
}

export interface CreateOrdenCompraRequest {
  proveedor_id: number;
  usuario_id: number;
  presu_prov_id?: number;
  fecha_orden?: string;
  estado?: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  monto_oc?: number;
  observaciones?: string;
  almacen_id?: number;
  fecha_entrega?: string;
  prioridad?: 'alta' | 'media' | 'baja';
}

export interface UpdateOrdenCompraRequest extends CreateOrdenCompraRequest {
  orden_compra_id: number;
}

// ===== REGISTRO DE COMPRAS =====
export interface CompraCabecera {
  compra_id: number;
  proveedor_id: number;
  usuario_id: number;
  fecha_compra: string;
  monto_compra: number;
  estado: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: 'contado' | 'credito_15' | 'credito_30' | 'credito_45' | 'credito_60';
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  tipo_doc_id: number;
  // Campos adicionales para la vista
  proveedor_nombre?: string;
  usuario_nombre?: string;
  almacen_nombre?: string;
  sucursal_nombre?: string;
  tipo_doc_nombre?: string;
}

export interface CreateCompraCabeceraRequest {
  proveedor_id: number;
  usuario_id: number;
  fecha_compra?: string;
  monto_compra: number;
  estado?: 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: 'contado' | 'credito_15' | 'credito_30' | 'credito_45' | 'credito_60';
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  tipo_doc_id: number;
}

export interface UpdateCompraCabeceraRequest extends CreateCompraCabeceraRequest {
  compra_id: number;
}

// ===== AJUSTES DE INVENTARIO =====
export interface AjusteInventario {
  ajuste_id: number;
  fecha: string;
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado: 'borrador' | 'validado' | 'anulado';
  // Campos adicionales para la vista
  usuario_nombre?: string;
  motivo_nombre?: string;
  almacen_nombre?: string;
  total_items?: number;
  monto_total?: number;
}

export interface CreateAjusteInventarioRequest {
  usuario_id: number;
  motivo_id: number;
  observaciones?: string;
  almacen_id: number;
  estado?: 'borrador' | 'validado' | 'anulado';
  detalles?: AjusteInventarioDetalle[];
}

export interface UpdateAjusteInventarioRequest extends CreateAjusteInventarioRequest {
  ajuste_id: number;
}

export interface AjusteInventarioDetalle {
  detalle_id?: number;
  ajuste_id?: number;
  producto_id: number;
  cantidad_ajustada: number;
  comentario?: string;
  // Campos adicionales
  producto_nombre?: string;
  cod_product?: string;
  stock_actual?: number;
}

// ===== NOTAS DE CRÉDITO/DÉBITO =====
export interface NotaCredito {
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
  estado: 'activo' | 'anulado';
  referencia_id: number;
  monto_nc: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exento: number;
  total_iva: number;
  total_nota: number;
  // Campos adicionales para la vista
  proveedor_nombre?: string;
  cliente_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  usuario_nombre?: string;
  estado_display?: string;
}

export interface NotaDebito {
  nota_debito_id: number;
  tipo_operacion: 'compra' | 'venta';
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro: string;
  nro_nota: string;
  motivo?: string;
  estado: 'activo' | 'anulado';
  referencia_id: number;
  monto_nd: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exento: number;
  total_iva: number;
  total_nota: number;
  // Campos adicionales para la vista
  proveedor_nombre?: string;
  cliente_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  usuario_nombre?: string;
  estado_display?: string;
}

export interface CreateNotaCreditoRequest {
  tipo_operacion: 'compra' | 'venta';
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro?: string;
  motivo?: string;
  estado?: 'activo' | 'anulado';
  referencia_id: number;
  monto_nc?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exento?: number;
  total_iva?: number;
  total_nota?: number;
}

export interface CreateNotaDebitoRequest {
  tipo_operacion: 'compra' | 'venta';
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id: number;
  almacen_id: number;
  usuario_id: number;
  fecha_registro?: string;
  motivo?: string;
  estado?: 'activo' | 'anulado';
  referencia_id: number;
  monto_nd?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exento?: number;
  total_iva?: number;
  total_nota?: number;
}

export interface UpdateNotaCreditoRequest extends CreateNotaCreditoRequest {
  nota_credito_id: number;
}

export interface UpdateNotaDebitoRequest extends CreateNotaDebitoRequest {
  nota_debito_id: number;
}

// ===== TRANSFERENCIAS =====
export interface TransferenciaStock {
  transferencia_id: number;
  fecha: string;
  usuario_id: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  estado: 'pendiente' | 'enviada' | 'recibida' | 'cancelada';
  motivo?: string;
  // Campos adicionales para la vista
  usuario_nombre?: string;
  almacen_origen_nombre?: string;
  almacen_destino_nombre?: string;
  total_items?: number;
  monto_total?: number;
}

export interface CreateTransferenciaStockRequest {
  usuario_id: number;
  almacen_origen_id: number;
  almacen_destino_id: number;
  estado?: 'pendiente' | 'enviada' | 'recibida' | 'cancelada';
  motivo?: string;
  detalles?: TransferenciaStockDetalle[];
}

export interface UpdateTransferenciaStockRequest extends CreateTransferenciaStockRequest {
  transferencia_id: number;
}

export interface TransferenciaStockDetalle {
  transferencia_detalle_id?: number;
  transferencia_id?: number;
  producto_id: number;
  cantidad: number;
  observaciones?: string;
  // Campos adicionales
  producto_nombre?: string;
  cod_product?: string;
  stock_disponible?: number;
}

// ===== TIPOS COMUNES =====
export interface ComprasApiResponse<T = any> {
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

export interface ComprasPaginationParams {
  page: number;
  limit: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

// ===== FILTROS ESPECÍFICOS =====
export interface FiltrosPedidosCompra {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  usuario_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

export interface FiltrosPresupuestosProveedor {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  usuario_id?: number;
}

export interface FiltrosOrdenesCompra {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  almacen_id?: number;
}

export interface FiltrosCompras {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

export interface FiltrosAjustesInventario {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  motivo_id?: number;
  almacen_id?: number;
}

export interface FiltrosNotasCredito {
  tipo_operacion?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

export interface FiltrosNotasDebito {
  tipo_operacion?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  cliente_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

export interface FiltrosTransferencias {
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  almacen_origen_id?: number;
  almacen_destino_id?: number;
}