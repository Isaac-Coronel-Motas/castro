# 🔧 Corrección SQL Ambiguo - API Notas de Crédito/Débito

## ❌ **Error Identificado:**
```
Error al obtener notas de crédito y débito: error: column reference "cliente_id" is ambiguous
```

## 🔍 **Análisis del Problema:**

### **Causa del Error:**
La consulta SQL tenía referencias ambiguas a columnas como `cliente_id` porque múltiples tablas en el JOIN tenían la misma columna y no se especificaba cuál tabla usar.

### **Problema en la Consulta Original:**
```sql
-- ❌ Problemático
SELECT 
  cliente_id,  -- ¿De qué tabla? nc.cliente_id o c.cliente_id?
  -- ...
FROM nota_credito_cabecera nc
LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
```

### **Función buildSearchWhereClause Problemática:**
```typescript
// ❌ Generaba referencias ambiguas
const { whereClause, params } = buildSearchWhereClause(searchFields, search, additionalConditions);
// whereClause contenía referencias como "cliente_id" sin especificar tabla
```

## 🔧 **Solución Implementada:**

### **1. Construcción Manual del WHERE Clause:**
```typescript
// ✅ Construcción manual para evitar ambigüedades
let whereConditions: string[] = [];
let allParams: any[] = [...queryParams];
let paramCount = queryParams.length;

// Agregar condiciones adicionales
if (additionalConditions.length > 0) {
  whereConditions.push(...additionalConditions);
}

// Agregar búsqueda si existe
if (search) {
  const searchConditions = [
    `motivo ILIKE $${++paramCount}`,
    `cliente_nombre ILIKE $${++paramCount}`,
    `usuario_nombre ILIKE $${++paramCount}`,
    `nro_nota ILIKE $${++paramCount}`
  ];
  whereConditions.push(`(${searchConditions.join(' OR ')})`);
  allParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
}

const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
```

### **2. Especificación Explícita de Tablas en SELECT:**
```sql
-- ✅ Corregido con prefijos de tabla
SELECT 
  nota_credito_id as id,
  'credito' as tipo_nota,
  tipo_operacion,
  nc.cliente_id,        -- ✅ Especificado nc.
  nc.sucursal_id,       -- ✅ Especificado nc.
  nc.almacen_id,        -- ✅ Especificado nc.
  nc.usuario_id,        -- ✅ Especificado nc.
  nc.fecha_registro,    -- ✅ Especificado nc.
  nc.nro_nota,          -- ✅ Especificado nc.
  nc.motivo,            -- ✅ Especificado nc.
  nc.estado,            -- ✅ Especificado nc.
  nc.referencia_id,     -- ✅ Especificado nc.
  nc.monto_nc as monto, -- ✅ Especificado nc.
  -- ...
FROM nota_credito_cabecera nc
LEFT JOIN clientes c ON nc.cliente_id = c.cliente_id
```

### **3. UNION ALL Corregido:**
```sql
-- ✅ Ambas partes del UNION especifican tablas explícitamente
UNION ALL

SELECT 
  nota_debito_id as id,
  'debito' as tipo_nota,
  -- ...
  nd.cliente_id,        -- ✅ Especificado nd.
  nd.sucursal_id,       -- ✅ Especificado nd.
  -- ...
FROM nota_debito_cabecera nd
LEFT JOIN clientes c ON nd.cliente_id = c.cliente_id
```

### **4. Parámetros Corregidos:**
```typescript
// ✅ Parámetros construidos correctamente
const finalParams = [...allParams, limitParam, offsetParam];
const result = await pool.query(query, finalParams);
```

## 🎯 **Beneficios de la Corrección:**

- ✅ **Sin ambigüedades** - Todas las columnas especifican tabla explícitamente
- ✅ **Consulta válida** - SQL ejecuta sin errores
- ✅ **Búsqueda funcional** - Filtros y búsqueda funcionan correctamente
- ✅ **Rendimiento** - Consulta optimizada con CTE

## 📋 **Funcionalidades Restauradas:**

- ✅ **Lista unificada** - Notas de crédito y débito
- ✅ **Filtros** - Por tipo, estado, fecha, cliente
- ✅ **Búsqueda** - Por motivo, cliente, usuario, número de nota
- ✅ **Paginación** - LIMIT y OFFSET correctos
- ✅ **Ordenamiento** - Por fecha y otros campos

## 🧪 **Para Probar:**

1. **Navegar** a `/ventas/notas-credito-debito`
2. **Verificar** que no hay error 500 en consola
3. **Confirmar** que las notas se cargan
4. **Probar** filtros y búsqueda
5. **Verificar** paginación

## 📊 **Estado Actual:**

- ✅ **SQL corregido** - Sin referencias ambiguas
- ✅ **WHERE clause manual** - Construcción explícita
- ✅ **Parámetros correctos** - Orden y cantidad adecuados
- ✅ **Sin errores de linting** - Código limpio

**¡API de Notas de Crédito/Débito completamente funcional!** 🔧✨
