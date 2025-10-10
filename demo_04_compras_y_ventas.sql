-- =====================================================
-- DEMO SISTEMA TALLER CASTRO - PARTE 4/5
-- Compras y Ventas
-- =====================================================

-- =====================================================
-- 1. PEDIDOS DE COMPRA
-- =====================================================
INSERT INTO pedido_proveedor (pedido_id, proveedor_id, fecha_pedido, estado, observaciones, usuario_id) VALUES
(1, 1, '2024-01-15', 'pendiente', 'Pedido urgente de repuestos motor', 6),
(2, 3, '2024-01-20', 'confirmado', 'Pedido de frenos y suspensión', 6),
(3, 4, '2024-02-01', 'recibido', 'Pedido de componentes eléctricos', 6),
(4, 5, '2024-02-10', 'pendiente', 'Pedido de aceites y lubricantes', 6);

-- Detalles de Pedidos de Compra
INSERT INTO detalle_pedido_compra (detalle_id, pedido_id, producto_id, cantidad, precio_unitario, observaciones) VALUES
-- Pedido 1 - Repuestos Motor
(1, 1, 1, 20, 6000, 'Filtros de aceite'),
(2, 1, 2, 50, 2500, 'Bujías de encendido'),
(3, 1, 3, 8, 32000, 'Correas de distribución'),

-- Pedido 2 - Frenos y Suspensión
(4, 2, 5, 15, 18000, 'Pastillas de freno'),
(5, 2, 6, 8, 25000, 'Discos de freno'),
(6, 2, 9, 6, 45000, 'Amortiguadores'),

-- Pedido 3 - Eléctrico
(7, 3, 13, 4, 60000, 'Alternadores'),
(8, 3, 14, 5, 55000, 'Motores de arranque'),
(9, 3, 15, 10, 32000, 'Baterías'),

-- Pedido 4 - Aceites
(10, 4, 20, 30, 12500, 'Aceite 5W-30'),
(11, 4, 21, 25, 11000, 'Aceite 10W-40'),
(12, 4, 22, 15, 15000, 'Aceite transmisión');

-- =====================================================
-- 2. PRESUPUESTOS PROVEEDOR
-- =====================================================
INSERT INTO presupuesto_proveedor (presupuesto_id, proveedor_id, fecha_presupuesto, estado, observaciones, usuario_id) VALUES
(1, 1, '2024-01-16', 'aprobado', 'Presupuesto para repuestos motor', 6),
(2, 3, '2024-01-21', 'pendiente', 'Presupuesto para frenos', 6),
(3, 4, '2024-02-02', 'aprobado', 'Presupuesto para eléctricos', 6);

-- =====================================================
-- 3. ÓRDENES DE COMPRA
-- =====================================================
INSERT INTO ordenes_compra (orden_id, proveedor_id, fecha_orden, estado, monto_oc, observaciones, usuario_id) VALUES
(1, 1, '2024-01-17', 'confirmada', 450000, 'Orden confirmada para repuestos', 6),
(2, 3, '2024-01-22', 'pendiente', 380000, 'Orden pendiente para frenos', 6),
(3, 4, '2024-02-03', 'confirmada', 520000, 'Orden confirmada para eléctricos', 6);

-- =====================================================
-- 4. REGISTRO DE COMPRAS
-- =====================================================
INSERT INTO compra_cabecera (compra_id, proveedor_id, fecha_compra, numero_factura, tipo_doc_id, monto_total, estado, usuario_id, caja_id) VALUES
(1, 1, '2024-01-25', 'FAC-001-2024', 1, 450000, 'confirmada', 6, 1),
(2, 3, '2024-02-05', 'FAC-002-2024', 1, 380000, 'confirmada', 6, 1),
(3, 4, '2024-02-15', 'FAC-003-2024', 1, 520000, 'confirmada', 6, 1);

-- =====================================================
-- 5. VENTAS
-- =====================================================
INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago) VALUES
(1, 1, '2024-01-10', 'cerrado', 'Factura', 125000, 1, 1, 1, 1, 0, 125000, 0, 12500, 'contado'),
(2, 2, '2024-01-12', 'cerrado', 'Factura', 85000, 1, 1, 2, 1, 0, 85000, 0, 8500, 'contado'),
(3, 3, '2024-01-15', 'cerrado', 'Factura', 150000, 2, 1, 3, 2, 0, 150000, 0, 15000, 'contado'),
(4, 4, '2024-01-18', 'cerrado', 'Factura', 95000, 1, 1, 4, 1, 0, 95000, 0, 9500, 'contado'),
(5, 5, '2024-01-20', 'cerrado', 'Factura', 200000, 3, 1, 5, 3, 0, 200000, 0, 20000, 'contado'),
(6, 6, '2024-01-22', 'cerrado', 'Factura', 75000, 1, 1, 6, 1, 0, 75000, 0, 7500, 'contado'),
(7, 7, '2024-01-25', 'cerrado', 'Factura', 180000, 2, 1, 7, 2, 0, 180000, 0, 18000, 'contado'),
(8, 8, '2024-01-28', 'cerrado', 'Factura', 110000, 1, 1, 8, 1, 0, 110000, 0, 11000, 'contado'),
(9, 1, '2024-02-01', 'cerrado', 'Factura', 160000, 3, 1, 9, 3, 0, 160000, 0, 16000, 'contado'),
(10, 2, '2024-02-05', 'cerrado', 'Factura', 90000, 1, 1, 10, 1, 0, 90000, 0, 9000, 'contado'),
(11, 3, '2024-02-08', 'cerrado', 'Factura', 130000, 2, 1, 11, 2, 0, 130000, 0, 13000, 'contado'),
(12, 4, '2024-02-12', 'cerrado', 'Factura', 105000, 1, 1, 12, 1, 0, 105000, 0, 10500, 'contado'),
(13, 5, '2024-02-15', 'abierto', 'Factura', 140000, 3, 1, 13, 3, 0, 140000, 0, 14000, 'contado');

-- Detalles de Ventas
INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario) VALUES
-- Venta 1
(1, 1, 1, 2, 8500),
(2, 1, 5, 1, 25000),
(3, 1, 20, 3, 18000),

-- Venta 2
(4, 2, 2, 4, 3500),
(5, 2, 17, 2, 12000),
(6, 2, 21, 2, 16000),

-- Venta 3
(7, 3, 9, 1, 65000),
(8, 3, 24, 2, 45000),
(9, 3, 20, 1, 18000),

-- Venta 4
(10, 4, 6, 1, 35000),
(11, 4, 7, 3, 8000),
(12, 4, 22, 2, 22000),

-- Venta 5
(13, 5, 13, 1, 85000),
(14, 5, 15, 1, 45000),
(15, 5, 16, 10, 500),

-- Venta 6
(16, 6, 3, 1, 45000),
(17, 6, 1, 1, 8500),
(18, 6, 21, 1, 16000),

-- Venta 7
(19, 7, 14, 1, 75000),
(20, 7, 25, 2, 55000),
(21, 7, 23, 1, 12000),

-- Venta 8
(22, 8, 10, 2, 25000),
(23, 8, 11, 1, 18000),
(24, 8, 20, 2, 18000),

-- Venta 9
(25, 9, 8, 1, 55000),
(26, 9, 26, 1, 65000),
(27, 9, 22, 2, 22000),

-- Venta 10
(28, 10, 4, 1, 12000),
(29, 10, 18, 2, 15000),
(30, 10, 21, 3, 16000),

-- Venta 11
(31, 11, 12, 2, 15000),
(32, 11, 24, 2, 45000),
(33, 11, 20, 1, 18000),

-- Venta 12
(34, 12, 19, 3, 8000),
(35, 12, 23, 2, 12000),
(36, 12, 21, 2, 16000),

-- Venta 13
(37, 13, 27, 1, 25000),
(38, 13, 28, 1, 15000),
(39, 13, 29, 2, 5000),
(40, 13, 30, 1, 8000);

-- =====================================================
-- 6. COBROS
-- =====================================================
INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion) VALUES
(1, 1, '2024-01-10', 125000, 2, 1, 'Cobro en efectivo'),
(2, 2, '2024-01-12', 85000, 2, 1, 'Cobro en efectivo'),
(3, 3, '2024-01-15', 150000, 3, 2, 'Cobro con tarjeta'),
(4, 4, '2024-01-18', 95000, 2, 1, 'Cobro en efectivo'),
(5, 5, '2024-01-20', 200000, 3, 3, 'Cobro con tarjeta'),
(6, 6, '2024-01-22', 75000, 2, 1, 'Cobro en efectivo'),
(7, 7, '2024-01-25', 180000, 3, 2, 'Cobro con tarjeta'),
(8, 8, '2024-01-28', 110000, 2, 1, 'Cobro en efectivo'),
(9, 9, '2024-02-01', 160000, 3, 3, 'Cobro con tarjeta'),
(10, 10, '2024-02-05', 90000, 2, 1, 'Cobro en efectivo'),
(11, 11, '2024-02-08', 130000, 3, 2, 'Cobro con tarjeta'),
(12, 12, '2024-02-12', 105000, 2, 1, 'Cobro en efectivo');

-- =====================================================
-- FIN DEL ARCHIVO 4/5
-- =====================================================
