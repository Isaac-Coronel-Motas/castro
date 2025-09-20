# Archivos SQL v5 - Optimizados para Neon Database

## 📋 Archivos Creados

### 1. `sys_taller_jc_v5.sql` (319KB)
- **Descripción**: Base de datos completa del sistema de gestión de taller
- **Optimizaciones**: 
  - Eliminadas declaraciones OWNER (no compatibles con Neon)
  - Agregados índices adicionales para mejor rendimiento
  - Incluye datos iniciales esenciales
  - Estructura optimizada para PostgreSQL en la nube

### 2. `create_admin_user_v5.sql` (6.2KB)
- **Descripción**: Script para crear usuario administrador con permisos completos
- **Correcciones aplicadas**:
  - ✅ Estructura de tablas corregida según esquema real
  - ✅ Campos faltantes agregados (`password_changed_at`, `totp_secret`, `is_2fa_enabled`)
  - ✅ Referencias a tablas relacionadas corregidas
  - ✅ Datos de empresa y ciudad agregados para referencias FK
- **Credenciales**: `admin` / `admin.2025`

### 3. `create_configuracion_table_v5.sql` (7.9KB)
- **Descripción**: Tabla de configuración del sistema con datos iniciales
- **Optimizaciones**:
  - ✅ Índices adicionales para mejor rendimiento en Neon
  - ✅ Configuraciones más completas del sistema
  - ✅ Categorías organizadas (general, sistema, seguridad, etc.)
  - ✅ Validaciones y comentarios mejorados

## 🚀 Instrucciones de Despliegue en Neon

### Paso 1: Desplegar Base de Datos Principal
```sql
-- Ejecutar en Neon SQL Editor o psql
\i sys_taller_jc_v5.sql
```

### Paso 2: Crear Usuario Administrador
```sql
-- Ejecutar después del paso 1
\i create_admin_user_v5.sql
```

### Paso 3: Crear Tabla de Configuración
```sql
-- Ejecutar después del paso 1
\i create_configuracion_table_v5.sql
```

## 🔧 Verificaciones Post-Despliegue

### Verificar Usuario Administrador
```sql
SELECT 
    u.usuario_id,
    u.nombre,
    u.username,
    u.email,
    r.nombre as rol_nombre,
    u.activo
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.rol_id
WHERE u.username = 'admin';
```

### Verificar Configuraciones
```sql
SELECT 
    categoria,
    COUNT(*) as total_configuraciones,
    COUNT(CASE WHEN activo = true THEN 1 END) as configuraciones_activas
FROM configuracion 
GROUP BY categoria 
ORDER BY categoria;
```

### Verificar Permisos del Administrador
```sql
SELECT 
    r.nombre as rol_nombre,
    p.nombre as permiso_nombre,
    p.descripcion
FROM roles r
INNER JOIN rol_permisos rp ON r.rol_id = rp.rol_id
INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
WHERE r.rol_id = 1
ORDER BY p.nombre;
```

## 🔑 Credenciales de Acceso

- **Usuario**: `admin`
- **Contraseña**: `admin.2025`
- **Email**: `admin@tallercastro.com`
- **Rol**: Administrador (todos los permisos)

## 📊 Características Optimizadas para Neon

### Rendimiento
- Índices adicionales en tablas críticas
- Consultas optimizadas para PostgreSQL en la nube
- Estructura de datos eficiente

### Compatibilidad
- Sin declaraciones OWNER (no soportadas en Neon)
- Sintaxis PostgreSQL estándar
- Compatible con todas las funciones de Neon

### Seguridad
- Contraseñas hasheadas con scrypt
- Sistema de permisos granular
- Auditoría completa de acciones

## ⚠️ Notas Importantes

1. **Orden de Ejecución**: Ejecutar los archivos en el orden indicado
2. **Backup**: Hacer backup antes de ejecutar en producción
3. **Credenciales**: Cambiar la contraseña del administrador después del primer login
4. **Configuración**: Revisar y ajustar las configuraciones según necesidades específicas

## 🆘 Solución de Problemas

### Error de FK Constraints
Si hay errores de foreign key, verificar que:
- Las tablas `empresas` y `ciudades` existan
- Los IDs de referencia sean correctos

### Error de Permisos
Si hay problemas de permisos:
- Verificar que el usuario administrador se creó correctamente
- Revisar la tabla `rol_permisos`

### Error de Configuración
Si hay problemas con configuraciones:
- Verificar que la tabla `configuracion` se creó
- Revisar los valores por defecto

---

**Generado**: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")  
**Versión**: 5.0  
**Compatible con**: Neon Database, PostgreSQL 15+
