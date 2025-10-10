-- =====================================================
-- DEMO SISTEMA TALLER CASTRO - PARTE 2/5
-- Roles, Permisos y Usuarios
-- =====================================================

-- =====================================================
-- 1. ROLES
-- =====================================================
INSERT INTO roles (rol_id, nombre, descripcion, activo, created_at, id) VALUES
(1, 'Super Administrador', 'Acceso completo al sistema', true, NOW(), 1),
(2, 'Administrador', 'Administrador general del sistema', true, NOW(), 2),
(3, 'Vendedor', 'Personal de ventas', true, NOW(), 3),
(4, 'Comprador', 'Personal de compras', true, NOW(), 4),
(5, 'Técnico', 'Personal técnico de servicios', true, NOW(), 5),
(6, 'Cajero', 'Personal de caja', true, NOW(), 6);

-- =====================================================
-- 2. PERMISOS
-- =====================================================
INSERT INTO permisos (permiso_id, nombre, descripcion, activo, created_at, id) VALUES
-- Ventas
(1, 'ventas.crear', 'Crear ventas', true, NOW(), 1),
(2, 'ventas.leer', 'Ver ventas', true, NOW(), 2),
(3, 'ventas.actualizar', 'Actualizar ventas', true, NOW(), 3),
(4, 'ventas.eliminar', 'Eliminar ventas', true, NOW(), 4),

-- Compras
(5, 'compras.crear', 'Crear compras', true, NOW(), 5),
(6, 'compras.leer', 'Ver compras', true, NOW(), 6),
(7, 'compras.actualizar', 'Actualizar compras', true, NOW(), 7),
(8, 'compras.eliminar', 'Eliminar compras', true, NOW(), 8),

-- Servicios Técnicos
(9, 'servicios.crear', 'Crear servicios', true, NOW(), 9),
(10, 'servicios.leer', 'Ver servicios', true, NOW(), 10),
(11, 'servicios.actualizar', 'Actualizar servicios', true, NOW(), 11),
(12, 'servicios.eliminar', 'Eliminar servicios', true, NOW(), 12),

-- Referencias
(13, 'referencias.crear', 'Crear referencias', true, NOW(), 13),
(14, 'referencias.leer', 'Ver referencias', true, NOW(), 14),
(15, 'referencias.actualizar', 'Actualizar referencias', true, NOW(), 15),
(16, 'referencias.eliminar', 'Eliminar referencias', true, NOW(), 16),

-- Administración
(17, 'administracion.crear', 'Crear administración', true, NOW(), 17),
(18, 'administracion.leer', 'Ver administración', true, NOW(), 18),
(19, 'administracion.actualizar', 'Actualizar administración', true, NOW(), 19),
(20, 'administracion.eliminar', 'Eliminar administración', true, NOW(), 20),

-- Dashboard
(21, 'dashboard.ver', 'Ver dashboard', true, NOW(), 21),

-- Reportes
(22, 'reportes.ver', 'Ver reportes', true, NOW(), 22),

-- Configuración
(23, 'configuracion.ver', 'Ver configuración', true, NOW(), 23),
(24, 'configuracion.actualizar', 'Actualizar configuración', true, NOW(), 24),

-- Auditoría
(25, 'auditoria.ver', 'Ver auditoría', true, NOW(), 25);

-- =====================================================
-- 3. ASIGNACIÓN DE PERMISOS A ROLES
-- =====================================================

-- Super Administrador (todos los permisos)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(1, 1, NOW()), (1, 2, NOW()), (1, 3, NOW()), (1, 4, NOW()),
(1, 5, NOW()), (1, 6, NOW()), (1, 7, NOW()), (1, 8, NOW()),
(1, 9, NOW()), (1, 10, NOW()), (1, 11, NOW()), (1, 12, NOW()),
(1, 13, NOW()), (1, 14, NOW()), (1, 15, NOW()), (1, 16, NOW()),
(1, 17, NOW()), (1, 18, NOW()), (1, 19, NOW()), (1, 20, NOW()),
(1, 21, NOW()), (1, 22, NOW()), (1, 23, NOW()), (1, 24, NOW()),
(1, 25, NOW());

-- Administrador (todos los permisos excepto eliminación)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(2, 1, NOW()), (2, 2, NOW()), (2, 3, NOW()),
(2, 5, NOW()), (2, 6, NOW()), (2, 7, NOW()),
(2, 9, NOW()), (2, 10, NOW()), (2, 11, NOW()),
(2, 13, NOW()), (2, 14, NOW()), (2, 15, NOW()),
(2, 17, NOW()), (2, 18, NOW()), (2, 19, NOW()),
(2, 21, NOW()), (2, 22, NOW()), (2, 23, NOW()), (2, 24, NOW()),
(2, 25, NOW());

-- Vendedor (solo permisos de ventas y referencias)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(3, 1, NOW()), (3, 2, NOW()), (3, 3, NOW()),
(3, 13, NOW()), (3, 14, NOW()), (3, 15, NOW()),
(3, 21, NOW()), (3, 22, NOW());

-- Comprador (solo permisos de compras y referencias)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(4, 5, NOW()), (4, 6, NOW()), (4, 7, NOW()),
(4, 13, NOW()), (4, 14, NOW()), (4, 15, NOW()),
(4, 21, NOW()), (4, 22, NOW());

-- Técnico (solo permisos de servicios y referencias)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(5, 9, NOW()), (5, 10, NOW()), (5, 11, NOW()),
(5, 13, NOW()), (5, 14, NOW()), (5, 15, NOW()),
(5, 21, NOW()), (5, 22, NOW());

-- Cajero (solo permisos de ventas lectura y dashboard)
INSERT INTO rol_permisos (rol_id, permiso_id, created_at) VALUES
(6, 2, NOW()), (6, 21, NOW()), (6, 22, NOW());

-- =====================================================
-- 4. USUARIOS
-- =====================================================
-- Hash para 'admin.2025' usando bcrypt
INSERT INTO usuarios (usuario_id, nombre, email, password, username, rol_id, id_empleado, activo, created_at) VALUES
(1, 'Administrador del Sistema', 'admin@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 1, 1, true, NOW()),
(2, 'Juan Pérez', 'juan.perez@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'jperez', 3, 2, true, NOW()),
(3, 'María González', 'maria.gonzalez@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'mgonzalez', 3, 3, true, NOW()),
(4, 'Carlos Rodríguez', 'carlos.rodriguez@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'crodriguez', 5, 4, true, NOW()),
(5, 'Ana Martínez', 'ana.martinez@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'amartinez', 5, 5, true, NOW()),
(6, 'Luis Hernández', 'luis.hernandez@tallercastro.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'lhernandez', 4, 6, true, NOW());

-- =====================================================
-- FIN DEL ARCHIVO 2/5
-- =====================================================
