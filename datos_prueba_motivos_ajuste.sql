-- Insertar motivos de ajuste de inventario
INSERT INTO motivo_ajuste (motivo_id, descripcion) VALUES 
(1, 'Compra'),
(2, 'Venta'),
(3, 'Corrección de Stock'),
(4, 'Merma'),
(5, 'Devolución Cliente'),
(6, 'Transferencia Interna'),
(7, 'Ajuste por Inventario Físico'),
(8, 'Producto Dañado'),
(9, 'Caducidad'),
(10, 'Robo o Pérdida')
ON CONFLICT (motivo_id) DO NOTHING;
