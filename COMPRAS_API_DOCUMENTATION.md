# API de Compras - Documentación

Esta documentación describe las APIs para la gestión del módulo de Compras del sistema de taller, incluyendo los tres submenús principales: Pedidos de Compra, Presupuestos Proveedor y Órdenes de Compra.

## Módulos Incluidos

- **Pedidos de Compra** - Gestión de solicitudes de compra a proveedores
- **Presupuestos Proveedor** - Gestión de cotizaciones y negociaciones
- **Órdenes de Compra** - Gestión y seguimiento de órdenes confirmadas
- **Registro de Compras** - Registro de compras realizadas
- **Dashboard** - Estadísticas y métricas del módulo

## Estructura de URLs

Todas las APIs siguen el patrón: `/api/compras/{modulo}`

## Autenticación

Todas las APIs requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer <token>
```

## Permisos Requeridos

Cada módulo requiere permisos específicos:
- `crear_{modulo}` - Crear registros
- `leer_{modulo}` - Leer registros
- `actualizar_{modulo}` - Actualizar registros
- `eliminar_{modulo}` - Eliminar registros
- `aprobar_{modulo}` - Aprobar registros (para presupuestos)

---

## 📋 PEDIDOS DE COMPRA

### GET /api/compras/pedidos
Listar pedidos de compra con paginación y filtros.

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10)
- `search` (opcional): Búsqueda por número de comprobante, comentario o proveedor
- `sort_by` (opcional): Campo para ordenar (default: fecha_pedido)
- `sort_order` (opcional): Orden (asc/desc, default: desc)
- `estado` (opcional): Filtrar por estado (pendiente/procesado/cancelado)
- `fecha_desde` (opcional): Fecha desde
- `fecha_hasta` (opcional): Fecha hasta
- `proveedor_id` (opcional): Filtrar por proveedor
- `sucursal_id` (opcional): Filtrar por sucursal

**Response:**
```json
{
  "success": true,
  "message": "Pedidos de compra obtenidos exitosamente",
  "data": [
    {
      "pedido_compra_id": 1,
      "fecha_pedido": "2024-01-15",
      "estado": "pendiente",
      "usuario_id": 1,
      "comentario": "Pedido urgente para reparaciones",
      "sucursal_id": 1,
      "almacen_id": 1,
      "nro_comprobante": "PC-0001-2024",
      "usuario_nombre": "Admin",
      "sucursal_nombre": "Sucursal Central",
      "almacen_nombre": "Almacén Principal",
      "total_proveedores": 2,
      "total_items": 5,
      "monto_total": 2500000
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "total_pages": 1
  }
}
```

### POST /api/compras/pedidos
Crear un nuevo pedido de compra.

**Request Body:**
```json
{
  "fecha_pedido": "2024-01-15",
  "estado": "pendiente",
  "comentario": "Pedido urgente para reparaciones",
  "sucursal_id": 1,
  "almacen_id": 1,
  "proveedores": [
    {
      "proveedor_id": 1,
      "fecha_envio": "2024-01-15T10:00:00Z"
    }
  ],
  "items": [
    {
      "producto_id": 1,
      "cantidad": 10,
      "precio_unitario": 250000
    }
  ]
}
```

### GET /api/compras/pedidos/[id]
Obtener un pedido de compra específico por ID con información completa.

### PUT /api/compras/pedidos/[id]
Actualizar un pedido de compra existente.

### DELETE /api/compras/pedidos/[id]
Eliminar un pedido de compra (solo si está pendiente).

---

## 💰 PRESUPUESTOS PROVEEDOR

### GET /api/compras/presupuestos
Listar presupuestos proveedor con información de vencimiento y prioridad.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que pedidos)
- `estado` (opcional): Filtrar por estado (nuevo/pendiente/aprobado/rechazado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `proveedor_id` (opcional): Filtrar por proveedor
- `prioridad` (opcional): Filtrar por prioridad (alta/media/baja)

**Response:**
```json
{
  "success": true,
  "message": "Presupuestos proveedor obtenidos exitosamente",
  "data": [
    {
      "presu_prov_id": 1,
      "usuario_id": 1,
      "fecha_presupuesto": "2024-01-15",
      "estado": "pendiente",
      "observaciones": "Cotización para componentes Q1",
      "monto_presu_prov": 3200000,
      "nro_comprobante": "PP-0001-2024",
      "pedido_prov_id": 1,
      "proveedor_id": 1,
      "usuario_nombre": "Admin",
      "proveedor_nombre": "Distribuidora Tech SA",
      "total_items": 8,
      "fecha_vencimiento": "2024-02-14",
      "estado_vencimiento": "vigente",
      "prioridad": "baja"
    }
  ]
}
```

### POST /api/compras/presupuestos
Crear un nuevo presupuesto proveedor.

**Request Body:**
```json
{
  "proveedor_id": 1,
  "fecha_presupuesto": "2024-01-15",
  "estado": "nuevo",
  "observaciones": "Cotización para componentes Q1",
  "monto_presu_prov": 3200000,
  "pedido_prov_id": 1,
  "items": [
    {
      "producto_id": 1,
      "cantidad": 5,
      "precio_unitario": 640000
    }
  ],
  "dias_validez": 30,
  "prioridad": "alta"
}
```

### GET /api/compras/presupuestos/[id]
Obtener un presupuesto específico por ID con items detallados.

### PUT /api/compras/presupuestos/[id]
Actualizar un presupuesto existente.

### PUT /api/compras/presupuestos/[id]/aprobar
Aprobar un presupuesto (cambia estado a 'aprobado').

### DELETE /api/compras/presupuestos/[id]
Eliminar un presupuesto (solo si no está aprobado/rechazado).

---

## 📦 ÓRDENES DE COMPRA

### GET /api/compras/ordenes
Listar órdenes de compra con información de progreso y tracking.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (igual que pedidos)
- `estado` (opcional): Filtrar por estado (pendiente/aprobada/rechazada/cancelada)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `proveedor_id` (opcional): Filtrar por proveedor
- `almacen_id` (opcional): Filtrar por almacén

**Response:**
```json
{
  "success": true,
  "message": "Órdenes de compra obtenidas exitosamente",
  "data": [
    {
      "orden_compra_id": 1,
      "proveedor_id": 1,
      "usuario_id": 1,
      "presu_prov_id": 1,
      "fecha_orden": "2024-01-15",
      "estado": "pendiente",
      "monto_oc": 3200000,
      "observaciones": "Orden confirmada",
      "almacen_id": 1,
      "nro_comprobante": "OC-0001-2024",
      "proveedor_nombre": "Distribuidora Tech SA",
      "usuario_nombre": "Admin",
      "almacen_nombre": "Almacén Principal",
      "total_items": 5,
      "monto_total": 3200000,
      "tracking": "TRK-001-2024",
      "estado_display": "Pendiente",
      "estado_accion": "Pendiente",
      "fecha_entrega": "2024-01-22",
      "progreso": 75,
      "dias_restantes": 2,
      "prioridad": "alta",
      "estado_vencimiento": "por_vencer"
    }
  ]
}
```

### POST /api/compras/ordenes
Crear una nueva orden de compra.

**Request Body:**
```json
{
  "proveedor_id": 1,
  "usuario_id": 1,
  "presu_prov_id": 1,
  "fecha_orden": "2024-01-15",
  "estado": "pendiente",
  "monto_oc": 3200000,
  "observaciones": "Orden confirmada",
  "almacen_id": 1,
  "items": [
    {
      "producto_id": 1,
      "cantidad": 5,
      "precio_unitario": 640000
    }
  ],
  "tracking": "TRK-001-2024",
  "fecha_entrega": "2024-01-22"
}
```

### GET /api/compras/ordenes/[id]
Obtener una orden específica por ID con información completa.

### PUT /api/compras/ordenes/[id]
Actualizar una orden existente.

### DELETE /api/compras/ordenes/[id]
Eliminar una orden (solo si está pendiente).

---

## 📊 DASHBOARD

### GET /api/compras/dashboard
Obtener estadísticas y métricas del dashboard de compras.

**Query Parameters:**
- `fecha_desde` (opcional): Fecha desde para filtrar estadísticas
- `fecha_hasta` (opcional): Fecha hasta para filtrar estadísticas
- `sucursal_id` (opcional): Filtrar por sucursal

**Response:**
```json
{
  "success": true,
  "message": "Dashboard de compras obtenido exitosamente",
  "data": {
    "pedidos": {
      "title": "Total Pedidos",
      "value": 24,
      "trend": 12,
      "trend_direction": "up",
      "icon": "shopping-cart",
      "color": "blue"
    },
    "presupuestos": {
      "title": "Presupuestos",
      "value": 18,
      "trend": 8,
      "trend_direction": "up",
      "icon": "file-text",
      "color": "green"
    },
    "ordenes": {
      "title": "Órdenes de Compra",
      "value": 32,
      "trend": 15,
      "trend_direction": "up",
      "icon": "package",
      "color": "orange"
    },
    "compras": {
      "title": "Valor Total",
      "value": 8500000,
      "trend": 28,
      "trend_direction": "up",
      "icon": "dollar-sign",
      "color": "red"
    },
    "resumen": {
      "total_valor": 8500000,
      "total_items": 150,
      "proveedores_activos": 12,
      "ordenes_vencidas": 3
    }
  }
}
```

---

## Validaciones

### Pedidos de Compra
- **fecha_pedido**: Formato de fecha válido, no puede ser futura
- **estado**: Debe ser pendiente, procesado o cancelado
- **nro_comprobante**: Formato válido (opcional)
- **proveedores**: Al menos un proveedor requerido
- **items**: Al menos un producto requerido
- **sucursal_id**: Debe existir (opcional)
- **almacen_id**: Debe existir (opcional)

### Presupuestos Proveedor
- **proveedor_id**: Requerido, debe existir
- **fecha_presupuesto**: Formato de fecha válido, no puede ser futura
- **estado**: Debe ser nuevo, pendiente, aprobado o rechazado
- **monto_presu_prov**: Número no negativo (opcional)
- **nro_comprobante**: Formato válido (opcional)
- **items**: Al menos un producto requerido
- **dias_validez**: Entre 1 y 365 días (opcional)
- **prioridad**: Debe ser alta, media o baja (opcional)

### Órdenes de Compra
- **proveedor_id**: Requerido, debe existir
- **fecha_orden**: Formato de fecha válido, no puede ser futura
- **estado**: Debe ser pendiente, aprobada, rechazada o cancelada
- **monto_oc**: Número no negativo (opcional)
- **items**: Al menos un producto requerido
- **fecha_entrega**: Debe ser posterior a fecha_orden
- **almacen_id**: Debe existir (opcional)

## Códigos de Error

- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token de acceso requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con datos existentes o estado inválido
- `500` - Internal Server Error: Error interno del servidor

## Características Especiales

### Generación Automática de Números
- **Pedidos**: PC-0001-2024, PC-0002-2024, etc.
- **Presupuestos**: PP-0001-2024, PP-0002-2024, etc.
- **Órdenes**: OC-0001-2024, OC-0002-2024, etc.
- **Tracking**: TRK-001-2024, TRK-002-2024, etc.

### Cálculo de Progreso y Prioridad
- **Progreso**: Calculado basado en días transcurridos vs. días totales
- **Prioridad**: Alta (vencida), Media (por vencer), Baja (vigente)
- **Días restantes**: Calculado automáticamente para órdenes

### Estados de Vencimiento
- **Vigente**: Más de 7 días restantes
- **Por vencer**: Entre 0 y 7 días restantes
- **Vencida**: Fecha de entrega pasada

### Validación de Estados
- Los pedidos solo pueden modificarse si están pendientes
- Los presupuestos solo pueden modificarse si no están aprobados/rechazados
- Las órdenes solo pueden modificarse si están pendientes

### Logs de Auditoría
Todas las operaciones de creación, actualización y eliminación se registran en logs para auditoría.

### Formateo de Datos
- Monedas se formatean según estándares paraguayos
- Fechas se manejan en formato ISO 8601
- Números de comprobante se generan automáticamente

## Flujo de Trabajo Recomendado

1. **Crear Pedido de Compra** → Solicitar cotizaciones a proveedores
2. **Crear Presupuestos Proveedor** → Recibir y evaluar cotizaciones
3. **Aprobar Presupuesto** → Seleccionar la mejor opción
4. **Crear Orden de Compra** → Confirmar compra con proveedor
5. **Seguimiento** → Monitorear progreso y entrega
6. **Registro de Compra** → Registrar compra realizada

## Integración con Otros Módulos

- **Referencias**: Utiliza proveedores, productos, almacenes, sucursales
- **Inventario**: Actualiza stock al registrar compras
- **Contabilidad**: Genera asientos contables automáticamente
- **Reportes**: Proporciona datos para reportes financieros
