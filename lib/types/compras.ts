// Tipos para módulo de Compras

// ===== ENUMS =====
export type EstadoCompra = 'pendiente' | 'en_progreso' | 'completada' | 'cancelada';
export type EstadoPedidoCompra = 'pendiente' | 'procesado' | 'cancelado';
export type EstadoOrdenCompra = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
export type EstadoPresupuesto = 'nuevo' | 'pendiente' | 'aprobado' | 'rechazado';
export type CondicionPago = 'contado' | 'credito_15' | 'credito_30' | 'credito_60' | 'credito_90';
export type TipoPresupuesto = 'con_diagnostico' | 'sin_diagnostico';

// ===== PEDIDOS DE COMPRA =====
export interface PedidoCompra {
  pedido_compra_id: number;
  fecha_pedido: string;
  estado: EstadoPedidoCompra;
  usuario_id?: number;
  comentario?: string;
  sucursal_id?: number;
  almacen_id?: number;
  nro_comprobante?: string;
  // Campos adicionales para joins
  usuario_nombre?: string;
  sucursal_nombre?: string;
  almacen_nombre?: string;
  proveedores?: PedidoProveedor[];
  items?: DetallePedidoCompra[];
  total_items?: number;
  monto_total?: number;
}

export interface PedidoProveedor {
  pedido_prov_id: number;
  pedido_compra_id: number;
  proveedor_id: number;
  fecha_envio: string;
  usuario_id: number;
  // Campos adicionales para joins
  proveedor_nombre?: string;
  usuario_nombre?: string;
}

export interface DetallePedidoCompra {
  ped_compra_det_id: number;
  pedido_compra_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreatePedidoCompraRequest {
  fecha_pedido?: string;
  estado?: EstadoPedidoCompra;
  comentario?: string;
  sucursal_id?: number;
  almacen_id?: number;
  nro_comprobante?: string;
  proveedores?: Array<{
    proveedor_id: number;
    fecha_envio?: string;
  }>;
  items?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

export interface UpdatePedidoCompraRequest {
  fecha_pedido?: string;
  estado?: EstadoPedidoCompra;
  comentario?: string;
  sucursal_id?: number;
  almacen_id?: number;
  nro_comprobante?: string;
  proveedores?: Array<{
    proveedor_id: number;
    fecha_envio?: string;
  }>;
  items?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

// ===== PRESUPUESTOS PROVEEDOR =====
export interface PresupuestoProveedor {
  presu_prov_id: number;
  usuario_id?: number;
  fecha_presupuesto: string;
  estado: EstadoPresupuesto;
  observaciones?: string;
  monto_presu_prov?: number;
  nro_comprobante?: string;
  pedido_prov_id?: number;
  // Campos adicionales para joins
  usuario_nombre?: string;
  proveedor_nombre?: string;
  proveedor_id?: number;
  items?: PresupuestoProveedorDetalle[];
  dias_validez?: number;
  prioridad?: 'alta' | 'media' | 'baja';
}

export interface PresupuestoProveedorDetalle {
  det_pres_prov_id: number;
  presu_prov_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreatePresupuestoProveedorRequest {
  usuario_id?: number;
  fecha_presupuesto?: string;
  estado?: EstadoPresupuesto;
  observaciones?: string;
  monto_presu_prov?: number;
  nro_comprobante?: string;
  pedido_prov_id?: number;
  proveedor_id: number;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  dias_validez?: number;
  prioridad?: 'alta' | 'media' | 'baja';
}

export interface UpdatePresupuestoProveedorRequest {
  usuario_id?: number;
  fecha_presupuesto?: string;
  estado?: EstadoPresupuesto;
  observaciones?: string;
  monto_presu_prov?: number;
  nro_comprobante?: string;
  items?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  dias_validez?: number;
  prioridad?: 'alta' | 'media' | 'baja';
}

// ===== ÓRDENES DE COMPRA =====
export interface OrdenCompra {
  orden_compra_id: number;
  proveedor_id: number;
  usuario_id?: number;
  presu_prov_id?: number;
  fecha_orden: string;
  estado: EstadoOrdenCompra;
  monto_oc?: number;
  observaciones?: string;
  almacen_id?: number;
  nro_comprobante?: string;
  // Campos adicionales para joins
  proveedor_nombre?: string;
  usuario_nombre?: string;
  almacen_nombre?: string;
  items?: OrdenCompraDetalle[];
  tracking?: string;
  fecha_entrega?: string;
  progreso?: number;
  dias_restantes?: number;
}

export interface OrdenCompraDetalle {
  det_orden_compra_id: number;
  orden_compra_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreateOrdenCompraRequest {
  proveedor_id: number;
  usuario_id?: number;
  presu_prov_id?: number;
  fecha_orden?: string;
  estado?: EstadoOrdenCompra;
  monto_oc?: number;
  observaciones?: string;
  almacen_id?: number;
  nro_comprobante?: string;
  items: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  tracking?: string;
  fecha_entrega?: string;
}

export interface UpdateOrdenCompraRequest {
  proveedor_id?: number;
  usuario_id?: number;
  presu_prov_id?: number;
  fecha_orden?: string;
  estado?: EstadoOrdenCompra;
  monto_oc?: number;
  observaciones?: string;
  almacen_id?: number;
  nro_comprobante?: string;
  items?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
  tracking?: string;
  fecha_entrega?: string;
}

// ===== REGISTRO DE COMPRAS =====
export interface CompraCabecera {
  compra_id: number;
  proveedor_id: number;
  usuario_id?: number;
  fecha_compra: string;
  monto_compra: number;
  estado: EstadoCompra;
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: CondicionPago;
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
}

export interface DetalleCompra {
  detalle_compra_id: number;
  compra_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_codigo?: string;
  subtotal?: number;
}

export interface CreateCompraRequest {
  proveedor_id: number;
  usuario_id?: number;
  fecha_compra?: string;
  monto_compra: number;
  estado?: EstadoCompra;
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id: number;
  condicion_pago?: CondicionPago;
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
}

export interface UpdateCompraRequest {
  proveedor_id?: number;
  usuario_id?: number;
  fecha_compra?: string;
  monto_compra?: number;
  estado?: EstadoCompra;
  observaciones?: string;
  almacen_id?: number;
  orden_compra_id?: number;
  sucursal_id?: number;
  condicion_pago?: CondicionPago;
  timbrado?: string;
  nro_factura?: string;
  fecha_comprobante?: string;
  tipo_doc_id?: number;
  monto_gravada_5?: number;
  monto_gravada_10?: number;
  monto_exenta?: number;
  monto_iva?: number;
  items?: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

// ===== TIPOS DE RESPUESTA =====
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
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  proveedor_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
}

// ===== TIPOS DE VALIDACIÓN =====
export interface ComprasValidationError {
  field: string;
  message: string;
}

export interface ComprasValidationResult {
  valid: boolean;
  errors: ComprasValidationError[];
}

// ===== TIPOS DE ESTADÍSTICAS =====
export interface ComprasStats {
  total_pedidos: number;
  total_presupuestos: number;
  total_ordenes: number;
  total_compras: number;
  pedidos_pendientes: number;
  presupuestos_pendientes: number;
  ordenes_pendientes: number;
  compras_pendientes: number;
  valor_total_pedidos: number;
  valor_total_presupuestos: number;
  valor_total_ordenes: number;
  valor_total_compras: number;
  tendencia_pedidos: number;
  tendencia_presupuestos: number;
  tendencia_ordenes: number;
  tendencia_compras: number;
}

// ===== TIPOS DE DASHBOARD =====
export interface DashboardCard {
  title: string;
  value: number;
  trend: number;
  trend_direction: 'up' | 'down';
  icon: string;
  color: string;
}

export interface ComprasDashboard {
  pedidos: DashboardCard;
  presupuestos: DashboardCard;
  ordenes: DashboardCard;
  compras: DashboardCard;
  resumen: {
    total_valor: number;
    total_items: number;
    proveedores_activos: number;
    ordenes_vencidas: number;
  };
}

// ===== TIPOS DE FILTROS =====
export interface ComprasFilters {
  fecha_desde?: string;
  fecha_hasta?: string;
  estado?: string;
  proveedor_id?: number;
  usuario_id?: number;
  sucursal_id?: number;
  almacen_id?: number;
  prioridad?: 'alta' | 'media' | 'baja';
  monto_min?: number;
  monto_max?: number;
}

// ===== TIPOS DE REPORTES =====
export interface ComprasReporte {
  periodo: {
    desde: string;
    hasta: string;
  };
  resumen: {
    total_compras: number;
    total_monto: number;
    promedio_compra: number;
    proveedores_activos: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    porcentaje: number;
  }>;
  por_proveedor: Array<{
    proveedor_id: number;
    proveedor_nombre: string;
    cantidad_compras: number;
    monto_total: number;
    porcentaje: number;
  }>;
  por_mes: Array<{
    mes: string;
    cantidad: number;
    monto: number;
  }>;
}
