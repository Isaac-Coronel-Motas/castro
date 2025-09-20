--
-- Script para crear usuario administrador - Versión v5 CORREGIDA
-- Optimizado para Neon Database
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
--

-- Usuario: admin
-- Contraseña: admin.2025
-- Hash generado con scrypt (compatible con la estructura existente)

-- Insertar rol de administrador si no existe
-- Verificar primero si ya existe un rol administrador
INSERT INTO public.roles (rol_id, nombre, descripcion, activo, created_at, id)
SELECT 1, 'Administrador', 'Rol con todos los permisos del sistema', true, CURRENT_TIMESTAMP, 1
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE rol_id = 1);

-- Insertar usuario administrador
INSERT INTO public.usuarios (
    usuario_id,
    nombre,
    email,
    password,
    fecha_creacion,
    rol_id,
    username,
    activo,
    created_at,
    created_by,
    updated_at,
    updated_by,
    is_deleted,
    failed_attempts,
    locked_until,
    last_login_attempt,
    password_changed_at,
    totp_secret,
    is_2fa_enabled
) VALUES (
    1,
    'Administrador del Sistema',
    'admin@tallercastro.com',
    '$2b$12$GqgMAqo1r/DPVD7A/iiGXuA9bNbqsygIu1xkdvECc.yb88LuxcPP6', -- admin.2025
    CURRENT_TIMESTAMP,
    1,
    'admin',
    true,
    CURRENT_TIMESTAMP,
    1,
    CURRENT_TIMESTAMP,
    1,
    false,
    0,
    NULL,
    NULL,
    CURRENT_TIMESTAMP,
    NULL,
    false
) ON CONFLICT (usuario_id) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 1;

-- Insertar permisos básicos del sistema (solo si no existen)
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 1, 'usuarios.crear', 'Crear usuarios', true, CURRENT_TIMESTAMP, 1
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 1);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 2, 'usuarios.leer', 'Ver usuarios', true, CURRENT_TIMESTAMP, 2
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 2);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 3, 'usuarios.actualizar', 'Actualizar usuarios', true, CURRENT_TIMESTAMP, 3
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 3);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 4, 'usuarios.eliminar', 'Eliminar usuarios', true, CURRENT_TIMESTAMP, 4
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 4);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 5, 'roles.crear', 'Crear roles', true, CURRENT_TIMESTAMP, 5
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 5);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 6, 'roles.leer', 'Ver roles', true, CURRENT_TIMESTAMP, 6
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 6);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 7, 'roles.actualizar', 'Actualizar roles', true, CURRENT_TIMESTAMP, 7
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 7);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 8, 'roles.eliminar', 'Eliminar roles', true, CURRENT_TIMESTAMP, 8
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 8);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 9, 'permisos.crear', 'Crear permisos', true, CURRENT_TIMESTAMP, 9
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 9);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 10, 'permisos.leer', 'Ver permisos', true, CURRENT_TIMESTAMP, 10
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 10);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 11, 'permisos.actualizar', 'Actualizar permisos', true, CURRENT_TIMESTAMP, 11
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 11);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 12, 'permisos.eliminar', 'Eliminar permisos', true, CURRENT_TIMESTAMP, 12
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 12);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 13, 'dashboard.ver', 'Ver dashboard', true, CURRENT_TIMESTAMP, 13
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 13);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 14, 'ventas.crear', 'Crear ventas', true, CURRENT_TIMESTAMP, 14
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 14);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 15, 'ventas.leer', 'Ver ventas', true, CURRENT_TIMESTAMP, 15
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 15);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 16, 'ventas.actualizar', 'Actualizar ventas', true, CURRENT_TIMESTAMP, 16
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 16);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 17, 'ventas.eliminar', 'Eliminar ventas', true, CURRENT_TIMESTAMP, 17
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 17);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 18, 'compras.crear', 'Crear compras', true, CURRENT_TIMESTAMP, 18
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 18);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 19, 'compras.leer', 'Ver compras', true, CURRENT_TIMESTAMP, 19
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 19);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 20, 'compras.actualizar', 'Actualizar compras', true, CURRENT_TIMESTAMP, 20
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 20);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 21, 'compras.eliminar', 'Eliminar compras', true, CURRENT_TIMESTAMP, 21
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 21);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 22, 'servicios.crear', 'Crear servicios', true, CURRENT_TIMESTAMP, 22
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 22);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 23, 'servicios.leer', 'Ver servicios', true, CURRENT_TIMESTAMP, 23
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 23);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 24, 'servicios.actualizar', 'Actualizar servicios', true, CURRENT_TIMESTAMP, 24
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 24);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 25, 'servicios.eliminar', 'Eliminar servicios', true, CURRENT_TIMESTAMP, 25
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 25);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 26, 'referencias.crear', 'Crear referencias', true, CURRENT_TIMESTAMP, 26
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 26);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 27, 'referencias.leer', 'Ver referencias', true, CURRENT_TIMESTAMP, 27
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 27);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 28, 'referencias.actualizar', 'Actualizar referencias', true, CURRENT_TIMESTAMP, 28
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 28);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 29, 'referencias.eliminar', 'Eliminar referencias', true, CURRENT_TIMESTAMP, 29
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 29);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 30, 'reportes.ver', 'Ver reportes', true, CURRENT_TIMESTAMP, 30
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 30);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 31, 'configuracion.ver', 'Ver configuración', true, CURRENT_TIMESTAMP, 31
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 31);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 32, 'configuracion.actualizar', 'Actualizar configuración', true, CURRENT_TIMESTAMP, 32
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 32);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 33, 'auditoria.ver', 'Ver auditoría', true, CURRENT_TIMESTAMP, 33
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 33);

-- Asignar todos los permisos al rol de administrador
INSERT INTO public.rol_permisos (rol_id, permiso_id, created_at)
SELECT 1, permiso_id, CURRENT_TIMESTAMP
FROM public.permisos
WHERE activo = true
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Insertar ciudad principal si no existe (necesaria para sucursales)
INSERT INTO public.ciudades (id, nombre)
SELECT 1, 'Ciudad Principal'
WHERE NOT EXISTS (SELECT 1 FROM public.ciudades WHERE id = 1);

-- Insertar sucursal principal si no existe
-- Nota: id_empresa = 1 se usa como referencia por defecto (tabla empresas no existe)
INSERT INTO public.sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa)
SELECT 1, 'Sucursal Principal', 'Dirección Principal', '0000-0000', 'principal@tallercastro.com', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.sucursales WHERE sucursal_id = 1);

-- Asignar usuario administrador a la sucursal principal
INSERT INTO public.usuarios_sucursales (id, id_usuario, id_sucursal)
SELECT 1, 1, 1
WHERE NOT EXISTS (SELECT 1 FROM public.usuarios_sucursales WHERE id = 1);

-- Verificar que el usuario fue creado correctamente
SELECT 
    u.usuario_id,
    u.nombre,
    u.username,
    u.email,
    r.nombre as rol_nombre,
    u.activo,
    u.created_at
FROM public.usuarios u
LEFT JOIN public.roles r ON u.rol_id = r.rol_id
WHERE u.username = 'admin';

-- Verificar permisos asignados
SELECT 
    r.nombre as rol_nombre,
    p.nombre as permiso_nombre,
    p.descripcion
FROM public.roles r
INNER JOIN public.rol_permisos rp ON r.rol_id = rp.rol_id
INNER JOIN public.permisos p ON rp.permiso_id = p.permiso_id
WHERE r.rol_id = 1
ORDER BY p.nombre;

--
-- Script completado - Usuario administrador creado exitosamente
-- Credenciales: admin / admin.2025
-- CORREGIDO: Estructura de tablas verificada contra sys_taller_jc_v5.sql
--
