// Tipos para módulos de Referencias

// ===== PROVEEDORES =====
export interface Proveedor {
  proveedor_id: number;
  nombre_proveedor: string;
  correo?: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad_id?: number;
  usuario_id?: number;
  // Campos adicionales para joins
  ciudad_nombre?: string;
  usuario_nombre?: string;
}

export interface CreateProveedorRequest {
  nombre_proveedor: string;
  correo?: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad_id?: number;
}

export interface UpdateProveedorRequest {
  nombre_proveedor?: string;
  correo?: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad_id?: number;
}

// ===== PRODUCTOS =====
export interface Producto {
  producto_id: number;
  nombre_producto: string;
  descripcion_producto?: string;
  precio_unitario?: number;
  stock: number;
  categoria_id?: number;
  impuesto_id?: number;
  precio_costo?: number;
  precio_venta?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  marca_id?: number;
  unidad_id?: number;
  cod_product?: number;
  estado: boolean;
  // Campos adicionales para joins
  categoria_nombre?: string;
  marca_nombre?: string;
  unidad_nombre?: string;
  impuesto_nombre?: string;
  impuesto_porcentaje?: number;
}

export interface CreateProductoRequest {
  nombre_producto: string;
  descripcion_producto?: string;
  precio_unitario?: number;
  stock?: number;
  categoria_id?: number;
  impuesto_id?: number;
  precio_costo?: number;
  precio_venta?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  marca_id?: number;
  unidad_id?: number;
  cod_product?: number;
  estado?: boolean;
}

export interface UpdateProductoRequest {
  nombre_producto?: string;
  descripcion_producto?: string;
  precio_unitario?: number;
  stock?: number;
  categoria_id?: number;
  impuesto_id?: number;
  precio_costo?: number;
  precio_venta?: number;
  stock_minimo?: number;
  stock_maximo?: number;
  marca_id?: number;
  unidad_id?: number;
  cod_product?: number;
  estado?: boolean;
}

// ===== CATEGORÍAS =====
export interface Categoria {
  categoria_id: number;
  nombre_categoria: string;
  estado: boolean;
  // Campos adicionales
  productos_count?: number;
}

export interface CreateCategoriaRequest {
  nombre_categoria: string;
  estado?: boolean;
}

export interface UpdateCategoriaRequest {
  nombre_categoria?: string;
  estado?: boolean;
}

// ===== CLIENTES =====
export interface Cliente {
  cliente_id: number;
  nombre: string;
  direccion?: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  ciudad_id?: number;
  usuario_id?: number;
  lista_id?: number;
  // Campos adicionales para joins
  ciudad_nombre?: string;
  usuario_nombre?: string;
  lista_nombre?: string;
}

export interface CreateClienteRequest {
  nombre: string;
  direccion?: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  ciudad_id?: number;
  lista_id?: number;
}

export interface UpdateClienteRequest {
  nombre?: string;
  direccion?: string;
  ruc?: string;
  telefono?: string;
  email?: string;
  estado?: 'activo' | 'inactivo' | 'suspendido';
  ciudad_id?: number;
  lista_id?: number;
}

// ===== MARCAS =====
export interface Marca {
  marca_id: number;
  descripcion: string;
  // Campos adicionales
  productos_count?: number;
}

export interface CreateMarcaRequest {
  descripcion: string;
}

export interface UpdateMarcaRequest {
  descripcion?: string;
}

// ===== TIPOS DE SERVICIO =====
export interface TipoServicio {
  tipo_serv_id: number;
  descripcion: string;
  nombre: string;
  activo: boolean;
  // Campos adicionales
  servicios_count?: number;
}

export interface CreateTipoServicioRequest {
  descripcion: string;
  nombre: string;
  activo?: boolean;
}

export interface UpdateTipoServicioRequest {
  descripcion?: string;
  nombre?: string;
  activo?: boolean;
}

// ===== SERVICIOS =====
export interface Servicio {
  servicio_id: number;
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  tipo_serv_id?: number;
  // Campos adicionales para joins
  tipo_serv_nombre?: string;
  tipo_serv_descripcion?: string;
  productos?: ServicioProducto[];
}

export interface ServicioProducto {
  servicio_producto_id: number;
  servicio_id: number;
  producto_id: number;
  cantidad: number;
  // Campos adicionales para joins
  producto_nombre?: string;
  producto_precio?: number;
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  tipo_serv_id?: number;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
  }>;
}

export interface UpdateServicioRequest {
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  tipo_serv_id?: number;
  productos?: Array<{
    producto_id: number;
    cantidad: number;
  }>;
}

// ===== TIPOS AUXILIARES =====
export interface Ciudad {
  id: number;
  nombre: string;
}

export interface UnidadMedida {
  unidad_id: number;
  nombre: string;
  abreviatura: string;
}

export interface Impuesto {
  impuesto_id: number;
  nombre: string;
  porcentaje: number;
  activo: boolean;
}

export interface ListaPrecio {
  lista_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
}

// ===== TIPOS DE RESPUESTA =====
export interface ReferenciasApiResponse<T = any> {
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

export interface ReferenciasPaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  estado?: boolean | string;
  activo?: boolean;
}

// ===== TIPOS DE VALIDACIÓN =====
export interface ReferenciasValidationError {
  field: string;
  message: string;
}

export interface ReferenciasValidationResult {
  valid: boolean;
  errors: ReferenciasValidationError[];
}

// ===== TIPOS DE ESTADÍSTICAS =====
export interface ReferenciasStats {
  total_proveedores: number;
  total_productos: number;
  total_categorias: number;
  total_clientes: number;
  total_marcas: number;
  total_tipos_servicio: number;
  total_servicios: number;
  productos_bajo_stock: number;
  productos_agotados: number;
  clientes_activos: number;
  proveedores_activos: number;
}
