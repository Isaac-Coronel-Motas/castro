# API de Servicios Técnicos - Documentación

Esta documentación describe las APIs para el módulo de Servicios Técnicos del sistema de taller, incluyendo todos los submenús: Solicitudes de Cliente, Recepción de Equipos, Diagnósticos, Presupuestos, Órdenes de Servicio, Retiro de Equipos, Reclamos e Informes.

## Módulos Incluidos

- **Solicitudes de Cliente** - Gestión de solicitudes de servicio técnico
- **Recepción de Equipos** - Control de recepción y registro de equipos
- **Diagnósticos** - Análisis y diagnóstico técnico de equipos
- **Presupuestos** - Generación y gestión de presupuestos de servicios
- **Órdenes de Servicio** - Ejecución y seguimiento de servicios técnicos
- **Retiro de Equipos** - Gestión de entrega y retiro de equipos
- **Reclamos** - Manejo de reclamos y resolución de problemas
- **Informes** - Análisis y reportes del módulo de servicios

## Estructura de URLs

Todas las APIs siguen el patrón: `/api/servicios/{modulo}`

---

## 📋 SOLICITUDES DE CLIENTE

### GET /api/servicios/solicitudes
Listar solicitudes de servicio con información de clientes y técnicos asignados.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado_solicitud` (opcional): Filtrar por estado (Pendiente/Asignada/En proceso/Finalizada/Cancelada)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `cliente_id` (opcional): Filtrar por cliente
- `sucursal_id` (opcional): Filtrar por sucursal
- `tecnico_id` (opcional): Filtrar por técnico asignado
- `tipo_atencion` (opcional): Filtrar por tipo (Visita/Recepcion)
- `ciudad_id` (opcional): Filtrar por ciudad

**Response:**
```json
{
  "success": true,
  "message": "Solicitudes de servicio obtenidas exitosamente",
  "data": [
    {
      "solicitud_id": 1,
      "fecha_solicitud": "2024-01-15T10:30:00Z",
      "cliente_id": 1,
      "direccion": "Av. Principal 123",
      "sucursal_id": 1,
      "descripcion_problema": "Pantalla rota",
      "recepcionado_por": 1,
      "fecha_programada": "2024-01-16T09:00:00Z",
      "estado_solicitud": "Pendiente",
      "nro_solicitud": "SOL-0001-2024",
      "tipo_atencion": "Visita",
      "cliente_nombre": "Juan Pérez",
      "cliente_telefono": "0981234567",
      "cliente_email": "juan@email.com",
      "sucursal_nombre": "Sucursal Central",
      "ciudad_nombre": "Asunción",
      "recepcionado_por_nombre": "María González",
      "total_servicios": 2,
      "monto_total": 150000,
      "dias_restantes": 1,
      "estado_programacion": "por_vencer"
    }
  ]
}
```

### POST /api/servicios/solicitudes
Crear una nueva solicitud de servicio.

**Request Body:**
```json
{
  "cliente_id": 1,
  "direccion": "Av. Principal 123",
  "sucursal_id": 1,
  "descripcion_problema": "Pantalla rota",
  "recepcionado_por": 1,
  "fecha_programada": "2024-01-16T09:00:00Z",
  "estado_solicitud": "Pendiente",
  "observaciones": "Cliente solicita visita técnica",
  "ciudad_id": 1,
  "tipo_atencion": "Visita",
  "servicios": [
    {
      "servicio_id": 1,
      "cantidad": 1,
      "precio_unitario": 75000,
      "observaciones": "Reparación de pantalla"
    }
  ]
}
```

---

## 📦 RECEPCIÓN DE EQUIPOS

### GET /api/servicios/recepcion-equipos
Listar recepciones de equipos con información de equipos y clientes.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado_recepcion` (opcional): Filtrar por estado (En revisión/Cancelada/Recepcionada)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `sucursal_id` (opcional): Filtrar por sucursal
- `usuario_id` (opcional): Filtrar por usuario
- `cliente_id` (opcional): Filtrar por cliente

**Response:**
```json
{
  "success": true,
  "message": "Recepciones de equipos obtenidas exitosamente",
  "data": [
    {
      "recepcion_id": 1,
      "fecha_recepcion": "2024-01-15T14:30:00Z",
      "usuario_id": 1,
      "sucursal_id": 1,
      "estado_recepcion": "Recepcionada",
      "observaciones": "Equipo en buen estado",
      "nro_recepcion": "REC-0001-2024",
      "solicitud_id": 1,
      "usuario_nombre": "María González",
      "sucursal_nombre": "Sucursal Central",
      "cliente_nombre": "Juan Pérez",
      "total_equipos": 1,
      "estado_display": "Recepcionada",
      "estado_accion": "Procesar"
    }
  ]
}
```

### POST /api/servicios/recepcion-equipos
Crear una nueva recepción de equipos.

**Request Body:**
```json
{
  "usuario_id": 1,
  "sucursal_id": 1,
  "estado_recepcion": "En revisión",
  "observaciones": "Equipo en buen estado",
  "solicitud_id": 1,
  "equipos": [
    {
      "equipo_id": 1,
      "cantidad": 1,
      "observaciones": "Samsung Galaxy A54"
    }
  ]
}
```

### PUT /api/servicios/recepcion-equipos/[id]/procesar
Procesar una recepción en revisión.

**Características Especiales:**
- **Estados controlados**: En revisión → Recepcionada
- **Validación de equipos**: Verifica que los equipos existan
- **Numeración automática**: REC-0001-2024, REC-0002-2024, etc.
- **Vinculación con solicitudes**: Opcional vinculación con solicitudes existentes

---

## 🔧 DIAGNÓSTICOS

### GET /api/servicios/diagnosticos
Listar diagnósticos técnicos con información de técnicos y equipos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado_diagnostico` (opcional): Filtrar por estado (Pendiente/En proceso/Completado/Rechazado/Cancelado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `tecnico_id` (opcional): Filtrar por técnico
- `tipo_diag_id` (opcional): Filtrar por tipo de diagnóstico
- `recepcion_id` (opcional): Filtrar por recepción

**Response:**
```json
{
  "success": true,
  "message": "Diagnósticos obtenidos exitosamente",
  "data": [
    {
      "diagnostico_id": 1,
      "recepcion_id": 1,
      "fecha_diagnostico": "2024-01-15T16:00:00Z",
      "tecnico_id": 2,
      "observacion": "Pantalla LCD dañada, requiere reemplazo",
      "estado_diagnostico": "Completado",
      "tipo_diag_id": 1,
      "motivo": "Diagnóstico técnico completo",
      "tecnico_nombre": "Carlos Méndez",
      "tipo_diagnostico_nombre": "Diagnóstico Completo",
      "tipo_diagnostico_descripcion": "Análisis técnico detallado",
      "nro_recepcion": "REC-0001-2024",
      "cliente_nombre": "Juan Pérez",
      "total_equipos": 1,
      "estado_display": "Completado",
      "estado_accion": "Ver"
    }
  ]
}
```

### POST /api/servicios/diagnosticos
Crear un nuevo diagnóstico técnico.

**Request Body:**
```json
{
  "recepcion_id": 1,
  "tecnico_id": 2,
  "observacion": "Pantalla LCD dañada, requiere reemplazo",
  "estado_diagnostico": "Pendiente",
  "tipo_diag_id": 1,
  "motivo": "Diagnóstico técnico completo",
  "equipos": [
    {
      "equipo_id": 1,
      "observacion": "Pantalla rota en esquina superior derecha",
      "cantidad": 1
    }
  ]
}
```

### PUT /api/servicios/diagnosticos/[id]/completar
Completar un diagnóstico en proceso.

**Características Especiales:**
- **Estados controlados**: Pendiente → En proceso → Completado
- **Validación de técnicos**: Verifica que el técnico exista
- **Tipos de diagnóstico**: Validación de tipos activos
- **Numeración automática**: DIAG-0001-2024, DIAG-0002-2024, etc.

---

## 💰 PRESUPUESTOS DE SERVICIOS

### GET /api/servicios/presupuestos
Listar presupuestos de servicios con información de validez y montos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado (pendiente/aprobado/rechazado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `usuario_id` (opcional): Filtrar por usuario
- `sucursal_id` (opcional): Filtrar por sucursal
- `tipo_presu` (opcional): Filtrar por tipo (con_diagnostico/sin_diagnostico)
- `diagnostico_id` (opcional): Filtrar por diagnóstico

**Response:**
```json
{
  "success": true,
  "message": "Presupuestos de servicios obtenidos exitosamente",
  "data": [
    {
      "presu_serv_id": 1,
      "fecha_presupuesto": "2024-01-15",
      "estado": "aprobado",
      "monto_presu_ser": 300000,
      "observaciones": "Presupuesto para reparación completa",
      "usuario_id": 1,
      "sucursal_id": 1,
      "nro_presupuesto": "PS-0001-2024",
      "diagnostico_id": 1,
      "valido_desde": "2024-01-15",
      "valido_hasta": "2024-01-22",
      "tipo_presu": "con_diagnostico",
      "usuario_nombre": "María González",
      "sucursal_nombre": "Sucursal Central",
      "cliente_nombre": "Juan Pérez",
      "total_servicios": 2,
      "total_productos": 1,
      "monto_servicios": 200000,
      "monto_productos": 100000,
      "dias_validez": 5,
      "estado_vencimiento": "vigente",
      "estado_display": "Aprobado",
      "estado_accion": "Ver"
    }
  ]
}
```

### POST /api/servicios/presupuestos
Crear un nuevo presupuesto de servicios.

**Request Body:**
```json
{
  "fecha_presupuesto": "2024-01-15",
  "estado": "pendiente",
  "monto_presu_ser": 300000,
  "observaciones": "Presupuesto para reparación completa",
  "usuario_id": 1,
  "sucursal_id": 1,
  "diagnostico_id": 1,
  "valido_desde": "2024-01-15",
  "valido_hasta": "2024-01-22",
  "tipo_presu": "con_diagnostico",
  "servicios": [
    {
      "servicio_id": 1,
      "cantidad": 1,
      "precio_unitario": 150000
    },
    {
      "servicio_id": 2,
      "cantidad": 1,
      "precio_unitario": 50000
    }
  ],
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 1,
      "precio_unitario": 100000
    }
  ]
}
```

### PUT /api/servicios/presupuestos/[id]/aprobar
Aprobar un presupuesto pendiente.

**Características Especiales:**
- **Estados controlados**: pendiente → aprobado/rechazado
- **Cálculo automático**: Montos totales si no se proporcionan
- **Validez temporal**: Control de fechas de validez
- **Numeración automática**: PS-0001-2024, PS-0002-2024, etc.

---

## 🛠️ ÓRDENES DE SERVICIO

### GET /api/servicios/ordenes-servicio
Listar órdenes de servicio con información de progreso y técnicos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado (pendiente/en_proceso/completado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `tecnico_id` (opcional): Filtrar por técnico
- `usuario_id` (opcional): Filtrar por usuario
- `cliente_id` (opcional): Filtrar por cliente
- `sucursal_id` (opcional): Filtrar por sucursal

**Response:**
```json
{
  "success": true,
  "message": "Órdenes de servicio obtenidas exitosamente",
  "data": [
    {
      "orden_servicio_id": 1,
      "fecha_solicitud": "2024-01-15",
      "usuario_id": 1,
      "estado": "en_proceso",
      "monto_servicio": 300000,
      "observaciones": "Reparación en curso",
      "monto_final": 300000,
      "tecnico_id": 2,
      "presu_serv_id": 1,
      "forma_cobro_id": 1,
      "fecha_ejecucion": "2024-01-16",
      "impresa": false,
      "usuario_nombre": "María González",
      "tecnico_nombre": "Carlos Méndez",
      "cliente_nombre": "Juan Pérez",
      "nro_solicitud": "SOL-0001-2024",
      "nro_presupuesto": "PS-0001-2024",
      "forma_cobro_nombre": "Efectivo",
      "total_servicios": 2,
      "total_productos": 1,
      "monto_servicios": 200000,
      "monto_productos": 100000,
      "estado_display": "En Proceso",
      "estado_accion": "Completar",
      "progreso": 50,
      "dias_restantes": 1
    }
  ]
}
```

### POST /api/servicios/ordenes-servicio
Crear una nueva orden de servicio.

**Request Body:**
```json
{
  "fecha_solicitud": "2024-01-15",
  "usuario_id": 1,
  "estado": "pendiente",
  "monto_servicio": 300000,
  "observaciones": "Reparación completa",
  "monto_final": 300000,
  "tecnico_id": 2,
  "presu_serv_id": 1,
  "forma_cobro_id": 1,
  "fecha_ejecucion": "2024-01-16",
  "servicios": [
    {
      "servicio_id": 1,
      "cantidad": 1,
      "precio_unitario": 150000
    }
  ],
  "productos": [
    {
      "producto_id": 1,
      "cantidad": 1,
      "precio_unitario": 100000
    }
  ]
}
```

### PUT /api/servicios/ordenes-servicio/[id]/completar
Completar una orden de servicio en proceso.

**Características Especiales:**
- **Estados controlados**: pendiente → en_proceso → completado
- **Progreso automático**: Cálculo de progreso según estado
- **Validación de presupuestos**: Solo presupuestos aprobados
- **Numeración automática**: OS-0001-2024, OS-0002-2024, etc.

---

## 📤 RETIRO DE EQUIPOS

### GET /api/servicios/retiro-equipos
Listar retiros de equipos con información de entrega y clientes.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `entregado_por` (opcional): Filtrar por usuario que entrega
- `cliente_id` (opcional): Filtrar por cliente

**Response:**
```json
{
  "success": true,
  "message": "Retiros de equipos obtenidos exitosamente",
  "data": [
    {
      "salida_id": 1,
      "recepcion_id": 1,
      "fecha_salida": "2024-01-16T10:00:00Z",
      "entregado_por": 1,
      "retirado_por": "Juan Pérez",
      "documento_entrega": "DNI 1234567",
      "observaciones": "Equipo reparado y entregado",
      "entregado_por_nombre": "María González",
      "cliente_nombre": "Juan Pérez",
      "nro_recepcion": "REC-0001-2024",
      "nro_solicitud": "SOL-0001-2024",
      "total_equipos": 1
    }
  ]
}
```

### POST /api/servicios/retiro-equipos
Crear un nuevo retiro de equipos.

**Request Body:**
```json
{
  "recepcion_id": 1,
  "entregado_por": 1,
  "retirado_por": "Juan Pérez",
  "documento_entrega": "DNI 1234567",
  "observaciones": "Equipo reparado y entregado"
}
```

**Características Especiales:**
- **Validación de recepción**: Solo recepciones procesadas
- **Control de duplicados**: Una salida por recepción
- **Documentación**: Registro de documento de entrega
- **Trazabilidad**: Vinculación completa con recepción y solicitud

---

## 📞 RECLAMOS

### GET /api/servicios/reclamos
Listar reclamos con información de resolución y tiempos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado (pendiente/en_verificacion/resuelto/rechazado/anulado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `cliente_id` (opcional): Filtrar por cliente
- `recibido_por` (opcional): Filtrar por usuario que recibe
- `gestionado_por` (opcional): Filtrar por usuario que gestiona

**Response:**
```json
{
  "success": true,
  "message": "Reclamos obtenidos exitosamente",
  "data": [
    {
      "reclamo_id": 1,
      "cliente_id": 1,
      "orden_servicio_id": 1,
      "fecha_reclamo": "2024-01-16T15:30:00Z",
      "recibido_por": 1,
      "gestionado_por": 2,
      "descripcion": "El servicio no funcionó correctamente",
      "resolucion": "Se reprogramó el servicio",
      "fecha_resolucion": "2024-01-17T10:00:00Z",
      "observaciones": "Cliente satisfecho con la resolución",
      "estado": "resuelto",
      "cliente_nombre": "Juan Pérez",
      "cliente_telefono": "0981234567",
      "cliente_email": "juan@email.com",
      "recibido_por_nombre": "María González",
      "gestionado_por_nombre": "Carlos Méndez",
      "dias_resolucion": 1,
      "estado_display": "Resuelto",
      "estado_accion": "Ver"
    }
  ]
}
```

### POST /api/servicios/reclamos
Crear un nuevo reclamo.

**Request Body:**
```json
{
  "cliente_id": 1,
  "orden_servicio_id": 1,
  "recibido_por": 1,
  "gestionado_por": 2,
  "descripcion": "El servicio no funcionó correctamente",
  "resolucion": "Se reprogramó el servicio",
  "fecha_resolucion": "2024-01-17T10:00:00Z",
  "observaciones": "Cliente satisfecho con la resolución",
  "estado": "resuelto"
}
```

### PUT /api/servicios/reclamos/[id]/resolver
Resolver un reclamo pendiente o en verificación.

**Características Especiales:**
- **Estados controlados**: pendiente → en_verificacion → resuelto
- **Tiempo de resolución**: Cálculo automático de días
- **Numeración automática**: RECL-0001-2024, RECL-0002-2024, etc.
- **Seguimiento**: Vinculación con órdenes de servicio

---

## 📊 INFORMES

### GET /api/servicios/informes
Obtener informe completo de servicios técnicos con análisis y métricas.

**Query Parameters:**
- `fecha_desde` (opcional): Fecha desde para el análisis
- `fecha_hasta` (opcional): Fecha hasta para el análisis
- `sucursal_id` (opcional): Filtrar por sucursal
- `tecnico_id` (opcional): Filtrar por técnico
- `cliente_id` (opcional): Filtrar por cliente
- `estado` (opcional): Filtrar por estado
- `tipo_periodo` (opcional): Tipo de período (semana/mes/trimestre/año)

**Response:**
```json
{
  "success": true,
  "message": "Informe de servicios técnicos obtenido exitosamente",
  "data": {
    "periodo": {
      "desde": "2024-01-01",
      "hasta": "2024-01-31"
    },
    "resumen": {
      "total_solicitudes": 45,
      "total_recepciones": 42,
      "total_diagnosticos": 38,
      "total_presupuestos": 35,
      "total_ordenes": 32,
      "total_reclamos": 5,
      "monto_total_presupuestos": 4500000,
      "monto_total_ordenes": 4200000,
      "tiempo_promedio_resolucion": 2.5
    },
    "por_estado": [
      {
        "estado": "Pendiente",
        "cantidad": 8,
        "porcentaje": 17.78
      },
      {
        "estado": "Completado",
        "cantidad": 25,
        "porcentaje": 55.56
      }
    ],
    "por_tecnico": [
      {
        "tecnico_id": 2,
        "tecnico_nombre": "Carlos Méndez",
        "total_servicios": 15,
        "monto_total": 1800000,
        "porcentaje": 35.0
      }
    ],
    "por_sucursal": [
      {
        "sucursal_id": 1,
        "sucursal_nombre": "Sucursal Central",
        "total_servicios": 30,
        "monto_total": 3600000,
        "porcentaje": 66.67
      }
    ],
    "tendencias": {
      "solicitudes_mensuales": [
        {
          "mes": "Ene",
          "cantidad": 45,
          "tendencia": "up"
        }
      ],
      "monto_mensual": [
        {
          "mes": "Ene",
          "monto": 4500000,
          "tendencia": "up"
        }
      ]
    }
  }
}
```

**Métricas Incluidas:**
- **Resumen ejecutivo**: Totales por módulo y montos
- **Análisis por estado**: Distribución de estados en todos los módulos
- **Rendimiento por técnico**: Servicios y montos por técnico
- **Análisis por sucursal**: Distribución geográfica de servicios
- **Tendencias**: Análisis de tendencias mensuales

---

## Validaciones Específicas

### Solicitudes de Cliente
- **Cliente**: Debe existir en la base de datos
- **Sucursal**: Debe existir y ser válida
- **Usuario**: Debe existir y estar activo
- **Fecha programada**: No puede ser pasada
- **Dirección**: Campo requerido
- **Servicios**: Validación de servicios existentes

### Recepción de Equipos
- **Usuario**: Debe existir y estar activo
- **Sucursal**: Debe existir y ser válida
- **Equipos**: Deben existir y estar activos
- **Solicitud**: Opcional pero debe existir si se proporciona
- **Estados**: Control de transiciones de estado

### Diagnósticos
- **Técnico**: Debe existir y estar activo
- **Tipo de diagnóstico**: Debe existir y estar activo
- **Observación**: Campo requerido
- **Equipos**: Deben existir y estar activos
- **Recepción/Visita**: Validación de relación única

### Presupuestos de Servicios
- **Diagnóstico**: Debe existir si se proporciona
- **Usuario/Sucursal**: Validación de existencia
- **Servicios/Productos**: Validación de existencia
- **Fechas de validez**: Validación de rangos
- **Montos**: Cálculo automático si no se proporcionan

### Órdenes de Servicio
- **Presupuesto**: Debe estar aprobado si se proporciona
- **Técnico**: Debe existir si se proporciona
- **Forma de cobro**: Debe existir si se proporciona
- **Servicios/Productos**: Validación de existencia
- **Fechas**: Validación de fechas de ejecución

### Retiro de Equipos
- **Recepción**: Debe existir y estar procesada
- **Usuario**: Debe existir y estar activo
- **Control de duplicados**: Una salida por recepción
- **Documento de entrega**: Registro de identificación

### Reclamos
- **Cliente**: Debe existir en la base de datos
- **Usuario que recibe**: Debe existir y estar activo
- **Usuario que gestiona**: Debe existir si se proporciona
- **Orden de servicio**: Debe existir si se proporciona
- **Descripción**: Campo requerido

## Códigos de Error

- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token de acceso requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con datos existentes o estado inválido
- `500` - Internal Server Error: Error interno del servidor

## Características Especiales

### Generación Automática de Códigos
- **Solicitudes**: SOL-0001-2024, SOL-0002-2024, etc.
- **Recepciones**: REC-0001-2024, REC-0002-2024, etc.
- **Diagnósticos**: DIAG-0001-2024, DIAG-0002-2024, etc.
- **Presupuestos**: PS-0001-2024, PS-0002-2024, etc.
- **Órdenes**: OS-0001-2024, OS-0002-2024, etc.
- **Reclamos**: RECL-0001-2024, RECL-0002-2024, etc.

### Cálculos Automáticos
- **Montos**: Cálculo automático de totales
- **Progreso**: Cálculo automático de progreso de órdenes
- **Tiempos**: Cálculo de días de resolución y validez
- **Porcentajes**: Cálculo automático en informes

### Estados y Transiciones
- **Solicitudes**: Pendiente → Asignada → En proceso → Finalizada
- **Recepciones**: En revisión → Recepcionada
- **Diagnósticos**: Pendiente → En proceso → Completado
- **Presupuestos**: pendiente → aprobado/rechazado
- **Órdenes**: pendiente → en_proceso → completado
- **Reclamos**: pendiente → en_verificacion → resuelto

### Logs de Auditoría
Todas las operaciones se registran con:
- Usuario que realizó la acción
- Timestamp de la operación
- Datos relevantes (sin información sensible)
- Tipo de operación

### Formateo de Datos
- **Monedas**: Formato paraguayo (PYG)
- **Fechas**: Formato ISO 8601
- **Porcentajes**: Redondeo a 2 decimales
- **Códigos**: Generación automática con prefijos

## Integración con Otros Módulos

- **Clientes**: Validación y consulta de datos
- **Usuarios**: Control de permisos y auditoría
- **Sucursales**: Validación de ubicaciones
- **Equipos**: Validación y actualización de datos
- **Servicios**: Validación de servicios disponibles
- **Productos**: Validación de productos activos

## Flujo de Trabajo Recomendado

1. **Solicitud de Cliente** → Crear solicitud de servicio
2. **Recepción de Equipos** → Registrar equipos recibidos
3. **Diagnóstico** → Realizar análisis técnico
4. **Presupuesto** → Generar presupuesto de servicios
5. **Orden de Servicio** → Ejecutar servicios técnicos
6. **Retiro de Equipos** → Entregar equipos reparados
7. **Reclamos** → Manejar reclamos si es necesario
8. **Informes** → Analizar rendimiento y tomar decisiones

## Próximos Pasos

Para implementar estas APIs:

1. **Configurar permisos** en la base de datos
2. **Crear tipos de diagnóstico** para diagnósticos técnicos
3. **Configurar formas de cobro** para órdenes de servicio
4. **Probar endpoints** con datos de prueba
5. **Integrar con frontend** existente
6. **Configurar alertas** para vencimientos y estados críticos
