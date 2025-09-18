-- Script para crear usuario administrador
-- Usuario: admin
-- Contraseña: admin.2025
-- Hash generado con bcrypt (12 rounds)

-- Insertar rol de administrador si no existe
INSERT INTO roles (rol_id, nombre, descripcion, activo, created_at, id)
VALUES (1, 'Administrador', 'Rol con todos los permisos del sistema', true, CURRENT_TIMESTAMP, 1)
ON CONFLICT (rol_id) DO NOTHING;

-- Insertar usuario administrador
INSERT INTO usuarios (
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
    false
) ON CONFLICT (usuario_id) DO UPDATE SET
    password = EXCLUDED.password,
    updated_at = CURRENT_TIMESTAMP,
    updated_by = 1;

-- Insertar permisos básicos del sistema
INSERT INTO permisos (permiso_id, nombre, descripcion, activo, created_at, id)
VALUES 
    (1, 'usuarios.crear', 'Crear usuarios', true, CURRENT_TIMESTAMP, 1),
    (2, 'usuarios.leer', 'Ver usuarios', true, CURRENT_TIMESTAMP, 2),
    (3, 'usuarios.actualizar', 'Actualizar usuarios', true, CURRENT_TIMESTAMP, 3),
    (4, 'usuarios.eliminar', 'Eliminar usuarios', true, CURRENT_TIMESTAMP, 4),
    (5, 'roles.crear', 'Crear roles', true, CURRENT_TIMESTAMP, 5),
    (6, 'roles.leer', 'Ver roles', true, CURRENT_TIMESTAMP, 6),
    (7, 'roles.actualizar', 'Actualizar roles', true, CURRENT_TIMESTAMP, 7),
    (8, 'roles.eliminar', 'Eliminar roles', true, CURRENT_TIMESTAMP, 8),
    (9, 'permisos.crear', 'Crear permisos', true, CURRENT_TIMESTAMP, 9),
    (10, 'permisos.leer', 'Ver permisos', true, CURRENT_TIMESTAMP, 10),
    (11, 'permisos.actualizar', 'Actualizar permisos', true, CURRENT_TIMESTAMP, 11),
    (12, 'permisos.eliminar', 'Eliminar permisos', true, CURRENT_TIMESTAMP, 12),
    (13, 'dashboard.ver', 'Ver dashboard', true, CURRENT_TIMESTAMP, 13),
    (14, 'ventas.crear', 'Crear ventas', true, CURRENT_TIMESTAMP, 14),
    (15, 'ventas.leer', 'Ver ventas', true, CURRENT_TIMESTAMP, 15),
    (16, 'ventas.actualizar', 'Actualizar ventas', true, CURRENT_TIMESTAMP, 16),
    (17, 'ventas.eliminar', 'Eliminar ventas', true, CURRENT_TIMESTAMP, 17),
    (18, 'compras.crear', 'Crear compras', true, CURRENT_TIMESTAMP, 18),
    (19, 'compras.leer', 'Ver compras', true, CURRENT_TIMESTAMP, 19),
    (20, 'compras.actualizar', 'Actualizar compras', true, CURRENT_TIMESTAMP, 20),
    (21, 'compras.eliminar', 'Eliminar compras', true, CURRENT_TIMESTAMP, 21),
    (22, 'servicios.crear', 'Crear servicios', true, CURRENT_TIMESTAMP, 22),
    (23, 'servicios.leer', 'Ver servicios', true, CURRENT_TIMESTAMP, 23),
    (24, 'servicios.actualizar', 'Actualizar servicios', true, CURRENT_TIMESTAMP, 24),
    (25, 'servicios.eliminar', 'Eliminar servicios', true, CURRENT_TIMESTAMP, 25),
    (26, 'referencias.crear', 'Crear referencias', true, CURRENT_TIMESTAMP, 26),
    (27, 'referencias.leer', 'Ver referencias', true, CURRENT_TIMESTAMP, 27),
    (28, 'referencias.actualizar', 'Actualizar referencias', true, CURRENT_TIMESTAMP, 28),
    (29, 'referencias.eliminar', 'Eliminar referencias', true, CURRENT_TIMESTAMP, 29),
    (30, 'reportes.ver', 'Ver reportes', true, CURRENT_TIMESTAMP, 30),
    (31, 'configuracion.ver', 'Ver configuración', true, CURRENT_TIMESTAMP, 31),
    (32, 'configuracion.actualizar', 'Actualizar configuración', true, CURRENT_TIMESTAMP, 32),
    (33, 'auditoria.ver', 'Ver auditoría', true, CURRENT_TIMESTAMP, 33)
ON CONFLICT (permiso_id) DO NOTHING;

-- Asignar todos los permisos al rol de administrador
INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
SELECT 1, permiso_id, CURRENT_TIMESTAMP
FROM permisos
WHERE activo = true
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Insertar sucursal principal si no existe
INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, activo, created_at, id)
VALUES (1, 'Sucursal Principal', 'Dirección Principal', '0000-0000', 'principal@tallercastro.com', true, CURRENT_TIMESTAMP, 1)
ON CONFLICT (sucursal_id) DO NOTHING;

-- Asignar usuario administrador a la sucursal principal
INSERT INTO usuarios_sucursales (id, id_usuario, id_sucursal)
VALUES (1, 1, 1)
ON CONFLICT (id) DO NOTHING;

-- Verificar que el usuario fue creado correctamente
SELECT 
    u.usuario_id,
    u.nombre,
    u.username,
    u.email,
    r.nombre as rol_nombre,
    u.activo,
    u.created_at
FROM usuarios u
LEFT JOIN roles r ON u.rol_id = r.rol_id
WHERE u.username = 'admin';

-- Verificar permisos asignados
SELECT 
    r.nombre as rol_nombre,
    p.nombre as permiso_nombre,
    p.descripcion
FROM roles r
INNER JOIN rol_permisos rp ON r.rol_id = rp.rol_id
INNER JOIN permisos p ON rp.permiso_id = p.permiso_id
WHERE r.rol_id = 1
ORDER BY p.nombre;
