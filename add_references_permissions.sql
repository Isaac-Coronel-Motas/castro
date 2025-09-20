-- Script para agregar permisos faltantes de referencias
-- Estos permisos son necesarios para que las rutas API funcionen correctamente

-- Permisos para categorías
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 46, 'categorias.leer', 'Ver categorías', true, CURRENT_TIMESTAMP, 46
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 46);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 47, 'categorias.crear', 'Crear categorías', true, CURRENT_TIMESTAMP, 47
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 47);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 48, 'categorias.actualizar', 'Actualizar categorías', true, CURRENT_TIMESTAMP, 48
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 48);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 49, 'categorias.eliminar', 'Eliminar categorías', true, CURRENT_TIMESTAMP, 49
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 49);

-- Permisos para marcas
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 50, 'marcas.leer', 'Ver marcas', true, CURRENT_TIMESTAMP, 50
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 50);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 51, 'marcas.crear', 'Crear marcas', true, CURRENT_TIMESTAMP, 51
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 51);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 52, 'marcas.actualizar', 'Actualizar marcas', true, CURRENT_TIMESTAMP, 52
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 52);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 53, 'marcas.eliminar', 'Eliminar marcas', true, CURRENT_TIMESTAMP, 53
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 53);

-- Permisos para tipos de servicio
INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 54, 'tipos-servicio.leer', 'Ver tipos de servicio', true, CURRENT_TIMESTAMP, 54
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 54);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 55, 'tipos-servicio.crear', 'Crear tipos de servicio', true, CURRENT_TIMESTAMP, 55
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 55);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 56, 'tipos-servicio.actualizar', 'Actualizar tipos de servicio', true, CURRENT_TIMESTAMP, 56
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 56);

INSERT INTO public.permisos (permiso_id, nombre, descripcion, activo, created_at, id)
SELECT 57, 'tipos-servicio.eliminar', 'Eliminar tipos de servicio', true, CURRENT_TIMESTAMP, 57
WHERE NOT EXISTS (SELECT 1 FROM public.permisos WHERE permiso_id = 57);

-- Asignar todos los nuevos permisos al rol de Administrador (rol_id = 1)
INSERT INTO public.rol_permisos (rol_id, permiso_id, created_at)
SELECT 1, p.permiso_id, CURRENT_TIMESTAMP
FROM public.permisos p
WHERE p.permiso_id BETWEEN 46 AND 57
AND NOT EXISTS (SELECT 1 FROM public.rol_permisos rp WHERE rp.rol_id = 1 AND rp.permiso_id = p.permiso_id);
