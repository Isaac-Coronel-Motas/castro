-- =====================================================
-- DEMO SISTEMA TALLER CASTRO - PARTE 1/5
-- Parámetros y Referencias Básicas
-- =====================================================

-- Limpiar datos existentes (opcional - descomentar si es necesario)
-- DELETE FROM rol_permisos;
-- DELETE FROM permisos;
-- DELETE FROM roles;
-- DELETE FROM ciudades;
-- DELETE FROM empresas;
-- DELETE FROM sucursales;
-- DELETE FROM almacenes;
-- DELETE FROM categorias;
-- DELETE FROM tipo_documento;
-- DELETE FROM tipo_equipo;
-- DELETE FROM tipo_diagnosticos;
-- DELETE FROM motivo_ajuste;
-- DELETE FROM forma_cobro;

-- =====================================================
-- 1. CIUDADES
-- =====================================================
INSERT INTO ciudades (ciudad_id, nombre, codigo_postal, activo) VALUES
(1, 'San José', '1000', true),
(2, 'Cartago', '3000', true),
(3, 'Alajuela', '2000', true),
(4, 'Heredia', '4000', true),
(5, 'Puntarenas', '6000', true),
(6, 'Limón', '7000', true),
(7, 'Guanacaste', '5000', true);

-- =====================================================
-- 2. EMPRESAS
-- =====================================================
INSERT INTO empresas (empresa_id, nombre, ruc, direccion, telefono, email, ciudad_id, activo) VALUES
(1, 'Taller Castro S.A.', '3-101-123456', 'Av. Central 123, San José', '2222-1234', 'info@tallercastro.com', 1, true),
(2, 'Castro Automotriz', '3-101-789012', 'Calle 5, Cartago', '2550-5678', 'cartago@tallercastro.com', 2, true);

-- =====================================================
-- 3. SUCURSALES
-- =====================================================
INSERT INTO sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa) VALUES
(1, 'Sucursal Central', 'Av. Central 123, San José', '2222-1234', 'central@tallercastro.com', 1, 1),
(2, 'Sucursal Cartago', 'Calle 5, Cartago', '2550-5678', 'cartago@tallercastro.com', 2, 1),
(3, 'Sucursal Principal', 'Av. Segunda 456, San José', '2222-9999', 'principal@tallercastro.com', 1, 1);

-- =====================================================
-- 4. ALMACENES
-- =====================================================
INSERT INTO almacenes (almacen_id, nombre, direccion, sucursal_id, activo) VALUES
(1, 'Almacén Central', 'Av. Central 123, San José', 1, true),
(2, 'Almacén Cartago', 'Calle 5, Cartago', 2, true),
(3, 'Almacén Principal', 'Av. Segunda 456, San José', 3, true),
(4, 'Almacén Repuestos', 'Av. Central 125, San José', 1, true);

-- =====================================================
-- 5. CATEGORÍAS DE PRODUCTOS
-- =====================================================
INSERT INTO categorias (categoria_id, nombre, descripcion, activo) VALUES
(1, 'Repuestos Motor', 'Repuestos para motores de vehículos', true),
(2, 'Frenos', 'Sistema de frenos y componentes', true),
(3, 'Suspensión', 'Componentes de suspensión', true),
(4, 'Eléctrico', 'Sistema eléctrico del vehículo', true),
(5, 'Filtros', 'Filtros de aire, aceite y combustible', true),
(6, 'Aceites', 'Aceites y lubricantes', true),
(7, 'Neumáticos', 'Neumáticos y llantas', true),
(8, 'Accesorios', 'Accesorios para vehículos', true);

-- =====================================================
-- 6. TIPOS DE DOCUMENTO
-- =====================================================
INSERT INTO tipo_documento (tipo_doc_id, descripcion, activo) VALUES
(1, 'Factura', true),
(2, 'Nota de Crédito', true),
(3, 'Nota de Débito', true),
(4, 'Nota de Remisión', true),
(5, 'Recibo', true),
(6, 'Presupuesto', true);

-- =====================================================
-- 7. TIPOS DE EQUIPO
-- =====================================================
INSERT INTO tipo_equipo (tipo_equipo_id, nombre, descripcion, activo) VALUES
(1, 'Automóvil', 'Vehículos de pasajeros', true),
(2, 'Camioneta', 'Vehículos comerciales ligeros', true),
(3, 'Motocicleta', 'Vehículos de dos ruedas', true),
(4, 'Camión', 'Vehículos comerciales pesados', true),
(5, 'Bus', 'Vehículos de transporte público', true),
(6, 'Maquinaria', 'Maquinaria pesada', true);

-- =====================================================
-- 8. TIPOS DE DIAGNÓSTICO
-- =====================================================
INSERT INTO tipo_diagnosticos (tipo_diag_id, nombre, descripcion, activo) VALUES
(1, 'Diagnóstico General', 'Revisión general del vehículo', true),
(2, 'Diagnóstico Motor', 'Revisión específica del motor', true),
(3, 'Diagnóstico Eléctrico', 'Revisión del sistema eléctrico', true),
(4, 'Diagnóstico Frenos', 'Revisión del sistema de frenos', true),
(5, 'Diagnóstico Suspensión', 'Revisión de la suspensión', true),
(6, 'Diagnóstico Transmisión', 'Revisión de la transmisión', true);

-- =====================================================
-- 9. MOTIVOS DE AJUSTE
-- =====================================================
INSERT INTO motivo_ajuste (motivo_id, descripcion, activo) VALUES
(1, 'Ajuste por Inventario', 'Ajuste realizado durante inventario físico', true),
(2, 'Producto Dañado', 'Producto dañado o defectuoso', true),
(3, 'Producto Vencido', 'Producto con fecha de vencimiento expirada', true),
(4, 'Robo o Pérdida', 'Producto robado o perdido', true),
(5, 'Devolución de Cliente', 'Devolución de producto por cliente', true),
(6, 'Ajuste por Error', 'Corrección de error en registro', true);

-- =====================================================
-- 10. FORMAS DE COBRO
-- =====================================================
INSERT INTO forma_cobro (forma_cobro_id, descripcion, activo) VALUES
(1, 'Efectivo', true),
(2, 'Tarjeta de Crédito', true),
(3, 'Tarjeta de Débito', true),
(4, 'Transferencia Bancaria', true),
(5, 'Cheque', true),
(6, 'Crédito Directo', true);

-- =====================================================
-- 11. CAJAS REGISTRADORAS
-- =====================================================
INSERT INTO cajas (caja_id, nro_caja, descripcion, sucursal_id, activo) VALUES
(1, 'CAJA-001', 'Caja Principal Central', 1, true),
(2, 'C002', 'Caja Secundaria Central', 1, true),
(3, 'C003', 'Caja Cartago', 2, true),
(4, 'C004', 'Caja Principal', 3, true);

-- =====================================================
-- 12. SERVICIOS TÉCNICOS
-- =====================================================
INSERT INTO servicios (servicio_id, nombre, descripcion, precio_base, activo) VALUES
(1, 'Cambio de Aceite', 'Cambio de aceite del motor', 15000, true),
(2, 'Revisión General', 'Revisión completa del vehículo', 25000, true),
(3, 'Reparación de Frenos', 'Reparación del sistema de frenos', 45000, true),
(4, 'Alineación y Balanceo', 'Alineación y balanceo de neumáticos', 20000, true),
(5, 'Diagnóstico Eléctrico', 'Diagnóstico del sistema eléctrico', 30000, true),
(6, 'Reparación de Motor', 'Reparación general del motor', 80000, true),
(7, 'Cambio de Filtros', 'Cambio de filtros de aire y aceite', 12000, true),
(8, 'Reparación de Suspensión', 'Reparación del sistema de suspensión', 60000, true);

-- =====================================================
-- 13. EMPLEADOS
-- =====================================================
INSERT INTO empleados (id_empleado, nombre, apellido, cedula, telefono, email, direccion, puesto, fecha_ingreso, activo) VALUES
(1, 'Administrador', 'Sistema', '1-1234-5678', '8888-0001', 'admin@tallercastro.com', 'Av. Central 123', 'Administrador', '2024-01-01', true),
(2, 'Juan', 'Pérez', '1-2345-6789', '8888-0002', 'juan.perez@tallercastro.com', 'Calle 1, San José', 'Vendedor', '2024-01-15', true),
(3, 'María', 'González', '1-3456-7890', '8888-0003', 'maria.gonzalez@tallercastro.com', 'Calle 2, San José', 'Vendedora', '2024-02-01', true),
(4, 'Carlos', 'Rodríguez', '1-4567-8901', '8888-0004', 'carlos.rodriguez@tallercastro.com', 'Calle 3, Cartago', 'Técnico', '2024-02-15', true),
(5, 'Ana', 'Martínez', '1-5678-9012', '8888-0005', 'ana.martinez@tallercastro.com', 'Calle 4, San José', 'Técnica', '2024-03-01', true),
(6, 'Luis', 'Hernández', '1-6789-0123', '8888-0006', 'luis.hernandez@tallercastro.com', 'Calle 5, San José', 'Comprador', '2024-03-15', true);

-- =====================================================
-- FIN DEL ARCHIVO 1/5
-- =====================================================