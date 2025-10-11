# Módulo de Ventas

## Descripción General

El módulo de Ventas gestiona todo el proceso de comercialización de productos y servicios, desde la gestión de pedidos de clientes hasta el registro de ventas, cobros y gestión de caja.

## Funcionalidades Principales

### 🛍️ Gestión de Pedidos de Clientes
- **Creación de pedidos**: Registro de solicitudes de clientes
- **Seguimiento de estado**: Pendiente, Confirmado, En Proceso, Entregado, Cancelado
- **Gestión de productos**: Selección y configuración de productos
- **Cálculo de precios**: Aplicación de descuentos y promociones
- **Historial de cambios**: Auditoría de modificaciones

### 💰 Registro de Ventas
- **Facturación**: Generación de facturas de venta
- **Gestión de productos**: Selección de productos disponibles
- **Cálculo de impuestos**: Aplicación de IVA y otros impuestos
- **Descuentos**: Aplicación de descuentos por cliente o producto
- **Múltiples formas de pago**: Efectivo, tarjeta, transferencia, crédito

### 💳 Gestión de Cobros
- **Registro de cobros**: Ingreso de pagos recibidos
- **Seguimiento de saldos**: Control de cuentas por cobrar
- **Conciliación bancaria**: Vinculación con movimientos bancarios
- **Notas de crédito/débito**: Gestión de devoluciones y ajustes
- **Reportes de cobros**: Análisis de cobranza

### 📋 Presupuestos de Servicios
- **Creación de presupuestos**: Cotización de servicios técnicos
- **Aprobación de presupuestos**: Proceso de aprobación por cliente
- **Conversión a órdenes**: Transformación a órdenes de servicio
- **Seguimiento de estado**: Control del proceso de aprobación
- **Historial de versiones**: Control de cambios en presupuestos

### 📦 Notas de Remisión
- **Generación de remisiones**: Documentos de entrega
- **Seguimiento de entregas**: Estado de envío y recepción
- **Control de inventario**: Salida de productos
- **Conciliación de remisiones**: Verificación de entregas
- **Reportes de entregas**: Análisis de entregas por período

### 💳 Notas de Crédito/Débito
- **Notas de crédito**: Devoluciones y descuentos a clientes
- **Notas de débito**: Cargos adicionales a clientes
- **Aplicación a facturas**: Vinculación con facturas originales
- **Seguimiento de saldos**: Control de saldos a favor/en contra
- **Reportes de notas**: Análisis de movimientos

### 🏪 Apertura/Cierre de Caja
- **Apertura de caja**: Inicio de jornada de ventas
- **Cierre de caja**: Fin de jornada con arqueo
- **Control de efectivo**: Manejo de dinero en efectivo
- **Reportes de caja**: Análisis de movimientos diarios
- **Conciliación**: Verificación de saldos

### 📈 Informes de Ventas
- **Dashboard de ventas**: Métricas consolidadas
- **Informe de pedidos**: Análisis de pedidos por período
- **Informe de ventas**: Análisis de ventas registradas
- **Informe de cobros**: Análisis de cobranza
- **Informe de presupuestos**: Análisis de presupuestos
- **Informe de remisiones**: Análisis de entregas
- **Informe de notas**: Análisis de notas de crédito/débito
- **Informe de cajas**: Análisis de movimientos de caja

## Estructura de Archivos

```
app/ventas/
├── pedidos-clientes/
│   ├── page.tsx              # Lista de pedidos de clientes
│   └── loading.tsx           # Estado de carga
├── registro/
│   ├── page.tsx              # Lista de ventas registradas
│   └── loading.tsx           # Estado de carga
├── cobros/
│   ├── page.tsx              # Lista de cobros
│   └── loading.tsx           # Estado de carga
├── presupuestos/
│   ├── page.tsx              # Lista de presupuestos de servicios
│   └── loading.tsx           # Estado de carga
├── notas-remision/
│   ├── page.tsx              # Lista de notas de remisión
│   └── loading.tsx           # Estado de carga
├── notas-credito-debito/
│   ├── page.tsx              # Lista de notas de crédito/débito
│   └── loading.tsx           # Estado de carga
├── apertura-cierre-caja/
│   ├── page.tsx              # Gestión de caja
│   └── loading.tsx           # Estado de carga
└── informes/
    ├── page.tsx              # Dashboard de informes
    └── loading.tsx            # Estado de carga

app/api/ventas/
├── pedidos-clientes/
│   ├── route.ts              # CRUD de pedidos de clientes
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── registro-ventas/
│   └── route.ts              # CRUD de ventas registradas
├── cobros/
│   ├── route.ts              # CRUD de cobros
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       ├── pagar/route.ts    # Registrar pago
│       └── anular/route.ts   # Anular cobro
├── presupuestos-servicios/
│   ├── route.ts              # CRUD de presupuestos de servicios
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       ├── aprobar/route.ts  # Aprobación
│       └── rechazar/route.ts # Rechazo
├── notas-remision/
│   ├── route.ts              # CRUD de notas de remisión
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       └── entregar/route.ts  # Marcar como entregada
├── notas-credito/
│   ├── route.ts              # CRUD de notas de crédito
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── notas-debito/
│   ├── route.ts              # CRUD de notas de débito
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── apertura-cierre-caja/
│   ├── route.ts              # CRUD de apertura/cierre de caja
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       ├── abrir/route.ts    # Abrir caja
│       └── cerrar/route.ts   # Cerrar caja
├── cajas/
│   └── route.ts              # Lista de cajas
├── productos-disponibles/
│   └── route.ts              # Productos disponibles para venta
├── buscar-facturas/
│   └── route.ts              # Búsqueda de facturas
├── dashboard/
│   └── route.ts              # Métricas del dashboard
└── informes/
    ├── dashboard/route.ts     # Dashboard de informes
    ├── pedidos/route.ts       # Informe de pedidos
    ├── ventas/route.ts        # Informe de ventas
    ├── cobros/route.ts        # Informe de cobros
    ├── presupuestos/route.ts  # Informe de presupuestos
    ├── remisiones/route.ts    # Informe de remisiones
    ├── notas/route.ts         # Informe de notas
    └── cajas/route.ts         # Informe de cajas

components/
├── informes-ventas/
│   ├── dashboard-ventas.tsx      # Dashboard de informes
│   ├── informe-pedidos.tsx       # Informe de pedidos
│   ├── informe-ventas.tsx        # Informe de ventas
│   ├── informe-cobros.tsx        # Informe de cobros
│   ├── informe-presupuestos.tsx  # Informe de presupuestos
│   ├── informe-remisiones.tsx    # Informe de remisiones
│   ├── informe-notas.tsx         # Informe de notas
│   └── informe-cajas.tsx         # Informe de cajas
└── modals/
    ├── pedido-cliente-modal.tsx      # Modal de pedido de cliente
    ├── modal-nueva-venta.tsx         # Modal de nueva venta
    ├── modal-nuevo-cobro.tsx         # Modal de nuevo cobro
    ├── modal-editar-cobro.tsx        # Modal de editar cobro
    ├── modal-nuevo-presupuesto-servicio.tsx # Modal de presupuesto
    ├── modal-editar-presupuesto-servicio.tsx # Modal de editar presupuesto
    ├── modal-nueva-nota-remision.tsx # Modal de nota de remisión
    ├── modal-editar-nota-remision.tsx # Modal de editar nota
    ├── nota-credito-debito-modal.tsx # Modal de nota de crédito/débito
    ├── apertura-caja-modal.tsx       # Modal de apertura de caja
    └── cierre-caja-modal.tsx         # Modal de cierre de caja
```

## APIs Principales

### Pedidos de Clientes

#### GET `/api/ventas/pedidos-clientes`
Obtiene la lista de pedidos de clientes con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  pedidos: Array<{
    pedido_id: number;
    codigo_pedido: string;
    fecha_pedido: string;
    cliente_nombre: string;
    estado: string;
    valor_total: number;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/ventas/pedidos-clientes`
Crea un nuevo pedido de cliente.

**Body:**
```typescript
{
  cliente_id: number;
  fecha_pedido: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }>;
}
```

### Registro de Ventas

#### GET `/api/ventas/registro-ventas`
Obtiene la lista de ventas registradas con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  ventas: Array<{
    venta_id: number;
    codigo_venta: string;
    fecha_venta: string;
    cliente_nombre: string;
    estado: string;
    monto_venta: number;
    forma_pago: string;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/ventas/registro-ventas`
Registra una nueva venta.

**Body:**
```typescript
{
  cliente_id: number;
  fecha_venta: string;
  forma_pago: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
  }>;
}
```

### Cobros

#### GET `/api/ventas/cobros`
Obtiene la lista de cobros con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  cobros: Array<{
    cobro_id: number;
    codigo_cobro: string;
    fecha_cobro: string;
    cliente_nombre: string;
    estado: string;
    monto: number;
    forma_pago: string;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

#### POST `/api/ventas/cobros`
Registra un nuevo cobro.

**Body:**
```typescript
{
  cliente_id: number;
  fecha_cobro: string;
  monto: number;
  forma_pago: string;
  observaciones?: string;
  factura_id?: number;
}
```

### Presupuestos de Servicios

#### GET `/api/ventas/presupuestos-servicios`
Obtiene la lista de presupuestos de servicios con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  presupuestos: Array<{
    presupuesto_id: number;
    codigo_presupuesto: string;
    fecha_presupuesto: string;
    cliente_nombre: string;
    estado: string;
    monto_presu_ser: number;
    valido_desde?: string;
    valido_hasta?: string;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Notas de Remisión

#### GET `/api/ventas/notas-remision`
Obtiene la lista de notas de remisión con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  cliente_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  notas: Array<{
    remision_id: number;
    codigo_remision: string;
    fecha_remision: string;
    cliente_nombre: string;
    estado: string;
    total_productos: number;
    total_cantidad: number;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Apertura/Cierre de Caja

#### GET `/api/ventas/apertura-cierre-caja`
Obtiene la lista de aperturas/cierres de caja con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  caja_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  cajas: Array<{
    caja_id: number;
    codigo_caja: string;
    fecha_apertura: string;
    fecha_cierre?: string;
    estado: string;
    monto_inicial: number;
    monto_final?: number;
    usuario_nombre: string;
    observaciones?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

### Dashboard de Ventas

#### GET `/api/ventas/dashboard`
Obtiene las métricas principales del módulo de ventas.

**Respuesta:**
```typescript
{
  resumen: {
    total_ventas: number;
    total_cobros: number;
    total_pedidos: number;
    total_clientes: number;
    total_usuarios: number;
    total_abiertas: number;
    total_cerradas: number;
    total_canceladas: number;
    tendencia_ventas: number;
    tendencia_cobros: number;
    tendencia_pedidos: number;
    tendencia_clientes: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: string;
    monto: string;
  }>;
  top_clientes: Array<{
    cliente_id: number | null;
    nombre: string | null;
    email: string | null;
    total_pedidos: string;
    total_ventas: string;
  }>;
  top_usuarios: Array<{
    usuario_id: number;
    nombre: string;
    email: string;
    total_transacciones: number;
    total_ventas: number;
  }>;
  por_sucursal: Array<{
    sucursal_id: number;
    nombre: string;
    total_transacciones: number;
    total_ventas: number;
  }>;
  por_caja: Array<{
    nro_caja: string | null;
    total_transacciones: string;
    total_ventas: string;
  }>;
  tendencias_mensuales: Array<{
    año: string;
    mes: string;
    mes_nombre: string;
    total_transacciones: string;
    total_ventas: string;
  }>;
}
```

## Componentes Principales

### PedidosClientesPage
Página principal para la gestión de pedidos de clientes.

**Funcionalidades:**
- Lista paginada de pedidos
- Filtros avanzados por cliente y estado
- Búsqueda en tiempo real
- Acciones de crear, editar, eliminar
- Conversión a ventas
- Exportación de datos

### RegistroPage
Página principal para el registro de ventas.

**Funcionalidades:**
- Lista paginada de ventas
- Filtros por cliente y período
- Búsqueda por código de venta
- Acciones de crear, editar, eliminar
- Generación de facturas
- Múltiples formas de pago

### CobrosPage
Página principal para la gestión de cobros.

**Funcionalidades:**
- Lista paginada de cobros
- Filtros por cliente y estado
- Búsqueda por código de cobro
- Acciones de crear, editar, eliminar
- Conciliación bancaria
- Reportes de cobranza

### PresupuestosPage
Página principal para la gestión de presupuestos de servicios.

**Funcionalidades:**
- Lista paginada de presupuestos
- Filtros por cliente y estado
- Búsqueda por código de presupuesto
- Acciones de crear, editar, eliminar
- Proceso de aprobación
- Conversión a órdenes de servicio

### NotasRemisionPage
Página principal para la gestión de notas de remisión.

**Funcionalidades:**
- Lista paginada de notas de remisión
- Filtros por cliente y estado
- Búsqueda por código de remisión
- Acciones de crear, editar, eliminar
- Control de entregas
- Conciliación de inventario

### AperturaCierreCajaPage
Página principal para la gestión de apertura/cierre de caja.

**Funcionalidades:**
- Lista paginada de aperturas/cierres
- Filtros por caja y estado
- Búsqueda por fecha
- Acciones de abrir, cerrar caja
- Control de efectivo
- Reportes de caja

### InformesPage
Página principal para los informes de ventas.

**Funcionalidades:**
- Dashboard de métricas
- Informes por módulo
- Filtros de fecha y período
- Exportación de reportes
- Gráficos interactivos
- Análisis de tendencias

## Hooks Personalizados

### useVentas
Hook base para operaciones de ventas.

```typescript
const {
  data,
  loading,
  error,
  fetchData,
  createItem,
  updateItem,
  deleteItem
} = useVentas(endpoint, options);
```

### useCobros
Hook específico para gestión de cobros.

```typescript
const {
  cobros,
  loading,
  error,
  pagination,
  fetchCobros,
  createCobro,
  updateCobro,
  deleteCobro
} = useCobros(options);
```

### useNotasRemision
Hook específico para gestión de notas de remisión.

```typescript
const {
  notasRemision,
  loading,
  error,
  pagination,
  fetchNotasRemision,
  createNotaRemision,
  updateNotaRemision,
  deleteNotaRemision
} = useNotasRemision(options);
```

### usePresupuestos
Hook específico para gestión de presupuestos.

```typescript
const {
  presupuestos,
  loading,
  error,
  pagination,
  fetchPresupuestos,
  createPresupuesto,
  updatePresupuesto,
  deletePresupuesto
} = usePresupuestos(options);
```

## Tipos TypeScript

### PedidoCliente
```typescript
interface PedidoCliente {
  pedido_id: number;
  codigo_pedido: string;
  fecha_pedido: string;
  cliente_id: number;
  cliente_nombre: string;
  estado: 'pendiente' | 'confirmado' | 'en_proceso' | 'entregado' | 'cancelado';
  valor_total: number;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    subtotal: number;
  }>;
}
```

### Venta
```typescript
interface Venta {
  venta_id: number;
  codigo_venta: string;
  fecha_venta: string;
  cliente_id: number;
  cliente_nombre: string;
  estado: 'abierto' | 'cerrado' | 'cancelado';
  monto_venta: number;
  forma_pago: string;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    descuento?: number;
    subtotal: number;
  }>;
}
```

### Cobro
```typescript
interface Cobro {
  cobro_id: number;
  codigo_cobro: string;
  fecha_cobro: string;
  cliente_id: number;
  cliente_nombre: string;
  estado: string;
  monto: number;
  forma_pago: string;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
  factura_id?: number;
  nro_factura?: string;
  fecha_venta?: string;
}
```

### PresupuestoServicio
```typescript
interface PresupuestoServicio {
  presu_serv_id: number;
  codigo_presupuesto: string;
  fecha_presupuesto: string;
  cliente_id: number;
  cliente_nombre: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  monto_presu_ser: number;
  valido_desde?: string;
  valido_hasta?: string;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
  servicios: Array<{
    servicio_id: number;
    servicio_nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}
```

### NotaRemision
```typescript
interface NotaRemision {
  remision_id: number;
  codigo_remision: string;
  fecha_remision: string;
  cliente_id: number;
  cliente_nombre: string;
  estado: 'activo' | 'anulado';
  total_productos: number;
  total_cantidad: number;
  usuario_id: number;
  usuario_nombre: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    producto_nombre: string;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
  }>;
}
```

## Permisos Requeridos

### Pedidos de Clientes
- `ventas.pedidos.ver` - Ver lista de pedidos
- `ventas.pedidos.crear` - Crear nuevos pedidos
- `ventas.pedidos.editar` - Editar pedidos existentes
- `ventas.pedidos.eliminar` - Eliminar pedidos

### Registro de Ventas
- `ventas.ventas.ver` - Ver lista de ventas
- `ventas.ventas.crear` - Registrar nuevas ventas
- `ventas.ventas.editar` - Editar ventas existentes
- `ventas.ventas.eliminar` - Eliminar ventas

### Cobros
- `ventas.cobros.ver` - Ver lista de cobros
- `ventas.cobros.crear` - Registrar nuevos cobros
- `ventas.cobros.editar` - Editar cobros existentes
- `ventas.cobros.eliminar` - Eliminar cobros

### Presupuestos de Servicios
- `ventas.presupuestos.ver` - Ver lista de presupuestos
- `ventas.presupuestos.crear` - Crear nuevos presupuestos
- `ventas.presupuestos.editar` - Editar presupuestos existentes
- `ventas.presupuestos.aprobar` - Aprobar presupuestos

### Notas de Remisión
- `ventas.remisiones.ver` - Ver lista de remisiones
- `ventas.remisiones.crear` - Crear nuevas remisiones
- `ventas.remisiones.editar` - Editar remisiones existentes
- `ventas.remisiones.eliminar` - Eliminar remisiones

### Apertura/Cierre de Caja
- `ventas.caja.ver` - Ver gestión de caja
- `ventas.caja.abrir` - Abrir caja
- `ventas.caja.cerrar` - Cerrar caja
- `ventas.caja.arqueo` - Realizar arqueo

### Informes
- `ventas.informes.ver` - Ver informes de ventas
- `ventas.informes.exportar` - Exportar informes

## Configuración

### Variables de Entorno
```env
VENTAS_PAGINATION_LIMIT=20
VENTAS_CACHE_TTL=300000
VENTAS_AUTO_FACTURA=true
VENTAS_IVA_PORCENTAJE=13
VENTAS_NOTIFICATION_EMAIL=ventas@empresa.com
```

### Configuración de Estados
```typescript
const PEDIDO_ESTADOS = {
  PENDIENTE: 'pendiente',
  CONFIRMADO: 'confirmado',
  EN_PROCESO: 'en_proceso',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado'
};

const VENTA_ESTADOS = {
  ABIERTO: 'abierto',
  CERRADO: 'cerrado',
  CANCELADO: 'cancelado'
};

const COBRO_ESTADOS = {
  PENDIENTE: 'pendiente',
  PAGADO: 'pagado',
  ANULADO: 'anulado'
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
describe('VentasPage', () => {
  it('should render ventas list', () => {
    // Test implementation
  });
  
  it('should handle create venta', () => {
    // Test implementation
  });
  
  it('should handle edit venta', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Ventas API', () => {
  it('should create venta', async () => {
    // Test implementation
  });
  
  it('should update venta', async () => {
    // Test implementation
  });
  
  it('should delete venta', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Ventas no se registran**
   - Verificar permisos del usuario
   - Revisar validaciones de datos
   - Verificar conexión a base de datos

2. **Cobros no se procesan**
   - Verificar saldos de clientes
   - Revisar validaciones de monto
   - Verificar estado del cobro

3. **Presupuestos no se aprueban**
   - Verificar flujo de aprobación
   - Revisar permisos de aprobación
   - Verificar estado del presupuesto

### Logs de Debug
```typescript
console.log('Venta registrada:', venta);
console.log('Cobro procesado:', cobro);
console.log('Presupuesto aprobado:', presupuesto);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Integración con POS
- [ ] Notificaciones automáticas
- [ ] Aprobación electrónica
- [ ] Integración con clientes
- [ ] Análisis predictivo
- [ ] Mobile app

### Mejoras Técnicas
- [ ] WebSockets para actualizaciones
- [ ] Advanced caching
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics dashboard
