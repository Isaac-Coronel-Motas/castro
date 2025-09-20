// Tipos para el módulo de Pedidos de Clientes

export interface PedidoCliente {
  venta_id: number;
  cliente_id: number;
  fecha_venta: string;
  estado: 'abierto' | 'cerrado' | 'cancelado';
  tipo_documento: string;
  monto_venta: number;
  caja_id?: number;
  tipo_doc_id?: number;
  nro_factura?: number;
  forma_cobro_id?: number;
  monto_gravada_5: number;
  monto_gravada_10: number;
  monto_exenta: number;
  monto_iva: number;
  condicion_pago: 'contado' | 'crédito';
  cliente_nombre: string;
  cliente_direccion?: string;
  cliente_ruc?: string;
  cliente_telefono?: string;
  cliente_email?: string;
  estado_display: string;
  estado_accion: string;
  total_productos: number;
  productos?: ProductoPedido[];
}

export interface ProductoPedido {
  detalle_venta_id: number;
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
  producto_nombre: string;
  producto_descripcion?: string;
  producto_codigo?: string;
  subtotal: number;
}

export interface ProductoDisponible {
  producto_id: number;
  nombre: string;
  descripcion?: string;
  codigo?: string;
  precio_venta: number;
  stock: number;
  stock_minimo: number;
  categoria_id: number;
  nombre_categoria: string;
  estado_stock: 'Disponible' | 'Bajo' | 'Sin Stock';
  estado_color: 'default' | 'warning' | 'destructive';
}

export interface Cliente {
  cliente_id: number;
  nombre: string;
  direccion?: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo';
  ciudad_id?: number;
  usuario_id?: number;
  lista_id?: number;
}

export interface PedidoFormData {
  cliente_id: number;
  fecha_venta: string;
  estado: 'abierto' | 'cerrado' | 'cancelado';
  tipo_documento: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}

export interface ProductoFormData {
  producto_id: number;
  cantidad: number;
  precio_unitario: number;
}

export interface PedidoFilters {
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  monto_minimo?: number;
  monto_maximo?: number;
}

export interface PedidoStats {
  total_pedidos: number;
  pedidos_abiertos: number;
  pedidos_cerrados: number;
  pedidos_cancelados: number;
  monto_total: number;
  monto_pendiente: number;
  monto_cobrado: number;
}
