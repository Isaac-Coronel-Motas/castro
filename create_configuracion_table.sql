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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_configuracion_categoria ON public.configuracion(categoria);
CREATE INDEX IF NOT EXISTS idx_configuracion_activo ON public.configuracion(activo);
CREATE INDEX IF NOT EXISTS idx_configuracion_clave ON public.configuracion(clave);

-- Insertar configuraciones iniciales del sistema
INSERT INTO public.configuracion (clave, valor, descripcion, tipo, categoria, activo) VALUES
-- Configuración General
('nombre_empresa', 'Taller de Electrónica & Informática Jaime Castro E Hijos', 'Nombre de la empresa', 'string', 'general', TRUE),
('direccion_empresa', 'Av. Principal 123, Ciudad', 'Dirección de la empresa', 'string', 'general', TRUE),
('telefono_empresa', '0981234567', 'Teléfono de contacto', 'string', 'general', TRUE),
('email_empresa', 'info@tallercastro.com', 'Email de contacto', 'string', 'general', TRUE),
('sitio_web', 'www.tallercastro.com', 'Sitio web de la empresa', 'string', 'general', TRUE),

-- Configuración de Sistema
('timezone', 'America/Montevideo', 'Zona horaria del sistema', 'string', 'sistema', TRUE),
('idioma', 'es', 'Idioma por defecto del sistema', 'string', 'sistema', TRUE),
('formato_fecha', 'DD/MM/YYYY', 'Formato de fecha por defecto', 'string', 'sistema', TRUE),
('moneda', 'UYU', 'Moneda por defecto', 'string', 'sistema', TRUE),

-- Configuración de Seguridad
('longitud_min_password', '8', 'Longitud mínima de contraseñas', 'number', 'seguridad', TRUE),
('requiere_caracteres_especiales', 'true', 'Requerir caracteres especiales en contraseñas', 'boolean', 'seguridad', TRUE),
('tiempo_sesion', '30', 'Tiempo de sesión en minutos', 'number', 'seguridad', TRUE),
('intentos_max_login', '3', 'Intentos máximos de login', 'number', 'seguridad', TRUE),

-- Configuración de Notificaciones
('notificaciones_email', 'true', 'Habilitar notificaciones por email', 'boolean', 'notificaciones', TRUE),
('notificaciones_sistema', 'true', 'Habilitar notificaciones del sistema', 'boolean', 'notificaciones', TRUE),
('alertas_stock', 'true', 'Habilitar alertas de stock bajo', 'boolean', 'notificaciones', TRUE),
('alertas_vencimiento', 'true', 'Habilitar alertas de vencimiento', 'boolean', 'notificaciones', TRUE),

-- Configuración de Backup
('backup_automatico', 'true', 'Habilitar backup automático', 'boolean', 'backup', TRUE),
('frecuencia_backup', 'diario', 'Frecuencia de backup', 'string', 'backup', TRUE),
('hora_backup', '02:00', 'Hora de backup automático', 'string', 'backup', TRUE),
('retencion_backup', '30', 'Días de retención de backups', 'number', 'backup', TRUE)

ON CONFLICT (clave) DO UPDATE SET 
    valor = EXCLUDED.valor,
    descripcion = EXCLUDED.descripcion,
    tipo = EXCLUDED.tipo,
    categoria = EXCLUDED.categoria,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Comentarios en la tabla
COMMENT ON TABLE public.configuracion IS 'Configuraciones del sistema';
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
