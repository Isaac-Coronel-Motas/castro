# Módulo de Referencias

## Descripción General

El módulo de Referencias gestiona todos los catálogos y datos maestros del sistema, incluyendo productos, categorías, clientes, proveedores, marcas, tipos de servicio y otras entidades de referencia necesarias para el funcionamiento del sistema.

## Funcionalidades Principales

### 📦 Gestión de Productos
- **Creación de productos**: Registro de productos con información completa
- **Categorización**: Asignación de categorías y subcategorías
- **Control de inventario**: Gestión de stock y precios
- **Marcas y modelos**: Asignación de marcas y modelos específicos
- **Estados de producto**: Activo, Inactivo, Descontinuado
- **Historial de cambios**: Auditoría de modificaciones

### 🏷️ Gestión de Categorías
- **Creación de categorías**: Definición de categorías de productos
- **Jerarquía de categorías**: Estructura de categorías padre-hijo
- **Subcategorías**: Creación de subcategorías específicas
- **Estados de categoría**: Activa, Inactiva
- **Asignación de productos**: Vinculación de productos a categorías

### 👥 Gestión de Clientes
- **Registro de clientes**: Información completa de clientes
- **Tipos de cliente**: Individual, Empresa, Distribuidor
- **Información de contacto**: Teléfonos, emails, direcciones
- **Historial de compras**: Seguimiento de transacciones
- **Estados de cliente**: Activo, Inactivo, Suspendido
- **Documentación**: RUC, DNI, pasaportes

### 🏢 Gestión de Proveedores
- **Registro de proveedores**: Información completa de proveedores
- **Tipos de proveedor**: Fabricante, Distribuidor, Importador
- **Información comercial**: Condiciones de pago, descuentos
- **Información de contacto**: Representantes, teléfonos, emails
- **Estados de proveedor**: Activo, Inactivo, Suspendido
- **Documentación**: RUC, certificaciones, contratos

### 🏷️ Gestión de Marcas
- **Creación de marcas**: Registro de marcas de productos
- **Información de marca**: Descripción, país de origen
- **Estados de marca**: Activa, Inactiva
- **Asignación de productos**: Vinculación de productos a marcas
- **Historial de cambios**: Auditoría de modificaciones

### 🔧 Gestión de Tipos de Servicio
- **Creación de tipos**: Definición de tipos de servicio técnico
- **Categorización de servicios**: Clasificación por área técnica
- **Precios base**: Establecimiento de precios de referencia
- **Tiempos estimados**: Duración promedio de servicios
- **Estados de tipo**: Activo, Inactivo
- **Especializaciones**: Requisitos técnicos específicos

### 🏪 Gestión de Almacenes
- **Creación de almacenes**: Definición de ubicaciones de inventario
- **Tipos de almacén**: Principal, Secundario, Temporal
- **Ubicación física**: Direcciones y coordenadas
- **Responsables**: Asignación de personal responsable
- **Estados de almacén**: Activo, Inactivo, En mantenimiento
- **Capacidad**: Límites de almacenamiento

### 🏢 Gestión de Sucursales
- **Creación de sucursales**: Definición de ubicaciones comerciales
- **Información de sucursal**: Dirección, teléfonos, horarios
- **Responsables**: Asignación de gerentes y personal
- **Estados de sucursal**: Activa, Inactiva, En construcción
- **Servicios disponibles**: Tipos de servicio por sucursal

### 🚚 Gestión de Ciudades
- **Registro de ciudades**: Catálogo de ciudades y municipios
- **Información geográfica**: Coordenadas, códigos postales
- **Estados de ciudad**: Activa, Inactiva
- **Asignación de clientes**: Vinculación de clientes a ciudades
- **Zonas de entrega**: Definición de áreas de cobertura

### 💳 Gestión de Formas de Cobro
- **Creación de formas**: Definición de métodos de pago
- **Tipos de forma**: Efectivo, Tarjeta, Transferencia, Crédito
- **Configuración**: Parámetros específicos por forma
- **Estados de forma**: Activa, Inactiva
- **Comisiones**: Porcentajes de comisión por forma

### 🔧 Gestión de Motivos de Ajuste
- **Creación de motivos**: Definición de razones de ajuste
- **Tipos de motivo**: Pérdida, Robo, Obsolescencia, Error
- **Estados de motivo**: Activo, Inactivo
- **Asignación de ajustes**: Vinculación con ajustes de inventario

### 📋 Gestión de Tipos de Documento
- **Creación de tipos**: Definición de tipos de documento
- **Tipos de documento**: Factura, Nota de Crédito, Nota de Débito
- **Numeración**: Secuencias de numeración automática
- **Estados de tipo**: Activo, Inactivo
- **Configuración fiscal**: Parámetros tributarios

### 🔍 Gestión de Tipos de Diagnóstico
- **Creación de tipos**: Definición de tipos de diagnóstico
- **Categorización**: Clasificación por área técnica
- **Tiempos estimados**: Duración promedio de diagnósticos
- **Estados de tipo**: Activo, Inactivo
- **Especializaciones**: Requisitos técnicos específicos

## Estructura de Archivos

```
app/referencias/
├── productos/
│   ├── page.tsx              # Lista de productos
│   └── loading.tsx           # Estado de carga
├── categorias/
│   ├── page.tsx              # Lista de categorías
│   └── loading.tsx           # Estado de carga
├── clientes/
│   ├── page.tsx              # Lista de clientes
│   └── loading.tsx           # Estado de carga
├── proveedores/
│   ├── page.tsx              # Lista de proveedores
│   └── loading.tsx           # Estado de carga
├── marcas/
│   ├── page.tsx              # Lista de marcas
│   └── loading.tsx           # Estado de carga
└── tipos-servicio/
    ├── page.tsx              # Lista de tipos de servicio
    └── loading.tsx           # Estado de carga

app/api/referencias/
├── productos/
│   ├── route.ts              # CRUD de productos
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── categorias/
│   ├── route.ts              # CRUD de categorías
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── clientes/
│   ├── route.ts              # CRUD de clientes
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── proveedores/
│   ├── route.ts              # CRUD de proveedores
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── marcas/
│   ├── route.ts              # CRUD de marcas
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── tipos-servicio/
│   ├── route.ts              # CRUD de tipos de servicio
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── almacenes/
│   └── route.ts              # CRUD de almacenes
├── sucursales/
│   └── route.ts              # CRUD de sucursales
├── ciudades/
│   └── route.ts              # CRUD de ciudades
├── formas-cobro/
│   └── route.ts              # CRUD de formas de cobro
├── motivos-ajuste/
│   └── route.ts              # CRUD de motivos de ajuste
├── tipos-documento/
│   └── route.ts              # CRUD de tipos de documento
├── tipos-diagnostico/
│   └── route.ts              # CRUD de tipos de diagnóstico
└── equipos/
    └── route.ts              # CRUD de equipos

components/
└── modals/
    ├── producto-modal.tsx        # Modal de producto
    ├── categoria-modal.tsx       # Modal de categoría
    ├── cliente-modal.tsx         # Modal de cliente
    ├── proveedor-modal.tsx       # Modal de proveedor
    ├── marca-modal.tsx           # Modal de marca
    └── servicio-modal.tsx        # Modal de tipo de servicio
```

## APIs Principales

### Productos

#### GET `/api/referencias/productos`
Obtiene la lista de productos con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  categoria_id?: number;
  marca_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  productos: Array<{
    producto_id: number;
    codigo_producto: string;
    nombre: string;
    descripcion?: string;
    categoria_nombre: string;
    marca_nombre: string;
    precio_venta: number;
    stock_actual: number;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/referencias/productos`
Crea un nuevo producto.

**Body:**
```typescript
{
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  marca_id: number;
  precio_venta: number;
  stock_inicial: number;
  estado: string;
}
```

### Categorías

#### GET `/api/referencias/categorias`
Obtiene la lista de categorías con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  categoria_padre_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  categorias: Array<{
    categoria_id: number;
    nombre: string;
    descripcion?: string;
    categoria_padre_nombre?: string;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Clientes

#### GET `/api/referencias/clientes`
Obtiene la lista de clientes con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  tipo_cliente?: string;
  ciudad_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  clientes: Array<{
    cliente_id: number;
    nombre: string;
    email?: string;
    telefono?: string;
    tipo_cliente: string;
    ciudad_nombre: string;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Proveedores

#### GET `/api/referencias/proveedores`
Obtiene la lista de proveedores con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  tipo_proveedor?: string;
  ciudad_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  proveedores: Array<{
    proveedor_id: number;
    nombre: string;
    email?: string;
    telefono?: string;
    tipo_proveedor: string;
    ciudad_nombre: string;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Marcas

#### GET `/api/referencias/marcas`
Obtiene la lista de marcas con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  marcas: Array<{
    marca_id: number;
    nombre: string;
    descripcion?: string;
    pais_origen?: string;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Tipos de Servicio

#### GET `/api/referencias/tipos-servicio`
Obtiene la lista de tipos de servicio con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  categoria_id?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  tipos: Array<{
    tipo_servicio_id: number;
    nombre: string;
    descripcion?: string;
    categoria_nombre: string;
    precio_base: number;
    tiempo_estimado: number;
    estado: string;
    usuario_nombre: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

## Componentes Principales

### ProductosPage
Página principal para la gestión de productos.

**Funcionalidades:**
- Lista paginada de productos
- Filtros avanzados por categoría y marca
- Búsqueda en tiempo real
- Acciones de crear, editar, eliminar
- Control de inventario
- Gestión de precios

### CategoriasPage
Página principal para la gestión de categorías.

**Funcionalidades:**
- Lista paginada de categorías
- Filtros por estado y categoría padre
- Búsqueda por nombre
- Acciones de crear, editar, eliminar
- Jerarquía de categorías
- Asignación de productos

### ClientesPage
Página principal para la gestión de clientes.

**Funcionalidades:**
- Lista paginada de clientes
- Filtros por tipo y ciudad
- Búsqueda por nombre o email
- Acciones de crear, editar, eliminar
- Información de contacto
- Historial de compras

### ProveedoresPage
Página principal para la gestión de proveedores.

**Funcionalidades:**
- Lista paginada de proveedores
- Filtros por tipo y ciudad
- Búsqueda por nombre o email
- Acciones de crear, editar, eliminar
- Información comercial
- Condiciones de pago

### MarcasPage
Página principal para la gestión de marcas.

**Funcionalidades:**
- Lista paginada de marcas
- Filtros por estado
- Búsqueda por nombre
- Acciones de crear, editar, eliminar
- Información de marca
- Asignación de productos

### TiposServicioPage
Página principal para la gestión de tipos de servicio.

**Funcionalidades:**
- Lista paginada de tipos de servicio
- Filtros por categoría y estado
- Búsqueda por nombre
- Acciones de crear, editar, eliminar
- Precios base
- Tiempos estimados

## Hooks Personalizados

### useReferencias
Hook base para operaciones de referencias.

```typescript
const {
  data,
  loading,
  error,
  fetchData,
  createItem,
  updateItem,
  deleteItem
} = useReferencias(endpoint, options);
```

### useReferenciasStats
Hook para estadísticas de referencias.

```typescript
const {
  stats,
  loading,
  error,
  fetchStats
} = useReferenciasStats();
```

## Tipos TypeScript

### Producto
```typescript
interface Producto {
  producto_id: number;
  codigo_producto: string;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  categoria_nombre: string;
  marca_id: number;
  marca_nombre: string;
  precio_venta: number;
  stock_actual: number;
  stock_minimo: number;
  stock_maximo: number;
  estado: 'activo' | 'inactivo' | 'descontinuado';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Categoria
```typescript
interface Categoria {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  categoria_padre_id?: number;
  categoria_padre_nombre?: string;
  estado: 'activa' | 'inactiva';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Cliente
```typescript
interface Cliente {
  cliente_id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo_cliente: 'individual' | 'empresa' | 'distribuidor';
  ciudad_id: number;
  ciudad_nombre: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Proveedor
```typescript
interface Proveedor {
  proveedor_id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  tipo_proveedor: 'fabricante' | 'distribuidor' | 'importador';
  ciudad_id: number;
  ciudad_nombre: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### Marca
```typescript
interface Marca {
  marca_id: number;
  nombre: string;
  descripcion?: string;
  pais_origen?: string;
  estado: 'activa' | 'inactiva';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

### TipoServicio
```typescript
interface TipoServicio {
  tipo_servicio_id: number;
  nombre: string;
  descripcion?: string;
  categoria_id: number;
  categoria_nombre: string;
  precio_base: number;
  tiempo_estimado: number;
  estado: 'activo' | 'inactivo';
  usuario_id: number;
  usuario_nombre: string;
  fecha_creacion: string;
  fecha_actualizacion: string;
}
```

## Permisos Requeridos

### Productos
- `referencias.productos.ver` - Ver lista de productos
- `referencias.productos.crear` - Crear nuevos productos
- `referencias.productos.editar` - Editar productos existentes
- `referencias.productos.eliminar` - Eliminar productos

### Categorías
- `referencias.categorias.ver` - Ver lista de categorías
- `referencias.categorias.crear` - Crear nuevas categorías
- `referencias.categorias.editar` - Editar categorías existentes
- `referencias.categorias.eliminar` - Eliminar categorías

### Clientes
- `referencias.clientes.ver` - Ver lista de clientes
- `referencias.clientes.crear` - Crear nuevos clientes
- `referencias.clientes.editar` - Editar clientes existentes
- `referencias.clientes.eliminar` - Eliminar clientes

### Proveedores
- `referencias.proveedores.ver` - Ver lista de proveedores
- `referencias.proveedores.crear` - Crear nuevos proveedores
- `referencias.proveedores.editar` - Editar proveedores existentes
- `referencias.proveedores.eliminar` - Eliminar proveedores

### Marcas
- `referencias.marcas.ver` - Ver lista de marcas
- `referencias.marcas.crear` - Crear nuevas marcas
- `referencias.marcas.editar` - Editar marcas existentes
- `referencias.marcas.eliminar` - Eliminar marcas

### Tipos de Servicio
- `referencias.tipos_servicio.ver` - Ver lista de tipos de servicio
- `referencias.tipos_servicio.crear` - Crear nuevos tipos de servicio
- `referencias.tipos_servicio.editar` - Editar tipos de servicio existentes
- `referencias.tipos_servicio.eliminar` - Eliminar tipos de servicio

## Configuración

### Variables de Entorno
```env
REFERENCIAS_PAGINATION_LIMIT=20
REFERENCIAS_CACHE_TTL=300000
REFERENCIAS_AUTO_NUMERACION=true
REFERENCIAS_NOTIFICATION_EMAIL=referencias@empresa.com
```

### Configuración de Estados
```typescript
const PRODUCTO_ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  DESCONTINUADO: 'descontinuado'
};

const CATEGORIA_ESTADOS = {
  ACTIVA: 'activa',
  INACTIVA: 'inactiva'
};

const CLIENTE_ESTADOS = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  SUSPENDIDO: 'suspendido'
};
```

## Optimizaciones

### Performance
- **Lazy Loading**: Carga diferida de componentes
- **Virtual Scrolling**: Para listas largas
- **Memoization**: Optimización de re-renders
- **Debounced Search**: Búsqueda optimizada

### Caching
- **Client-side**: Cache de datos en memoria
- **Server-side**: Cache de consultas
- **CDN**: Cache de assets estáticos

### Database
- **Indexes**: Índices optimizados
- **Query Optimization**: Consultas optimizadas
- **Connection Pooling**: Pool de conexiones
- **Read Replicas**: Réplicas de lectura

## Testing

### Unit Tests
```typescript
describe('ReferenciasPage', () => {
  it('should render referencias list', () => {
    // Test implementation
  });
  
  it('should handle create referencia', () => {
    // Test implementation
  });
  
  it('should handle edit referencia', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Referencias API', () => {
  it('should create producto', async () => {
    // Test implementation
  });
  
  it('should update categoria', async () => {
    // Test implementation
  });
  
  it('should delete cliente', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Productos no se crean**
   - Verificar permisos del usuario
   - Revisar validaciones de datos
   - Verificar conexión a base de datos

2. **Categorías no se eliminan**
   - Verificar productos asociados
   - Revisar dependencias
   - Verificar estado de la categoría

3. **Clientes no se actualizan**
   - Verificar permisos de edición
   - Revisar validaciones de datos
   - Verificar estado del cliente

### Logs de Debug
```typescript
console.log('Producto creado:', producto);
console.log('Categoría actualizada:', categoria);
console.log('Cliente eliminado:', cliente);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Importación masiva de datos
- [ ] Sincronización con sistemas externos
- [ ] Validación automática de datos
- [ ] Reportes de referencias
- [ ] Análisis de uso
- [ ] Mobile app

### Mejoras Técnicas
- [ ] WebSockets para actualizaciones
- [ ] Advanced caching
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics dashboard
