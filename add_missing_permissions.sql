-- Script para agregar permisos faltantes
-- Ejecutar después de create_admin_user_v5.sql

-- Agregar permisos para productos
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 34, 'productos.crear', 'Crear productos', true, CURRENT_TIMESTAMP, 34
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 34);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 35, 'productos.leer', 'Ver productos', true, CURRENT_TIMESTAMP, 35
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 35);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 36, 'productos.actualizar', 'Actualizar productos', true, CURRENT_TIMESTAMP, 36
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 36);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 37, 'productos.eliminar', 'Eliminar productos', true, CURRENT_TIMESTAMP, 37
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 37);

-- Agregar permisos para proveedores
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 38, 'proveedores.crear', 'Crear proveedores', true, CURRENT_TIMESTAMP, 38
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 38);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 39, 'proveedores.leer', 'Ver proveedores', true, CURRENT_TIMESTAMP, 39
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 39);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 40, 'proveedores.actualizar', 'Actualizar proveedores', true, CURRENT_TIMESTAMP, 40
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 40);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 41, 'proveedores.eliminar', 'Eliminar proveedores', true, CURRENT_TIMESTAMP, 41
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 41);

-- Agregar permisos para clientes
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 42, 'clientes.crear', 'Crear clientes', true, CURRENT_TIMESTAMP, 42
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 42);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 43, 'clientes.leer', 'Ver clientes', true, CURRENT_TIMESTAMP, 43
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 43);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 44, 'clientes.actualizar', 'Actualizar clientes', true, CURRENT_TIMESTAMP, 44
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 44);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 45, 'clientes.eliminar', 'Eliminar clientes', true, CURRENT_TIMESTAMP, 45
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 45);

-- Asignar todos los nuevos permisos al rol de administrador
INSERT INTO public.rol_permisos (rol_id, permiso_id, created_at)
SELECT 1, permiso_id, CURRENT_TIMESTAMP
FROM public.permisos
WHERE permiso_id >= 34 AND permiso_id <= 45
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Verificar permisos agregados
SELECT 
    permiso_id,
    nombre,
    descripcion,
    activo
FROM public.permisos 
WHERE permiso_id >= 34 
ORDER BY permiso_id;
