-- Script para insertar datos de prueba específicos para informes de ventas
-- Este archivo contiene datos de ejemplo para probar los informes de ventas

-- Insertar sucursales adicionales si no existen
INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa)
VALUES 
    (1, 'Sucursal Central', 'Av. Central 123, San José', '2222-0000', 'central@taller.com', 1, 1),
    (2, 'Sucursal Cartago', 'Calle Real 456, Cartago', '2550-0000', 'cartago@taller.com', 1, 1),
    (3, 'Sucursal Alajuela', 'Av. 2 789, Alajuela', '2440-0000', 'alajuela@taller.com', 1, 1)
ON CONFLICT (sucursal_id) DO NOTHING;

-- Insertar cajas para las sucursales
INSERT INTO cajas (caja_id, sucursal_id, nro_caja, activo)
VALUES 
    (1, 1, 'C001', true),
    (2, 1, 'C002', true),
    (3, 2, 'C003', true),
    (4, 3, 'C004', true)
ON CONFLICT (caja_id) DO NOTHING;

-- Insertar formas de cobro
INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
VALUES 
    (1, 'Efectivo', true),
    (2, 'Tarjeta de Crédito', true),
    (3, 'Tarjeta de Débito', true),
    (4, 'Transferencia', true),
    (5, 'Cheque', true)
ON CONFLICT (forma_cobro_id) DO NOTHING;

-- Insertar tipos de documento
INSERT INTO tipo_documento (tipo_doc_id, descripcion)
VALUES 
    (1, 'Factura'),
    (2, 'Boleta'),
    (3, 'Nota de Crédito'),
    (4, 'Nota de Débito')
ON CONFLICT (tipo_doc_id) DO NOTHING;

-- Insertar ventas de prueba para diferentes períodos
-- Ventas del mes actual
INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
VALUES 
    -- Enero 2024
    (1, 1, '2024-01-15', 'cerrado', 'Factura', 150000, 1, 1, 1001, 1, 0, 142857.14, 0, 7142.86),
    (2, 2, '2024-01-20', 'cerrado', 'Factura', 250000, 1, 1, 1002, 2, 0, 238095.24, 0, 11904.76),
    (3, 3, '2024-01-25', 'cerrado', 'Factura', 180000, 2, 1, 1003, 1, 0, 171428.57, 0, 8571.43),
    (4, 4, '2024-01-30', 'abierto', 'Factura', 320000, 1, 1, 1004, 3, 0, 304761.90, 0, 15238.10),
    
    -- Febrero 2024
    (5, 5, '2024-02-05', 'cerrado', 'Factura', 200000, 3, 1, 1005, 1, 0, 190476.19, 0, 9523.81),
    (6, 1, '2024-02-10', 'cerrado', 'Factura', 280000, 2, 1, 1006, 2, 0, 266666.67, 0, 13333.33),
    (7, 6, '2024-02-15', 'cerrado', 'Factura', 350000, 1, 1, 1007, 1, 0, 333333.33, 0, 16666.67),
    (8, 7, '2024-02-20', 'cerrado', 'Factura', 120000, 3, 1, 1008, 3, 0, 114285.71, 0, 5714.29),
    (9, 8, '2024-02-25', 'cancelado', 'Factura', 400000, 2, 1, 1009, 2, 0, 380952.38, 0, 19047.62),
    
    -- Marzo 2024
    (10, 9, '2024-03-01', 'cerrado', 'Factura', 220000, 1, 1, 1010, 1, 0, 209523.81, 0, 10476.19),
    (11, 10, '2024-03-05', 'cerrado', 'Factura', 300000, 3, 1, 1011, 2, 0, 285714.29, 0, 14285.71),
    (12, 1, '2024-03-10', 'cerrado', 'Factura', 180000, 2, 1, 1012, 1, 0, 171428.57, 0, 8571.43),
    (13, 2, '2024-03-15', 'cerrado', 'Factura', 450000, 1, 1, 1013, 3, 0, 428571.43, 0, 21428.57),
    (14, 3, '2024-03-20', 'cerrado', 'Factura', 160000, 3, 1, 1014, 1, 0, 152380.95, 0, 7619.05),
    (15, 4, '2024-03-25', 'abierto', 'Factura', 380000, 2, 1, 1015, 2, 0, 361904.76, 0, 18095.24),
    
    -- Abril 2024
    (16, 5, '2024-04-01', 'cerrado', 'Factura', 290000, 1, 1, 1016, 1, 0, 276190.48, 0, 13809.52),
    (17, 6, '2024-04-05', 'cerrado', 'Factura', 210000, 3, 1, 1017, 2, 0, 200000, 0, 10000),
    (18, 7, '2024-04-10', 'cerrado', 'Factura', 340000, 2, 1, 1018, 1, 0, 323809.52, 0, 16190.48),
    (19, 8, '2024-04-15', 'cerrado', 'Factura', 190000, 1, 1, 1019, 3, 0, 180952.38, 0, 9047.62),
    (20, 9, '2024-04-20', 'cerrado', 'Factura', 260000, 3, 1, 1020, 1, 0, 247619.05, 0, 12380.95),
    
    -- Mayo 2024
    (21, 10, '2024-05-01', 'cerrado', 'Factura', 310000, 2, 1, 1021, 2, 0, 295238.10, 0, 14761.90),
    (22, 1, '2024-05-05', 'cerrado', 'Factura', 170000, 1, 1, 1022, 1, 0, 161904.76, 0, 8095.24),
    (23, 2, '2024-05-10', 'cerrado', 'Factura', 420000, 3, 1, 1023, 3, 0, 400000, 0, 20000),
    (24, 3, '2024-05-15', 'cerrado', 'Factura', 240000, 2, 1, 1024, 1, 0, 228571.43, 0, 11428.57),
    (25, 4, '2024-05-20', 'cerrado', 'Factura', 360000, 1, 1, 1025, 2, 0, 342857.14, 0, 17142.86),
    
    -- Junio 2024 (mes actual)
    (26, 5, '2024-06-01', 'cerrado', 'Factura', 280000, 3, 1, 1026, 1, 0, 266666.67, 0, 13333.33),
    (27, 6, '2024-06-05', 'cerrado', 'Factura', 200000, 2, 1, 1027, 2, 0, 190476.19, 0, 9523.81),
    (28, 7, '2024-06-10', 'cerrado', 'Factura', 330000, 1, 1, 1028, 1, 0, 314285.71, 0, 15714.29),
    (29, 8, '2024-06-15', 'abierto', 'Factura', 150000, 3, 1, 1029, 3, 0, 142857.14, 0, 7142.86),
    (30, 9, '2024-06-20', 'cerrado', 'Factura', 410000, 2, 1, 1030, 1, 0, 390476.19, 0, 19523.81)
ON CONFLICT (venta_id) DO NOTHING;

-- Insertar detalles de ventas
INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
VALUES 
    -- Detalles para ventas de enero
    (1, 1, 1, 1, 150000),
    (2, 2, 2, 1, 250000),
    (3, 3, 3, 2, 90000),
    (4, 4, 4, 1, 320000),
    
    -- Detalles para ventas de febrero
    (5, 5, 5, 1, 200000),
    (6, 6, 1, 1, 280000),
    (7, 7, 6, 1, 350000),
    (8, 8, 7, 1, 120000),
    (9, 9, 8, 1, 400000),
    
    -- Detalles para ventas de marzo
    (10, 10, 9, 1, 220000),
    (11, 11, 10, 1, 300000),
    (12, 12, 1, 1, 180000),
    (13, 13, 2, 1, 450000),
    (14, 14, 3, 1, 160000),
    (15, 15, 4, 1, 380000),
    
    -- Detalles para ventas de abril
    (16, 16, 5, 1, 290000),
    (17, 17, 6, 1, 210000),
    (18, 18, 7, 1, 340000),
    (19, 19, 8, 1, 190000),
    (20, 20, 9, 1, 260000),
    
    -- Detalles para ventas de mayo
    (21, 21, 10, 1, 310000),
    (22, 22, 1, 1, 170000),
    (23, 23, 2, 1, 420000),
    (24, 24, 3, 1, 240000),
    (25, 25, 4, 1, 360000),
    
    -- Detalles para ventas de junio
    (26, 26, 5, 1, 280000),
    (27, 27, 6, 1, 200000),
    (28, 28, 7, 1, 330000),
    (29, 29, 8, 1, 150000),
    (30, 30, 9, 1, 410000)
ON CONFLICT (detalle_venta_id) DO NOTHING;

-- Insertar cobros para las ventas cerradas
INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
VALUES 
    -- Cobros enero
    (1, 1, '2024-01-15', 150000, 1, 1, 'Pago completo'),
    (2, 2, '2024-01-20', 250000, 1, 1, 'Pago completo'),
    (3, 3, '2024-01-25', 180000, 1, 2, 'Pago completo'),
    
    -- Cobros febrero
    (4, 5, '2024-02-05', 200000, 1, 3, 'Pago completo'),
    (5, 6, '2024-02-10', 280000, 1, 2, 'Pago completo'),
    (6, 7, '2024-02-15', 350000, 1, 1, 'Pago completo'),
    (7, 8, '2024-02-20', 120000, 1, 3, 'Pago completo'),
    
    -- Cobros marzo
    (8, 10, '2024-03-01', 220000, 1, 1, 'Pago completo'),
    (9, 11, '2024-03-05', 300000, 1, 3, 'Pago completo'),
    (10, 12, '2024-03-10', 180000, 1, 2, 'Pago completo'),
    (11, 13, '2024-03-15', 450000, 1, 1, 'Pago completo'),
    (12, 14, '2024-03-20', 160000, 1, 3, 'Pago completo'),
    
    -- Cobros abril
    (13, 16, '2024-04-01', 290000, 1, 1, 'Pago completo'),
    (14, 17, '2024-04-05', 210000, 1, 3, 'Pago completo'),
    (15, 18, '2024-04-10', 340000, 1, 2, 'Pago completo'),
    (16, 19, '2024-04-15', 190000, 1, 1, 'Pago completo'),
    (17, 20, '2024-04-20', 260000, 1, 3, 'Pago completo'),
    
    -- Cobros mayo
    (18, 21, '2024-05-01', 310000, 1, 2, 'Pago completo'),
    (19, 22, '2024-05-05', 170000, 1, 1, 'Pago completo'),
    (20, 23, '2024-05-10', 420000, 1, 3, 'Pago completo'),
    (21, 24, '2024-05-15', 240000, 1, 2, 'Pago completo'),
    (22, 25, '2024-05-20', 360000, 1, 1, 'Pago completo'),
    
    -- Cobros junio
    (23, 26, '2024-06-01', 280000, 1, 3, 'Pago completo'),
    (24, 27, '2024-06-05', 200000, 1, 2, 'Pago completo'),
    (25, 28, '2024-06-10', 330000, 1, 1, 'Pago completo'),
    (26, 30, '2024-06-20', 410000, 1, 2, 'Pago completo')
ON CONFLICT (cobro_id) DO NOTHING;

-- Insertar notas de crédito
INSERT INTO nota_credito_cabecera (nota_credito_id, tipo_operacion, cliente_id, sucursal_id, almacen_id, usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id, monto_nc, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva)
VALUES 
    (1, 'venta', 1, 1, 1, 1, '2024-02-15', 'NC001', 'Devolución de producto', 'activo', 1, 150000, 0, 142857.14, 0, 7142.86),
    (2, 'venta', 3, 2, 1, 1, '2024-03-20', 'NC002', 'Producto defectuoso', 'activo', 3, 180000, 0, 171428.57, 0, 8571.43),
    (3, 'venta', 5, 3, 1, 1, '2024-04-10', 'NC003', 'Error en facturación', 'activo', 5, 200000, 0, 190476.19, 0, 9523.81),
    (4, 'venta', 7, 1, 1, 1, '2024-05-15', 'NC004', 'Devolución parcial', 'activo', 7, 120000, 0, 114285.71, 0, 5714.29),
    (5, 'venta', 9, 2, 1, 1, '2024-06-05', 'NC005', 'Garantía', 'activo', 9, 220000, 0, 209523.81, 0, 10476.19)
ON CONFLICT (nota_credito_id) DO NOTHING;

-- Insertar notas de débito
INSERT INTO nota_debito_cabecera (nota_debito_id, tipo_operacion, cliente_id, sucursal_id, almacen_id, usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id, monto_nd, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva)
VALUES 
    (1, 'venta', 2, 1, 1, 1, '2024-02-20', 'ND001', 'Servicios adicionales', 'activo', 2, 50000, 0, 47619.05, 0, 2380.95),
    (2, 'venta', 4, 2, 1, 1, '2024-03-25', 'ND002', 'Gastos de envío', 'activo', 4, 25000, 0, 23809.52, 0, 1190.48),
    (3, 'venta', 6, 3, 1, 1, '2024-04-15', 'ND003', 'Servicio técnico', 'activo', 6, 30000, 0, 28571.43, 0, 1428.57),
    (4, 'venta', 8, 1, 1, 1, '2024-05-20', 'ND004', 'Instalación', 'activo', 8, 40000, 0, 38095.24, 0, 1904.76),
    (5, 'venta', 10, 2, 1, 1, '2024-06-10', 'ND005', 'Mantenimiento', 'activo', 10, 35000, 0, 33333.33, 0, 1666.67)
ON CONFLICT (nota_debito_id) DO NOTHING;

-- Insertar detalles de notas de crédito
INSERT INTO nota_credito_detalle (nota_credito_detalle_id, nota_credito_id, producto_id, cantidad, precio_unitario)
VALUES 
    (1, 1, 1, 1, 150000),
    (2, 2, 3, 2, 90000),
    (3, 3, 5, 1, 200000),
    (4, 4, 7, 1, 120000),
    (5, 5, 9, 1, 220000)
ON CONFLICT (nota_credito_detalle_id) DO NOTHING;

-- Insertar detalles de notas de débito
INSERT INTO nota_debito_detalle (nota_debito_detalle_id, nota_debito_id, producto_id, cantidad, precio_unitario)
VALUES 
    (1, 1, 2, 1, 50000),
    (2, 2, 4, 1, 25000),
    (3, 3, 6, 1, 30000),
    (4, 4, 8, 1, 40000),
    (5, 5, 10, 1, 35000)
ON CONFLICT (nota_debito_detalle_id) DO NOTHING;

-- Actualizar secuencias para evitar conflictos
SELECT setval('ventas_venta_id_seq', (SELECT MAX(venta_id) FROM ventas));
SELECT setval('ventas_detalle_detalle_venta_id_seq', (SELECT MAX(detalle_venta_id) FROM ventas_detalle));
SELECT setval('cobros_cobro_id_seq', (SELECT MAX(cobro_id) FROM cobros));
SELECT setval('nota_credito_cabecera_nota_credito_id_seq', (SELECT MAX(nota_credito_id) FROM nota_credito_cabecera));
SELECT setval('nota_debito_cabecera_nota_debito_id_seq', (SELECT MAX(nota_debito_id) FROM nota_debito_cabecera));
SELECT setval('nota_credito_detalle_nota_credito_detalle_id_seq', (SELECT MAX(nota_credito_detalle_id) FROM nota_credito_detalle));
SELECT setval('nota_debito_detalle_nota_debito_detalle_id_seq', (SELECT MAX(nota_debito_detalle_id) FROM nota_debito_detalle));
