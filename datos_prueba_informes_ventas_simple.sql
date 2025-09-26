-- Script simplificado para insertar datos de prueba para informes de ventas
-- Sin usar ON CONFLICT para evitar problemas de restricciones

-- Insertar sucursales (solo si no existen)
INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa)
SELECT 1, 'Sucursal Central', 'Av. Central 123, San José', '2222-0000', 'central@taller.com', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE sucursal_id = 1);

INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa)
SELECT 2, 'Sucursal Cartago', 'Calle Real 456, Cartago', '2550-0000', 'cartago@taller.com', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE sucursal_id = 2);

INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa)
SELECT 3, 'Sucursal Alajuela', 'Av. 2 789, Alajuela', '2440-0000', 'alajuela@taller.com', 1, 1
WHERE NOT EXISTS (SELECT 1 FROM sucursales WHERE sucursal_id = 3);

-- Insertar cajas (solo si no existen)
INSERT INTO cajas (caja_id, sucursal_id, nro_caja, activo)
SELECT 1, 1, 'C001', true
WHERE NOT EXISTS (SELECT 1 FROM cajas WHERE caja_id = 1);

INSERT INTO cajas (caja_id, sucursal_id, nro_caja, activo)
SELECT 2, 1, 'C002', true
WHERE NOT EXISTS (SELECT 1 FROM cajas WHERE caja_id = 2);

INSERT INTO cajas (caja_id, sucursal_id, nro_caja, activo)
SELECT 3, 2, 'C003', true
WHERE NOT EXISTS (SELECT 1 FROM cajas WHERE caja_id = 3);

INSERT INTO cajas (caja_id, sucursal_id, nro_caja, activo)
SELECT 4, 3, 'C004', true
WHERE NOT EXISTS (SELECT 1 FROM cajas WHERE caja_id = 4);

-- Insertar formas de cobro (solo si no existen)
INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
SELECT 1, 'Efectivo', true
WHERE NOT EXISTS (SELECT 1 FROM formas_cobro WHERE forma_cobro_id = 1);

INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
SELECT 2, 'Tarjeta de Crédito', true
WHERE NOT EXISTS (SELECT 1 FROM formas_cobro WHERE forma_cobro_id = 2);

INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
SELECT 3, 'Tarjeta de Débito', true
WHERE NOT EXISTS (SELECT 1 FROM formas_cobro WHERE forma_cobro_id = 3);

INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
SELECT 4, 'Transferencia', true
WHERE NOT EXISTS (SELECT 1 FROM formas_cobro WHERE forma_cobro_id = 4);

INSERT INTO formas_cobro (forma_cobro_id, nombre, activo)
SELECT 5, 'Cheque', true
WHERE NOT EXISTS (SELECT 1 FROM formas_cobro WHERE forma_cobro_id = 5);

-- Insertar tipos de documento (solo si no existen)
INSERT INTO tipo_documento (tipo_doc_id, descripcion)
SELECT 1, 'Factura'
WHERE NOT EXISTS (SELECT 1 FROM tipo_documento WHERE tipo_doc_id = 1);

INSERT INTO tipo_documento (tipo_doc_id, descripcion)
SELECT 2, 'Boleta'
WHERE NOT EXISTS (SELECT 1 FROM tipo_documento WHERE tipo_doc_id = 2);

INSERT INTO tipo_documento (tipo_doc_id, descripcion)
SELECT 3, 'Nota de Crédito'
WHERE NOT EXISTS (SELECT 1 FROM tipo_documento WHERE tipo_doc_id = 3);

INSERT INTO tipo_documento (tipo_doc_id, descripcion)
SELECT 4, 'Nota de Débito'
WHERE NOT EXISTS (SELECT 1 FROM tipo_documento WHERE tipo_doc_id = 4);

-- Insertar ventas de prueba (solo si no existen)
INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 1, 1, '2024-01-15', 'cerrado', 'Factura', 150000, 1, 1, 1001, 1, 0, 142857.14, 0, 7142.86, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 1);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 2, 2, '2024-01-20', 'cerrado', 'Factura', 250000, 1, 1, 1002, 2, 0, 238095.24, 0, 11904.76, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 2);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 3, 3, '2024-02-05', 'cerrado', 'Factura', 180000, 2, 1, 1003, 1, 0, 171428.57, 0, 8571.43, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 3);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 4, 4, '2024-02-10', 'cerrado', 'Factura', 320000, 1, 1, 1004, 3, 0, 304761.90, 0, 15238.10, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 4);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 5, 5, '2024-03-01', 'cerrado', 'Factura', 200000, 3, 1, 1005, 1, 0, 190476.19, 0, 9523.81, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 5);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 6, 1, '2024-03-15', 'cerrado', 'Factura', 280000, 2, 1, 1006, 2, 0, 266666.67, 0, 13333.33, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 6);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 7, 2, '2024-04-01', 'cerrado', 'Factura', 350000, 1, 1, 1007, 1, 0, 333333.33, 0, 16666.67, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 7);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 8, 3, '2024-04-15', 'cerrado', 'Factura', 120000, 3, 1, 1008, 3, 0, 114285.71, 0, 5714.29, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 8);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 9, 4, '2024-05-01', 'cerrado', 'Factura', 220000, 2, 1, 1009, 1, 0, 209523.81, 0, 10476.19, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 9);

INSERT INTO ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago)
SELECT 10, 5, '2024-05-15', 'cerrado', 'Factura', 300000, 1, 1, 1010, 2, 0, 285714.29, 0, 14285.71, 'contado'
WHERE NOT EXISTS (SELECT 1 FROM ventas WHERE venta_id = 10);

-- Insertar detalles de ventas (solo si no existen)
INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 1, 1, 1, 1, 150000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 1);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 2, 2, 2, 1, 250000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 2);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 3, 3, 3, 2, 90000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 3);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 4, 4, 4, 1, 320000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 4);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 5, 5, 5, 1, 200000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 5);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 6, 6, 1, 1, 280000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 6);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 7, 7, 2, 1, 350000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 7);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 8, 8, 3, 1, 120000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 8);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 9, 9, 4, 1, 220000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 9);

INSERT INTO ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario)
SELECT 10, 10, 5, 1, 300000
WHERE NOT EXISTS (SELECT 1 FROM ventas_detalle WHERE detalle_venta_id = 10);

-- Insertar cobros (solo si no existen)
INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 1, 1, '2024-01-15', 150000, 1, 1, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 1);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 2, 2, '2024-01-20', 250000, 1, 1, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 2);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 3, 3, '2024-02-05', 180000, 1, 2, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 3);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 4, 4, '2024-02-10', 320000, 1, 1, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 4);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 5, 5, '2024-03-01', 200000, 1, 3, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 5);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 6, 6, '2024-03-15', 280000, 1, 2, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 6);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 7, 7, '2024-04-01', 350000, 1, 1, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 7);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 8, 8, '2024-04-15', 120000, 1, 3, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 8);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 9, 9, '2024-05-01', 220000, 1, 2, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 9);

INSERT INTO cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion)
SELECT 10, 10, '2024-05-15', 300000, 1, 1, 'Pago completo'
WHERE NOT EXISTS (SELECT 1 FROM cobros WHERE cobro_id = 10);

-- Actualizar secuencias
SELECT setval('ventas_venta_id_seq', (SELECT COALESCE(MAX(venta_id), 0) FROM ventas));
SELECT setval('ventas_detalle_detalle_venta_id_seq', (SELECT COALESCE(MAX(detalle_venta_id), 0) FROM ventas_detalle));
SELECT setval('cobros_cobro_id_seq', (SELECT COALESCE(MAX(cobro_id), 0) FROM cobros));
