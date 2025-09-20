--
-- Crear tabla de configuración del sistema - Versión v5
-- Optimizado para Neon Database
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
--

-- Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.configuracion (
    config_id SERIAL PRIMARY KEY,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT NOT NULL,
    descripcion VARCHAR(255),
    tipo VARCHAR(20) NOT NULL DEFAULT 'string' CHECK (tipo IN ('string', 'number', 'boolean', 'json')),
    categoria VARCHAR(50) NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by INTEGER,
    updated_by INTEGER
);

-- Crear índices para mejorar el rendimiento en Neon
CREATE INDEX IF NOT EXISTS idx_configuracion_categoria ON public.configuracion(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracion_activo ON public.configuracion(activo);
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON public.configuracion(clave);
CREATE INDEX IF NOT EXISTS idx_configuracion_tipo ON public.configuracion(tipo);

-- Insertar configuraciones iniciales del sistema
INSERT INTO public.configuracion (clave, valor, descripcion, tipo, categoria, activo, created_by) VALUES
-- Configuración General
('nombre_empresa', 'Taller de Electrónica & Informática Jaime Castro E Hijos', 'Nombre de la empresa', 'string', 'general', TRUE, 1),
('direccion_empresa', 'Av. Principal 123, Ciudad', 'Dirección de la empresa', 'string', 'general', TRUE, 1),
('telefono_empresa', '0981234567', 'Teléfono de contacto', 'string', 'general', TRUE, 1),
('email_empresa', 'info@tallercastro.com', 'Email de contacto', 'string', 'general', TRUE, 1),
('sitio_web', 'www.tallercastro.com', 'Sitio web de la empresa', 'string', 'general', TRUE, 1),
('ruc_empresa', '12345678-9', 'RUC de la empresa', 'string', 'general', TRUE, 1),

-- Configuración de Sistema
('timezone', 'America/Montevideo', 'Zona horaria del sistema', 'string', 'sistema', TRUE, 1),
('idioma', 'es', 'Idioma por defecto del sistema', 'string', 'sistema', TRUE, 1),
('formato_fecha', 'DD/MM/YYYY', 'Formato de fecha por defecto', 'string', 'sistema', TRUE, 1),
('formato_hora', 'HH:mm:ss', 'Formato de hora por defecto', 'string', 'sistema', TRUE, 1),
('moneda', 'UYU', 'Moneda por defecto', 'string', 'sistema', TRUE, 1),
('simbolo_moneda', '$', 'Símbolo de la moneda', 'string', 'sistema', TRUE, 1),
('decimales_moneda', '2', 'Número de decimales para la moneda', 'number', 'sistema', TRUE, 1),

-- Configuración de Seguridad
('longitud_min_password', '8', 'Longitud mínima de contraseñas', 'number', 'seguridad', TRUE, 1),
('requiere_caracteres_especiales', 'true', 'Requerir caracteres especiales en contraseñas', 'boolean', 'seguridad', TRUE, 1),
('tiempo_sesion', '30', 'Tiempo de sesión en minutos', 'number', 'seguridad', TRUE, 1),
('intentos_max_login', '3', 'Intentos máximos de login', 'number', 'seguridad', TRUE, 1),
('bloqueo_temporal', 'true', 'Habilitar bloqueo temporal por intentos fallidos', 'boolean', 'seguridad', TRUE, 1),
('tiempo_bloqueo', '15', 'Tiempo de bloqueo en minutos', 'number', 'seguridad', TRUE, 1),

-- Configuración de Notificaciones
('notificaciones_email', 'true', 'Habilitar notificaciones por email', 'boolean', 'notificaciones', TRUE, 1),
('notificaciones_sistema', 'true', 'Habilitar notificaciones del sistema', 'boolean', 'notificaciones', TRUE, 1),
('alertas_stock', 'true', 'Habilitar alertas de stock bajo', 'boolean', 'notificaciones', TRUE, 1),
('alertas_vencimiento', 'true', 'Habilitar alertas de vencimiento', 'boolean', 'notificaciones', TRUE, 1),
('stock_minimo', '10', 'Stock mínimo para alertas', 'number', 'notificaciones', TRUE, 1),
('dias_vencimiento', '30', 'Días antes del vencimiento para alertar', 'number', 'notificaciones', TRUE, 1),

-- Configuración de Backup
('backup_automatico', 'true', 'Habilitar backup automático', 'boolean', 'backup', TRUE, 1),
('frecuencia_backup', 'diario', 'Frecuencia de backup', 'string', 'backup', TRUE, 1),
('hora_backup', '02:00', 'Hora de backup automático', 'string', 'backup', TRUE, 1),
('retencion_backup', '30', 'Días de retención de backups', 'number', 'backup', TRUE, 1),

-- Configuración de Ventas
('impuesto_iva', '10', 'Porcentaje de IVA', 'number', 'ventas', TRUE, 1),
('impuesto_iva_5', '5', 'Porcentaje de IVA reducido', 'number', 'ventas', TRUE, 1),
('numero_factura_inicial', '1', 'Número inicial de facturas', 'number', 'ventas', TRUE, 1),
('prefijo_factura', 'FAC', 'Prefijo para facturas', 'string', 'ventas', TRUE, 1),
('requiere_cliente_venta', 'false', 'Requerir cliente obligatorio en ventas', 'boolean', 'ventas', TRUE, 1),

-- Configuración de Compras
('requiere_proveedor_compra', 'true', 'Requerir proveedor obligatorio en compras', 'boolean', 'compras', TRUE, 1),
('numero_compra_inicial', '1', 'Número inicial de compras', 'number', 'compras', TRUE, 1),
('prefijo_compra', 'COM', 'Prefijo para compras', 'string', 'compras', TRUE, 1),

-- Configuración de Servicios
('numero_servicio_inicial', '1', 'Número inicial de servicios', 'number', 'servicios', TRUE, 1),
('prefijo_servicio', 'SER', 'Prefijo para servicios', 'string', 'servicios', TRUE, 1),
('tiempo_garantia_default', '90', 'Tiempo de garantía por defecto en días', 'number', 'servicios', TRUE, 1),

-- Configuración de Inventario
('control_stock', 'true', 'Habilitar control de stock', 'boolean', 'inventario', TRUE, 1),
('permitir_stock_negativo', 'false', 'Permitir stock negativo', 'boolean', 'inventario', TRUE, 1),
('costo_promedio', 'true', 'Usar costo promedio para valoración', 'boolean', 'inventario', TRUE, 1),

-- Configuración de Reportes
('logo_empresa', '', 'Ruta del logo de la empresa para reportes', 'string', 'reportes', TRUE, 1),
('pie_pagina_reporte', 'Sistema de Gestión de Taller JC', 'Pie de página para reportes', 'string', 'reportes', TRUE, 1),
('mostrar_logo_reporte', 'true', 'Mostrar logo en reportes', 'boolean', 'reportes', TRUE, 1)

ON CONFLICT (clave) DO UPDATE SET 
    valor = EXCLUDED.valor,
    descripcion = EXCLUDED.descripcion,
    tipo = EXCLUDED.tipo,
    categoria = EXCLUDED.categoria,
    activo = EXCLUDED.activo,
    updated_at = NOW(),
    updated_by = 1;

-- Comentarios en la tabla
COMMENT ON TABLE public.configuracion IS 'Configuraciones del sistema - Optimizado para Neon Database';
COMMENT ON COLUMN public.configuracion.config_id IS 'ID único de la configuración';
COMMENT ON COLUMN public.configuracion.clave IS 'Clave única de la configuración';
COMMENT ON COLUMN public.configuracion.valor IS 'Valor de la configuración';
COMMENT ON COLUMN public.configuracion.descripcion IS 'Descripción de la configuración';
COMMENT ON COLUMN public.configuracion.tipo IS 'Tipo de dato del valor (string, number, boolean, json)';
COMMENT ON COLUMN public.configuracion.categoria IS 'Categoría de la configuración';
COMMENT ON COLUMN public.configuracion.activo IS 'Indica si la configuración está activa';
COMMENT ON COLUMN public.configuracion.created_at IS 'Fecha de creación';
COMMENT ON COLUMN public.configuracion.updated_at IS 'Fecha de última actualización';
COMMENT ON COLUMN public.configuracion.created_by IS 'Usuario que creó la configuración';
COMMENT ON COLUMN public.configuracion.updated_by IS 'Usuario que actualizó la configuración';

-- Verificar configuraciones creadas
SELECT 
    categoria,
    COUNT(*) as total_configuraciones,
    COUNT(CASE WHEN activo = true THEN 1 END) as configuraciones_activas
FROM public.configuracion 
GROUP BY categoria 
ORDER BY categoria;

--
-- Tabla de configuración creada exitosamente
-- Optimizada para Neon Database con índices adicionales
--
