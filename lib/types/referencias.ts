// Tipos para el módulo de Referencias

export interface Proveedor {
  proveedor_id: number;
  nombre_proveedor: string;
  correo?: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad_id?: number;
  usuario_id?: number;
  created_at?: string;
  updated_at?: string;
}

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
  cod_product?: string;
  estado: boolean;
  created_at?: string;
  updated_at?: string;
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
  created_at?: string;
  updated_at?: string;
}

export interface Marca {
  marca_id: number;
  descripcion: string;
  created_at?: string;
  updated_at?: string;
}

export interface Servicio {
  servicio_id: number;
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  tipo_serv_id?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Categoria {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

// Tipos para formularios
export interface ProveedorFormData {
  nombre_proveedor: string;
  correo: string;
  telefono: string;
  ruc: string;
  direccion: string;
}

export interface ProductoFormData {
  nombre_producto: string;
  descripcion_producto: string;
  precio_unitario: number;
  stock: number;
  categoria_id: number | null;
  precio_costo: number;
  precio_venta: number;
  stock_minimo: number;
  stock_maximo: number;
  marca_id: number | null;
  cod_product: string;
  estado: boolean;
}

export interface ClienteFormData {
  nombre: string;
  direccion: string;
  ruc: string;
  telefono: string;
  email: string;
  estado: 'activo' | 'inactivo';
}

export interface MarcaFormData {
  descripcion: string;
}

export interface ServicioFormData {
  nombre: string;
  descripcion: string;
  precio_base: number;
  tipo_serv_id: number | null;
}

export interface CategoriaFormData {
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// ===== TIPOS DE REQUEST PARA APIs =====

export interface CreateProveedorRequest {
  nombre_proveedor: string;
  correo?: string;
  telefono?: string;
  ruc?: string;
  direccion?: string;
  ciudad_id?: number;
}

export interface UpdateProveedorRequest extends CreateProveedorRequest {
  proveedor_id: number;
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
  cod_product?: string;
  estado?: boolean;
}

export interface UpdateProductoRequest extends CreateProductoRequest {
  producto_id: number;
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

export interface UpdateClienteRequest extends CreateClienteRequest {
  cliente_id: number;
}

export interface CreateMarcaRequest {
  descripcion: string;
}

export interface UpdateMarcaRequest extends CreateMarcaRequest {
  marca_id: number;
}

export interface CreateCategoriaRequest {
  nombre_categoria: string;
  estado?: boolean;
}

export interface UpdateCategoriaRequest extends CreateCategoriaRequest {
  categoria_id: number;
}

export interface CreateTipoServicioRequest {
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface UpdateTipoServicioRequest extends CreateTipoServicioRequest {
  tipo_serv_id: number;
}

export interface CreateServicioRequest {
  nombre: string;
  descripcion?: string;
  precio_base?: number;
  tipo_serv_id?: number;
}

export interface UpdateServicioRequest extends CreateServicioRequest {
  servicio_id: number;
}