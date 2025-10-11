# Módulo de Compras

## Descripción General

El módulo de Compras gestiona todo el proceso de adquisición de productos y servicios, desde la solicitud de presupuestos hasta la recepción de mercancías y el registro de compras.

## Funcionalidades Principales

### 🛒 Gestión de Pedidos de Compra
- **Creación de pedidos**: Solicitud de productos a proveedores
- **Seguimiento de estado**: Pendiente, Enviado, Recibido, Cancelado
- **Aprobación de pedidos**: Flujo de aprobación por niveles
- **Historial de cambios**: Auditoría de modificaciones

### 📋 Presupuestos de Proveedor
- **Solicitud de presupuestos**: Envío de solicitudes a proveedores
- **Comparación de ofertas**: Análisis de múltiples presupuestos
- **Aprobación de presupuestos**: Proceso de aprobación
- **Conversión a órdenes**: Transformación automática

### 📦 Órdenes de Compra
- **Generación de órdenes**: Desde presupuestos aprobados
- **Seguimiento de entrega**: Estado de envío y recepción
- **Control de calidad**: Verificación de productos recibidos
- **Facturación**: Vinculación con facturas de proveedor

### 📊 Registro de Compras
- **Registro de facturas**: Ingreso de facturas de proveedores
- **Validación de datos**: Verificación de información
- **Asignación de costos**: Distribución de costos por centro
- **Integración contable**: Sincronización con sistema contable

### 🔧 Ajustes de Inventario
- **Ajustes por diferencia**: Corrección de inventarios
- **Ajustes por obsolescencia**: Bajas por productos obsoletos
- **Ajustes por pérdidas**: Registro de pérdidas y robos
- **Auditoría de ajustes**: Trazabilidad completa

### 💳 Notas de Crédito/Débito
- **Notas de crédito**: Devoluciones y descuentos
- **Notas de débito**: Cargos adicionales
- **Aplicación a facturas**: Vinculación con facturas originales
- **Seguimiento de saldos**: Control de saldos pendientes

### 🔄 Transferencias de Stock
- **Transferencias entre almacenes**: Movimiento de inventario
- **Transferencias entre sucursales**: Movimiento inter-sucursal
- **Seguimiento de transferencias**: Estado de envío y recepción
- **Conciliación de inventarios**: Verificación de movimientos

### 📈 Informes de Compras
- **Dashboard de compras**: Métricas consolidadas
- **Informe de pedidos**: Análisis de pedidos por período
- **Informe de presupuestos**: Comparativa de ofertas
- **Informe de órdenes**: Seguimiento de órdenes
- **Informe de registro**: Análisis de compras registradas
- **Informe de ajustes**: Análisis de ajustes de inventario
- **Informe de notas**: Análisis de notas de crédito/débito
- **Informe de transferencias**: Análisis de movimientos

## Estructura de Archivos

```
app/compras/
├── pedidos-de-compra/
│   ├── page.tsx              # Lista de pedidos
│   └── loading.tsx           # Estado de carga
├── presupuestos/
│   ├── page.tsx              # Lista de presupuestos
│   └── loading.tsx           # Estado de carga
├── ordenes/
│   ├── page.tsx              # Lista de órdenes
│   └── loading.tsx           # Estado de carga
├── registro/
│   ├── page.tsx              # Lista de compras registradas
│   └── loading.tsx           # Estado de carga
├── ajustes/
│   ├── page.tsx              # Lista de ajustes
│   └── loading.tsx           # Estado de carga
├── notas/
│   ├── page.tsx              # Lista de notas
│   └── loading.tsx           # Estado de carga
├── transferencias/
│   ├── page.tsx              # Lista de transferencias
│   └── loading.tsx           # Estado de carga
└── informes/
    ├── page.tsx              # Dashboard de informes
    └── loading.tsx            # Estado de carga

app/api/compras/
├── pedidos/
│   ├── route.ts              # CRUD de pedidos
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── presupuestos/
│   ├── route.ts              # CRUD de presupuestos
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       ├── aprobar/route.ts  # Aprobación
│       └── rechazar/route.ts # Rechazo
├── ordenes/
│   ├── route.ts              # CRUD de órdenes
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       └── completar/route.ts # Completar orden
├── registro/
│   ├── route.ts              # CRUD de registro
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── ajustes-inventario/
│   ├── route.ts              # CRUD de ajustes
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── notas-credito/
│   ├── route.ts              # CRUD de notas de crédito
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── notas-debito/
│   ├── route.ts              # CRUD de notas de débito
│   └── [id]/
│       └── route.ts          # Operaciones específicas
├── transferencias/
│   ├── route.ts              # CRUD de transferencias
│   └── [id]/
│       ├── route.ts          # Operaciones específicas
│       └── completar/route.ts # Completar transferencia
├── dashboard/
│   └── route.ts              # Métricas del dashboard
└── informes/
    ├── dashboard/route.ts     # Dashboard de informes
    ├── pedidos/route.ts       # Informe de pedidos
    ├── presupuestos/route.ts  # Informe de presupuestos
    ├── ordenes/route.ts       # Informe de órdenes
    ├── registro/route.ts      # Informe de registro
    ├── ajustes/route.ts       # Informe de ajustes
    ├── notas/route.ts         # Informe de notas
    └── transferencias/route.ts # Informe de transferencias

components/
├── informes/
│   ├── dashboard-compras.tsx     # Dashboard de informes
│   ├── informe-pedidos.tsx       # Informe de pedidos
│   ├── informe-presupuestos.tsx  # Informe de presupuestos
│   ├── informe-ordenes.tsx       # Informe de órdenes
│   ├── informe-registro.tsx      # Informe de registro
│   ├── informe-ajustes.tsx       # Informe de ajustes
│   ├── informe-notas.tsx         # Informe de notas
│   └── informe-transferencias.tsx # Informe de transferencias
└── modals/
    ├── pedido-compra-modal.tsx      # Modal de pedido
    ├── presupuesto-proveedor-modal.tsx # Modal de presupuesto
    ├── orden-compra-modal.tsx       # Modal de orden
    ├── compra-cabecera-modal.tsx    # Modal de registro
    ├── ajuste-inventario-modal.tsx  # Modal de ajuste
    ├── nota-modal.tsx               # Modal de nota
    └── transferencia-stock-modal.tsx # Modal de transferencia
```

## APIs Principales

### Pedidos de Compra

#### GET `/api/compras/pedidos`
Obtiene la lista de pedidos de compra con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  proveedor_id?: number;
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
    proveedor_nombre: string;
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

#### POST `/api/compras/pedidos`
Crea un nuevo pedido de compra.

**Body:**
```typescript
{
  proveedor_id: number;
  fecha_pedido: string;
  observaciones?: string;
  productos: Array<{
    producto_id: number;
    cantidad: number;
    precio_unitario: number;
  }>;
}
```

### Presupuestos de Proveedor

#### GET `/api/compras/presupuestos`
Obtiene la lista de presupuestos con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  proveedor_id?: number;
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
    proveedor_nombre: string;
    estado: string;
    monto_total: number;
    valido_desde?: string;
    valido_hasta?: string;
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

### Órdenes de Compra

#### GET `/api/compras/ordenes`
Obtiene la lista de órdenes de compra con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  proveedor_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  ordenes: Array<{
    orden_id: number;
    codigo_orden: string;
    fecha_orden: string;
    proveedor_nombre: string;
    estado: string;
    monto_oc: number;
    fecha_entrega?: string;
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

### Registro de Compras

#### GET `/api/compras/registro`
Obtiene la lista de compras registradas con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  proveedor_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  compras: Array<{
    compra_id: number;
    codigo_compra: string;
    fecha_compra: string;
    proveedor_nombre: string;
    estado: string;
    monto_total: number;
    nro_factura?: string;
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

### Ajustes de Inventario

#### GET `/api/compras/ajustes-inventario`
Obtiene la lista de ajustes de inventario con filtros y paginación.

**Query Parameters:**
```typescript
{
  page?: number;
  limit?: number;
  search?: string;
  estado?: string;
  almacen_id?: number;
  motivo_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
```

**Respuesta:**
```typescript
{
  ajustes: Array<{
    ajuste_id: number;
    codigo_ajuste: string;
    fecha: string;
    almacen_nombre: string;
    motivo_nombre: string;
    estado: string;
    monto_total: number;
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

### Dashboard de Compras

#### GET `/api/compras/dashboard`
Obtiene las métricas principales del módulo de compras.

**Respuesta:**
```typescript
{
  resumen: {
    total_pedidos: number;
    total_presupuestos: number;
    total_ordenes: number;
    total_compras: number;
    total_ajustes: number;
    total_notas: number;
    total_transferencias: number;
    monto_total_compras: number;
  };
  por_estado: Array<{
    estado: string;
    cantidad: number;
    monto: number;
  }>;
  top_proveedores: Array<{
    proveedor_id: number;
    nombre: string;
    total_compras: number;
    total_monto: number;
  }>;
  por_sucursal: Array<{
    sucursal_id: number;
    nombre: string;
    total_compras: number;
    total_monto: number;
  }>;
  tendencias_mensuales: Array<{
    año: string;
    mes: string;
    mes_nombre: string;
    total_compras: number;
    total_monto: number;
  }>;
}
```

## Componentes Principales

### PedidosDeCompraPage
Página principal para la gestión de pedidos de compra.

**Funcionalidades:**
- Lista paginada de pedidos
- Filtros avanzados
- Búsqueda en tiempo real
- Acciones de crear, editar, eliminar
- Exportación de datos

### PresupuestosPage
Página principal para la gestión de presupuestos de proveedor.

**Funcionalidades:**
- Lista paginada de presupuestos
- Filtros por estado y proveedor
- Proceso de aprobación/rechazo
- Comparación de ofertas
- Conversión a órdenes

### OrdenesPage
Página principal para la gestión de órdenes de compra.

**Funcionalidades:**
- Lista paginada de órdenes
- Seguimiento de estado
- Control de entregas
- Vinculación con facturas
- Completar órdenes

### RegistroPage
Página principal para el registro de compras.

**Funcionalidades:**
- Lista paginada de compras
- Registro de facturas
- Validación de datos
- Asignación de costos
- Integración contable

### AjustesPage
Página principal para la gestión de ajustes de inventario.

**Funcionalidades:**
- Lista paginada de ajustes
- Creación de ajustes
- Control de motivos
- Auditoría de cambios
- Aprobación de ajustes

### InformesPage
Página principal para los informes de compras.

**Funcionalidades:**
- Dashboard de métricas
- Informes por módulo
- Filtros de fecha y período
- Exportación de reportes
- Gráficos interactivos

## Hooks Personalizados

### useCompras
Hook base para operaciones de compras.

```typescript
const {
  data,
  loading,
  error,
  fetchData,
  createItem,
  updateItem,
  deleteItem
} = useCompras(endpoint, options);
```

### useComprasStats
Hook para estadísticas de compras.

```typescript
const {
  stats,
  loading,
  error,
  fetchStats
} = useComprasStats();
```

## Tipos TypeScript

### PedidoCompra
```typescript
interface PedidoCompra {
  pedido_id: number;
  codigo_pedido: string;
  fecha_pedido: string;
  proveedor_id: number;
  proveedor_nombre: string;
  estado: 'pendiente' | 'enviado' | 'recibido' | 'cancelado';
  valor_total: number;
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

### PresupuestoProveedor
```typescript
interface PresupuestoProveedor {
  presupuesto_id: number;
  codigo_presupuesto: string;
  fecha_presupuesto: string;
  proveedor_id: number;
  proveedor_nombre: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  monto_total: number;
  valido_desde?: string;
  valido_hasta?: string;
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

### OrdenCompra
```typescript
interface OrdenCompra {
  orden_id: number;
  codigo_orden: string;
  fecha_orden: string;
  proveedor_id: number;
  proveedor_nombre: string;
  estado: 'pendiente' | 'enviada' | 'recibida' | 'cancelada';
  monto_oc: number;
  fecha_entrega?: string;
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

### Pedidos de Compra
- `compras.pedidos.ver` - Ver lista de pedidos
- `compras.pedidos.crear` - Crear nuevos pedidos
- `compras.pedidos.editar` - Editar pedidos existentes
- `compras.pedidos.eliminar` - Eliminar pedidos

### Presupuestos
- `compras.presupuestos.ver` - Ver lista de presupuestos
- `compras.presupuestos.crear` - Crear nuevos presupuestos
- `compras.presupuestos.editar` - Editar presupuestos existentes
- `compras.presupuestos.aprobar` - Aprobar presupuestos
- `compras.presupuestos.rechazar` - Rechazar presupuestos

### Órdenes de Compra
- `compras.ordenes.ver` - Ver lista de órdenes
- `compras.ordenes.crear` - Crear nuevas órdenes
- `compras.ordenes.editar` - Editar órdenes existentes
- `compras.ordenes.completar` - Completar órdenes

### Registro de Compras
- `compras.registro.ver` - Ver lista de compras
- `compras.registro.crear` - Registrar nuevas compras
- `compras.registro.editar` - Editar compras existentes
- `compras.registro.eliminar` - Eliminar compras

### Ajustes de Inventario
- `compras.ajustes.ver` - Ver lista de ajustes
- `compras.ajustes.crear` - Crear nuevos ajustes
- `compras.ajustes.editar` - Editar ajustes existentes
- `compras.ajustes.aprobar` - Aprobar ajustes

### Informes
- `compras.informes.ver` - Ver informes de compras
- `compras.informes.exportar` - Exportar informes

## Configuración

### Variables de Entorno
```env
COMPRAS_PAGINATION_LIMIT=20
COMPRAS_CACHE_TTL=300000
COMPRAS_AUTO_APPROVE_LIMIT=1000
COMPRAS_NOTIFICATION_EMAIL=compras@empresa.com
```

### Configuración de Estados
```typescript
const PEDIDO_ESTADOS = {
  PENDIENTE: 'pendiente',
  ENVIADO: 'enviado',
  RECIBIDO: 'recibido',
  CANCELADO: 'cancelado'
};

const PRESUPUESTO_ESTADOS = {
  PENDIENTE: 'pendiente',
  APROBADO: 'aprobado',
  RECHAZADO: 'rechazado'
};

const ORDEN_ESTADOS = {
  PENDIENTE: 'pendiente',
  ENVIADA: 'enviada',
  RECIBIDA: 'recibida',
  CANCELADA: 'cancelada'
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
describe('PedidosDeCompraPage', () => {
  it('should render pedidos list', () => {
    // Test implementation
  });
  
  it('should handle create pedido', () => {
    // Test implementation
  });
  
  it('should handle edit pedido', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
describe('Compras API', () => {
  it('should create pedido', async () => {
    // Test implementation
  });
  
  it('should update pedido', async () => {
    // Test implementation
  });
  
  it('should delete pedido', async () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Pedidos no se crean**
   - Verificar permisos del usuario
   - Revisar validaciones de datos
   - Verificar conexión a base de datos

2. **Presupuestos no se aprueban**
   - Verificar flujo de aprobación
   - Revisar permisos de aprobación
   - Verificar estado del presupuesto

3. **Órdenes no se completan**
   - Verificar productos recibidos
   - Revisar validaciones de cantidad
   - Verificar estado de la orden

### Logs de Debug
```typescript
console.log('Pedido creado:', pedido);
console.log('Presupuesto aprobado:', presupuesto);
console.log('Orden completada:', orden);
```

## Roadmap

### Próximas Funcionalidades
- [ ] Integración con ERP
- [ ] Notificaciones automáticas
- [ ] Aprobación electrónica
- [ ] Integración con proveedores
- [ ] Análisis predictivo
- [ ] Mobile app

### Mejoras Técnicas
- [ ] WebSockets para actualizaciones
- [ ] Advanced caching
- [ ] Performance monitoring
- [ ] Error tracking
- [ ] Analytics dashboard
