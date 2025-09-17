# API de Módulos Adicionales de Compras - Documentación

Esta documentación describe las APIs para los módulos adicionales del sistema de compras: Registro de Compras, Ajustes de Inventario, Notas de Crédito/Débito, Transferencias e Informes.

## Módulos Incluidos

- **Registro de Compras** - Historial contable y control de facturas de proveedores
- **Ajustes de Inventario** - Control y seguimiento de movimientos de stock
- **Notas de Crédito/Débito** - Gestión de ajustes contables con proveedores
- **Transferencias** - Gestión de movimientos entre ubicaciones
- **Informes** - Análisis y reportes del módulo de compras

## Estructura de URLs

Todas las APIs siguen el patrón: `/api/compras/{modulo}`

---

## 📋 REGISTRO DE COMPRAS

### GET /api/compras/registro
Listar registro de compras con información de cuentas por pagar y vencimientos.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado de compra
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `proveedor_id` (opcional): Filtrar por proveedor
- `sucursal_id`, `almacen_id` (opcional): Filtros de ubicación
- `tipo_documento_id` (opcional): Filtrar por tipo de documento
- `estado_vencimiento` (opcional): Filtrar por estado de vencimiento (vigente/por_vencer/vencida)

**Response:**
```json
{
  "success": true,
  "message": "Registro de compras obtenido exitosamente",
  "data": [
    {
      "compra_id": 1,
      "proveedor_id": 1,
      "fecha_compra": "2024-01-15",
      "monto_compra": 3051000,
      "estado": "completada",
      "nro_factura": "FAC-2024-001",
      "timbrado": "12345678",
      "proveedor_nombre": "Distribuidora Tech SA",
      "total_items": 5,
      "monto_total_items": 3051000,
      "cuenta_pagar_id": 1,
      "fecha_vencimiento": "2024-02-14",
      "dias_vencimiento": 15,
      "estado_vencimiento": "vigente",
      "monto_gravada_5": 2700000,
      "monto_gravada_10": 0,
      "monto_exenta": 0,
      "monto_iva": 351000
    }
  ]
}
```

### POST /api/compras/registro
Crear un nuevo registro de compra con cuenta por pagar.

**Request Body:**
```json
{
  "proveedor_id": 1,
  "fecha_compra": "2024-01-15",
  "monto_compra": 3051000,
  "estado": "completada",
  "nro_factura": "FAC-2024-001",
  "timbrado": "12345678",
  "sucursal_id": 1,
  "tipo_doc_id": 1,
  "monto_gravada_5": 2700000,
  "monto_gravada_10": 0,
  "monto_exenta": 0,
  "monto_iva": 351000,
  "fecha_vencimiento": "2024-02-14",
  "items": [
    {
      "producto_id": 1,
      "cantidad": 10,
      "precio_unitario": 270000
    }
  ]
}
```

---

## 📦 AJUSTES DE INVENTARIO

### GET /api/compras/ajustes-inventario
Listar ajustes de inventario con información de movimientos y valores.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado (borrador/validado/anulado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `motivo_id` (opcional): Filtrar por motivo de ajuste
- `almacen_id` (opcional): Filtrar por almacén
- `usuario_id` (opcional): Filtrar por usuario
- `tipo_movimiento` (opcional): Filtrar por tipo (entrada/salida/correccion)

**Response:**
```json
{
  "success": true,
  "message": "Ajustes de inventario obtenidos exitosamente",
  "data": [
    {
      "ajuste_id": 1,
      "fecha": "2024-01-15T10:30:00Z",
      "usuario_id": 1,
      "motivo_id": 1,
      "almacen_id": 1,
      "estado": "validado",
      "usuario_nombre": "Juan Pérez",
      "motivo_descripcion": "Compra",
      "almacen_nombre": "Almacén Principal",
      "total_productos": 3,
      "valor_total": 2125000,
      "codigo_ajuste": "AJ-001"
    }
  ]
}
```

### POST /api/compras/ajustes-inventario
Crear un nuevo ajuste de inventario.

**Request Body:**
```json
{
  "usuario_id": 1,
  "motivo_id": 1,
  "almacen_id": 1,
  "estado": "borrador",
  "observaciones": "Ajuste por compra de componentes",
  "referencia": "OC-001",
  "items": [
    {
      "producto_id": 1,
      "cantidad_ajustada": 25,
      "comentario": "Entrada de pantallas Samsung"
    },
    {
      "producto_id": 2,
      "cantidad_ajustada": -3,
      "comentario": "Salida por venta"
    }
  ]
}
```

**Características Especiales:**
- **Validación de stock**: Verifica que el ajuste no resulte en stock negativo
- **Actualización automática**: Actualiza el stock de productos automáticamente
- **Log de movimientos**: Registra cada movimiento en el log de inventario
- **Código automático**: Genera códigos como AJ-001, AJ-002, etc.

---

## 💳 NOTAS DE CRÉDITO/DÉBITO

### GET /api/compras/notas-credito
Listar notas de crédito y débito.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `tipo_operacion` (opcional): Filtrar por tipo (credito/debito)
- `estado` (opcional): Filtrar por estado (activo/inactivo/anulado)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `proveedor_id`, `cliente_id` (opcional): Filtros de entidad
- `sucursal_id`, `almacen_id` (opcional): Filtros de ubicación

**Response:**
```json
{
  "success": true,
  "message": "Notas de crédito/débito obtenidas exitosamente",
  "data": [
    {
      "nota_credito_id": 1,
      "tipo_operacion": "credito",
      "proveedor_id": 1,
      "fecha_registro": "2024-01-15",
      "nro_nota": "NC-001",
      "motivo": "Devolución productos defectuosos",
      "estado": "activo",
      "monto_nc": 508500,
      "proveedor_nombre": "Distribuidora Tech SA",
      "total_items": 3,
      "monto_total_items": 508500,
      "tipo_operacion_display": "Crédito",
      "estado_display": "Aprobada"
    }
  ]
}
```

### POST /api/compras/notas-credito
Crear una nueva nota de crédito o débito.

**Request Body:**
```json
{
  "tipo_operacion": "credito",
  "proveedor_id": 1,
  "sucursal_id": 1,
  "almacen_id": 1,
  "usuario_id": 1,
  "fecha_registro": "2024-01-15",
  "motivo": "Devolución productos defectuosos",
  "estado": "activo",
  "referencia_id": 1,
  "monto_nc": 508500,
  "monto_gravada_5": 450000,
  "monto_gravada_10": 0,
  "monto_exenta": 0,
  "monto_iva": 58500,
  "referencia_factura": "FAC-2024-001",
  "items": [
    {
      "producto_id": 1,
      "cantidad": 3,
      "precio_unitario": 150000
    }
  ]
}
```

**Características Especiales:**
- **Tipos de operación**: Crédito (negativo) y Débito (positivo)
- **Validación de entidades**: Requiere proveedor O cliente, no ambos
- **Numeración automática**: NC-001, ND-001, etc.
- **Cálculo automático**: Calcula montos totales si no se proporcionan

---

## 🚚 TRANSFERENCIAS

### GET /api/compras/transferencias
Listar transferencias de stock entre almacenes.

**Query Parameters:**
- `page`, `limit`, `search`, `sort_by`, `sort_order` (paginación y ordenamiento)
- `estado` (opcional): Filtrar por estado (pendiente/en_transito/completada/cancelada)
- `fecha_desde`, `fecha_hasta` (opcional): Filtros de fecha
- `almacen_origen_id`, `almacen_destino_id` (opcional): Filtros de almacenes
- `usuario_id` (opcional): Filtrar por usuario responsable

**Response:**
```json
{
  "success": true,
  "message": "Transferencias de stock obtenidas exitosamente",
  "data": [
    {
      "transferencia_id": 1,
      "fecha": "2024-01-15",
      "usuario_id": 1,
      "almacen_origen_id": 1,
      "almacen_destino_id": 2,
      "estado": "en_transito",
      "motivo": "Componentes para reparación Samsung Galaxy",
      "usuario_nombre": "Carlos Méndez",
      "almacen_origen_nombre": "Almacén Principal",
      "almacen_destino_nombre": "Taller Reparaciones",
      "total_productos": 5,
      "valor_total": 450000,
      "codigo_transferencia": "TRF-001",
      "estado_display": "En Tránsito",
      "estado_accion": "En Tránsito"
    }
  ]
}
```

### POST /api/compras/transferencias
Crear una nueva transferencia de stock.

**Request Body:**
```json
{
  "usuario_id": 1,
  "almacen_origen_id": 1,
  "almacen_destino_id": 2,
  "estado": "pendiente",
  "motivo": "Componentes para reparación Samsung Galaxy",
  "responsable": "Carlos Méndez",
  "observaciones": "Transferencia urgente para reparación",
  "items": [
    {
      "producto_id": 1,
      "cantidad": 5,
      "observaciones": "Pantallas Samsung Galaxy A54"
    }
  ]
}
```

### PUT /api/compras/transferencias/[id]/completar
Completar una transferencia en tránsito.

**Características Especiales:**
- **Validación de stock**: Verifica stock disponible en almacén origen
- **Actualización automática**: Actualiza stock en ambos almacenes al completar
- **Estados controlados**: Pendiente → En Tránsito → Completada
- **Código automático**: TRF-001, TRF-002, etc.

---

## 📊 INFORMES

### GET /api/compras/informes
Obtener informe completo de compras con análisis y métricas.

**Query Parameters:**
- `fecha_desde` (opcional): Fecha desde para el análisis
- `fecha_hasta` (opcional): Fecha hasta para el análisis
- `sucursal_id` (opcional): Filtrar por sucursal
- `proveedor_id` (opcional): Filtrar por proveedor
- `categoria_id` (opcional): Filtrar por categoría
- `estado` (opcional): Filtrar por estado de compras
- `tipo_periodo` (opcional): Tipo de período (semana/mes/trimestre/año)

**Response:**
```json
{
  "success": true,
  "message": "Informe de compras obtenido exitosamente",
  "data": {
    "periodo": {
      "desde": "2024-01-01",
      "hasta": "2024-01-31"
    },
    "resumen": {
      "total_gastado": 17100000,
      "total_compras": 45,
      "promedio_compra": 380000,
      "proveedores_activos": 4,
      "utilizacion_presupuesto": 95.0,
      "ordenes_procesadas": 45
    },
    "gastos_vs_presupuesto": [
      {
        "mes": "Ene",
        "gasto_real": 2500000,
        "presupuesto": 3000000,
        "diferencia": -500000,
        "porcentaje_utilizacion": 83.33
      }
    ],
    "top_proveedores": [
      {
        "proveedor_id": 1,
        "proveedor_nombre": "Distribuidora Tech SA",
        "total_pedidos": 15,
        "monto_total": 1250000,
        "categoria_principal": "Componentes",
        "porcentaje": 35.0
      }
    ],
    "distribucion_categorias": [
      {
        "categoria": "Componentes",
        "porcentaje": 35.0,
        "monto_total": 1800000,
        "color": "#3B82F6"
      }
    ],
    "tendencias": {
      "gastos_mensuales": [
        {
          "mes": "Ene",
          "monto": 2500000,
          "tendencia": "up"
        }
      ],
      "compras_por_estado": [
        {
          "estado": "completada",
          "cantidad": 38,
          "porcentaje": 84.44
        }
      ]
    }
  }
}
```

**Métricas Incluidas:**
- **Resumen ejecutivo**: Total gastado, compras, promedio, proveedores activos
- **Gastos vs Presupuesto**: Comparación mensual con presupuesto asignado
- **Top Proveedores**: Ranking de proveedores por monto y cantidad
- **Distribución por Categorías**: Análisis de gastos por categoría de productos
- **Tendencias**: Análisis de tendencias mensuales y por estado

---

## Validaciones Específicas

### Registro de Compras
- **Proveedor**: Debe existir en la base de datos
- **Sucursal**: Debe existir y ser válida
- **Tipo de documento**: Debe existir en la tabla tipo_documento
- **Número de factura**: Formato válido (opcional)
- **Timbrado**: 8 dígitos numéricos (opcional)
- **Fechas**: Fecha de compra no puede ser futura
- **Vencimiento**: Debe ser posterior a fecha de comprobante
- **IVA**: Se calcula automáticamente si no se proporciona

### Ajustes de Inventario
- **Usuario**: Debe existir y estar activo
- **Motivo**: Debe existir en motivo_ajuste
- **Almacén**: Debe existir y ser válido
- **Stock**: Verifica que el ajuste no resulte en stock negativo
- **Cantidad**: No puede ser cero
- **Productos**: Deben existir y estar activos

### Notas de Crédito/Débito
- **Tipo de operación**: Debe ser 'credito' o 'debito'
- **Entidad**: Requiere proveedor O cliente, no ambos
- **Sucursal/Almacén**: Deben existir
- **Usuario**: Debe existir y estar activo
- **Referencia**: ID de referencia requerido
- **Fechas**: Fecha de registro no puede ser futura

### Transferencias
- **Almacenes**: Al menos uno debe ser especificado
- **Diferentes**: Origen y destino no pueden ser iguales
- **Stock**: Verifica disponibilidad en almacén origen
- **Productos**: Deben existir y estar activos
- **Cantidades**: Deben ser positivas

## Códigos de Error

- `400` - Bad Request: Datos de entrada inválidos
- `401` - Unauthorized: Token de acceso requerido o inválido
- `403` - Forbidden: No tiene permisos para realizar la acción
- `404` - Not Found: Recurso no encontrado
- `409` - Conflict: Conflicto con datos existentes o estado inválido
- `500` - Internal Server Error: Error interno del servidor

## Características Especiales

### Generación Automática de Códigos
- **Ajustes**: AJ-001, AJ-002, etc.
- **Notas**: NC-001, ND-001, etc.
- **Transferencias**: TRF-001, TRF-002, etc.
- **Facturas**: FAC-2024-001, FAC-2024-002, etc.

### Cálculos Automáticos
- **IVA Paraguayo**: 5% y 10% según montos gravados
- **Stock**: Actualización automática en ajustes y transferencias
- **Porcentajes**: Cálculo automático en informes
- **Tendencias**: Análisis automático de cambios

### Estados y Transiciones
- **Ajustes**: borrador → validado → anulado
- **Transferencias**: pendiente → en_transito → completada
- **Notas**: activo → inactivo → anulado
- **Compras**: pendiente → en_progreso → completada

### Logs de Auditoría
Todas las operaciones se registran con:
- Usuario que realizó la acción
- Timestamp de la operación
- Datos relevantes (sin información sensible)
- Tipo de operación

### Formateo de Datos
- **Monedas**: Formato paraguayo (PYG) y costarricense (CRC)
- **Fechas**: Formato ISO 8601
- **Porcentajes**: Redondeo a 2 decimales
- **Códigos**: Generación automática con prefijos

## Integración con Otros Módulos

- **Inventario**: Actualización automática de stock
- **Contabilidad**: Generación de asientos contables
- **Proveedores**: Validación y consulta de datos
- **Usuarios**: Control de permisos y auditoría
- **Almacenes**: Validación de ubicaciones
- **Productos**: Validación y actualización de datos

## Flujo de Trabajo Recomendado

1. **Registro de Compras** → Registrar facturas y crear cuentas por pagar
2. **Ajustes de Inventario** → Ajustar stock por compras, ventas o correcciones
3. **Notas de Crédito/Débito** → Manejar devoluciones y ajustes contables
4. **Transferencias** → Mover productos entre almacenes
5. **Informes** → Analizar rendimiento y tomar decisiones

## Próximos Pasos

Para implementar estas APIs:

1. **Configurar permisos** en la base de datos
2. **Crear tablas de motivos** para ajustes de inventario
3. **Configurar tipos de documento** para compras
4. **Probar endpoints** con datos de prueba
5. **Integrar con frontend** existente
6. **Configurar alertas** para vencimientos y stock bajo
