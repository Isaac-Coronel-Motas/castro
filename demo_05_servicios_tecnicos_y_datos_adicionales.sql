-- =====================================================
-- DEMO SISTEMA TALLER CASTRO - PARTE 5/5
-- Servicios Técnicos y Datos Adicionales
-- =====================================================

-- =====================================================
-- 1. EQUIPOS
-- =====================================================
INSERT INTO equipos (equipo_id, tipo_equipo_id, numero_serie, estado) VALUES
(1, 1, 'ABC123456789', 'activo'),
(2, 2, 'DEF987654321', 'activo'),
(3, 1, 'GHI147258369', 'activo'),
(4, 3, 'JKL369258147', 'activo'),
(5, 2, 'MNO741852963', 'activo'),
(6, 1, 'PQR963852741', 'activo'),
(7, 4, 'STU159753486', 'activo'),
(8, 1, 'VWX486753159', 'activo');

-- =====================================================
-- 2. SOLICITUDES DE SERVICIO
-- =====================================================
INSERT INTO solicitud_servicio (solicitud_id, cliente_id, fecha_solicitud, descripcion_problema, estado_solicitud, tipo_atencion, sucursal_id, usuario_id) VALUES
(1, 1, '2024-01-05', 'El vehículo no arranca, posible problema eléctrico', 'pendiente', 'taller', 1, 4),
(2, 2, '2024-01-08', 'Ruido extraño en los frenos', 'en_proceso', 'taller', 2, 4),
(3, 3, '2024-01-12', 'Revisión general del vehículo', 'completada', 'taller', 1, 5),
(4, 4, '2024-01-15', 'Cambio de aceite y filtros', 'completada', 'taller', 1, 5),
(5, 5, '2024-01-18', 'Problema con la suspensión', 'en_proceso', 'taller', 3, 4),
(6, 6, '2024-01-22', 'Revisión del sistema de frenos', 'pendiente', 'taller', 2, 5),
(7, 7, '2024-01-25', 'Diagnóstico del motor', 'completada', 'taller', 1, 4),
(8, 8, '2024-01-28', 'Reparación de transmisión', 'en_proceso', 'taller', 3, 5);

-- =====================================================
-- 3. RECEPCIÓN DE EQUIPOS
-- =====================================================
INSERT INTO recepcion_equipo (recepcion_id, solicitud_id, equipo_id, fecha_recepcion, estado_recepcion, observaciones, usuario_id, sucursal_id) VALUES
(1, 1, 1, '2024-01-05', 'recibido', 'Equipo recibido en buen estado', 4, 1),
(2, 2, 2, '2024-01-08', 'recibido', 'Equipo con daños menores', 4, 2),
(3, 3, 3, '2024-01-12', 'recibido', 'Equipo en excelente estado', 5, 1),
(4, 4, 4, '2024-01-15', 'recibido', 'Equipo recibido correctamente', 5, 1),
(5, 5, 5, '2024-01-18', 'recibido', 'Equipo con problemas de suspensión', 4, 3),
(6, 6, 6, '2024-01-22', 'recibido', 'Equipo recibido para revisión', 5, 2),
(7, 7, 7, '2024-01-25', 'recibido', 'Equipo recibido para diagnóstico', 4, 1),
(8, 8, 8, '2024-01-28', 'recibido', 'Equipo con problemas de transmisión', 5, 3);

-- =====================================================
-- 4. DIAGNÓSTICOS
-- =====================================================
INSERT INTO diagnostico (diagnostico_id, recepcion_id, fecha_diagnostico, tecnico_id, observacion, estado_diagnostico, tipo_diag_id, motivo) VALUES
(1, 1, '2024-01-06', 4, 'Problema en el sistema de arranque, batería descargada', 'completado', 2, 'Batería agotada'),
(2, 2, '2024-01-09', 4, 'Pastillas de freno desgastadas, requiere cambio', 'completado', 4, 'Desgaste normal'),
(3, 3, '2024-01-13', 5, 'Revisión completa realizada, vehículo en buen estado', 'completado', 1, 'Mantenimiento preventivo'),
(4, 4, '2024-01-16', 5, 'Cambio de aceite realizado exitosamente', 'completado', 2, 'Mantenimiento programado'),
(5, 5, '2024-01-19', 4, 'Amortiguadores desgastados, requiere reemplazo', 'pendiente', 5, 'Desgaste por uso'),
(6, 6, '2024-01-23', 5, 'Sistema de frenos revisado, requiere ajuste', 'pendiente', 4, 'Ajuste necesario'),
(7, 7, '2024-01-26', 4, 'Motor en buen estado, solo requiere limpieza', 'completado', 2, 'Mantenimiento menor'),
(8, 8, '2024-01-29', 5, 'Transmisión requiere reparación mayor', 'pendiente', 6, 'Falla mecánica');

-- =====================================================
-- 5. PRESUPUESTOS DE SERVICIOS
-- =====================================================
INSERT INTO presupuesto_servicios (presu_serv_id, fecha_presupuesto, estado, monto_presu_ser, observaciones, usuario_id, sucursal_id, diagnostico_id, valido_desde, valido_hasta, tipo_presu) VALUES
(1, '2024-01-07', 'aprobado', 45000, 'Presupuesto para reparación de arranque', 4, 1, 1, '2024-01-07', '2024-01-14', 'con_diagnostico'),
(2, '2024-01-10', 'aprobado', 35000, 'Presupuesto para cambio de pastillas', 4, 2, 2, '2024-01-10', '2024-01-17', 'con_diagnostico'),
(3, '2024-01-14', 'aprobado', 25000, 'Presupuesto para revisión general', 5, 1, 3, '2024-01-14', '2024-01-21', 'con_diagnostico'),
(4, '2024-01-17', 'aprobado', 15000, 'Presupuesto para cambio de aceite', 5, 1, 4, '2024-01-17', '2024-01-24', 'con_diagnostico'),
(5, '2024-01-20', 'pendiente', 65000, 'Presupuesto para cambio de amortiguadores', 4, 3, 5, '2024-01-20', '2024-01-27', 'con_diagnostico'),
(6, '2024-01-24', 'pendiente', 25000, 'Presupuesto para ajuste de frenos', 5, 2, 6, '2024-01-24', '2024-01-31', 'con_diagnostico'),
(7, '2024-01-27', 'aprobado', 20000, 'Presupuesto para limpieza de motor', 4, 1, 7, '2024-01-27', '2024-02-03', 'con_diagnostico'),
(8, '2024-01-30', 'pendiente', 120000, 'Presupuesto para reparación de transmisión', 5, 3, 8, '2024-01-30', '2024-02-06', 'con_diagnostico');

-- =====================================================
-- 6. ÓRDENES DE SERVICIO
-- =====================================================
INSERT INTO orden_servicio (orden_servicio_id, fecha_solicitud, usuario_id, estado, monto_servicio, observaciones, monto_final, tecnico_id, presu_serv_id, forma_cobro_id, fecha_ejecucion, impresa) VALUES
(1, '2024-01-08', 4, 'completada', 45000, 'Orden completada exitosamente', 45000, 4, 1, 1, '2024-01-08', true),
(2, '2024-01-11', 4, 'completada', 35000, 'Orden completada exitosamente', 35000, 4, 2, 1, '2024-01-11', true),
(3, '2024-01-15', 5, 'completada', 25000, 'Orden completada exitosamente', 25000, 5, 3, 1, '2024-01-15', true),
(4, '2024-01-18', 5, 'completada', 15000, 'Orden completada exitosamente', 15000, 5, 4, 1, '2024-01-18', true),
(5, '2024-01-21', 4, 'en_proceso', 65000, 'Orden en proceso de ejecución', 0, 4, 5, 2, NULL, false),
(6, '2024-01-25', 5, 'pendiente', 25000, 'Orden pendiente de ejecución', 0, 5, 6, 1, NULL, false),
(7, '2024-01-28', 4, 'completada', 20000, 'Orden completada exitosamente', 20000, 4, 7, 1, '2024-01-28', true),
(8, '2024-01-31', 5, 'pendiente', 120000, 'Orden pendiente de ejecución', 0, 5, 8, 3, NULL, false);

-- =====================================================
-- 7. SALIDA DE EQUIPOS
-- =====================================================
INSERT INTO salida_equipo (salida_id, recepcion_id, fecha_salida, entregado_por, retirado_por, documento_entrega, observaciones) VALUES
(1, 1, '2024-01-08', 4, 'Isaac Castro', 'ENT-001', 'Equipo entregado correctamente'),
(2, 2, '2024-01-11', 4, 'María Rodríguez', 'ENT-002', 'Equipo entregado correctamente'),
(3, 3, '2024-01-15', 5, 'Carlos López', 'ENT-003', 'Equipo entregado correctamente'),
(4, 4, '2024-01-18', 5, 'Ana García', 'ENT-004', 'Equipo entregado correctamente'),
(7, 7, '2024-01-28', 4, 'Roberto Silva', 'ENT-007', 'Equipo entregado correctamente');

-- =====================================================
-- 8. RECLAMOS
-- =====================================================
INSERT INTO reclamos (reclamo_id, cliente_id, orden_servicio_id, fecha_reclamo, recibido_por, gestionado_por, descripcion, resolucion, fecha_resolucion, observaciones, estado) VALUES
(1, 2, 2, '2024-01-12', 4, 4, 'El servicio no quedó como esperaba', 'Se realizó ajuste adicional sin costo', '2024-01-13', 'Cliente satisfecho con la resolución', 'resuelto'),
(2, 5, 5, '2024-01-22', 4, 4, 'El tiempo de reparación es muy largo', 'Se aceleró el proceso de reparación', '2024-01-23', 'Proceso acelerado exitosamente', 'resuelto'),
(3, 8, 8, '2024-02-01', 5, 5, 'El presupuesto es muy alto', 'Se revisó el presupuesto y se ajustó', '2024-02-02', 'Presupuesto ajustado según expectativas', 'resuelto');

-- =====================================================
-- 9. AJUSTES DE INVENTARIO
-- =====================================================
INSERT INTO ajustes_inventario (ajuste_id, fecha, motivo_id, tipo_movimiento, observaciones, usuario_id, id_sucursal) VALUES
(1, '2024-01-30', 1, 'entrada', 'Ajuste por inventario físico', 1, 1),
(2, '2024-01-30', 2, 'salida', 'Producto dañado encontrado', 1, 1),
(3, '2024-01-30', 3, 'salida', 'Producto vencido retirado', 1, 2);

-- Detalles de Ajustes
INSERT INTO ajustes_inventario_detalle (detalle_id, ajuste_id, producto_id, cantidad_anterior, cantidad_nueva, diferencia, observaciones) VALUES
(1, 1, 1, 25, 30, 5, 'Ajuste por inventario físico'),
(2, 1, 2, 50, 55, 5, 'Ajuste por inventario físico'),
(3, 2, 5, 18, 17, -1, 'Producto dañado'),
(4, 3, 20, 50, 48, -2, 'Productos vencidos');

-- =====================================================
-- 10. TRANSFERENCIAS DE STOCK
-- =====================================================
INSERT INTO transferencia_stock (transferencia_id, producto_id, almacen_origen_id, almacen_destino_id, cantidad, fecha_transferencia, estado, observaciones, usuario_id) VALUES
(1, 1, 1, 2, 5, '2024-01-15', 'completada', 'Transferencia entre sucursales', 1),
(2, 5, 1, 3, 3, '2024-01-20', 'completada', 'Transferencia urgente', 1),
(3, 20, 2, 1, 10, '2024-02-01', 'pendiente', 'Transferencia programada', 1);

-- =====================================================
-- 11. NOTAS DE CRÉDITO Y DÉBITO
-- =====================================================
INSERT INTO nota_credito_cabecera (nc_id, cliente_id, fecha_nc, monto_nc, motivo, estado, usuario_id, sucursal_id) VALUES
(1, 1, '2024-01-20', 15000, 'Devolución de producto defectuoso', 'confirmada', 2, 1),
(2, 3, '2024-02-01', 25000, 'Descuento por demora en servicio', 'confirmada', 3, 1);

INSERT INTO nota_debito_cabecera (nd_id, cliente_id, fecha_nd, monto_nd, motivo, estado, usuario_id, sucursal_id) VALUES
(1, 2, '2024-01-25', 5000, 'Cargo adicional por servicio extra', 'confirmada', 2, 2),
(2, 5, '2024-02-05', 10000, 'Cargo por almacenamiento', 'confirmada', 3, 3);

-- =====================================================
-- 12. NOTAS DE REMISIÓN
-- =====================================================
INSERT INTO nota_remision (remision_id, cliente_id, fecha_remision, estado, observaciones, usuario_id, sucursal_id) VALUES
(1, 1, '2024-01-10', 'entregada', 'Remisión entregada correctamente', 2, 1),
(2, 3, '2024-01-15', 'entregada', 'Remisión entregada correctamente', 3, 1),
(3, 5, '2024-01-20', 'pendiente', 'Remisión pendiente de entrega', 2, 3);

-- =====================================================
-- FIN DEL ARCHIVO 5/5
-- =====================================================

-- =====================================================
-- RESUMEN DE DATOS CARGADOS
-- =====================================================
-- ✅ 7 Ciudades
-- ✅ 2 Empresas
-- ✅ 3 Sucursales
-- ✅ 4 Almacenes
-- ✅ 8 Categorías de productos
-- ✅ 6 Tipos de documento
-- ✅ 6 Tipos de equipo
-- ✅ 6 Tipos de diagnóstico
-- ✅ 6 Motivos de ajuste
-- ✅ 6 Formas de cobro
-- ✅ 4 Cajas registradoras
-- ✅ 8 Servicios técnicos
-- ✅ 6 Empleados
-- ✅ 6 Roles
-- ✅ 25 Permisos
-- ✅ 6 Usuarios (admin.2025)
-- ✅ 8 Clientes
-- ✅ 6 Proveedores
-- ✅ 30 Productos
-- ✅ 4 Pedidos de compra
-- ✅ 3 Presupuestos proveedor
-- ✅ 3 Órdenes de compra
-- ✅ 3 Registros de compra
-- ✅ 13 Ventas
-- ✅ 12 Cobros
-- ✅ 8 Equipos
-- ✅ 8 Solicitudes de servicio
-- ✅ 8 Recepciones de equipo
-- ✅ 8 Diagnósticos
-- ✅ 8 Presupuestos de servicios
-- ✅ 8 Órdenes de servicio
-- ✅ 5 Salidas de equipo
-- ✅ 3 Reclamos
-- ✅ 3 Ajustes de inventario
-- ✅ 3 Transferencias de stock
-- ✅ 2 Notas de crédito
-- ✅ 2 Notas de débito
-- ✅ 3 Notas de remisión

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 1. Ejecutar los archivos en orden: 01, 02, 03, 04, 05
-- 2. Usar el usuario 'admin' con contraseña 'admin.2025' para acceso completo
-- 3. Usar usuarios específicos para cada módulo:
--    - jperez/mgonzalez: Ventas
--    - lhernandez: Compras  
--    - crodriguez/amartinez: Servicios Técnicos
-- 4. Los datos incluyen transacciones completas para probar todos los módulos
-- 5. Los informes mostrarán datos reales para la demo
