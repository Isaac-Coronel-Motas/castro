# 🔧 Corrección de Errores 403 - Autenticación y Autorización

## ❌ Problema Identificado

**Error**: `GET /api/roles?page=1&limit=10&sort_by=created_at&sort_order=desc 403`
**Error**: `GET /api/usuarios?page=1&limit=10&sort_by=created_at&sort_order=desc 403`

**Causa**: Inconsistencia entre los nombres de permisos en la base de datos y las rutas de la API.

## 🔍 Análisis Realizado

### Permisos en Base de Datos:
- ✅ `usuarios.leer`, `usuarios.crear`, `usuarios.actualizar`, `usuarios.eliminar`
- ✅ `roles.leer`, `roles.crear`, `roles.actualizar`, `roles.eliminar`
- ✅ `permisos.leer`, `permisos.crear`, `permisos.actualizar`, `permisos.eliminar`

### Permisos Solicitados en API:
- ❌ `leer_usuarios`, `crear_usuarios`, `actualizar_usuarios`, `eliminar_usuarios`
- ❌ `leer_roles`, `crear_roles`, `actualizar_roles`, `eliminar_roles`
- ❌ `leer_productos`, `crear_productos` (no existían en BD)

## ✅ Correcciones Aplicadas

### 1. **Rutas de API Corregidas**

#### `/api/usuarios/route.ts`:
```typescript
// Antes
requirePermission('leer_usuarios')(request)
requirePermission('crear_usuarios')(request)

// Después
requirePermission('usuarios.leer')(request)
requirePermission('usuarios.crear')(request)
```

#### `/api/roles/route.ts`:
```typescript
// Antes
requirePermission('leer_roles')(request)
requirePermission('crear_roles')(request)

// Después
requirePermission('roles.leer')(request)
requirePermission('roles.crear')(request)
```

#### `/api/roles/[id]/route.ts`:
```typescript
// Antes
requirePermission('actualizar_roles')(request)
requirePermission('eliminar_roles')(request)

// Después
requirePermission('roles.actualizar')(request)
requirePermission('roles.eliminar')(request)
```

### 2. **Permisos Faltantes Agregados**

Creado script `add_missing_permissions.sql` con permisos para:

- **Productos**: `productos.crear`, `productos.leer`, `productos.actualizar`, `productos.eliminar`
- **Proveedores**: `proveedores.crear`, `proveedores.leer`, `proveedores.actualizar`, `proveedores.eliminar`
- **Clientes**: `clientes.crear`, `clientes.leer`, `clientes.actualizar`, `clientes.eliminar`

### 3. **Rutas Adicionales Corregidas**

- ✅ `/api/productos/route.ts` - Corregido a `productos.leer` y `productos.crear`
- ✅ `/api/proveedores/route.ts` - Corregido a `proveedores.leer` y `proveedores.crear`

## 🚀 Pasos para Aplicar las Correcciones

### Paso 1: Ejecutar Script de Permisos Faltantes
```sql
-- Ejecutar en Neon SQL Editor
\i add_missing_permissions.sql
```

### Paso 2: Verificar Correcciones
```bash
# Verificar permisos en la base de datos
node scripts/check-permissions.js
```

### Paso 3: Probar la Aplicación
1. **Hacer login** con `admin` / `admin.2025`
2. **Navegar** al menú de usuarios
3. **Verificar** que no aparezcan errores 403

## 📊 Estado de los Permisos

### Permisos Existentes (33):
- ✅ Usuarios (4): crear, leer, actualizar, eliminar
- ✅ Roles (4): crear, leer, actualizar, eliminar
- ✅ Permisos (4): crear, leer, actualizar, eliminar
- ✅ Ventas (4): crear, leer, actualizar, eliminar
- ✅ Compras (4): crear, leer, actualizar, eliminar
- ✅ Servicios (4): crear, leer, actualizar, eliminar
- ✅ Referencias (4): crear, leer, actualizar, eliminar
- ✅ Sistema (5): dashboard, reportes, configuración, auditoría

### Permisos Agregados (12):
- ✅ Productos (4): crear, leer, actualizar, eliminar
- ✅ Proveedores (4): crear, leer, actualizar, eliminar
- ✅ Clientes (4): crear, leer, actualizar, eliminar

## 🔑 Usuario Administrador

- **Username**: `admin`
- **Password**: `admin.2025`
- **Rol**: Administrador (ID: 1)
- **Permisos**: Todos los permisos del sistema (45 permisos)

## 🧪 Verificación Post-Corrección

### Scripts de Verificación:
```bash
# Verificar permisos en BD
node scripts/check-permissions.js

# Verificar conexión
npm run test:neon
```

### Endpoints que Deberían Funcionar:
- ✅ `GET /api/usuarios` - Listar usuarios
- ✅ `GET /api/roles` - Listar roles
- ✅ `GET /api/productos` - Listar productos
- ✅ `GET /api/proveedores` - Listar proveedores

---

**Correcciones aplicadas**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Archivos modificados**: 6 rutas de API + 1 script SQL  
**Estado**: ✅ Listo para prueba
