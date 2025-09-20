-- Script para agregar permisos faltantes de productos y proveedores
-- Estos permisos son necesarios para que las rutas API funcionen correctamente

-- Permisos para productos
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 58, 'productos.leer', 'Ver productos', true, CURRENT_TIMESTAMP, 58
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 58);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 59, 'productos.crear', 'Crear productos', true, CURRENT_TIMESTAMP, 59
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 59);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 60, 'productos.actualizar', 'Actualizar productos', true, CURRENT_TIMESTAMP, 60
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 60);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 61, 'productos.eliminar', 'Eliminar productos', true, CURRENT_TIMESTAMP, 61
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 61);

-- Permisos para proveedores
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 62, 'proveedores.leer', 'Ver proveedores', true, CURRENT_TIMESTAMP, 62
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 62);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 63, 'proveedores.crear', 'Crear proveedores', true, CURRENT_TIMESTAMP, 63
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 63);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 64, 'proveedores.actualizar', 'Actualizar proveedores', true, CURRENT_TIMESTAMP, 64
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 64);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 65, 'proveedores.eliminar', 'Eliminar proveedores', true, CURRENT_TIMESTAMP, 65
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 65);

-- Permisos para clientes
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 66, 'clientes.leer', 'Ver clientes', true, CURRENT_TIMESTAMP, 66
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 66);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 67, 'clientes.crear', 'Crear clientes', true, CURRENT_TIMESTAMP, 67
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 67);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 68, 'clientes.actualizar', 'Actualizar clientes', true, CURRENT_TIMESTAMP, 68
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 68);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 69, 'clientes.eliminar', 'Eliminar clientes', true, CURRENT_TIMESTAMP, 69
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 69);

-- Permisos para servicios
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 70, 'servicios.leer', 'Ver servicios', true, CURRENT_TIMESTAMP, 70
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 70);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 71, 'servicios.crear', 'Crear servicios', true, CURRENT_TIMESTAMP, 71
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 71);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 72, 'servicios.actualizar', 'Actualizar servicios', true, CURRENT_TIMESTAMP, 72
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 72);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 73, 'servicios.eliminar', 'Eliminar servicios', true, CURRENT_TIMESTAMP, 73
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 73);

-- Asignar todos los nuevos permisos al rol de Administrador (rol_id = 1)
INSERT INTO public.rol_permisos (rol_id, permiso_id, created_at)
SELECT 1, p.permiso_id, CURRENT_TIMESTAMP
FROM public.permisos p
WHERE p.permiso_id BETWEEN 58 AND 73
AND NOT EXISTS (SELECT 1 FROM public.rol_permisos rp WHERE rp.rol_id = 1 AND rp.permiso_id = p.permiso_id);
