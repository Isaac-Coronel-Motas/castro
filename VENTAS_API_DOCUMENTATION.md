# Documentación API - Módulo de Ventas

## Descripción General

El módulo de Ventas proporciona APIs completas para la gestión de operaciones de venta, incluyendo apertura/cierre de caja, pedidos de clientes, registro de ventas, cobros, presupuestos, notas de remisión, notas de crédito/débito e informes detallados.

## Características Principales

- **Gestión de Caja**: Control de apertura y cierre de caja con arqueos
- **Pedidos de Clientes**: Manejo completo de pedidos con seguimiento de estados
- **Registro de Ventas**: Procesamiento de ventas con cálculo automático de IVA
- **Gestión de Cobros**: Manejo de pagos y cuentas por cobrar
- **Presupuestos**: Creación y seguimiento de presupuestos de venta
- **Notas de Remisión**: Control de transferencias entre almacenes
- **Notas de Crédito/Débito**: Gestión de correcciones y ajustes
- **Informes Avanzados**: Reportes detallados y estadísticas de ventas

## Estructura de APIs

### 1. Apertura/Cierre de Caja

#### `GET /api/ventas/apertura-cierre-caja`
Lista registros de apertura/cierre de caja con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y usuario
- `sort_by`: Campo de ordenamiento (default: fecha_apertura)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado del arqueo (abierto/cerrado)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `usuario_id`: ID del usuario
- `caja_id`: ID de la caja

**Respuesta:**
```json
{
  "success": true,
  "message": "Registros de caja obtenidos exitosamente",
  "data": [
    {
      "arqueo_id": 1,
      "fecha_apertura": "2024-01-15",
      "fecha_cierre": "2024-01-15",
      "usuario_id": 1,
      "caja_id": 1,
      "monto_apertura": 100000,
      "monto_cierre": 150000,
      "diferencia": 50000,
      "estado": "cerrado",
      "observaciones": "Cierre normal",
      "usuario_nombre": "Juan Pérez",
      "caja_nombre": "Caja Principal",
      "estado_display": "Cerrado",
      "estado_accion": "Ver"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

#### `POST /api/ventas/apertura-cierre-caja`
Abre una nueva caja.

**Body:**
```json
{
  "usuario_id": 1,
  "caja_id": 1,
  "monto_apertura": 100000,
  "observaciones": "Apertura de caja"
}
```

#### `PUT /api/ventas/apertura-cierre-caja/[id]/cerrar`
Cierra una caja abierta.

**Body:**
```json
{
  "monto_cierre": 150000,
  "observaciones": "Cierre de caja"
}
```

### 2. Pedidos de Clientes

#### `GET /api/ventas/pedidos-clientes`
Lista pedidos de clientes con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_pedido)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado del pedido (pendiente/enviado/entregado/anulado)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `sucursal_id`: ID de la sucursal

**Respuesta:**
```json
{
  "success": true,
  "message": "Pedidos de clientes obtenidos exitosamente",
  "data": [
    {
      "pedido_id": 1,
      "fecha_pedido": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "sucursal_id": 1,
      "estado": "pendiente",
      "observaciones": "Pedido urgente",
      "total_pedido": 500000,
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "sucursal_nombre": "Sucursal Central",
      "estado_display": "Pendiente",
      "estado_accion": "Enviar"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "total_pages": 5
  }
}
```

#### `POST /api/ventas/pedidos-clientes`
Crea un nuevo pedido de cliente.

**Body:**
```json
{
  "fecha_pedido": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "sucursal_id": 1,
  "estado": "pendiente",
  "observaciones": "Pedido urgente",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 100000
    }
  ]
}
```

### 3. Registro de Ventas

#### `GET /api/ventas/registro-ventas`
Lista ventas registradas con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en nro_factura y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_venta)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado de la venta (pendiente/facturada/anulada)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `sucursal_id`: ID de la sucursal
- `condicion_pago`: Condición de pago (contado/credito)

**Respuesta:**
```json
{
  "success": true,
  "message": "Ventas obtenidas exitosamente",
  "data": [
    {
      "venta_id": 1,
      "fecha_venta": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "sucursal_id": 1,
      "nro_factura": "001-001-0000001",
      "timbrado": 1,
      "condicion_pago": "contado",
      "estado": "facturada",
      "total_gravado": 400000,
      "total_iva": 60000,
      "total_exento": 0,
      "total_venta": 460000,
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "sucursal_nombre": "Sucursal Central",
      "estado_display": "Facturada",
      "estado_accion": "Ver"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "total_pages": 10
  }
}
```

#### `POST /api/ventas/registro-ventas`
Crea una nueva venta.

**Body:**
```json
{
  "fecha_venta": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "sucursal_id": 1,
  "nro_factura": "001-001-0000001",
  "timbrado": 1,
  "condicion_pago": "contado",
  "estado": "facturada",
  "observaciones": "Venta al contado",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 2,
      "precio_unitario": 100000,
      "descuento": 0,
      "subtotal": 200000,
      "gravado": 200000,
      "exento": 0,
      "iva": 30000
    }
  ]
}
```

### 4. Cobros

#### `GET /api/ventas/cobros`
Lista cobros realizados con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_cobro)
- `sort_order`: Orden (asc/desc, default: desc)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `forma_cobro_id`: ID de la forma de cobro
- `venta_id`: ID de la venta

**Respuesta:**
```json
{
  "success": true,
  "message": "Cobros obtenidos exitosamente",
  "data": [
    {
      "cobro_id": 1,
      "fecha_cobro": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "venta_id": 1,
      "forma_cobro_id": 1,
      "monto": 460000,
      "observaciones": "Pago completo",
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "forma_cobro_nombre": "Efectivo",
      "nro_factura": "001-001-0000001"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 75,
    "total_pages": 8
  }
}
```

#### `POST /api/ventas/cobros`
Crea un nuevo cobro.

**Body:**
```json
{
  "fecha_cobro": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "venta_id": 1,
  "forma_cobro_id": 1,
  "monto": 460000,
  "observaciones": "Pago completo"
}
```

### 5. Presupuestos de Ventas

#### `GET /api/ventas/presupuestos`
Lista presupuestos de ventas con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_presupuesto)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado del presupuesto (pendiente/aprobado/rechazado/vencido)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `sucursal_id`: ID de la sucursal

**Respuesta:**
```json
{
  "success": true,
  "message": "Presupuestos obtenidos exitosamente",
  "data": [
    {
      "presupuesto_id": 1,
      "fecha_presupuesto": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "sucursal_id": 1,
      "estado": "pendiente",
      "observaciones": "Presupuesto para proyecto",
      "total_presupuesto": 1000000,
      "fecha_vencimiento": "2024-01-30",
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "sucursal_nombre": "Sucursal Central",
      "estado_display": "Pendiente",
      "estado_accion": "Aprobar"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 30,
    "total_pages": 3
  }
}
```

#### `POST /api/ventas/presupuestos`
Crea un nuevo presupuesto de venta.

**Body:**
```json
{
  "fecha_presupuesto": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "sucursal_id": 1,
  "estado": "pendiente",
  "observaciones": "Presupuesto para proyecto",
  "fecha_vencimiento": "2024-01-30",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 5,
      "precio_unitario": 100000,
      "descuento": 0,
      "subtotal": 500000,
      "gravado": 500000,
      "exento": 0,
      "iva": 75000
    }
  ]
}
```

### 6. Notas de Remisión

#### `GET /api/ventas/notas-remision`
Lista notas de remisión con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y usuario
- `sort_by`: Campo de ordenamiento (default: fecha_remision)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado de la remisión (pendiente/enviado/anulado)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `usuario_id`: ID del usuario
- `origen_almacen_id`: ID del almacén de origen
- `destino_sucursal_id`: ID de la sucursal de destino
- `destino_almacen_id`: ID del almacén de destino
- `tipo_remision`: Tipo de remisión

**Respuesta:**
```json
{
  "success": true,
  "message": "Notas de remisión obtenidas exitosamente",
  "data": [
    {
      "remision_id": 1,
      "fecha_remision": "2024-01-15",
      "usuario_id": 1,
      "origen_almacen_id": 1,
      "destino_sucursal_id": 2,
      "destino_almacen_id": 3,
      "tipo_remision": "transferencia",
      "referencia_id": 1,
      "estado": "pendiente",
      "observaciones": "Transferencia entre sucursales",
      "usuario_nombre": "Juan Pérez",
      "origen_almacen_nombre": "Almacén Central",
      "destino_sucursal_nombre": "Sucursal Norte",
      "destino_almacen_nombre": "Almacén Norte",
      "total_productos": 5,
      "estado_display": "Pendiente",
      "estado_accion": "Enviar"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "total_pages": 2
  }
}
```

#### `POST /api/ventas/notas-remision`
Crea una nueva nota de remisión.

**Body:**
```json
{
  "fecha_remision": "2024-01-15",
  "usuario_id": 1,
  "origen_almacen_id": 1,
  "destino_sucursal_id": 2,
  "destino_almacen_id": 3,
  "tipo_remision": "transferencia",
  "referencia_id": 1,
  "estado": "pendiente",
  "observaciones": "Transferencia entre sucursales",
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 5
    }
  ]
}
```

#### `PUT /api/ventas/notas-remision/[id]/enviar`
Envía una remisión pendiente.

### 7. Notas de Crédito

#### `GET /api/ventas/notas-credito`
Lista notas de crédito con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_nota)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado de la nota (pendiente/aprobada/anulada)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `tipo_documento`: Tipo de documento

**Respuesta:**
```json
{
  "success": true,
  "message": "Notas de crédito obtenidas exitosamente",
  "data": [
    {
      "nota_credito_id": 1,
      "fecha_nota": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "tipo_documento": "factura",
      "nro_documento": "001-001-0000001",
      "nro_nota": "NC-001",
      "timbrado": 1,
      "estado": "pendiente",
      "observaciones": "Devolución de productos",
      "total_gravado": 200000,
      "total_iva": 30000,
      "total_exento": 0,
      "total_nota": 230000,
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "estado_display": "Pendiente",
      "estado_accion": "Aprobar"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "total_pages": 2
  }
}
```

#### `POST /api/ventas/notas-credito`
Crea una nueva nota de crédito.

**Body:**
```json
{
  "fecha_nota": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "tipo_documento": "factura",
  "nro_documento": "001-001-0000001",
  "nro_nota": "NC-001",
  "timbrado": 1,
  "estado": "pendiente",
  "observaciones": "Devolución de productos",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 1,
      "precio_unitario": 100000,
      "descuento": 0,
      "subtotal": 100000,
      "gravado": 100000,
      "exento": 0,
      "iva": 15000
    }
  ]
}
```

### 8. Notas de Débito

#### `GET /api/ventas/notas-debito`
Lista notas de débito con filtros avanzados.

**Parámetros de consulta:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10)
- `search`: Búsqueda en observaciones y cliente
- `sort_by`: Campo de ordenamiento (default: fecha_nota)
- `sort_order`: Orden (asc/desc, default: desc)
- `estado`: Estado de la nota (pendiente/aprobada/anulada)
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `cliente_id`: ID del cliente
- `usuario_id`: ID del usuario
- `tipo_documento`: Tipo de documento

**Respuesta:**
```json
{
  "success": true,
  "message": "Notas de débito obtenidas exitosamente",
  "data": [
    {
      "nota_debito_id": 1,
      "fecha_nota": "2024-01-15",
      "cliente_id": 1,
      "usuario_id": 1,
      "tipo_documento": "factura",
      "nro_documento": "001-001-0000001",
      "nro_nota": "ND-001",
      "timbrado": 1,
      "estado": "pendiente",
      "observaciones": "Cargo adicional",
      "total_gravado": 50000,
      "total_iva": 7500,
      "total_exento": 0,
      "total_nota": 57500,
      "cliente_nombre": "Cliente ABC",
      "usuario_nombre": "Juan Pérez",
      "estado_display": "Pendiente",
      "estado_accion": "Aprobar"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 10,
    "total_pages": 1
  }
}
```

#### `POST /api/ventas/notas-debito`
Crea una nueva nota de débito.

**Body:**
```json
{
  "fecha_nota": "2024-01-15",
  "cliente_id": 1,
  "usuario_id": 1,
  "tipo_documento": "factura",
  "nro_documento": "001-001-0000001",
  "nro_nota": "ND-001",
  "timbrado": 1,
  "estado": "pendiente",
  "observaciones": "Cargo adicional",
  "detalles": [
    {
      "producto_id": 1,
      "cantidad": 1,
      "precio_unitario": 50000,
      "descuento": 0,
      "subtotal": 50000,
      "gravado": 50000,
      "exento": 0,
      "iva": 7500
    }
  ]
}
```

### 9. Informes de Ventas

#### `GET /api/ventas/informes`
Obtiene informes y estadísticas de ventas.

**Parámetros de consulta:**
- `fecha_desde`: Fecha desde
- `fecha_hasta`: Fecha hasta
- `sucursal_id`: ID de la sucursal
- `usuario_id`: ID del usuario
- `tipo_reporte`: Tipo de reporte (general/ventas_por_periodo/top_clientes/top_productos/ventas_por_usuario/ventas_por_sucursal/tendencias_mensuales/estado_ventas/formas_pago/cobros_pendientes)

**Respuesta para reporte general:**
```json
{
  "success": true,
  "message": "Informe de ventas obtenido exitosamente",
  "data": {
    "total_ventas": 150,
    "total_monto": 15000000,
    "total_gravado": 12000000,
    "total_iva": 1800000,
    "total_exento": 1200000,
    "promedio_venta": 100000,
    "total_clientes": 75,
    "total_usuarios": 5
  }
}
```

**Respuesta para top clientes:**
```json
{
  "success": true,
  "message": "Informe de ventas obtenido exitosamente",
  "data": [
    {
      "cliente_id": 1,
      "cliente_nombre": "Cliente ABC",
      "cantidad_ventas": 25,
      "total_monto": 2500000,
      "promedio_venta": 100000
    }
  ]
}
```

**Respuesta para top productos:**
```json
{
  "success": true,
  "message": "Informe de ventas obtenido exitosamente",
  "data": [
    {
      "producto_id": 1,
      "producto_nombre": "Producto A",
      "cantidad_vendida": 100,
      "total_monto": 1000000,
      "precio_promedio": 10000
    }
  ]
}
```

## Características de Seguridad

- **Autenticación**: Todas las APIs requieren autenticación JWT
- **Autorización**: Control de acceso basado en permisos específicos
- **Validación**: Validación completa de datos de entrada
- **Auditoría**: Logs de auditoría para todas las operaciones
- **Sanitización**: Sanitización de datos para logs

## Permisos Requeridos

- `leer_apertura_cierre_caja`: Leer registros de caja
- `crear_apertura_cierre_caja`: Crear apertura de caja
- `cerrar_caja`: Cerrar caja
- `leer_pedidos_clientes`: Leer pedidos de clientes
- `crear_pedidos_clientes`: Crear pedidos de clientes
- `modificar_pedidos_clientes`: Modificar pedidos de clientes
- `eliminar_pedidos_clientes`: Eliminar pedidos de clientes
- `enviar_pedidos_clientes`: Enviar pedidos de clientes
- `leer_ventas`: Leer ventas
- `crear_ventas`: Crear ventas
- `modificar_ventas`: Modificar ventas
- `eliminar_ventas`: Eliminar ventas
- `facturar_ventas`: Facturar ventas
- `leer_cobros`: Leer cobros
- `crear_cobros`: Crear cobros
- `modificar_cobros`: Modificar cobros
- `eliminar_cobros`: Eliminar cobros
- `leer_presupuestos_ventas`: Leer presupuestos de ventas
- `crear_presupuestos_ventas`: Crear presupuestos de ventas
- `modificar_presupuestos_ventas`: Modificar presupuestos de ventas
- `eliminar_presupuestos_ventas`: Eliminar presupuestos de ventas
- `aprobar_presupuestos_ventas`: Aprobar presupuestos de ventas
- `leer_notas_remision`: Leer notas de remisión
- `crear_notas_remision`: Crear notas de remisión
- `modificar_notas_remision`: Modificar notas de remisión
- `eliminar_notas_remision`: Eliminar notas de remisión
- `enviar_notas_remision`: Enviar notas de remisión
- `leer_notas_credito`: Leer notas de crédito
- `crear_notas_credito`: Crear notas de crédito
- `modificar_notas_credito`: Modificar notas de crédito
- `eliminar_notas_credito`: Eliminar notas de crédito
- `leer_notas_debito`: Leer notas de débito
- `crear_notas_debito`: Crear notas de débito
- `modificar_notas_debito`: Modificar notas de débito
- `eliminar_notas_debito`: Eliminar notas de débito
- `leer_informes_ventas`: Leer informes de ventas

## Validaciones Implementadas

- **Validación de fechas**: Verificación de formatos y rangos de fechas
- **Validación de estados**: Transiciones de estado válidas
- **Validación de entidades**: Verificación de existencia de clientes, usuarios, productos, etc.
- **Validación de montos**: Verificación de montos positivos y cálculos correctos
- **Validación de stock**: Verificación de disponibilidad de productos
- **Validación de timbrados**: Verificación de timbrados activos
- **Validación de IVA**: Cálculo correcto del IVA paraguayo (10%)

## Funcionalidades Especiales

- **Generación automática de números**: Números de factura, notas y remisiones
- **Cálculo automático de IVA**: IVA paraguayo del 10%
- **Gestión de cuentas por cobrar**: Creación automática para ventas a crédito
- **Control de stock**: Actualización automática de inventario
- **Seguimiento de estados**: Control de flujo de trabajo
- **Reportes avanzados**: Estadísticas detalladas y análisis de tendencias

## Próximos Pasos

1. **Configurar variables de entorno** para la conexión a la base de datos
2. **Implementar middleware de autenticación** en la aplicación
3. **Configurar permisos** en el sistema de roles
4. **Probar las APIs** con herramientas como Postman o Insomnia
5. **Implementar frontend** para consumir las APIs
6. **Configurar logs de auditoría** en producción
7. **Implementar monitoreo** y alertas del sistema
8. **Optimizar consultas** para mejor rendimiento
9. **Implementar caché** para consultas frecuentes
10. **Configurar backup** y recuperación de datos
