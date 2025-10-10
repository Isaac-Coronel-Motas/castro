-- =====================================================
-- DEMO SISTEMA TALLER CASTRO - PARTE 3/5
-- Clientes, Proveedores y Productos
-- =====================================================

-- =====================================================
-- 1. CLIENTES
-- =====================================================
INSERT INTO clientes (cliente_id, nombre, direccion, ruc, telefono, email, estado, ciudad_id, usuario_id, lista_id) VALUES
(1, 'Isaac Castro', 'Av. Central 456, San José', '1-1234-5678', '8888-1111', 'isaac@email.com', 'activo', 1, 1, 1),
(2, 'María Rodríguez', 'Calle 10, Cartago', '1-2345-6789', '8888-2222', 'maria@email.com', 'activo', 2, 1, 1),
(3, 'Carlos López', 'Av. Segunda 789, San José', '1-3456-7890', '8888-3333', 'carlos@email.com', 'activo', 1, 1, 1),
(4, 'Ana García', 'Calle 15, Alajuela', '1-4567-8901', '8888-4444', 'ana@email.com', 'activo', 3, 1, 1),
(5, 'Luis Martínez', 'Av. Tercera 321, San José', '1-5678-9012', '8888-5555', 'luis@email.com', 'activo', 1, 1, 1),
(6, 'Patricia Herrera', 'Calle 20, Heredia', '1-6789-0123', '8888-6666', 'patricia@email.com', 'activo', 4, 1, 1),
(7, 'Roberto Silva', 'Av. Cuarta 654, San José', '1-7890-1234', '8888-7777', 'roberto@email.com', 'activo', 1, 1, 1),
(8, 'Carmen Vargas', 'Calle 25, Puntarenas', '1-8901-2345', '8888-8888', 'carmen@email.com', 'activo', 5, 1, 1);

-- =====================================================
-- 2. PROVEEDORES
-- =====================================================
INSERT INTO proveedores (proveedor_id, nombre, direccion, telefono, email, ruc, contacto, estado, ciudad_id, usuario_id) VALUES
(1, 'Repuestos Nacionales S.A.', 'Av. Industrial 123, San José', '2222-1111', 'ventas@repuestosnacionales.com', '3-101-111111', 'Juan Pérez', 'activo', 1, 1),
(2, 'Autopartes del Pacífico', 'Calle Comercial 456, Puntarenas', '2661-2222', 'info@autopartespacifico.com', '3-601-222222', 'María González', 'activo', 5, 1),
(3, 'Frenos y Suspensión Ltda.', 'Av. Técnica 789, Cartago', '2550-3333', 'ventas@frenosysuspension.com', '3-301-333333', 'Carlos Rodríguez', 'activo', 2, 1),
(4, 'Eléctricos Automotrices', 'Calle Eléctrica 321, San José', '2222-4444', 'contacto@electricosauto.com', '3-101-444444', 'Ana Martínez', 'activo', 1, 1),
(5, 'Aceites y Lubricantes', 'Av. Química 654, Alajuela', '2443-5555', 'ventas@aceiteslubricantes.com', '3-201-555555', 'Luis Hernández', 'activo', 3, 1),
(6, 'Neumáticos del Valle', 'Calle Caucho 987, Heredia', '2260-6666', 'info@neumaticosvalle.com', '3-401-666666', 'Patricia Herrera', 'activo', 4, 1);

-- =====================================================
-- 3. PRODUCTOS
-- =====================================================
INSERT INTO productos (producto_id, codigo_producto, descripcion_producto, precio_venta, precio_compra, stock_minimo, stock_actual, categoria_id, proveedor_id, activo, usuario_id) VALUES
-- Repuestos Motor
(1, 'REP001', 'Filtro de Aceite Motor', 8500, 6000, 10, 25, 1, 1, true, 1),
(2, 'REP002', 'Bujía de Encendido', 3500, 2500, 20, 50, 1, 1, true, 1),
(3, 'REP003', 'Correa de Distribución', 45000, 32000, 5, 12, 1, 1, true, 1),
(4, 'REP004', 'Termostato Motor', 12000, 8500, 8, 15, 1, 1, true, 1),

-- Frenos
(5, 'FRE001', 'Pastillas de Freno Delanteras', 25000, 18000, 6, 18, 2, 3, true, 1),
(6, 'FRE002', 'Discos de Freno', 35000, 25000, 4, 10, 2, 3, true, 1),
(7, 'FRE003', 'Líquido de Freno', 8000, 5500, 12, 30, 2, 3, true, 1),
(8, 'FRE004', 'Cilindro Maestro', 55000, 40000, 3, 8, 2, 3, true, 1),

-- Suspensión
(9, 'SUS001', 'Amortiguador Delantero', 65000, 45000, 4, 8, 3, 3, true, 1),
(10, 'SUS002', 'Resorte de Suspensión', 25000, 18000, 6, 12, 3, 3, true, 1),
(11, 'SUS003', 'Rótula de Dirección', 18000, 12500, 8, 20, 3, 3, true, 1),
(12, 'SUS004', 'Terminal de Dirección', 15000, 10000, 10, 25, 3, 3, true, 1),

-- Eléctrico
(13, 'ELE001', 'Alternador', 85000, 60000, 3, 6, 4, 4, true, 1),
(14, 'ELE002', 'Motor de Arranque', 75000, 55000, 3, 7, 4, 4, true, 1),
(15, 'ELE003', 'Batería 12V', 45000, 32000, 5, 12, 4, 4, true, 1),
(16, 'ELE004', 'Fusible 20A', 500, 300, 50, 100, 4, 4, true, 1),

-- Filtros
(17, 'FIL001', 'Filtro de Aire', 12000, 8500, 15, 35, 5, 1, true, 1),
(18, 'FIL002', 'Filtro de Combustible', 15000, 10000, 10, 25, 5, 1, true, 1),
(19, 'FIL003', 'Filtro de Cabina', 8000, 5500, 20, 40, 5, 1, true, 1),

-- Aceites
(20, 'ACE001', 'Aceite Motor 5W-30', 18000, 12500, 20, 50, 6, 5, true, 1),
(21, 'ACE002', 'Aceite Motor 10W-40', 16000, 11000, 25, 60, 6, 5, true, 1),
(22, 'ACE003', 'Aceite Transmisión', 22000, 15000, 10, 25, 6, 5, true, 1),
(23, 'ACE004', 'Líquido Refrigerante', 12000, 8000, 15, 35, 6, 5, true, 1),

-- Neumáticos
(24, 'NEU001', 'Neumático 185/65R15', 45000, 32000, 8, 20, 7, 6, true, 1),
(25, 'NEU002', 'Neumático 205/55R16', 55000, 40000, 6, 15, 7, 6, true, 1),
(26, 'NEU003', 'Neumático 225/45R17', 65000, 48000, 4, 10, 7, 6, true, 1),

-- Accesorios
(27, 'ACC001', 'Cubre Asientos', 25000, 18000, 10, 25, 8, 1, true, 1),
(28, 'ACC002', 'Alfombras', 15000, 10000, 15, 30, 8, 1, true, 1),
(29, 'ACC003', 'Porta Vasos', 5000, 3500, 20, 50, 8, 1, true, 1),
(30, 'ACC004', 'Cargador USB', 8000, 5500, 25, 60, 8, 1, true, 1);

-- =====================================================
-- FIN DEL ARCHIVO 3/5
-- =====================================================
