-- Script para insertar datos de prueba en el sistema
-- Este archivo contiene datos de ejemplo para todas las tablas principales

-- Insertar categorías de productos
INSERT INTO categorias (categoria_id, nombre, descripcion, activo, created_at, id)
VALUES 
    (1, 'Pantallas', 'Pantallas LCD, OLED y componentes de visualización', true, CURRENT_TIMESTAMP, 1),
    (2, 'Baterías', 'Baterías para dispositivos móviles y laptops', true, CURRENT_TIMESTAMP, 2),
    (3, 'Accesorios', 'Cables, cargadores y accesorios diversos', true, CURRENT_TIMESTAMP, 3),
    (4, 'Componentes', 'Placas madre, procesadores y componentes internos', true, CURRENT_TIMESTAMP, 4),
    (5, 'Periféricos', 'Teclados, mouse y dispositivos de entrada', true, CURRENT_TIMESTAMP, 5),
    (6, 'Memoria', 'Memorias RAM, almacenamiento y tarjetas SD', true, CURRENT_TIMESTAMP, 6),
    (7, 'Audio', 'Auriculares, altavoces y componentes de audio', true, CURRENT_TIMESTAMP, 7),
    (8, 'Carcasas', 'Fundas y protectores para dispositivos móviles', true, CURRENT_TIMESTAMP, 8),
    (9, 'Cargadores', 'Cargadores y adaptadores de corriente', true, CURRENT_TIMESTAMP, 9),
    (10, 'Cables', 'Cables USB, HDMI y de conexión', true, CURRENT_TIMESTAMP, 10)
ON CONFLICT (categoria_id) DO NOTHING;

-- Insertar marcas
INSERT INTO marcas (marca_id, nombre, descripcion, activo, created_at, id)
VALUES 
    (1, 'Samsung', 'Electrónicos Samsung', true, CURRENT_TIMESTAMP, 1),
    (2, 'Apple', 'Productos Apple', true, CURRENT_TIMESTAMP, 2),
    (3, 'Huawei', 'Dispositivos Huawei', true, CURRENT_TIMESTAMP, 3),
    (4, 'Xiaomi', 'Productos Xiaomi', true, CURRENT_TIMESTAMP, 4),
    (5, 'LG', 'Electrónicos LG', true, CURRENT_TIMESTAMP, 5),
    (6, 'Sony', 'Productos Sony', true, CURRENT_TIMESTAMP, 6),
    (7, 'Motorola', 'Dispositivos Motorola', true, CURRENT_TIMESTAMP, 7),
    (8, 'OnePlus', 'Smartphones OnePlus', true, CURRENT_TIMESTAMP, 8),
    (9, 'Google', 'Productos Google Pixel', true, CURRENT_TIMESTAMP, 9),
    (10, 'Oppo', 'Dispositivos Oppo', true, CURRENT_TIMESTAMP, 10)
ON CONFLICT (marca_id) DO NOTHING;

-- Insertar tipos de servicio
INSERT INTO tipos_servicio (tipo_servicio_id, nombre, descripcion, precio_base, tiempo_estimado, activo, created_at, id)
VALUES 
    (1, 'Reparación de Pantalla', 'Cambio y reparación de pantallas', 50000, 60, true, CURRENT_TIMESTAMP, 1),
    (2, 'Cambio de Batería', 'Reemplazo de batería de dispositivos', 30000, 30, true, CURRENT_TIMESTAMP, 2),
    (3, 'Reparación de Placa', 'Reparación de placas madre', 80000, 120, true, CURRENT_TIMESTAMP, 3),
    (4, 'Actualización de Software', 'Instalación y actualización de sistemas', 15000, 45, true, CURRENT_TIMESTAMP, 4),
    (5, 'Recuperación de Datos', 'Recuperación de información perdida', 60000, 90, true, CURRENT_TIMESTAMP, 5),
    (6, 'Limpieza Interna', 'Limpieza y mantenimiento interno', 20000, 30, true, CURRENT_TIMESTAMP, 6),
    (7, 'Reparación de Audio', 'Reparación de problemas de sonido', 35000, 60, true, CURRENT_TIMESTAMP, 7),
    (8, 'Cambio de Carcasa', 'Reemplazo de carcasa externa', 25000, 45, true, CURRENT_TIMESTAMP, 8),
    (9, 'Reparación de Carga', 'Reparación de problemas de carga', 20000, 30, true, CURRENT_TIMESTAMP, 9),
    (10, 'Diagnóstico General', 'Diagnóstico completo del dispositivo', 10000, 20, true, CURRENT_TIMESTAMP, 10)
ON CONFLICT (tipo_servicio_id) DO NOTHING;

-- Insertar clientes
INSERT INTO clientes (cliente_id, nombre_cliente, apellido_cliente, email, telefono, direccion, ciudad, estado_cliente, created_at, id)
VALUES 
    (1, 'Juan', 'Pérez', 'juan.perez@email.com', '0981-123-456', 'Av. Mariscal López 123', 'Asunción', 'activo', CURRENT_TIMESTAMP, 1),
    (2, 'María', 'González', 'maria.gonzalez@email.com', '0982-234-567', 'Calle 25 de Mayo 456', 'Asunción', 'activo', CURRENT_TIMESTAMP, 2),
    (3, 'Carlos', 'Rodríguez', 'carlos.rodriguez@email.com', '0983-345-678', 'Av. España 789', 'Asunción', 'activo', CURRENT_TIMESTAMP, 3),
    (4, 'Ana', 'Martínez', 'ana.martinez@email.com', '0984-456-789', 'Calle Palma 321', 'Asunción', 'activo', CURRENT_TIMESTAMP, 4),
    (5, 'Luis', 'Fernández', 'luis.fernandez@email.com', '0985-567-890', 'Av. Brasilia 654', 'Asunción', 'activo', CURRENT_TIMESTAMP, 5),
    (6, 'Carmen', 'López', 'carmen.lopez@email.com', '0986-678-901', 'Calle Estrella 987', 'Asunción', 'activo', CURRENT_TIMESTAMP, 6),
    (7, 'Roberto', 'García', 'roberto.garcia@email.com', '0987-789-012', 'Av. Defensores del Chaco 147', 'Asunción', 'activo', CURRENT_TIMESTAMP, 7),
    (8, 'Patricia', 'Hernández', 'patricia.hernandez@email.com', '0988-890-123', 'Calle Yegros 258', 'Asunción', 'activo', CURRENT_TIMESTAMP, 8),
    (9, 'Miguel', 'Torres', 'miguel.torres@email.com', '0989-901-234', 'Av. Aregua 369', 'Asunción', 'activo', CURRENT_TIMESTAMP, 9),
    (10, 'Isabel', 'Morales', 'isabel.morales@email.com', '0990-012-345', 'Calle Montevideo 741', 'Asunción', 'activo', CURRENT_TIMESTAMP, 10)
ON CONFLICT (cliente_id) DO NOTHING;

-- Insertar proveedores
INSERT INTO proveedores (proveedor_id, nombre_proveedor, contacto, email, telefono, direccion, ciudad, activo, created_at, id)
VALUES 
    (1, 'Distribuidora Tech S.A.', 'Pedro Silva', 'pedro@techsa.com', '021-123-456', 'Av. Mcal. López 1000', 'Asunción', true, CURRENT_TIMESTAMP, 1),
    (2, 'Electrónicos del Paraguay', 'María López', 'maria@electronpar.com', '021-234-567', 'Calle 25 de Mayo 2000', 'Asunción', true, CURRENT_TIMESTAMP, 2),
    (3, 'Importaciones Digitales', 'Carlos Mendoza', 'carlos@impdigital.com', '021-345-678', 'Av. España 3000', 'Asunción', true, CURRENT_TIMESTAMP, 3),
    (4, 'Suministros Informáticos', 'Ana Ruiz', 'ana@suministros.com', '021-456-789', 'Calle Palma 4000', 'Asunción', true, CURRENT_TIMESTAMP, 4),
    (5, 'Comercial Electrónica', 'Luis Vargas', 'luis@comelec.com', '021-567-890', 'Av. Brasilia 5000', 'Asunción', true, CURRENT_TIMESTAMP, 5),
    (6, 'Distribuidora Central', 'Carmen Díaz', 'carmen@distcentral.com', '021-678-901', 'Calle Estrella 6000', 'Asunción', true, CURRENT_TIMESTAMP, 6),
    (7, 'Tecnología Avanzada', 'Roberto Castro', 'roberto@tecavanzada.com', '021-789-012', 'Av. Defensores 7000', 'Asunción', true, CURRENT_TIMESTAMP, 7),
    (8, 'Electro Suministros', 'Patricia Herrera', 'patricia@electrosum.com', '021-890-123', 'Calle Yegros 8000', 'Asunción', true, CURRENT_TIMESTAMP, 8),
    (9, 'Importaciones Globales', 'Miguel Torres', 'miguel@impglobal.com', '021-901-234', 'Av. Aregua 9000', 'Asunción', true, CURRENT_TIMESTAMP, 9),
    (10, 'Distribuidora Nacional', 'Isabel Morales', 'isabel@distnacional.com', '021-012-345', 'Calle Montevideo 10000', 'Asunción', true, CURRENT_TIMESTAMP, 10)
ON CONFLICT (proveedor_id) DO NOTHING;

-- Insertar productos
INSERT INTO productos (producto_id, nombre_producto, descripcion, categoria_id, marca_id, precio_compra, precio_venta, stock_minimo, stock_actual, activo, created_at, id)
VALUES 
    (1, 'Pantalla Samsung Galaxy S21', 'Pantalla LCD para Samsung Galaxy S21', 1, 1, 150000, 200000, 5, 10, true, CURRENT_TIMESTAMP, 1),
    (2, 'Batería iPhone 12', 'Batería original para iPhone 12', 2, 2, 80000, 120000, 3, 8, true, CURRENT_TIMESTAMP, 2),
    (3, 'Cable USB-C', 'Cable USB-C de carga rápida', 3, 1, 15000, 25000, 10, 20, true, CURRENT_TIMESTAMP, 3),
    (4, 'Placa Madre Huawei P40', 'Placa madre para Huawei P40', 4, 3, 200000, 280000, 2, 5, true, CURRENT_TIMESTAMP, 4),
    (5, 'Teclado Bluetooth', 'Teclado inalámbrico Bluetooth', 5, 6, 50000, 80000, 5, 12, true, CURRENT_TIMESTAMP, 5),
    (6, 'Memoria RAM 8GB', 'Memoria RAM DDR4 8GB', 6, 1, 60000, 90000, 8, 15, true, CURRENT_TIMESTAMP, 6),
    (7, 'Auriculares Inalámbricos', 'Auriculares Bluetooth con cancelación de ruido', 7, 2, 120000, 180000, 3, 7, true, CURRENT_TIMESTAMP, 7),
    (8, 'Carcasa iPhone 13', 'Carcasa protectora para iPhone 13', 8, 2, 25000, 40000, 10, 25, true, CURRENT_TIMESTAMP, 8),
    (9, 'Cargador Rápido', 'Cargador rápido 30W', 9, 1, 30000, 50000, 8, 18, true, CURRENT_TIMESTAMP, 9),
    (10, 'Cable HDMI', 'Cable HDMI 2.0 de alta velocidad', 10, 6, 20000, 35000, 5, 12, true, CURRENT_TIMESTAMP, 10)
ON CONFLICT (producto_id) DO NOTHING;

-- Insertar sucursales adicionales
INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, activo, created_at, id)
VALUES 
    (2, 'Sucursal Centro', 'Calle Palma 1234', '021-111-222', 'centro@tallercastro.com', true, CURRENT_TIMESTAMP, 2),
    (3, 'Sucursal Villa Morra', 'Av. Mariscal López 5678', '021-333-444', 'villamorra@tallercastro.com', true, CURRENT_TIMESTAMP, 3),
    (4, 'Sucursal Lambaré', 'Ruta 1 Mcal. Estigarribia 9012', '021-555-666', 'lambare@tallercastro.com', true, CURRENT_TIMESTAMP, 4)
ON CONFLICT (sucursal_id) DO NOTHING;

-- Insertar usuarios adicionales
INSERT INTO usuarios (
    usuario_id, nombre, email, password, fecha_creacion, rol_id, username, activo, 
    created_at, created_by, updated_at, updated_by, is_deleted, failed_attempts, 
    locked_until, last_login_attempt, password_changed_at, is_2fa_enabled
) VALUES 
    (2, 'María Rodríguez', 'maria@tallercastro.com', '$2b$12$GqgMAqo1r/DPVD7A/iiGXuA9bNbqsygIu1xkdvECc.yb88LuxcPP6', CURRENT_TIMESTAMP, 1, 'maria', true, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1, false, 0, NULL, NULL, CURRENT_TIMESTAMP, false),
    (3, 'Carlos Pérez', 'carlos@tallercastro.com', '$2b$12$GqgMAqo1r/DPVD7A/iiGXuA9bNbqsygIu1xkdvECc.yb88LuxcPP6', CURRENT_TIMESTAMP, 1, 'carlos', true, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1, false, 0, NULL, NULL, CURRENT_TIMESTAMP, false),
    (4, 'Ana García', 'ana@tallercastro.com', '$2b$12$GqgMAqo1r/DPVD7A/iiGXuA9bNbqsygIu1xkdvECc.yb88LuxcPP6', CURRENT_TIMESTAMP, 1, 'ana', true, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1, false, 0, NULL, NULL, CURRENT_TIMESTAMP, false),
    (5, 'Luis Martínez', 'luis@tallercastro.com', '$2b$12$GqgMAqo1r/DPVD7A/iiGXuA9bNbqsygIu1xkdvECc.yb88LuxcPP6', CURRENT_TIMESTAMP, 1, 'luis', true, CURRENT_TIMESTAMP, 1, CURRENT_TIMESTAMP, 1, false, 0, NULL, NULL, CURRENT_TIMESTAMP, false)
ON CONFLICT (usuario_id) DO NOTHING;

-- Asignar usuarios a sucursales
INSERT INTO usuarios_sucursales (id, id_usuario, id_sucursal)
VALUES 
    (2, 2, 2),
    (3, 3, 3),
    (4, 4, 4),
    (5, 5, 1)
ON CONFLICT (id) DO NOTHING;

-- Insertar roles adicionales
INSERT INTO roles (rol_id, nombre, descripcion, activo, created_at, id)
VALUES 
    (2, 'Técnico', 'Rol para técnicos de reparación', true, CURRENT_TIMESTAMP, 2),
    (3, 'Vendedor', 'Rol para personal de ventas', true, CURRENT_TIMESTAMP, 3),
    (4, 'Operador', 'Rol para operadores del sistema', true, CURRENT_TIMESTAMP, 4)
ON CONFLICT (rol_id) DO NOTHING;

-- Asignar permisos a roles adicionales
INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
SELECT 2, permiso_id, CURRENT_TIMESTAMP FROM permisos WHERE permiso_id IN (13, 22, 23, 24, 25, 26, 27, 28, 29)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
SELECT 3, permiso_id, CURRENT_TIMESTAMP FROM permisos WHERE permiso_id IN (13, 14, 15, 16, 17, 26, 27, 28, 29, 30)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

INSERT INTO rol_permisos (rol_id, permiso_id, created_at)
SELECT 4, permiso_id, CURRENT_TIMESTAMP FROM permisos WHERE permiso_id IN (13, 26, 27, 30)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Verificar datos insertados
SELECT 'Categorías' as tabla, COUNT(*) as cantidad FROM categorias
UNION ALL
SELECT 'Marcas', COUNT(*) FROM marcas
UNION ALL
SELECT 'Tipos de Servicio', COUNT(*) FROM tipos_servicio
UNION ALL
SELECT 'Clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'Proveedores', COUNT(*) FROM proveedores
UNION ALL
SELECT 'Productos', COUNT(*) FROM productos
UNION ALL
SELECT 'Sucursales', COUNT(*) FROM sucursales
UNION ALL
SELECT 'Usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'Roles', COUNT(*) FROM roles;

-- Insertar tipos de servicio adicionales
INSERT INTO tipo_servicio (tipo_serv_id, descripcion, nombre, activo)
VALUES 
    (1, 'Servicios de reparación de equipos', 'Reparación', true),
    (2, 'Servicios de instalación de equipos', 'Instalación', true),
    (3, 'Servicios de mantenimiento preventivo', 'Mantenimiento', true),
    (4, 'Servicios de diagnóstico técnico', 'Diagnóstico', true),
    (5, 'Otros servicios técnicos', 'Otros', true)
ON CONFLICT (tipo_serv_id) DO NOTHING;

-- Insertar servicios de prueba
INSERT INTO servicios (servicio_id, nombre, descripcion, precio_base, tipo_serv_id)
VALUES 
    (1, 'Reparación de Compresor', 'Reparación completa de compresores de aire acondicionado', 150000, 1),
    (2, 'Instalación de Split', 'Instalación de equipos split residenciales', 200000, 2),
    (3, 'Mantenimiento Preventivo', 'Mantenimiento preventivo de equipos de aire acondicionado', 80000, 3),
    (4, 'Diagnóstico Técnico', 'Diagnóstico completo de fallas en equipos', 50000, 4),
    (5, 'Recarga de Gas', 'Recarga de gas refrigerante en equipos', 120000, 1),
    (6, 'Limpieza de Ductos', 'Limpieza y desinfección de ductos de aire', 100000, 3),
    (7, 'Reparación de Motor', 'Reparación de motores de ventiladores', 90000, 1),
    (8, 'Instalación de Central', 'Instalación de equipos centrales comerciales', 500000, 2),
    (9, 'Mantenimiento Industrial', 'Mantenimiento de equipos industriales', 300000, 3),
    (10, 'Diagnóstico Electrónico', 'Diagnóstico de fallas electrónicas', 75000, 4)
ON CONFLICT (servicio_id) DO NOTHING;

-- Verificar servicios insertados
SELECT 'Servicios' as tabla, COUNT(*) as cantidad FROM servicios;
