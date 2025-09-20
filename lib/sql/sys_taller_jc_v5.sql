--
-- Sistema de Gestión de Taller JC v5
-- Optimizado para Neon Database
-- Generado: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
--

-- PostgreSQL database dump optimized for Neon
-- Version: 5.0
-- Compatible with Neon PostgreSQL




--
-- TOC entry 1060 (class 1247 OID 25493)
-- Name: condicion_pago_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.condicion_pago_enum AS ENUM (
    'contado',
    'crédito'
);




--
-- TOC entry 1453 (class 1247 OID 44662)
-- Name: condicionpagoenum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.condicionpagoenum AS ENUM (
    'contado',
    'credito'
);




--
-- TOC entry 1063 (class 1247 OID 25498)
-- Name: estado_arqueo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_arqueo_enum AS ENUM (
    'abierto',
    'cerrado',
    'anulado'
);




--
-- TOC entry 1066 (class 1247 OID 25506)
-- Name: estado_cliente; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cliente AS ENUM (
    'activo',
    'inactivo'
);




--
-- TOC entry 1069 (class 1247 OID 25512)
-- Name: estado_compra; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_compra AS ENUM (
    'pendiente',
    'en_progreso',
    'completada',
    'cancelada'
);




--
-- TOC entry 1072 (class 1247 OID 25522)
-- Name: estado_cuenta_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_cuenta_enum AS ENUM (
    'pendiente',
    'parcial',
    'pagada',
    'vencida'
);




--
-- TOC entry 1075 (class 1247 OID 25532)
-- Name: estado_diagnostico_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_diagnostico_enum AS ENUM (
    'Pendiente',
    'En proceso',
    'Completado',
    'Rechazado',
    'Cancelado'
);




--
-- TOC entry 1078 (class 1247 OID 25544)
-- Name: estado_fact_serv; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_fact_serv AS ENUM (
    'pendiente',
    'pagada',
    'cancelada'
);




--
-- TOC entry 1081 (class 1247 OID 25552)
-- Name: estado_factura_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_factura_enum AS ENUM (
    'pendiente',
    'pagada',
    'cancelada'
);




--
-- TOC entry 1084 (class 1247 OID 25560)
-- Name: estado_factura_venta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_factura_venta AS ENUM (
    'emitida',
    'pagada',
    'anulada'
);




--
-- TOC entry 1087 (class 1247 OID 25568)
-- Name: estado_nc_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_nc_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'anulada'
);




--
-- TOC entry 1090 (class 1247 OID 25578)
-- Name: estado_nd_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_nd_enum AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'anulada'
);




--
-- TOC entry 1093 (class 1247 OID 25588)
-- Name: estado_ord_serv; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_ord_serv AS ENUM (
    'pendiente',
    'en_proceso',
    'completado'
);




--
-- TOC entry 1096 (class 1247 OID 25596)
-- Name: estado_orden_compra; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_orden_compra AS ENUM (
    'pendiente',
    'aprobada',
    'rechazada',
    'cancelada'
);




--
-- TOC entry 1099 (class 1247 OID 25606)
-- Name: estado_ped_venta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_ped_venta AS ENUM (
    'pendiente',
    'confirmado',
    'cancelado'
);




--
-- TOC entry 1102 (class 1247 OID 25614)
-- Name: estado_pedido_p; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pedido_p AS ENUM (
    'pendiente',
    'procesado',
    'cancelado'
);




--
-- TOC entry 1105 (class 1247 OID 25622)
-- Name: estado_pres_venta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_pres_venta AS ENUM (
    'pendiente',
    'aceptado',
    'rechazado'
);




--
-- TOC entry 1108 (class 1247 OID 25630)
-- Name: estado_presupuesto; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_presupuesto AS ENUM (
    'nuevo',
    'pendiente',
    'aprobado',
    'rechazado'
);




--
-- TOC entry 1111 (class 1247 OID 25640)
-- Name: estado_recaudacion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_recaudacion_enum AS ENUM (
    'pendiente',
    'aprobado',
    'depositado',
    'cancelado'
);




--
-- TOC entry 1114 (class 1247 OID 25650)
-- Name: estado_recepcion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_recepcion_enum AS ENUM (
    'En revisión',
    'En diagnóstico',
    'Presupuestado',
    'En reparación',
    'Finalizado',
    'Entregado',
    'Cancelado'
);




--
-- TOC entry 1117 (class 1247 OID 25666)
-- Name: estado_recepcion_enum_new; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_recepcion_enum_new AS ENUM (
    'En revisión',
    'Cancelada',
    'Recepcionada'
);




--
-- TOC entry 1120 (class 1247 OID 25674)
-- Name: estado_reclamo_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_reclamo_enum AS ENUM (
    'pendiente',
    'en_verificacion',
    'resuelto',
    'rechazado',
    'anulado'
);




--
-- TOC entry 1123 (class 1247 OID 25686)
-- Name: estado_remision_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_remision_enum AS ENUM (
    'pendiente',
    'enviado',
    'anulado'
);




--
-- TOC entry 1126 (class 1247 OID 25694)
-- Name: estado_solicitud_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_solicitud_enum AS ENUM (
    'Pendiente',
    'Asignada',
    'En proceso',
    'Finalizada',
    'Cancelada'
);




--
-- TOC entry 1129 (class 1247 OID 25706)
-- Name: estado_venta; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_venta AS ENUM (
    'cerrado',
    'abierto',
    'cancelado'
);




--
-- TOC entry 1132 (class 1247 OID 25714)
-- Name: estado_visita_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estado_visita_enum AS ENUM (
    'Pendiente',
    'Realizada',
    'Reprogramada',
    'Cancelada'
);




--
-- TOC entry 1447 (class 1247 OID 44648)
-- Name: estadoclienteenum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estadoclienteenum AS ENUM (
    'activo',
    'inactivo'
);




--
-- TOC entry 1450 (class 1247 OID 44654)
-- Name: estadoventaenum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.estadoventaenum AS ENUM (
    'abierto',
    'cerrado',
    'anulado'
);




--
-- TOC entry 1135 (class 1247 OID 25724)
-- Name: tipo_atencion_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_atencion_enum AS ENUM (
    'Visita',
    'Recepcion'
);




--
-- TOC entry 1138 (class 1247 OID 25730)
-- Name: tipo_movimiento_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_movimiento_enum AS ENUM (
    'entrada',
    'salida',
    'ajuste'
);




--
-- TOC entry 1141 (class 1247 OID 25738)
-- Name: tipo_presupuesto_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.tipo_presupuesto_enum AS ENUM (
    'con_diagnostico',
    'sin_diagnostico'
);




SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 25743)
-- Name: accesos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.accesos (
    acceso_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_acceso timestamp without time zone DEFAULT now(),
    tipo_acceso character varying(50),
    ip_origen character varying(45),
    info_extra text
);




--
-- TOC entry 218 (class 1259 OID 25749)
-- Name: accesos_acceso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.accesos_acceso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6404 (class 0 OID 0)
-- Dependencies: 218
-- Name: accesos_acceso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.accesos_acceso_id_seq OWNED BY public.accesos.acceso_id;


--
-- TOC entry 219 (class 1259 OID 25750)
-- Name: ajustes_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajustes_inventario (
    ajuste_id integer NOT NULL,
    fecha timestamp without time zone DEFAULT now(),
    usuario_id integer NOT NULL,
    motivo_id integer NOT NULL,
    observaciones text,
    almacen_id integer NOT NULL,
    estado character varying(20) DEFAULT 'borrador'::character varying,
    CONSTRAINT ajustes_inventario_estado_check CHECK (((estado)::text = ANY (ARRAY[('borrador'::character varying)::text, ('validado'::character varying)::text, ('anulado'::character varying)::text])))
);




--
-- TOC entry 220 (class 1259 OID 25758)
-- Name: ajustes_inventario_ajuste_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ajustes_inventario_ajuste_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6405 (class 0 OID 0)
-- Dependencies: 220
-- Name: ajustes_inventario_ajuste_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ajustes_inventario_ajuste_id_seq OWNED BY public.ajustes_inventario.ajuste_id;


--
-- TOC entry 221 (class 1259 OID 25759)
-- Name: ajustes_inventario_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ajustes_inventario_detalle (
    detalle_id integer NOT NULL,
    ajuste_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad_ajustada numeric NOT NULL,
    comentario text
);




--
-- TOC entry 222 (class 1259 OID 25764)
-- Name: ajustes_inventario_detalle_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ajustes_inventario_detalle_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6406 (class 0 OID 0)
-- Dependencies: 222
-- Name: ajustes_inventario_detalle_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ajustes_inventario_detalle_detalle_id_seq OWNED BY public.ajustes_inventario_detalle.detalle_id;


--
-- TOC entry 223 (class 1259 OID 25765)
-- Name: almacenes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.almacenes (
    almacen_id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    almacen_principal boolean DEFAULT false NOT NULL,
    id_sucursal integer
);




--
-- TOC entry 224 (class 1259 OID 25771)
-- Name: almacenes_almacen_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.almacenes_almacen_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6407 (class 0 OID 0)
-- Dependencies: 224
-- Name: almacenes_almacen_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.almacenes_almacen_id_seq OWNED BY public.almacenes.almacen_id;


--
-- TOC entry 225 (class 1259 OID 25772)
-- Name: apertura_cierre_caja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.apertura_cierre_caja (
    apertura_cierre_id integer NOT NULL,
    caja_id integer NOT NULL,
    fecha_apertura date DEFAULT CURRENT_DATE NOT NULL,
    monto_apertura numeric(12,2) NOT NULL,
    fecha_cierre date,
    hora_cierre time without time zone,
    monto_cierre numeric(12,2),
    estado character varying(10) DEFAULT 'abierta'::character varying NOT NULL,
    CONSTRAINT chk_estado_caja CHECK (((estado)::text = ANY (ARRAY[('abierta'::character varying)::text, ('cerrada'::character varying)::text])))
);




--
-- TOC entry 226 (class 1259 OID 25778)
-- Name: apertura_cierre_caja_apertura_cierre_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.apertura_cierre_caja_apertura_cierre_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6408 (class 0 OID 0)
-- Dependencies: 226
-- Name: apertura_cierre_caja_apertura_cierre_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.apertura_cierre_caja_apertura_cierre_id_seq OWNED BY public.apertura_cierre_caja.apertura_cierre_id;


--
-- TOC entry 227 (class 1259 OID 25779)
-- Name: arqueo_caja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.arqueo_caja (
    arqueo_id integer NOT NULL,
    caja_id integer NOT NULL,
    sucursal_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_apertura date DEFAULT CURRENT_DATE NOT NULL,
    hora_apertura time without time zone NOT NULL,
    monto_apertura numeric(12,2) NOT NULL,
    monto_contado numeric(12,2) DEFAULT 0,
    monto_credito numeric(12,2) DEFAULT 0,
    monto_salida numeric(12,2) DEFAULT 0,
    valor_sistema numeric(12,2),
    monto_cierre numeric(12,2),
    diferencia numeric(12,2),
    fecha_cierre date,
    hora_cierre time without time zone,
    estado public.estado_arqueo_enum DEFAULT 'abierto'::public.estado_arqueo_enum
);




--
-- TOC entry 228 (class 1259 OID 25787)
-- Name: arqueo_caja_arqueo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.arqueo_caja_arqueo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6409 (class 0 OID 0)
-- Dependencies: 228
-- Name: arqueo_caja_arqueo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.arqueo_caja_arqueo_id_seq OWNED BY public.arqueo_caja.arqueo_id;


--
-- TOC entry 427 (class 1259 OID 44714)
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    log_id integer NOT NULL,
    usuario_id integer,
    accion character varying(100) NOT NULL,
    tabla_afectada character varying(100),
    ip_address character varying(45),
    user_agent text,
    fecha_hora timestamp without time zone,
    exitoso boolean,
    detalles text,
    session_id character varying(100),
    request_method character varying(10),
    request_url text,
    response_status integer
);




--
-- TOC entry 426 (class 1259 OID 44713)
-- Name: audit_logs_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_log_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6410 (class 0 OID 0)
-- Dependencies: 426
-- Name: audit_logs_log_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_log_id_seq OWNED BY public.audit_logs.log_id;


--
-- TOC entry 229 (class 1259 OID 25788)
-- Name: auditoria_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_compra (
    auditoria_id integer NOT NULL,
    tabla text NOT NULL,
    registro_id integer NOT NULL,
    usuario_id integer,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accion character varying(10) NOT NULL,
    campos_modificados text,
    valor_anterior jsonb,
    valor_nuevo jsonb
);




--
-- TOC entry 230 (class 1259 OID 25794)
-- Name: auditoria_compra_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_compra_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6411 (class 0 OID 0)
-- Dependencies: 230
-- Name: auditoria_compra_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_compra_auditoria_id_seq OWNED BY public.auditoria_compra.auditoria_id;


--
-- TOC entry 231 (class 1259 OID 25795)
-- Name: auditoria_general; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_general (
    auditoria_id integer NOT NULL,
    tabla text NOT NULL,
    registro_id integer NOT NULL,
    usuario_id integer,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accion character varying(10) NOT NULL,
    campos_modificados text,
    valor_anterior jsonb,
    valor_nuevo jsonb
);




--
-- TOC entry 232 (class 1259 OID 25801)
-- Name: auditoria_general_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_general_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6412 (class 0 OID 0)
-- Dependencies: 232
-- Name: auditoria_general_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_general_auditoria_id_seq OWNED BY public.auditoria_general.auditoria_id;


--
-- TOC entry 233 (class 1259 OID 25802)
-- Name: auditoria_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_servicio (
    auditoria_id integer NOT NULL,
    tabla text NOT NULL,
    registro_id integer NOT NULL,
    usuario_id integer,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accion character varying(10) NOT NULL,
    campos_modificados text,
    valor_anterior jsonb,
    valor_nuevo jsonb
);




--
-- TOC entry 234 (class 1259 OID 25808)
-- Name: auditoria_servicio_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_servicio_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6413 (class 0 OID 0)
-- Dependencies: 234
-- Name: auditoria_servicio_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_servicio_auditoria_id_seq OWNED BY public.auditoria_servicio.auditoria_id;


--
-- TOC entry 235 (class 1259 OID 25809)
-- Name: auditoria_venta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auditoria_venta (
    auditoria_id integer NOT NULL,
    tabla text NOT NULL,
    registro_id integer NOT NULL,
    usuario_id integer,
    fecha_cambio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accion character varying(10) NOT NULL,
    campos_modificados text,
    valor_anterior jsonb,
    valor_nuevo jsonb
);




--
-- TOC entry 236 (class 1259 OID 25815)
-- Name: auditoria_venta_auditoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.auditoria_venta_auditoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6414 (class 0 OID 0)
-- Dependencies: 236
-- Name: auditoria_venta_auditoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.auditoria_venta_auditoria_id_seq OWNED BY public.auditoria_venta.auditoria_id;


--
-- TOC entry 237 (class 1259 OID 25816)
-- Name: bancos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bancos (
    banco_id integer NOT NULL,
    nombre text NOT NULL
);




--
-- TOC entry 238 (class 1259 OID 25821)
-- Name: bancos_banco_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bancos_banco_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6415 (class 0 OID 0)
-- Dependencies: 238
-- Name: bancos_banco_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bancos_banco_id_seq OWNED BY public.bancos.banco_id;


--
-- TOC entry 239 (class 1259 OID 25822)
-- Name: caja_timbrados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.caja_timbrados (
    caja_id integer NOT NULL,
    timbrado_id integer NOT NULL,
    fecha_desde date DEFAULT CURRENT_DATE NOT NULL,
    fecha_hasta date
);




--
-- TOC entry 240 (class 1259 OID 25826)
-- Name: cajas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cajas (
    caja_id integer NOT NULL,
    nro_caja character varying(10) NOT NULL,
    sucursal_id integer NOT NULL,
    activo boolean DEFAULT true
);




--
-- TOC entry 241 (class 1259 OID 25830)
-- Name: cajas_caja_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cajas_caja_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6416 (class 0 OID 0)
-- Dependencies: 241
-- Name: cajas_caja_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cajas_caja_id_seq OWNED BY public.cajas.caja_id;


--
-- TOC entry 242 (class 1259 OID 25831)
-- Name: categorias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categorias (
    categoria_id integer NOT NULL,
    nombre_categoria character varying(100),
    estado boolean DEFAULT true
);




--
-- TOC entry 243 (class 1259 OID 25835)
-- Name: categorias_categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categorias_categoria_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6417 (class 0 OID 0)
-- Dependencies: 243
-- Name: categorias_categoria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categorias_categoria_id_seq OWNED BY public.categorias.categoria_id;


--
-- TOC entry 244 (class 1259 OID 25836)
-- Name: ciudades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ciudades (
    id integer NOT NULL,
    nombre character varying(100) NOT NULL
);




--
-- TOC entry 245 (class 1259 OID 25839)
-- Name: ciudades_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ciudades_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6418 (class 0 OID 0)
-- Dependencies: 245
-- Name: ciudades_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ciudades_id_seq OWNED BY public.ciudades.id;


--
-- TOC entry 246 (class 1259 OID 25840)
-- Name: clientes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clientes (
    cliente_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    direccion text,
    ruc character varying(50),
    telefono character varying(20),
    email character varying(100),
    estado public.estado_cliente DEFAULT 'activo'::public.estado_cliente,
    ciudad_id integer,
    usuario_id integer,
    lista_id integer
);




--
-- TOC entry 247 (class 1259 OID 25846)
-- Name: clientes_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.clientes_cliente_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6419 (class 0 OID 0)
-- Dependencies: 247
-- Name: clientes_cliente_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.clientes_cliente_id_seq OWNED BY public.clientes.cliente_id;


--
-- TOC entry 248 (class 1259 OID 25847)
-- Name: cobros; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cobros (
    cobro_id integer NOT NULL,
    venta_id integer NOT NULL,
    fecha_cobro date DEFAULT CURRENT_DATE,
    monto numeric(12,2) NOT NULL,
    usuario_id integer,
    caja_id integer NOT NULL,
    observacion text
);




--
-- TOC entry 249 (class 1259 OID 25853)
-- Name: cobros_cobro_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cobros_cobro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6420 (class 0 OID 0)
-- Dependencies: 249
-- Name: cobros_cobro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cobros_cobro_id_seq OWNED BY public.cobros.cobro_id;


--
-- TOC entry 250 (class 1259 OID 25854)
-- Name: compra_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.compra_cabecera (
    compra_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    usuario_id integer,
    fecha_compra date DEFAULT CURRENT_TIMESTAMP,
    monto_compra numeric NOT NULL,
    estado public.estado_compra DEFAULT 'pendiente'::public.estado_compra NOT NULL,
    observaciones text,
    almacen_id integer,
    orden_compra_id integer,
    sucursal_id integer NOT NULL,
    condicion_pago public.condicion_pago_enum,
    timbrado character varying(50),
    nro_factura character varying(50),
    fecha_comprobante date,
    tipo_doc_id integer NOT NULL,
    monto_gravada_5 numeric(12,2) DEFAULT 0,
    monto_gravada_10 numeric(12,2) DEFAULT 0,
    monto_exenta numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) DEFAULT 0
);




--
-- TOC entry 251 (class 1259 OID 25865)
-- Name: compra_cabecera_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.compra_cabecera_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6421 (class 0 OID 0)
-- Dependencies: 251
-- Name: compra_cabecera_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.compra_cabecera_compra_id_seq OWNED BY public.compra_cabecera.compra_id;


--
-- TOC entry 252 (class 1259 OID 25866)
-- Name: cuentas_bancarias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_bancarias (
    cuenta_id integer NOT NULL,
    numero_cuenta text NOT NULL,
    moneda text DEFAULT 'PYG'::text,
    activa boolean DEFAULT true,
    banco_id integer
);




--
-- TOC entry 253 (class 1259 OID 25873)
-- Name: cuentas_bancarias_cuenta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_bancarias_cuenta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6422 (class 0 OID 0)
-- Dependencies: 253
-- Name: cuentas_bancarias_cuenta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_bancarias_cuenta_id_seq OWNED BY public.cuentas_bancarias.cuenta_id;


--
-- TOC entry 254 (class 1259 OID 25874)
-- Name: cuentas_por_cobrar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_por_cobrar (
    cuenta_cobrar_id integer NOT NULL,
    venta_id integer NOT NULL,
    cliente_id integer NOT NULL,
    fecha_emision date DEFAULT CURRENT_DATE NOT NULL,
    fecha_vencimiento date,
    monto_total numeric(12,2) NOT NULL,
    saldo_pendiente numeric(12,2) NOT NULL,
    estado public.estado_cuenta_enum DEFAULT 'pendiente'::public.estado_cuenta_enum,
    usuario_id integer NOT NULL
);




--
-- TOC entry 255 (class 1259 OID 25879)
-- Name: cuentas_por_cobrar_cuenta_cobrar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_por_cobrar_cuenta_cobrar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6423 (class 0 OID 0)
-- Dependencies: 255
-- Name: cuentas_por_cobrar_cuenta_cobrar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_por_cobrar_cuenta_cobrar_id_seq OWNED BY public.cuentas_por_cobrar.cuenta_cobrar_id;


--
-- TOC entry 256 (class 1259 OID 25880)
-- Name: cuentas_por_pagar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cuentas_por_pagar (
    cuenta_pagar_id integer NOT NULL,
    compra_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    fecha_emision date DEFAULT CURRENT_DATE NOT NULL,
    fecha_vencimiento date,
    monto_adeudado numeric(12,2) NOT NULL,
    saldo_pendiente numeric(12,2) NOT NULL,
    estado public.estado_cuenta_enum DEFAULT 'pendiente'::public.estado_cuenta_enum
);




--
-- TOC entry 257 (class 1259 OID 25885)
-- Name: cuentas_por_pagar_cuenta_pagar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cuentas_por_pagar_cuenta_pagar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6424 (class 0 OID 0)
-- Dependencies: 257
-- Name: cuentas_por_pagar_cuenta_pagar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cuentas_por_pagar_cuenta_pagar_id_seq OWNED BY public.cuentas_por_pagar.cuenta_pagar_id;


--
-- TOC entry 425 (class 1259 OID 44707)
-- Name: departamentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.departamentos (
    departamento_id integer NOT NULL,
    nombre_departamento character varying(100) NOT NULL
);




--
-- TOC entry 424 (class 1259 OID 44706)
-- Name: departamentos_departamento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.departamentos_departamento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6425 (class 0 OID 0)
-- Dependencies: 424
-- Name: departamentos_departamento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.departamentos_departamento_id_seq OWNED BY public.departamentos.departamento_id;


--
-- TOC entry 258 (class 1259 OID 25886)
-- Name: descuentos_aplicados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.descuentos_aplicados (
    desc_aplicado_id integer NOT NULL,
    tipo_descuento_id integer NOT NULL,
    monto_descuento numeric(10,2) NOT NULL,
    fecha_aplicacion timestamp without time zone DEFAULT now(),
    usuario_id integer NOT NULL,
    origen_tipo character varying(50) NOT NULL,
    origen_id integer NOT NULL
);




--
-- TOC entry 259 (class 1259 OID 25890)
-- Name: descuentos_aplicados_desc_aplicado_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.descuentos_aplicados_desc_aplicado_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6426 (class 0 OID 0)
-- Dependencies: 259
-- Name: descuentos_aplicados_desc_aplicado_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.descuentos_aplicados_desc_aplicado_id_seq OWNED BY public.descuentos_aplicados.desc_aplicado_id;


--
-- TOC entry 260 (class 1259 OID 25891)
-- Name: tipo_descuentos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_descuentos (
    tipo_descuento_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    descripcion text NOT NULL,
    porcentaje numeric(5,2) NOT NULL,
    usuario_id integer NOT NULL,
    activo boolean DEFAULT true,
    nro_descuento character varying(50),
    global boolean DEFAULT false,
    CONSTRAINT descuentos_porcentaje_check CHECK (((porcentaje >= (0)::numeric) AND (porcentaje <= (100)::numeric)))
);




--
-- TOC entry 261 (class 1259 OID 25900)
-- Name: descuentos_descuento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.descuentos_descuento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6427 (class 0 OID 0)
-- Dependencies: 261
-- Name: descuentos_descuento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.descuentos_descuento_id_seq OWNED BY public.tipo_descuentos.tipo_descuento_id;


--
-- TOC entry 262 (class 1259 OID 25901)
-- Name: detalle_compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_compras (
    detalle_compra_id integer NOT NULL,
    compra_id integer,
    producto_id integer,
    cantidad integer,
    precio_unitario numeric(12,2)
);




--
-- TOC entry 263 (class 1259 OID 25904)
-- Name: detalle_compras_detalle_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_compras_detalle_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6428 (class 0 OID 0)
-- Dependencies: 263
-- Name: detalle_compras_detalle_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_compras_detalle_compra_id_seq OWNED BY public.detalle_compras.detalle_compra_id;


--
-- TOC entry 264 (class 1259 OID 25905)
-- Name: detalle_pedido_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_pedido_compra (
    ped_compra_det_id integer NOT NULL,
    pedido_compra_id integer NOT NULL,
    producto_id integer,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario integer
);




--
-- TOC entry 265 (class 1259 OID 25908)
-- Name: detalle_presupuesto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_presupuesto (
    detalle_presup_id integer NOT NULL,
    presu_prov_id integer,
    producto_id integer,
    cantidad integer,
    precio_unitario numeric(12,2)
);




--
-- TOC entry 266 (class 1259 OID 25911)
-- Name: detalle_presupuesto_detalle_presup_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_presupuesto_detalle_presup_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6429 (class 0 OID 0)
-- Dependencies: 266
-- Name: detalle_presupuesto_detalle_presup_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_presupuesto_detalle_presup_id_seq OWNED BY public.detalle_presupuesto.detalle_presup_id;


--
-- TOC entry 267 (class 1259 OID 25912)
-- Name: detalle_producto_presupuesto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_producto_presupuesto (
    id_detalle_producto integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    presu_serv_id integer,
    CONSTRAINT detalle_producto_presupuesto_cantidad_check CHECK ((cantidad > 0))
);




--
-- TOC entry 268 (class 1259 OID 25916)
-- Name: detalle_producto_presupuesto_id_detalle_producto_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_producto_presupuesto_id_detalle_producto_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6430 (class 0 OID 0)
-- Dependencies: 268
-- Name: detalle_producto_presupuesto_id_detalle_producto_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_producto_presupuesto_id_detalle_producto_seq OWNED BY public.detalle_producto_presupuesto.id_detalle_producto;


--
-- TOC entry 269 (class 1259 OID 25917)
-- Name: detalle_remision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.detalle_remision (
    detalle_remision_id integer NOT NULL,
    nota_remision_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL
);




--
-- TOC entry 270 (class 1259 OID 25920)
-- Name: detalle_remision_detalle_remision_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.detalle_remision_detalle_remision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6431 (class 0 OID 0)
-- Dependencies: 270
-- Name: detalle_remision_detalle_remision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.detalle_remision_detalle_remision_id_seq OWNED BY public.detalle_remision.detalle_remision_id;


--
-- TOC entry 271 (class 1259 OID 25921)
-- Name: diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostico (
    diagnostico_id integer NOT NULL,
    recepcion_id integer,
    fecha_diagnostico timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    tecnico_id integer NOT NULL,
    observacion text NOT NULL,
    estado_diagnostico public.estado_diagnostico_enum DEFAULT 'Pendiente'::public.estado_diagnostico_enum NOT NULL,
    visita_tecnica_id integer,
    tipo_diag_id integer NOT NULL,
    motivo text,
    CONSTRAINT chk_unica_relacion CHECK ((((recepcion_id IS NOT NULL) AND (visita_tecnica_id IS NULL)) OR ((recepcion_id IS NULL) AND (visita_tecnica_id IS NOT NULL))))
);




--
-- TOC entry 272 (class 1259 OID 25929)
-- Name: diagnostico_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diagnostico_detalle (
    detalle_id integer NOT NULL,
    diagnostico_id integer NOT NULL,
    equipo_id integer NOT NULL,
    observacion text,
    cantidad integer DEFAULT 1 NOT NULL,
    CONSTRAINT diagnostico_detalle_cantidad_check CHECK ((cantidad > 0))
);




--
-- TOC entry 273 (class 1259 OID 25936)
-- Name: diagnostico_detalle_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diagnostico_detalle_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6432 (class 0 OID 0)
-- Dependencies: 273
-- Name: diagnostico_detalle_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diagnostico_detalle_detalle_id_seq OWNED BY public.diagnostico_detalle.detalle_id;


--
-- TOC entry 274 (class 1259 OID 25937)
-- Name: diagnostico_diagnostico_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diagnostico_diagnostico_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6433 (class 0 OID 0)
-- Dependencies: 274
-- Name: diagnostico_diagnostico_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diagnostico_diagnostico_id_seq OWNED BY public.diagnostico.diagnostico_id;


--
-- TOC entry 275 (class 1259 OID 25938)
-- Name: empleados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empleados (
    id_empleado integer NOT NULL,
    nombre character varying(100) NOT NULL,
    cedula character varying(100),
    puesto character varying(50) NOT NULL,
    fecha_nacimiento date,
    fecha_contratacion date NOT NULL,
    direccion character varying(200),
    telefono character varying(15),
    email character varying(100),
    cont_emer_nombre character varying(50),
    cont_emer_numero character varying(20)
);




--
-- TOC entry 276 (class 1259 OID 25943)
-- Name: empleados_id_empleado_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empleados_id_empleado_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6434 (class 0 OID 0)
-- Dependencies: 276
-- Name: empleados_id_empleado_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empleados_id_empleado_seq OWNED BY public.empleados.id_empleado;


--
-- TOC entry 277 (class 1259 OID 25944)
-- Name: empresa; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.empresa (
    id integer NOT NULL,
    nombre character varying(250) NOT NULL,
    direccion character varying(250) NOT NULL,
    telefono text,
    email text,
    id_ciudad integer,
    ruc character varying(20) NOT NULL
);




--
-- TOC entry 278 (class 1259 OID 25949)
-- Name: empresa_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.empresa_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6435 (class 0 OID 0)
-- Dependencies: 278
-- Name: empresa_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.empresa_id_seq OWNED BY public.empresa.id;


--
-- TOC entry 279 (class 1259 OID 25950)
-- Name: entidad_emisora; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.entidad_emisora (
    entidad_emisora_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);




--
-- TOC entry 280 (class 1259 OID 25956)
-- Name: entidad_emisora_entidad_emisora_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.entidad_emisora_entidad_emisora_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6436 (class 0 OID 0)
-- Dependencies: 280
-- Name: entidad_emisora_entidad_emisora_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.entidad_emisora_entidad_emisora_id_seq OWNED BY public.entidad_emisora.entidad_emisora_id;


--
-- TOC entry 281 (class 1259 OID 25957)
-- Name: equipos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.equipos (
    equipo_id integer NOT NULL,
    tipo_equipo_id integer NOT NULL,
    numero_serie character varying(100) NOT NULL,
    estado character varying(50)
);




--
-- TOC entry 282 (class 1259 OID 25960)
-- Name: equipos_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.equipos_equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6437 (class 0 OID 0)
-- Dependencies: 282
-- Name: equipos_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.equipos_equipo_id_seq OWNED BY public.equipos.equipo_id;


--
-- TOC entry 283 (class 1259 OID 25961)
-- Name: factura_numero_factura_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.factura_numero_factura_seq
    START WITH 50
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 284 (class 1259 OID 25962)
-- Name: formas_cobro; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formas_cobro (
    forma_cobro_id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    activo boolean DEFAULT true
);




--
-- TOC entry 285 (class 1259 OID 25966)
-- Name: formas_cobro_forma_cobro_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formas_cobro_forma_cobro_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6438 (class 0 OID 0)
-- Dependencies: 285
-- Name: formas_cobro_forma_cobro_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formas_cobro_forma_cobro_id_seq OWNED BY public.formas_cobro.forma_cobro_id;


--
-- TOC entry 286 (class 1259 OID 25967)
-- Name: garantias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.garantias (
    garantia_id integer NOT NULL,
    orden_servicio_id integer NOT NULL,
    fecha_inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    fecha_fin timestamp without time zone NOT NULL,
    condiciones text
);




--
-- TOC entry 287 (class 1259 OID 25973)
-- Name: garantias_garantia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.garantias_garantia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6439 (class 0 OID 0)
-- Dependencies: 287
-- Name: garantias_garantia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.garantias_garantia_id_seq OWNED BY public.garantias.garantia_id;


--
-- TOC entry 288 (class 1259 OID 25974)
-- Name: impuestos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impuestos (
    impuesto_id integer NOT NULL,
    nombre character varying(255) NOT NULL,
    porcentaje numeric NOT NULL
);




--
-- TOC entry 289 (class 1259 OID 25979)
-- Name: impuestos_impuesto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.impuestos_impuesto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6440 (class 0 OID 0)
-- Dependencies: 289
-- Name: impuestos_impuesto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.impuestos_impuesto_id_seq OWNED BY public.impuestos.impuesto_id;


--
-- TOC entry 290 (class 1259 OID 25980)
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    inventario_id integer NOT NULL,
    producto_id integer NOT NULL,
    almacen_id integer NOT NULL,
    cantidad_disponible numeric(10,2),
    stock_minimo numeric(10,2),
    stock_maximo numeric(10,2) DEFAULT NULL::numeric,
    fecha_actualizacion timestamp without time zone DEFAULT now()
);




--
-- TOC entry 291 (class 1259 OID 25985)
-- Name: inventarios_inventario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.inventarios_inventario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6441 (class 0 OID 0)
-- Dependencies: 291
-- Name: inventarios_inventario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.inventarios_inventario_id_seq OWNED BY public.stock.inventario_id;


--
-- TOC entry 292 (class 1259 OID 25986)
-- Name: libro_compras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libro_compras (
    libro_compra_id integer NOT NULL,
    compra_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    proveedor_id integer NOT NULL,
    nro_factura character varying(50) NOT NULL,
    timbrado character varying(50),
    condicion_pago public.condicion_pago_enum,
    monto_exento numeric(12,2) DEFAULT 0,
    monto_iva_5 numeric(12,2) DEFAULT 0,
    monto_iva_10 numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) GENERATED ALWAYS AS (((monto_iva_5 / (21)::numeric) + (monto_iva_10 / (11)::numeric))) STORED,
    monto_compra numeric(12,2),
    tipo_doc_id integer NOT NULL
);




--
-- TOC entry 293 (class 1259 OID 25994)
-- Name: libro_compras_libro_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libro_compras_libro_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6442 (class 0 OID 0)
-- Dependencies: 293
-- Name: libro_compras_libro_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libro_compras_libro_compra_id_seq OWNED BY public.libro_compras.libro_compra_id;


--
-- TOC entry 294 (class 1259 OID 25995)
-- Name: libro_ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.libro_ventas (
    libro_venta_id integer NOT NULL,
    venta_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE NOT NULL,
    cliente_id integer NOT NULL,
    nro_factura character varying(50) NOT NULL,
    timbrado character varying(50),
    condicion_pago public.condicion_pago_enum,
    monto_exento numeric(12,2) DEFAULT 0,
    monto_iva_5 numeric(12,2) DEFAULT 0,
    monto_iva_10 numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) GENERATED ALWAYS AS (((monto_iva_5 / (21)::numeric) + (monto_iva_10 / (11)::numeric))) STORED,
    monto_venta numeric(12,2),
    tipo_doc_id integer NOT NULL
);




--
-- TOC entry 295 (class 1259 OID 26003)
-- Name: libro_ventas_libro_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.libro_ventas_libro_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6443 (class 0 OID 0)
-- Dependencies: 295
-- Name: libro_ventas_libro_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.libro_ventas_libro_venta_id_seq OWNED BY public.libro_ventas.libro_venta_id;


--
-- TOC entry 296 (class 1259 OID 26004)
-- Name: lista_precios_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lista_precios_detalle (
    lista_det_id integer NOT NULL,
    lista_id integer NOT NULL,
    producto_id integer NOT NULL,
    precio numeric(10,2) NOT NULL
);




--
-- TOC entry 297 (class 1259 OID 26007)
-- Name: lista_precios_detalle_lista_det_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lista_precios_detalle_lista_det_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6444 (class 0 OID 0)
-- Dependencies: 297
-- Name: lista_precios_detalle_lista_det_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lista_precios_detalle_lista_det_id_seq OWNED BY public.lista_precios_detalle.lista_det_id;


--
-- TOC entry 298 (class 1259 OID 26008)
-- Name: listas_precios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.listas_precios (
    lista_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    fecha_inicio date,
    fecha_fin date,
    activa boolean DEFAULT true
);




--
-- TOC entry 299 (class 1259 OID 26014)
-- Name: listas_precios_lista_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.listas_precios_lista_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6445 (class 0 OID 0)
-- Dependencies: 299
-- Name: listas_precios_lista_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.listas_precios_lista_id_seq OWNED BY public.listas_precios.lista_id;


--
-- TOC entry 419 (class 1259 OID 44668)
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    attempt_id integer NOT NULL,
    usuario_id integer,
    username character varying(100),
    ip_address character varying(45),
    user_agent text,
    attempt_time timestamp without time zone,
    success boolean,
    failure_reason character varying(100)
);




--
-- TOC entry 418 (class 1259 OID 44667)
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6446 (class 0 OID 0)
-- Dependencies: 418
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_attempts_attempt_id_seq OWNED BY public.login_attempts.attempt_id;


--
-- TOC entry 300 (class 1259 OID 26015)
-- Name: marca_tarjetas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marca_tarjetas (
    marca_tarjeta_id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    entidad_emisora_id integer NOT NULL,
    descripcion text,
    activo boolean DEFAULT true
);




--
-- TOC entry 301 (class 1259 OID 26021)
-- Name: marca_tarjetas_marca_tarjeta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marca_tarjetas_marca_tarjeta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6447 (class 0 OID 0)
-- Dependencies: 301
-- Name: marca_tarjetas_marca_tarjeta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marca_tarjetas_marca_tarjeta_id_seq OWNED BY public.marca_tarjetas.marca_tarjeta_id;


--
-- TOC entry 302 (class 1259 OID 26022)
-- Name: marcas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.marcas (
    marca_id integer NOT NULL,
    descripcion character varying(100)
);




--
-- TOC entry 303 (class 1259 OID 26025)
-- Name: marcas_marca_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.marcas_marca_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6448 (class 0 OID 0)
-- Dependencies: 303
-- Name: marcas_marca_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.marcas_marca_id_seq OWNED BY public.marcas.marca_id;


--
-- TOC entry 421 (class 1259 OID 44682)
-- Name: modulos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulos (
    modulo_id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    descripcion text,
    icono character varying(50),
    orden integer,
    activo boolean
);




--
-- TOC entry 420 (class 1259 OID 44681)
-- Name: modulos_modulo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modulos_modulo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6449 (class 0 OID 0)
-- Dependencies: 420
-- Name: modulos_modulo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modulos_modulo_id_seq OWNED BY public.modulos.modulo_id;


--
-- TOC entry 304 (class 1259 OID 26026)
-- Name: motivo_ajuste; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.motivo_ajuste (
    motivo_id integer NOT NULL,
    descripcion character varying(100) NOT NULL
);




--
-- TOC entry 305 (class 1259 OID 26029)
-- Name: motivo_ajuste_motivo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.motivo_ajuste_motivo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6450 (class 0 OID 0)
-- Dependencies: 305
-- Name: motivo_ajuste_motivo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.motivo_ajuste_motivo_id_seq OWNED BY public.motivo_ajuste.motivo_id;


--
-- TOC entry 306 (class 1259 OID 26030)
-- Name: motivo_cambios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.motivo_cambios (
    motivo_id integer NOT NULL,
    tipo_cambio character varying(20) NOT NULL,
    descripcion text NOT NULL
);




--
-- TOC entry 307 (class 1259 OID 26035)
-- Name: motivos_cambios_visita_motivo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.motivos_cambios_visita_motivo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6451 (class 0 OID 0)
-- Dependencies: 307
-- Name: motivos_cambios_visita_motivo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.motivos_cambios_visita_motivo_id_seq OWNED BY public.motivo_cambios.motivo_id;


--
-- TOC entry 308 (class 1259 OID 26036)
-- Name: movimientos_caja; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_caja (
    movimiento_id integer NOT NULL,
    caja_id integer NOT NULL,
    fecha timestamp without time zone DEFAULT now(),
    tipo_movimiento_id integer NOT NULL,
    monto numeric(12,2) NOT NULL,
    descripcion text,
    forma_pago_id integer,
    referencia_id integer,
    referencia_tipo character varying(50),
    usuario_id integer NOT NULL,
    CONSTRAINT movimientos_caja_monto_check CHECK ((monto > (0)::numeric))
);




--
-- TOC entry 309 (class 1259 OID 26043)
-- Name: movimientos_caja_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_caja_movimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6452 (class 0 OID 0)
-- Dependencies: 309
-- Name: movimientos_caja_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_caja_movimiento_id_seq OWNED BY public.movimientos_caja.movimiento_id;


--
-- TOC entry 310 (class 1259 OID 26044)
-- Name: movimientos_inventario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.movimientos_inventario (
    movimiento_id integer NOT NULL,
    tipo_movimiento public.tipo_movimiento_enum NOT NULL,
    cantidad numeric(10,2),
    fecha_movimiento timestamp without time zone DEFAULT now(),
    producto_id integer,
    almacen_id integer,
    detalle text,
    documento_id integer,
    usuario_id integer,
    tipo_doc_id integer
);




--
-- TOC entry 311 (class 1259 OID 26050)
-- Name: movimientos_inventario_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.movimientos_inventario_movimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6453 (class 0 OID 0)
-- Dependencies: 311
-- Name: movimientos_inventario_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.movimientos_inventario_movimiento_id_seq OWNED BY public.movimientos_inventario.movimiento_id;


--
-- TOC entry 312 (class 1259 OID 26051)
-- Name: nota_credito_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_credito_cabecera (
    nota_credito_id integer NOT NULL,
    tipo_operacion character varying(10) NOT NULL,
    proveedor_id integer,
    cliente_id integer,
    sucursal_id integer NOT NULL,
    almacen_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE,
    nro_nota character varying(50),
    motivo text,
    estado character varying(20) DEFAULT 'activo'::character varying,
    referencia_id integer NOT NULL,
    monto_nc numeric(12,2),
    monto_gravada_5 numeric(12,2) DEFAULT 0,
    monto_gravada_10 numeric(12,2) DEFAULT 0,
    monto_exenta numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) DEFAULT 0,
    CONSTRAINT nota_credito_cabecera_estado_check CHECK (((estado)::text = ANY (ARRAY[('activo'::character varying)::text, ('anulado'::character varying)::text]))),
    CONSTRAINT nota_credito_cabecera_tipo_operacion_check CHECK (((tipo_operacion)::text = ANY (ARRAY[('compra'::character varying)::text, ('venta'::character varying)::text])))
);




--
-- TOC entry 313 (class 1259 OID 26064)
-- Name: nota_credito_cabecera_nota_credito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_credito_cabecera_nota_credito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6454 (class 0 OID 0)
-- Dependencies: 313
-- Name: nota_credito_cabecera_nota_credito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_credito_cabecera_nota_credito_id_seq OWNED BY public.nota_credito_cabecera.nota_credito_id;


--
-- TOC entry 314 (class 1259 OID 26065)
-- Name: nota_credito_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_credito_detalle (
    nota_credito_detalle_id integer NOT NULL,
    nota_credito_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    precio_unitario numeric(12,2)
);




--
-- TOC entry 315 (class 1259 OID 26068)
-- Name: nota_credito_detalle_nota_credito_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_credito_detalle_nota_credito_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6455 (class 0 OID 0)
-- Dependencies: 315
-- Name: nota_credito_detalle_nota_credito_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_credito_detalle_nota_credito_detalle_id_seq OWNED BY public.nota_credito_detalle.nota_credito_detalle_id;


--
-- TOC entry 316 (class 1259 OID 26069)
-- Name: nota_debito_cabecera; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_debito_cabecera (
    nota_debito_id integer NOT NULL,
    tipo_operacion character varying(10) NOT NULL,
    proveedor_id integer,
    cliente_id integer,
    sucursal_id integer NOT NULL,
    almacen_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_registro date DEFAULT CURRENT_DATE,
    nro_nota character varying(50),
    motivo text,
    estado character varying(20) DEFAULT 'activo'::character varying,
    referencia_id integer NOT NULL,
    monto_nd numeric(12,2),
    monto_gravada_5 numeric(12,2) DEFAULT 0,
    monto_gravada_10 numeric(12,2) DEFAULT 0,
    monto_exenta numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) DEFAULT 0,
    CONSTRAINT nota_debito_cabecera_estado_check CHECK (((estado)::text = ANY (ARRAY[('activo'::character varying)::text, ('anulado'::character varying)::text]))),
    CONSTRAINT nota_debito_cabecera_tipo_operacion_check CHECK (((tipo_operacion)::text = ANY (ARRAY[('compra'::character varying)::text, ('venta'::character varying)::text])))
);




--
-- TOC entry 317 (class 1259 OID 26082)
-- Name: nota_debito_cabecera_nota_debito_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_debito_cabecera_nota_debito_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6456 (class 0 OID 0)
-- Dependencies: 317
-- Name: nota_debito_cabecera_nota_debito_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_debito_cabecera_nota_debito_id_seq OWNED BY public.nota_debito_cabecera.nota_debito_id;


--
-- TOC entry 318 (class 1259 OID 26083)
-- Name: nota_debito_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_debito_detalle (
    nota_debito_detalle_id integer NOT NULL,
    nota_debito_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    precio_unitario numeric(12,2)
);




--
-- TOC entry 319 (class 1259 OID 26086)
-- Name: nota_debito_detalle_nota_debito_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_debito_detalle_nota_debito_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6457 (class 0 OID 0)
-- Dependencies: 319
-- Name: nota_debito_detalle_nota_debito_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_debito_detalle_nota_debito_detalle_id_seq OWNED BY public.nota_debito_detalle.nota_debito_detalle_id;


--
-- TOC entry 320 (class 1259 OID 26087)
-- Name: nota_remision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_remision (
    remision_id integer NOT NULL,
    fecha_remision date DEFAULT CURRENT_DATE,
    usuario_id integer NOT NULL,
    origen_almacen_id integer NOT NULL,
    destino_sucursal_id integer,
    destino_almacen_id integer,
    tipo_remision character varying(20) NOT NULL,
    referencia_id integer,
    estado character varying(20) DEFAULT 'activo'::character varying,
    observaciones text,
    CONSTRAINT chk_destino CHECK (((((tipo_remision)::text = ANY (ARRAY[('compra'::character varying)::text, ('venta'::character varying)::text])) AND (destino_sucursal_id IS NOT NULL) AND (destino_almacen_id IS NULL)) OR (((tipo_remision)::text = 'transferencia'::text) AND (destino_almacen_id IS NOT NULL) AND (destino_sucursal_id IS NULL)))),
    CONSTRAINT nota_remision_estado_check CHECK (((estado)::text = ANY (ARRAY[('activo'::character varying)::text, ('anulado'::character varying)::text]))),
    CONSTRAINT nota_remision_tipo_remision_check CHECK (((tipo_remision)::text = ANY (ARRAY[('compra'::character varying)::text, ('venta'::character varying)::text, ('transferencia'::character varying)::text])))
);




--
-- TOC entry 321 (class 1259 OID 26097)
-- Name: nota_remision_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nota_remision_detalle (
    detalle_id integer NOT NULL,
    remision_id integer,
    producto_id integer,
    cantidad integer NOT NULL
);




--
-- TOC entry 322 (class 1259 OID 26100)
-- Name: nota_remision_detalle_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_remision_detalle_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6458 (class 0 OID 0)
-- Dependencies: 322
-- Name: nota_remision_detalle_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_remision_detalle_detalle_id_seq OWNED BY public.nota_remision_detalle.detalle_id;


--
-- TOC entry 323 (class 1259 OID 26101)
-- Name: nota_remision_remision_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nota_remision_remision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6459 (class 0 OID 0)
-- Dependencies: 323
-- Name: nota_remision_remision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nota_remision_remision_id_seq OWNED BY public.nota_remision.remision_id;


--
-- TOC entry 324 (class 1259 OID 26102)
-- Name: orden_compra_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden_compra_detalle (
    orden_compra_detalle_id integer NOT NULL,
    orden_compra_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer,
    precio_unitario numeric(12,2)
);




--
-- TOC entry 325 (class 1259 OID 26105)
-- Name: orden_compra_detalle_orden_compra_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_compra_detalle_orden_compra_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6460 (class 0 OID 0)
-- Dependencies: 325
-- Name: orden_compra_detalle_orden_compra_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orden_compra_detalle_orden_compra_detalle_id_seq OWNED BY public.orden_compra_detalle.orden_compra_detalle_id;


--
-- TOC entry 326 (class 1259 OID 26106)
-- Name: orden_servicio_orden_servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_servicio_orden_servicio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 327 (class 1259 OID 26107)
-- Name: orden_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden_servicio (
    orden_servicio_id integer DEFAULT nextval('public.orden_servicio_orden_servicio_id_seq'::regclass) NOT NULL,
    fecha_solicitud date DEFAULT now(),
    usuario_id integer,
    estado public.estado_ord_serv DEFAULT 'pendiente'::public.estado_ord_serv,
    monto_servicio numeric(10,2),
    observaciones text,
    monto_final numeric(10,2),
    tecnico_id integer,
    presu_serv_id integer,
    forma_cobro_id integer,
    fecha_ejecucion date,
    impresa boolean DEFAULT false
);




--
-- TOC entry 328 (class 1259 OID 26116)
-- Name: orden_servicio_detalle_serv_deta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_servicio_detalle_serv_deta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 329 (class 1259 OID 26117)
-- Name: orden_servicio_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden_servicio_detalle (
    serv_deta_id integer DEFAULT nextval('public.orden_servicio_detalle_serv_deta_id_seq'::regclass) NOT NULL,
    orden_servicio_id integer,
    servicio_id integer,
    cantidad integer,
    precio_unitario numeric(10,2)
);




--
-- TOC entry 330 (class 1259 OID 26121)
-- Name: orden_servicio_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.orden_servicio_productos (
    or_ser_prod_id integer NOT NULL,
    orden_servicio_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2)
);




--
-- TOC entry 331 (class 1259 OID 26124)
-- Name: orden_servicio_productos_or_ser_prod_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.orden_servicio_productos_or_ser_prod_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6461 (class 0 OID 0)
-- Dependencies: 331
-- Name: orden_servicio_productos_or_ser_prod_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.orden_servicio_productos_or_ser_prod_id_seq OWNED BY public.orden_servicio_productos.or_ser_prod_id;


--
-- TOC entry 332 (class 1259 OID 26125)
-- Name: ordenes_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ordenes_compra (
    orden_compra_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    usuario_id integer,
    presu_prov_id integer,
    fecha_orden date DEFAULT CURRENT_DATE NOT NULL,
    estado public.estado_orden_compra DEFAULT 'pendiente'::public.estado_orden_compra NOT NULL,
    monto_oc numeric(12,2),
    observaciones text,
    almacen_id integer,
    nro_comprobante character varying(50)
);




--
-- TOC entry 333 (class 1259 OID 26132)
-- Name: ordenes_compra_orden_compra_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ordenes_compra_orden_compra_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6462 (class 0 OID 0)
-- Dependencies: 333
-- Name: ordenes_compra_orden_compra_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ordenes_compra_orden_compra_id_seq OWNED BY public.ordenes_compra.orden_compra_id;


--
-- TOC entry 334 (class 1259 OID 26133)
-- Name: pagos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pagos (
    pago_id integer NOT NULL,
    cuenta_pagar_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    usuario_id integer NOT NULL,
    fecha_pago date DEFAULT CURRENT_DATE,
    monto_pagado numeric(12,2) NOT NULL,
    metodo_pago character varying(50),
    nro_comprobante character varying(50),
    observaciones text
);




--
-- TOC entry 335 (class 1259 OID 26139)
-- Name: pagos_pago_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pagos_pago_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6463 (class 0 OID 0)
-- Dependencies: 335
-- Name: pagos_pago_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pagos_pago_id_seq OWNED BY public.pagos.pago_id;


--
-- TOC entry 423 (class 1259 OID 44693)
-- Name: password_reset_tokens; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.password_reset_tokens (
    token_id integer NOT NULL,
    usuario_id integer,
    token character varying(255) NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    used boolean,
    created_at timestamp without time zone
);




--
-- TOC entry 422 (class 1259 OID 44692)
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.password_reset_tokens_token_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6464 (class 0 OID 0)
-- Dependencies: 422
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.password_reset_tokens_token_id_seq OWNED BY public.password_reset_tokens.token_id;


--
-- TOC entry 336 (class 1259 OID 26140)
-- Name: pedido_compra; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_compra (
    pedido_compra_id integer NOT NULL,
    fecha_pedido date DEFAULT CURRENT_DATE,
    estado public.estado_pedido_p DEFAULT 'pendiente'::public.estado_pedido_p,
    usuario_id integer,
    comentario text,
    sucursal_id integer,
    almacen_id integer,
    nro_comprobante character varying(50)
);




--
-- TOC entry 337 (class 1259 OID 26147)
-- Name: pedido_proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.pedido_proveedor (
    pedido_prov_id integer NOT NULL,
    pedido_compra_id integer NOT NULL,
    proveedor_id integer NOT NULL,
    fecha_envio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    usuario_id integer NOT NULL
);




--
-- TOC entry 338 (class 1259 OID 26151)
-- Name: pedido_proveedor_p_proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_proveedor_p_proveedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6465 (class 0 OID 0)
-- Dependencies: 338
-- Name: pedido_proveedor_p_proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_proveedor_p_proveedor_id_seq OWNED BY public.pedido_compra.pedido_compra_id;


--
-- TOC entry 339 (class 1259 OID 26152)
-- Name: pedido_proveedor_pedido_prov_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedido_proveedor_pedido_prov_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6466 (class 0 OID 0)
-- Dependencies: 339
-- Name: pedido_proveedor_pedido_prov_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedido_proveedor_pedido_prov_id_seq OWNED BY public.pedido_proveedor.pedido_prov_id;


--
-- TOC entry 340 (class 1259 OID 26153)
-- Name: pedidos_proveedor_detalles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.pedidos_proveedor_detalles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6467 (class 0 OID 0)
-- Dependencies: 340
-- Name: pedidos_proveedor_detalles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.pedidos_proveedor_detalles_id_seq OWNED BY public.detalle_pedido_compra.ped_compra_det_id;


--
-- TOC entry 341 (class 1259 OID 26154)
-- Name: permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.permisos (
    permiso_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    id integer NOT NULL
);




--
-- TOC entry 417 (class 1259 OID 35939)
-- Name: permisos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6468 (class 0 OID 0)
-- Dependencies: 417
-- Name: permisos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_id_seq OWNED BY public.permisos.id;


--
-- TOC entry 342 (class 1259 OID 26159)
-- Name: permisos_permiso_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.permisos_permiso_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6469 (class 0 OID 0)
-- Dependencies: 342
-- Name: permisos_permiso_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.permisos_permiso_id_seq OWNED BY public.permisos.permiso_id;


--
-- TOC entry 343 (class 1259 OID 26160)
-- Name: presupuesto_producto_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuesto_producto_detalle (
    det_pres_producto_id integer NOT NULL,
    presu_serv_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(10,2) NOT NULL,
    precio_unitario numeric(10,2) NOT NULL
);




--
-- TOC entry 344 (class 1259 OID 26163)
-- Name: presupuesto_producto_detalle_det_pres_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuesto_producto_detalle_det_pres_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6470 (class 0 OID 0)
-- Dependencies: 344
-- Name: presupuesto_producto_detalle_det_pres_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuesto_producto_detalle_det_pres_producto_id_seq OWNED BY public.presupuesto_producto_detalle.det_pres_producto_id;


--
-- TOC entry 345 (class 1259 OID 26164)
-- Name: presupuesto_proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuesto_proveedor (
    presu_prov_id integer NOT NULL,
    usuario_id integer,
    fecha_presupuesto date DEFAULT CURRENT_DATE,
    estado public.estado_presupuesto DEFAULT 'nuevo'::public.estado_presupuesto NOT NULL,
    observaciones text,
    monto_presu_prov numeric(12,2),
    nro_comprobante character varying(50),
    pedido_prov_id integer
);




--
-- TOC entry 346 (class 1259 OID 26171)
-- Name: presupuesto_servicio_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuesto_servicio_detalle (
    det_pres_serv_id integer NOT NULL,
    presu_serv_id integer NOT NULL,
    servicio_id integer NOT NULL,
    cantidad integer NOT NULL,
    precio_unitario numeric(10,2) NOT NULL,
    CONSTRAINT presupuesto_servicio_detalle_cantidad_check CHECK ((cantidad > 0))
);




--
-- TOC entry 347 (class 1259 OID 26175)
-- Name: presupuesto_servicio_detalle_det_pres_serv_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuesto_servicio_detalle_det_pres_serv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6471 (class 0 OID 0)
-- Dependencies: 347
-- Name: presupuesto_servicio_detalle_det_pres_serv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuesto_servicio_detalle_det_pres_serv_id_seq OWNED BY public.presupuesto_servicio_detalle.det_pres_serv_id;


--
-- TOC entry 348 (class 1259 OID 26176)
-- Name: presupuesto_servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.presupuesto_servicios (
    presu_serv_id integer NOT NULL,
    fecha_presupuesto date DEFAULT CURRENT_DATE,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    monto_presu_ser numeric(10,2) DEFAULT 0.00,
    observaciones text,
    descuento_id integer,
    usuario_id integer,
    sucursal_id integer,
    promocion_id integer,
    nro_presupuesto character varying(50),
    diagnostico_id integer,
    valido_desde date,
    valido_hasta date,
    tipo_presu public.tipo_presupuesto_enum DEFAULT 'con_diagnostico'::public.tipo_presupuesto_enum NOT NULL,
    CONSTRAINT chk_estado CHECK (((estado)::text = ANY (ARRAY[('pendiente'::character varying)::text, ('aprobado'::character varying)::text, ('rechazado'::character varying)::text])))
);




--
-- TOC entry 349 (class 1259 OID 26186)
-- Name: presupuesto_servicios_presu_serv_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuesto_servicios_presu_serv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6472 (class 0 OID 0)
-- Dependencies: 349
-- Name: presupuesto_servicios_presu_serv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuesto_servicios_presu_serv_id_seq OWNED BY public.presupuesto_servicios.presu_serv_id;


--
-- TOC entry 350 (class 1259 OID 26187)
-- Name: presupuestos_compra_presupuesto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.presupuestos_compra_presupuesto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6473 (class 0 OID 0)
-- Dependencies: 350
-- Name: presupuestos_compra_presupuesto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.presupuestos_compra_presupuesto_id_seq OWNED BY public.presupuesto_proveedor.presu_prov_id;


--
-- TOC entry 351 (class 1259 OID 26188)
-- Name: productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.productos (
    producto_id integer NOT NULL,
    nombre_producto character varying(100) NOT NULL,
    descripcion_producto character varying(250),
    precio_unitario numeric,
    stock integer DEFAULT 0 NOT NULL,
    categoria_id integer,
    impuesto_id integer,
    precio_costo numeric(10,2),
    precio_venta numeric(10,2),
    stock_minimo numeric,
    stock_maximo numeric,
    marca_id integer,
    unidad_id integer,
    cod_product integer,
    estado boolean DEFAULT true
);




--
-- TOC entry 352 (class 1259 OID 26195)
-- Name: productos_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.productos_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6474 (class 0 OID 0)
-- Dependencies: 352
-- Name: productos_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.productos_producto_id_seq OWNED BY public.productos.producto_id;


--
-- TOC entry 353 (class 1259 OID 26196)
-- Name: promociones_aplicadas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promociones_aplicadas (
    promo_aplicada_id integer NOT NULL,
    tipo_promo_id integer NOT NULL,
    monto_beneficio numeric(10,2) NOT NULL,
    fecha_aplicacion timestamp without time zone DEFAULT now(),
    usuario_id integer NOT NULL,
    origen_tipo character varying(50) NOT NULL,
    origen_id integer NOT NULL
);




--
-- TOC entry 354 (class 1259 OID 26200)
-- Name: promociones_aplicadas_promo_aplicada_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promociones_aplicadas_promo_aplicada_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6475 (class 0 OID 0)
-- Dependencies: 354
-- Name: promociones_aplicadas_promo_aplicada_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promociones_aplicadas_promo_aplicada_id_seq OWNED BY public.promociones_aplicadas.promo_aplicada_id;


--
-- TOC entry 355 (class 1259 OID 26201)
-- Name: proveedores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.proveedores (
    proveedor_id integer NOT NULL,
    nombre_proveedor character varying(200) NOT NULL,
    correo character varying(200),
    telefono character varying(20),
    ruc character varying(20),
    direccion text,
    ciudad_id integer,
    usuario_id integer
);




--
-- TOC entry 356 (class 1259 OID 26206)
-- Name: proveedores_proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.proveedores_proveedor_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6476 (class 0 OID 0)
-- Dependencies: 356
-- Name: proveedores_proveedor_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.proveedores_proveedor_id_seq OWNED BY public.proveedores.proveedor_id;


--
-- TOC entry 357 (class 1259 OID 26207)
-- Name: recaudaciones_a_depositar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recaudaciones_a_depositar (
    recaudacion_id integer NOT NULL,
    arqueo_id integer NOT NULL,
    usuario_id integer NOT NULL,
    forma_cobro_id integer NOT NULL,
    monto numeric(12,2) NOT NULL,
    fecha timestamp without time zone DEFAULT now() NOT NULL,
    estado public.estado_recaudacion_enum DEFAULT 'pendiente'::public.estado_recaudacion_enum,
    fecha_deposito timestamp without time zone,
    cuenta_id integer
);




--
-- TOC entry 358 (class 1259 OID 26212)
-- Name: recaudaciones_a_depositar_recaudacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recaudaciones_a_depositar_recaudacion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6477 (class 0 OID 0)
-- Dependencies: 358
-- Name: recaudaciones_a_depositar_recaudacion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recaudaciones_a_depositar_recaudacion_id_seq OWNED BY public.recaudaciones_a_depositar.recaudacion_id;


--
-- TOC entry 359 (class 1259 OID 26213)
-- Name: recepcion_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepcion_equipo (
    recepcion_id integer NOT NULL,
    fecha_recepcion timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    usuario_id integer NOT NULL,
    sucursal_id integer NOT NULL,
    estado_recepcion public.estado_recepcion_enum_new NOT NULL,
    observaciones text,
    nro_recepcion character varying(50),
    solicitud_id integer
);




--
-- TOC entry 360 (class 1259 OID 26219)
-- Name: recepcion_equipo_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recepcion_equipo_detalle (
    detalle_id integer NOT NULL,
    recepcion_id integer NOT NULL,
    equipo_id integer NOT NULL,
    cantidad integer DEFAULT 1,
    observaciones text
);




--
-- TOC entry 361 (class 1259 OID 26225)
-- Name: recepcion_equipo_detalle_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recepcion_equipo_detalle_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6478 (class 0 OID 0)
-- Dependencies: 361
-- Name: recepcion_equipo_detalle_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recepcion_equipo_detalle_detalle_id_seq OWNED BY public.recepcion_equipo_detalle.detalle_id;


--
-- TOC entry 362 (class 1259 OID 26226)
-- Name: recepcion_equipo_recepcion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recepcion_equipo_recepcion_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6479 (class 0 OID 0)
-- Dependencies: 362
-- Name: recepcion_equipo_recepcion_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recepcion_equipo_recepcion_id_seq OWNED BY public.recepcion_equipo.recepcion_id;


--
-- TOC entry 363 (class 1259 OID 26227)
-- Name: reclamos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.reclamos (
    reclamo_id integer NOT NULL,
    cliente_id integer NOT NULL,
    orden_servicio_id integer,
    fecha_reclamo timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recibido_por integer NOT NULL,
    gestionado_por integer,
    descripcion text NOT NULL,
    resolucion text,
    fecha_resolucion timestamp without time zone,
    observaciones text,
    estado public.estado_reclamo_enum DEFAULT 'pendiente'::public.estado_reclamo_enum NOT NULL
);




--
-- TOC entry 364 (class 1259 OID 26234)
-- Name: reclamos_reclamo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.reclamos_reclamo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6480 (class 0 OID 0)
-- Dependencies: 364
-- Name: reclamos_reclamo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.reclamos_reclamo_id_seq OWNED BY public.reclamos.reclamo_id;


--
-- TOC entry 365 (class 1259 OID 26235)
-- Name: rol_permisos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.rol_permisos (
    rol_id integer NOT NULL,
    permiso_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);




--
-- TOC entry 366 (class 1259 OID 26238)
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    rol_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion character varying(255),
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone,
    id integer NOT NULL
);




--
-- TOC entry 416 (class 1259 OID 35928)
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6481 (class 0 OID 0)
-- Dependencies: 416
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- TOC entry 367 (class 1259 OID 26241)
-- Name: roles_rol_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_rol_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6482 (class 0 OID 0)
-- Dependencies: 367
-- Name: roles_rol_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_rol_id_seq OWNED BY public.roles.rol_id;


--
-- TOC entry 368 (class 1259 OID 26242)
-- Name: salida_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.salida_equipo (
    salida_id integer NOT NULL,
    recepcion_id integer NOT NULL,
    fecha_salida timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    entregado_por integer NOT NULL,
    retirado_por character varying(100),
    documento_entrega character varying(50),
    observaciones text
);




--
-- TOC entry 369 (class 1259 OID 26248)
-- Name: salida_equipo_salida_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.salida_equipo_salida_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6483 (class 0 OID 0)
-- Dependencies: 369
-- Name: salida_equipo_salida_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.salida_equipo_salida_id_seq OWNED BY public.salida_equipo.salida_id;


--
-- TOC entry 429 (class 1259 OID 44728)
-- Name: security_alerts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.security_alerts (
    alert_id integer NOT NULL,
    alert_type character varying(50) NOT NULL,
    usuario_id integer,
    ip_address character varying(45),
    descripcion text,
    fecha_hora timestamp without time zone,
    severity character varying(20),
    resuelto boolean,
    email_sent boolean
);




--
-- TOC entry 428 (class 1259 OID 44727)
-- Name: security_alerts_alert_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.security_alerts_alert_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6484 (class 0 OID 0)
-- Dependencies: 428
-- Name: security_alerts_alert_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.security_alerts_alert_id_seq OWNED BY public.security_alerts.alert_id;


--
-- TOC entry 370 (class 1259 OID 26249)
-- Name: servicio_productos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicio_productos (
    servicio_producto_id integer NOT NULL,
    servicio_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric DEFAULT 0
);




--
-- TOC entry 371 (class 1259 OID 26255)
-- Name: servicio_productos_servicio_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicio_productos_servicio_producto_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6485 (class 0 OID 0)
-- Dependencies: 371
-- Name: servicio_productos_servicio_producto_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servicio_productos_servicio_producto_id_seq OWNED BY public.servicio_productos.servicio_producto_id;


--
-- TOC entry 372 (class 1259 OID 26256)
-- Name: servicios_servicio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servicios_servicio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 373 (class 1259 OID 26257)
-- Name: servicios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servicios (
    servicio_id integer DEFAULT nextval('public.servicios_servicio_id_seq'::regclass) NOT NULL,
    nombre character varying(50),
    descripcion text,
    precio_base numeric(10,2),
    tipo_serv_id integer
);




--
-- TOC entry 374 (class 1259 OID 26263)
-- Name: solicitud_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_servicio (
    solicitud_id integer NOT NULL,
    fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    cliente_id integer NOT NULL,
    direccion text NOT NULL,
    sucursal_id integer NOT NULL,
    descripcion_problema text,
    recepcionado_por integer NOT NULL,
    fecha_programada timestamp without time zone,
    estado_solicitud public.estado_solicitud_enum DEFAULT 'Pendiente'::public.estado_solicitud_enum NOT NULL,
    observaciones text,
    ciudad_id integer,
    nro_solicitud character varying(50),
    tipo_atencion public.tipo_atencion_enum DEFAULT 'Visita'::public.tipo_atencion_enum NOT NULL
);




--
-- TOC entry 375 (class 1259 OID 26271)
-- Name: solicitud_servicio_det; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.solicitud_servicio_det (
    detalle_id integer NOT NULL,
    solicitud_id integer NOT NULL,
    servicio_id integer NOT NULL,
    cantidad integer DEFAULT 1,
    precio_unitario numeric(10,2),
    observaciones text
);




--
-- TOC entry 376 (class 1259 OID 26277)
-- Name: solicitud_servicio_det_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_servicio_det_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6486 (class 0 OID 0)
-- Dependencies: 376
-- Name: solicitud_servicio_det_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_servicio_det_detalle_id_seq OWNED BY public.solicitud_servicio_det.detalle_id;


--
-- TOC entry 377 (class 1259 OID 26278)
-- Name: solicitud_servicio_solicitud_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.solicitud_servicio_solicitud_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6487 (class 0 OID 0)
-- Dependencies: 377
-- Name: solicitud_servicio_solicitud_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.solicitud_servicio_solicitud_id_seq OWNED BY public.solicitud_servicio.solicitud_id;


--
-- TOC entry 378 (class 1259 OID 26279)
-- Name: subtipo_diagnostico; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.subtipo_diagnostico (
    subtipo_id integer NOT NULL,
    tipo_diag_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text
);




--
-- TOC entry 379 (class 1259 OID 26284)
-- Name: subtipo_diagnostico_subtipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.subtipo_diagnostico_subtipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6488 (class 0 OID 0)
-- Dependencies: 379
-- Name: subtipo_diagnostico_subtipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.subtipo_diagnostico_subtipo_id_seq OWNED BY public.subtipo_diagnostico.subtipo_id;


--
-- TOC entry 380 (class 1259 OID 26285)
-- Name: sucursales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sucursales (
    sucursal_id integer NOT NULL,
    nombre character varying(250) NOT NULL,
    direccion character varying(250),
    telefono text,
    email text,
    id_ciudad integer,
    id_empresa integer NOT NULL
);




--
-- TOC entry 381 (class 1259 OID 26290)
-- Name: sucursales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sucursales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6489 (class 0 OID 0)
-- Dependencies: 381
-- Name: sucursales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sucursales_id_seq OWNED BY public.sucursales.sucursal_id;


--
-- TOC entry 382 (class 1259 OID 26291)
-- Name: timbrados; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.timbrados (
    timbrado_id integer NOT NULL,
    numero character varying(50) NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    sucursal_id integer NOT NULL,
    punto_expedicion character varying(3) NOT NULL,
    establecimiento character varying(3) NOT NULL,
    nro_desde integer DEFAULT 1 NOT NULL,
    nro_hasta integer NOT NULL,
    activo boolean DEFAULT true
);




--
-- TOC entry 383 (class 1259 OID 26296)
-- Name: timbrados_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.timbrados_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6490 (class 0 OID 0)
-- Dependencies: 383
-- Name: timbrados_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.timbrados_id_seq OWNED BY public.timbrados.timbrado_id;


--
-- TOC entry 384 (class 1259 OID 26297)
-- Name: tipo_descuentos_sucursales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_descuentos_sucursales (
    tipo_descuento_id integer NOT NULL,
    sucursal_id integer NOT NULL
);




--
-- TOC entry 385 (class 1259 OID 26300)
-- Name: tipo_diagnosticos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_diagnosticos (
    tipo_diag_id integer NOT NULL,
    descripcion character varying(150),
    activo boolean DEFAULT true,
    nombre character varying(100)
);




--
-- TOC entry 386 (class 1259 OID 26304)
-- Name: tipo_diagnosticos_tipo_diag_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_diagnosticos_tipo_diag_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6491 (class 0 OID 0)
-- Dependencies: 386
-- Name: tipo_diagnosticos_tipo_diag_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_diagnosticos_tipo_diag_id_seq OWNED BY public.tipo_diagnosticos.tipo_diag_id;


--
-- TOC entry 387 (class 1259 OID 26305)
-- Name: tipo_documento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_documento (
    tipo_doc_id integer NOT NULL,
    descripcion character varying(100) NOT NULL
);




--
-- TOC entry 388 (class 1259 OID 26308)
-- Name: tipo_documento_tipo_doc_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_documento_tipo_doc_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6492 (class 0 OID 0)
-- Dependencies: 388
-- Name: tipo_documento_tipo_doc_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_documento_tipo_doc_id_seq OWNED BY public.tipo_documento.tipo_doc_id;


--
-- TOC entry 389 (class 1259 OID 26309)
-- Name: tipo_equipo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_equipo (
    tipo_equipo_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    activo boolean DEFAULT true,
    descripcion character varying(150)
);




--
-- TOC entry 390 (class 1259 OID 26313)
-- Name: tipo_equipo_tipo_equipo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_equipo_tipo_equipo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6493 (class 0 OID 0)
-- Dependencies: 390
-- Name: tipo_equipo_tipo_equipo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_equipo_tipo_equipo_id_seq OWNED BY public.tipo_equipo.tipo_equipo_id;


--
-- TOC entry 391 (class 1259 OID 26314)
-- Name: tipo_movimiento; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_movimiento (
    tipo_movimiento_id integer NOT NULL,
    nombre character varying(50) NOT NULL
);




--
-- TOC entry 392 (class 1259 OID 26317)
-- Name: tipo_movimiento_tipo_movimiento_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_movimiento_tipo_movimiento_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6494 (class 0 OID 0)
-- Dependencies: 392
-- Name: tipo_movimiento_tipo_movimiento_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_movimiento_tipo_movimiento_id_seq OWNED BY public.tipo_movimiento.tipo_movimiento_id;


--
-- TOC entry 393 (class 1259 OID 26318)
-- Name: tipo_promociones; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_promociones (
    tipo_promo_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    descripcion text NOT NULL,
    tipo_promo character varying(50) NOT NULL,
    valor_beneficio numeric(10,2) DEFAULT 0.00,
    tipo_valor character varying(20) DEFAULT 'porcentaje'::character varying NOT NULL,
    fecha_inicio date NOT NULL,
    fecha_fin date,
    activo boolean DEFAULT true,
    usuario_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    nro_promocion character varying(50),
    global boolean DEFAULT false
);




--
-- TOC entry 394 (class 1259 OID 26328)
-- Name: tipo_promociones_sucursales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_promociones_sucursales (
    tipo_promo_id integer NOT NULL,
    sucursal_id integer NOT NULL
);




--
-- TOC entry 395 (class 1259 OID 26331)
-- Name: tipo_promociones_tipo_promo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_promociones_tipo_promo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6495 (class 0 OID 0)
-- Dependencies: 395
-- Name: tipo_promociones_tipo_promo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_promociones_tipo_promo_id_seq OWNED BY public.tipo_promociones.tipo_promo_id;


--
-- TOC entry 396 (class 1259 OID 26332)
-- Name: tipo_servicio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tipo_servicio (
    tipo_serv_id integer NOT NULL,
    descripcion character varying(50),
    nombre character varying(10),
    activo boolean DEFAULT true
);




--
-- TOC entry 397 (class 1259 OID 26336)
-- Name: tipo_servicio_tipo_serv_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tipo_servicio_tipo_serv_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6496 (class 0 OID 0)
-- Dependencies: 397
-- Name: tipo_servicio_tipo_serv_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tipo_servicio_tipo_serv_id_seq OWNED BY public.tipo_servicio.tipo_serv_id;


--
-- TOC entry 398 (class 1259 OID 26337)
-- Name: transferencia_stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transferencia_stock (
    transferencia_id integer NOT NULL,
    fecha date DEFAULT CURRENT_DATE,
    usuario_id integer,
    almacen_origen_id integer,
    almacen_destino_id integer,
    estado character varying(20) DEFAULT 'pendiente'::character varying,
    motivo text
);




--
-- TOC entry 399 (class 1259 OID 26344)
-- Name: transferencia_stock_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.transferencia_stock_detalle (
    transferencia_detalle_id integer NOT NULL,
    transferencia_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(12,2) NOT NULL,
    observaciones text,
    CONSTRAINT transferencia_stock_detalle_cantidad_check CHECK ((cantidad > (0)::numeric))
);




--
-- TOC entry 400 (class 1259 OID 26350)
-- Name: transferencia_stock_detalle_transferencia_detalle_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transferencia_stock_detalle_transferencia_detalle_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6497 (class 0 OID 0)
-- Dependencies: 400
-- Name: transferencia_stock_detalle_transferencia_detalle_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transferencia_stock_detalle_transferencia_detalle_id_seq OWNED BY public.transferencia_stock_detalle.transferencia_detalle_id;


--
-- TOC entry 401 (class 1259 OID 26351)
-- Name: transferencia_stock_transferencia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.transferencia_stock_transferencia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6498 (class 0 OID 0)
-- Dependencies: 401
-- Name: transferencia_stock_transferencia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.transferencia_stock_transferencia_id_seq OWNED BY public.transferencia_stock.transferencia_id;


--
-- TOC entry 402 (class 1259 OID 26352)
-- Name: unidades_medida; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.unidades_medida (
    unidad_id integer NOT NULL,
    nombre character varying(50) NOT NULL,
    abreviatura character varying(10) NOT NULL
);




--
-- TOC entry 403 (class 1259 OID 26355)
-- Name: unidades_medida_unidad_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.unidades_medida_unidad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6499 (class 0 OID 0)
-- Dependencies: 403
-- Name: unidades_medida_unidad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.unidades_medida_unidad_id_seq OWNED BY public.unidades_medida.unidad_id;


--
-- TOC entry 415 (class 1259 OID 35910)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(80) NOT NULL,
    email character varying(120) NOT NULL,
    password_hash character varying(128),
    two_factor_secret character varying(16)
);




--
-- TOC entry 414 (class 1259 OID 35909)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6500 (class 0 OID 0)
-- Dependencies: 414
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 404 (class 1259 OID 26356)
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    usuario_id integer NOT NULL,
    nombre character varying(100) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(200) NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    rol_id integer,
    id_empleado integer,
    username character varying(50) NOT NULL,
    activo boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_by integer,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_by integer,
    is_deleted boolean DEFAULT false,
    deleted_at timestamp without time zone,
    deleted_by integer,
    audit_data json,
    failed_attempts integer DEFAULT 0,
    locked_until timestamp without time zone,
    last_login_attempt timestamp without time zone,
    password_changed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    totp_secret character varying(32),
    is_2fa_enabled boolean DEFAULT false
);




--
-- TOC entry 405 (class 1259 OID 26360)
-- Name: usuarios_sucursales; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios_sucursales (
    id integer NOT NULL,
    id_usuario integer NOT NULL,
    id_sucursal integer NOT NULL
);




--
-- TOC entry 406 (class 1259 OID 26363)
-- Name: usuarios_sucursales_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_sucursales_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6501 (class 0 OID 0)
-- Dependencies: 406
-- Name: usuarios_sucursales_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_sucursales_id_seq OWNED BY public.usuarios_sucursales.id;


--
-- TOC entry 407 (class 1259 OID 26364)
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6502 (class 0 OID 0)
-- Dependencies: 407
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_usuario_id_seq OWNED BY public.usuarios.usuario_id;


--
-- TOC entry 431 (class 1259 OID 44742)
-- Name: ventanas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventanas (
    ventana_id integer NOT NULL,
    modulo_id integer,
    nombre character varying(100) NOT NULL,
    ruta character varying(200),
    icono character varying(50),
    orden integer,
    activo boolean
);




--
-- TOC entry 430 (class 1259 OID 44741)
-- Name: ventanas_ventana_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventanas_ventana_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6503 (class 0 OID 0)
-- Dependencies: 430
-- Name: ventanas_ventana_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventanas_ventana_id_seq OWNED BY public.ventanas.ventana_id;


--
-- TOC entry 408 (class 1259 OID 26365)
-- Name: ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas (
    venta_id integer NOT NULL,
    cliente_id integer,
    fecha_venta date DEFAULT now(),
    estado public.estado_venta DEFAULT 'abierto'::public.estado_venta,
    tipo_documento character varying(20),
    monto_venta numeric(10,2),
    caja_id integer,
    tipo_doc_id integer,
    nro_factura integer,
    forma_cobro_id integer,
    monto_gravada_5 numeric(12,2) DEFAULT 0,
    monto_gravada_10 numeric(12,2) DEFAULT 0,
    monto_exenta numeric(12,2) DEFAULT 0,
    monto_iva numeric(12,2) DEFAULT 0,
    condicion_pago public.condicion_pago_enum DEFAULT 'contado'::public.condicion_pago_enum NOT NULL
);




--
-- TOC entry 409 (class 1259 OID 26375)
-- Name: ventas_detalle; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ventas_detalle (
    detalle_venta_id integer NOT NULL,
    venta_id integer NOT NULL,
    producto_id integer NOT NULL,
    cantidad numeric(10,2),
    precio_unitario numeric(10,2)
);




--
-- TOC entry 410 (class 1259 OID 26378)
-- Name: ventas_detalle_detalle_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_detalle_detalle_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6504 (class 0 OID 0)
-- Dependencies: 410
-- Name: ventas_detalle_detalle_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_detalle_detalle_venta_id_seq OWNED BY public.ventas_detalle.detalle_venta_id;


--
-- TOC entry 411 (class 1259 OID 26379)
-- Name: ventas_venta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ventas_venta_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6505 (class 0 OID 0)
-- Dependencies: 411
-- Name: ventas_venta_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ventas_venta_id_seq OWNED BY public.ventas.venta_id;


--
-- TOC entry 412 (class 1259 OID 26380)
-- Name: visita_tecnica; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.visita_tecnica (
    visita_id integer NOT NULL,
    solicitud_id integer NOT NULL,
    fecha_visita timestamp without time zone NOT NULL,
    creado_por integer NOT NULL,
    tecnico_id integer NOT NULL,
    estado_visita public.estado_visita_enum DEFAULT 'Pendiente'::public.estado_visita_enum NOT NULL,
    sucursal_id integer NOT NULL,
    fecha_creacion timestamp without time zone DEFAULT now(),
    nro_visita character varying(50),
    motivo_estado text,
    motivo_cambio_id integer,
    reclamo_id integer
);




--
-- TOC entry 413 (class 1259 OID 26387)
-- Name: visita_tecnica_visita_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.visita_tecnica_visita_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;




--
-- TOC entry 6506 (class 0 OID 0)
-- Dependencies: 413
-- Name: visita_tecnica_visita_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.visita_tecnica_visita_id_seq OWNED BY public.visita_tecnica.visita_id;


--
-- TOC entry 5268 (class 2604 OID 26388)
-- Name: accesos acceso_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesos ALTER COLUMN acceso_id SET DEFAULT nextval('public.accesos_acceso_id_seq'::regclass);


--
-- TOC entry 5270 (class 2604 OID 26389)
-- Name: ajustes_inventario ajuste_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario ALTER COLUMN ajuste_id SET DEFAULT nextval('public.ajustes_inventario_ajuste_id_seq'::regclass);


--
-- TOC entry 5273 (class 2604 OID 26390)
-- Name: ajustes_inventario_detalle detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario_detalle ALTER COLUMN detalle_id SET DEFAULT nextval('public.ajustes_inventario_detalle_detalle_id_seq'::regclass);


--
-- TOC entry 5274 (class 2604 OID 26391)
-- Name: almacenes almacen_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes ALTER COLUMN almacen_id SET DEFAULT nextval('public.almacenes_almacen_id_seq'::regclass);


--
-- TOC entry 5276 (class 2604 OID 26392)
-- Name: apertura_cierre_caja apertura_cierre_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apertura_cierre_caja ALTER COLUMN apertura_cierre_id SET DEFAULT nextval('public.apertura_cierre_caja_apertura_cierre_id_seq'::regclass);


--
-- TOC entry 5279 (class 2604 OID 26393)
-- Name: arqueo_caja arqueo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arqueo_caja ALTER COLUMN arqueo_id SET DEFAULT nextval('public.arqueo_caja_arqueo_id_seq'::regclass);


--
-- TOC entry 5507 (class 2604 OID 44717)
-- Name: audit_logs log_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN log_id SET DEFAULT nextval('public.audit_logs_log_id_seq'::regclass);


--
-- TOC entry 5285 (class 2604 OID 26394)
-- Name: auditoria_compra auditoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_compra ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_compra_auditoria_id_seq'::regclass);


--
-- TOC entry 5287 (class 2604 OID 26395)
-- Name: auditoria_general auditoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_general ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_general_auditoria_id_seq'::regclass);


--
-- TOC entry 5289 (class 2604 OID 26396)
-- Name: auditoria_servicio auditoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_servicio ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_servicio_auditoria_id_seq'::regclass);


--
-- TOC entry 5291 (class 2604 OID 26397)
-- Name: auditoria_venta auditoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_venta ALTER COLUMN auditoria_id SET DEFAULT nextval('public.auditoria_venta_auditoria_id_seq'::regclass);


--
-- TOC entry 5293 (class 2604 OID 26398)
-- Name: bancos banco_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos ALTER COLUMN banco_id SET DEFAULT nextval('public.bancos_banco_id_seq'::regclass);


--
-- TOC entry 5295 (class 2604 OID 26399)
-- Name: cajas caja_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas ALTER COLUMN caja_id SET DEFAULT nextval('public.cajas_caja_id_seq'::regclass);


--
-- TOC entry 5297 (class 2604 OID 26400)
-- Name: categorias categoria_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias ALTER COLUMN categoria_id SET DEFAULT nextval('public.categorias_categoria_id_seq'::regclass);


--
-- TOC entry 5299 (class 2604 OID 26401)
-- Name: ciudades id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciudades ALTER COLUMN id SET DEFAULT nextval('public.ciudades_id_seq'::regclass);


--
-- TOC entry 5300 (class 2604 OID 26402)
-- Name: clientes cliente_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes ALTER COLUMN cliente_id SET DEFAULT nextval('public.clientes_cliente_id_seq'::regclass);


--
-- TOC entry 5302 (class 2604 OID 26403)
-- Name: cobros cobro_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cobros ALTER COLUMN cobro_id SET DEFAULT nextval('public.cobros_cobro_id_seq'::regclass);


--
-- TOC entry 5304 (class 2604 OID 26404)
-- Name: compra_cabecera compra_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera ALTER COLUMN compra_id SET DEFAULT nextval('public.compra_cabecera_compra_id_seq'::regclass);


--
-- TOC entry 5311 (class 2604 OID 26405)
-- Name: cuentas_bancarias cuenta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_bancarias ALTER COLUMN cuenta_id SET DEFAULT nextval('public.cuentas_bancarias_cuenta_id_seq'::regclass);


--
-- TOC entry 5314 (class 2604 OID 26406)
-- Name: cuentas_por_cobrar cuenta_cobrar_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar ALTER COLUMN cuenta_cobrar_id SET DEFAULT nextval('public.cuentas_por_cobrar_cuenta_cobrar_id_seq'::regclass);


--
-- TOC entry 5317 (class 2604 OID 26407)
-- Name: cuentas_por_pagar cuenta_pagar_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_pagar ALTER COLUMN cuenta_pagar_id SET DEFAULT nextval('public.cuentas_por_pagar_cuenta_pagar_id_seq'::regclass);


--
-- TOC entry 5506 (class 2604 OID 44710)
-- Name: departamentos departamento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos ALTER COLUMN departamento_id SET DEFAULT nextval('public.departamentos_departamento_id_seq'::regclass);


--
-- TOC entry 5320 (class 2604 OID 26408)
-- Name: descuentos_aplicados desc_aplicado_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos_aplicados ALTER COLUMN desc_aplicado_id SET DEFAULT nextval('public.descuentos_aplicados_desc_aplicado_id_seq'::regclass);


--
-- TOC entry 5326 (class 2604 OID 26409)
-- Name: detalle_compras detalle_compra_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras ALTER COLUMN detalle_compra_id SET DEFAULT nextval('public.detalle_compras_detalle_compra_id_seq'::regclass);


--
-- TOC entry 5327 (class 2604 OID 26410)
-- Name: detalle_pedido_compra ped_compra_det_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_compra ALTER COLUMN ped_compra_det_id SET DEFAULT nextval('public.pedidos_proveedor_detalles_id_seq'::regclass);


--
-- TOC entry 5328 (class 2604 OID 26411)
-- Name: detalle_presupuesto detalle_presup_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_presupuesto ALTER COLUMN detalle_presup_id SET DEFAULT nextval('public.detalle_presupuesto_detalle_presup_id_seq'::regclass);


--
-- TOC entry 5329 (class 2604 OID 26412)
-- Name: detalle_producto_presupuesto id_detalle_producto; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_producto_presupuesto ALTER COLUMN id_detalle_producto SET DEFAULT nextval('public.detalle_producto_presupuesto_id_detalle_producto_seq'::regclass);


--
-- TOC entry 5330 (class 2604 OID 26413)
-- Name: detalle_remision detalle_remision_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_remision ALTER COLUMN detalle_remision_id SET DEFAULT nextval('public.detalle_remision_detalle_remision_id_seq'::regclass);


--
-- TOC entry 5331 (class 2604 OID 26414)
-- Name: diagnostico diagnostico_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico ALTER COLUMN diagnostico_id SET DEFAULT nextval('public.diagnostico_diagnostico_id_seq'::regclass);


--
-- TOC entry 5334 (class 2604 OID 26415)
-- Name: diagnostico_detalle detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_detalle ALTER COLUMN detalle_id SET DEFAULT nextval('public.diagnostico_detalle_detalle_id_seq'::regclass);


--
-- TOC entry 5336 (class 2604 OID 26416)
-- Name: empleados id_empleado; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados ALTER COLUMN id_empleado SET DEFAULT nextval('public.empleados_id_empleado_seq'::regclass);


--
-- TOC entry 5337 (class 2604 OID 26417)
-- Name: empresa id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa ALTER COLUMN id SET DEFAULT nextval('public.empresa_id_seq'::regclass);


--
-- TOC entry 5338 (class 2604 OID 26418)
-- Name: entidad_emisora entidad_emisora_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entidad_emisora ALTER COLUMN entidad_emisora_id SET DEFAULT nextval('public.entidad_emisora_entidad_emisora_id_seq'::regclass);


--
-- TOC entry 5340 (class 2604 OID 26419)
-- Name: equipos equipo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos ALTER COLUMN equipo_id SET DEFAULT nextval('public.equipos_equipo_id_seq'::regclass);


--
-- TOC entry 5341 (class 2604 OID 26420)
-- Name: formas_cobro forma_cobro_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formas_cobro ALTER COLUMN forma_cobro_id SET DEFAULT nextval('public.formas_cobro_forma_cobro_id_seq'::regclass);


--
-- TOC entry 5343 (class 2604 OID 26421)
-- Name: garantias garantia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias ALTER COLUMN garantia_id SET DEFAULT nextval('public.garantias_garantia_id_seq'::regclass);


--
-- TOC entry 5345 (class 2604 OID 26422)
-- Name: impuestos impuesto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos ALTER COLUMN impuesto_id SET DEFAULT nextval('public.impuestos_impuesto_id_seq'::regclass);


--
-- TOC entry 5349 (class 2604 OID 26423)
-- Name: libro_compras libro_compra_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras ALTER COLUMN libro_compra_id SET DEFAULT nextval('public.libro_compras_libro_compra_id_seq'::regclass);


--
-- TOC entry 5355 (class 2604 OID 26424)
-- Name: libro_ventas libro_venta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas ALTER COLUMN libro_venta_id SET DEFAULT nextval('public.libro_ventas_libro_venta_id_seq'::regclass);


--
-- TOC entry 5361 (class 2604 OID 26425)
-- Name: lista_precios_detalle lista_det_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_precios_detalle ALTER COLUMN lista_det_id SET DEFAULT nextval('public.lista_precios_detalle_lista_det_id_seq'::regclass);


--
-- TOC entry 5362 (class 2604 OID 26426)
-- Name: listas_precios lista_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listas_precios ALTER COLUMN lista_id SET DEFAULT nextval('public.listas_precios_lista_id_seq'::regclass);


--
-- TOC entry 5503 (class 2604 OID 44671)
-- Name: login_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.login_attempts_attempt_id_seq'::regclass);


--
-- TOC entry 5364 (class 2604 OID 26427)
-- Name: marca_tarjetas marca_tarjeta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marca_tarjetas ALTER COLUMN marca_tarjeta_id SET DEFAULT nextval('public.marca_tarjetas_marca_tarjeta_id_seq'::regclass);


--
-- TOC entry 5366 (class 2604 OID 26428)
-- Name: marcas marca_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas ALTER COLUMN marca_id SET DEFAULT nextval('public.marcas_marca_id_seq'::regclass);


--
-- TOC entry 5504 (class 2604 OID 44685)
-- Name: modulos modulo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos ALTER COLUMN modulo_id SET DEFAULT nextval('public.modulos_modulo_id_seq'::regclass);


--
-- TOC entry 5367 (class 2604 OID 26429)
-- Name: motivo_ajuste motivo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivo_ajuste ALTER COLUMN motivo_id SET DEFAULT nextval('public.motivo_ajuste_motivo_id_seq'::regclass);


--
-- TOC entry 5368 (class 2604 OID 26430)
-- Name: motivo_cambios motivo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivo_cambios ALTER COLUMN motivo_id SET DEFAULT nextval('public.motivos_cambios_visita_motivo_id_seq'::regclass);


--
-- TOC entry 5369 (class 2604 OID 26431)
-- Name: movimientos_caja movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja ALTER COLUMN movimiento_id SET DEFAULT nextval('public.movimientos_caja_movimiento_id_seq'::regclass);


--
-- TOC entry 5371 (class 2604 OID 26432)
-- Name: movimientos_inventario movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario ALTER COLUMN movimiento_id SET DEFAULT nextval('public.movimientos_inventario_movimiento_id_seq'::regclass);


--
-- TOC entry 5373 (class 2604 OID 26433)
-- Name: nota_credito_cabecera nota_credito_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera ALTER COLUMN nota_credito_id SET DEFAULT nextval('public.nota_credito_cabecera_nota_credito_id_seq'::regclass);


--
-- TOC entry 5380 (class 2604 OID 26434)
-- Name: nota_credito_detalle nota_credito_detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalle ALTER COLUMN nota_credito_detalle_id SET DEFAULT nextval('public.nota_credito_detalle_nota_credito_detalle_id_seq'::regclass);


--
-- TOC entry 5381 (class 2604 OID 26435)
-- Name: nota_debito_cabecera nota_debito_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera ALTER COLUMN nota_debito_id SET DEFAULT nextval('public.nota_debito_cabecera_nota_debito_id_seq'::regclass);


--
-- TOC entry 5388 (class 2604 OID 26436)
-- Name: nota_debito_detalle nota_debito_detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_detalle ALTER COLUMN nota_debito_detalle_id SET DEFAULT nextval('public.nota_debito_detalle_nota_debito_detalle_id_seq'::regclass);


--
-- TOC entry 5389 (class 2604 OID 26437)
-- Name: nota_remision remision_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision ALTER COLUMN remision_id SET DEFAULT nextval('public.nota_remision_remision_id_seq'::regclass);


--
-- TOC entry 5392 (class 2604 OID 26438)
-- Name: nota_remision_detalle detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision_detalle ALTER COLUMN detalle_id SET DEFAULT nextval('public.nota_remision_detalle_detalle_id_seq'::regclass);


--
-- TOC entry 5393 (class 2604 OID 26439)
-- Name: orden_compra_detalle orden_compra_detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_compra_detalle ALTER COLUMN orden_compra_detalle_id SET DEFAULT nextval('public.orden_compra_detalle_orden_compra_detalle_id_seq'::regclass);


--
-- TOC entry 5399 (class 2604 OID 26440)
-- Name: orden_servicio_productos or_ser_prod_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_productos ALTER COLUMN or_ser_prod_id SET DEFAULT nextval('public.orden_servicio_productos_or_ser_prod_id_seq'::regclass);


--
-- TOC entry 5400 (class 2604 OID 26441)
-- Name: ordenes_compra orden_compra_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra ALTER COLUMN orden_compra_id SET DEFAULT nextval('public.ordenes_compra_orden_compra_id_seq'::regclass);


--
-- TOC entry 5403 (class 2604 OID 26442)
-- Name: pagos pago_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos ALTER COLUMN pago_id SET DEFAULT nextval('public.pagos_pago_id_seq'::regclass);


--
-- TOC entry 5505 (class 2604 OID 44696)
-- Name: password_reset_tokens token_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens ALTER COLUMN token_id SET DEFAULT nextval('public.password_reset_tokens_token_id_seq'::regclass);


--
-- TOC entry 5405 (class 2604 OID 26443)
-- Name: pedido_compra pedido_compra_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_compra ALTER COLUMN pedido_compra_id SET DEFAULT nextval('public.pedido_proveedor_p_proveedor_id_seq'::regclass);


--
-- TOC entry 5408 (class 2604 OID 26444)
-- Name: pedido_proveedor pedido_prov_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_proveedor ALTER COLUMN pedido_prov_id SET DEFAULT nextval('public.pedido_proveedor_pedido_prov_id_seq'::regclass);


--
-- TOC entry 5410 (class 2604 OID 26445)
-- Name: permisos permiso_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN permiso_id SET DEFAULT nextval('public.permisos_permiso_id_seq'::regclass);


--
-- TOC entry 5413 (class 2604 OID 35940)
-- Name: permisos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos ALTER COLUMN id SET DEFAULT nextval('public.permisos_id_seq'::regclass);


--
-- TOC entry 5414 (class 2604 OID 26446)
-- Name: presupuesto_producto_detalle det_pres_producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_producto_detalle ALTER COLUMN det_pres_producto_id SET DEFAULT nextval('public.presupuesto_producto_detalle_det_pres_producto_id_seq'::regclass);


--
-- TOC entry 5415 (class 2604 OID 26447)
-- Name: presupuesto_proveedor presu_prov_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_proveedor ALTER COLUMN presu_prov_id SET DEFAULT nextval('public.presupuestos_compra_presupuesto_id_seq'::regclass);


--
-- TOC entry 5418 (class 2604 OID 26448)
-- Name: presupuesto_servicio_detalle det_pres_serv_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicio_detalle ALTER COLUMN det_pres_serv_id SET DEFAULT nextval('public.presupuesto_servicio_detalle_det_pres_serv_id_seq'::regclass);


--
-- TOC entry 5419 (class 2604 OID 26449)
-- Name: presupuesto_servicios presu_serv_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios ALTER COLUMN presu_serv_id SET DEFAULT nextval('public.presupuesto_servicios_presu_serv_id_seq'::regclass);


--
-- TOC entry 5424 (class 2604 OID 26450)
-- Name: productos producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos ALTER COLUMN producto_id SET DEFAULT nextval('public.productos_producto_id_seq'::regclass);


--
-- TOC entry 5427 (class 2604 OID 26451)
-- Name: promociones_aplicadas promo_aplicada_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_aplicadas ALTER COLUMN promo_aplicada_id SET DEFAULT nextval('public.promociones_aplicadas_promo_aplicada_id_seq'::regclass);


--
-- TOC entry 5429 (class 2604 OID 26452)
-- Name: proveedores proveedor_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores ALTER COLUMN proveedor_id SET DEFAULT nextval('public.proveedores_proveedor_id_seq'::regclass);


--
-- TOC entry 5430 (class 2604 OID 26453)
-- Name: recaudaciones_a_depositar recaudacion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar ALTER COLUMN recaudacion_id SET DEFAULT nextval('public.recaudaciones_a_depositar_recaudacion_id_seq'::regclass);


--
-- TOC entry 5433 (class 2604 OID 26454)
-- Name: recepcion_equipo recepcion_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo ALTER COLUMN recepcion_id SET DEFAULT nextval('public.recepcion_equipo_recepcion_id_seq'::regclass);


--
-- TOC entry 5435 (class 2604 OID 26455)
-- Name: recepcion_equipo_detalle detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo_detalle ALTER COLUMN detalle_id SET DEFAULT nextval('public.recepcion_equipo_detalle_detalle_id_seq'::regclass);


--
-- TOC entry 5437 (class 2604 OID 26456)
-- Name: reclamos reclamo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos ALTER COLUMN reclamo_id SET DEFAULT nextval('public.reclamos_reclamo_id_seq'::regclass);


--
-- TOC entry 5441 (class 2604 OID 26457)
-- Name: roles rol_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN rol_id SET DEFAULT nextval('public.roles_rol_id_seq'::regclass);


--
-- TOC entry 5444 (class 2604 OID 35929)
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- TOC entry 5445 (class 2604 OID 26458)
-- Name: salida_equipo salida_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salida_equipo ALTER COLUMN salida_id SET DEFAULT nextval('public.salida_equipo_salida_id_seq'::regclass);


--
-- TOC entry 5508 (class 2604 OID 44731)
-- Name: security_alerts alert_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_alerts ALTER COLUMN alert_id SET DEFAULT nextval('public.security_alerts_alert_id_seq'::regclass);


--
-- TOC entry 5447 (class 2604 OID 26459)
-- Name: servicio_productos servicio_producto_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_productos ALTER COLUMN servicio_producto_id SET DEFAULT nextval('public.servicio_productos_servicio_producto_id_seq'::regclass);


--
-- TOC entry 5450 (class 2604 OID 26460)
-- Name: solicitud_servicio solicitud_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio ALTER COLUMN solicitud_id SET DEFAULT nextval('public.solicitud_servicio_solicitud_id_seq'::regclass);


--
-- TOC entry 5454 (class 2604 OID 26461)
-- Name: solicitud_servicio_det detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio_det ALTER COLUMN detalle_id SET DEFAULT nextval('public.solicitud_servicio_det_detalle_id_seq'::regclass);


--
-- TOC entry 5346 (class 2604 OID 26462)
-- Name: stock inventario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock ALTER COLUMN inventario_id SET DEFAULT nextval('public.inventarios_inventario_id_seq'::regclass);


--
-- TOC entry 5456 (class 2604 OID 26463)
-- Name: subtipo_diagnostico subtipo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtipo_diagnostico ALTER COLUMN subtipo_id SET DEFAULT nextval('public.subtipo_diagnostico_subtipo_id_seq'::regclass);


--
-- TOC entry 5457 (class 2604 OID 26464)
-- Name: sucursales sucursal_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursales ALTER COLUMN sucursal_id SET DEFAULT nextval('public.sucursales_id_seq'::regclass);


--
-- TOC entry 5458 (class 2604 OID 26465)
-- Name: timbrados timbrado_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timbrados ALTER COLUMN timbrado_id SET DEFAULT nextval('public.timbrados_id_seq'::regclass);


--
-- TOC entry 5322 (class 2604 OID 26466)
-- Name: tipo_descuentos tipo_descuento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos ALTER COLUMN tipo_descuento_id SET DEFAULT nextval('public.descuentos_descuento_id_seq'::regclass);


--
-- TOC entry 5461 (class 2604 OID 26467)
-- Name: tipo_diagnosticos tipo_diag_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_diagnosticos ALTER COLUMN tipo_diag_id SET DEFAULT nextval('public.tipo_diagnosticos_tipo_diag_id_seq'::regclass);


--
-- TOC entry 5463 (class 2604 OID 26468)
-- Name: tipo_documento tipo_doc_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_documento ALTER COLUMN tipo_doc_id SET DEFAULT nextval('public.tipo_documento_tipo_doc_id_seq'::regclass);


--
-- TOC entry 5464 (class 2604 OID 26469)
-- Name: tipo_equipo tipo_equipo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_equipo ALTER COLUMN tipo_equipo_id SET DEFAULT nextval('public.tipo_equipo_tipo_equipo_id_seq'::regclass);


--
-- TOC entry 5466 (class 2604 OID 26470)
-- Name: tipo_movimiento tipo_movimiento_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento ALTER COLUMN tipo_movimiento_id SET DEFAULT nextval('public.tipo_movimiento_tipo_movimiento_id_seq'::regclass);


--
-- TOC entry 5467 (class 2604 OID 26471)
-- Name: tipo_promociones tipo_promo_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones ALTER COLUMN tipo_promo_id SET DEFAULT nextval('public.tipo_promociones_tipo_promo_id_seq'::regclass);


--
-- TOC entry 5473 (class 2604 OID 26472)
-- Name: tipo_servicio tipo_serv_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_servicio ALTER COLUMN tipo_serv_id SET DEFAULT nextval('public.tipo_servicio_tipo_serv_id_seq'::regclass);


--
-- TOC entry 5475 (class 2604 OID 26473)
-- Name: transferencia_stock transferencia_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock ALTER COLUMN transferencia_id SET DEFAULT nextval('public.transferencia_stock_transferencia_id_seq'::regclass);


--
-- TOC entry 5478 (class 2604 OID 26474)
-- Name: transferencia_stock_detalle transferencia_detalle_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock_detalle ALTER COLUMN transferencia_detalle_id SET DEFAULT nextval('public.transferencia_stock_detalle_transferencia_detalle_id_seq'::regclass);


--
-- TOC entry 5479 (class 2604 OID 26475)
-- Name: unidades_medida unidad_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_medida ALTER COLUMN unidad_id SET DEFAULT nextval('public.unidades_medida_unidad_id_seq'::regclass);


--
-- TOC entry 5502 (class 2604 OID 35913)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5480 (class 2604 OID 26476)
-- Name: usuarios usuario_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN usuario_id SET DEFAULT nextval('public.usuarios_usuario_id_seq'::regclass);


--
-- TOC entry 5489 (class 2604 OID 26477)
-- Name: usuarios_sucursales id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_sucursales ALTER COLUMN id SET DEFAULT nextval('public.usuarios_sucursales_id_seq'::regclass);


--
-- TOC entry 5509 (class 2604 OID 44745)
-- Name: ventanas ventana_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventanas ALTER COLUMN ventana_id SET DEFAULT nextval('public.ventanas_ventana_id_seq'::regclass);


--
-- TOC entry 5490 (class 2604 OID 26478)
-- Name: ventas venta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas ALTER COLUMN venta_id SET DEFAULT nextval('public.ventas_venta_id_seq'::regclass);


--
-- TOC entry 5498 (class 2604 OID 26479)
-- Name: ventas_detalle detalle_venta_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_detalle ALTER COLUMN detalle_venta_id SET DEFAULT nextval('public.ventas_detalle_detalle_venta_id_seq'::regclass);


--
-- TOC entry 5499 (class 2604 OID 26480)
-- Name: visita_tecnica visita_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica ALTER COLUMN visita_id SET DEFAULT nextval('public.visita_tecnica_visita_id_seq'::regclass);


--
-- TOC entry 6183 (class 0 OID 25743)
-- Dependencies: 217
-- Data for Name: accesos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.accesos (acceso_id, usuario_id, fecha_acceso, tipo_acceso, ip_origen, info_extra) FROM stdin;
\.


--
-- TOC entry 6185 (class 0 OID 25750)
-- Dependencies: 219
-- Data for Name: ajustes_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ajustes_inventario (ajuste_id, fecha, usuario_id, motivo_id, observaciones, almacen_id, estado) FROM stdin;
\.


--
-- TOC entry 6187 (class 0 OID 25759)
-- Dependencies: 221
-- Data for Name: ajustes_inventario_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ajustes_inventario_detalle (detalle_id, ajuste_id, producto_id, cantidad_ajustada, comentario) FROM stdin;
\.


--
-- TOC entry 6189 (class 0 OID 25765)
-- Dependencies: 223
-- Data for Name: almacenes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.almacenes (almacen_id, nombre, descripcion, almacen_principal, id_sucursal) FROM stdin;
1	Almacén Central	Almacén principal donde se gestionan todos los productos	t	\N
2	Almacén Secundario	Almacén secundario para productos de temporada	f	\N
\.


--
-- TOC entry 6191 (class 0 OID 25772)
-- Dependencies: 225
-- Data for Name: apertura_cierre_caja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.apertura_cierre_caja (apertura_cierre_id, caja_id, fecha_apertura, monto_apertura, fecha_cierre, hora_cierre, monto_cierre, estado) FROM stdin;
\.


--
-- TOC entry 6193 (class 0 OID 25779)
-- Dependencies: 227
-- Data for Name: arqueo_caja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.arqueo_caja (arqueo_id, caja_id, sucursal_id, usuario_id, fecha_apertura, hora_apertura, monto_apertura, monto_contado, monto_credito, monto_salida, valor_sistema, monto_cierre, diferencia, fecha_cierre, hora_cierre, estado) FROM stdin;
\.


--
-- TOC entry 6393 (class 0 OID 44714)
-- Dependencies: 427
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (log_id, usuario_id, accion, tabla_afectada, ip_address, user_agent, fecha_hora, exitoso, detalles, session_id, request_method, request_url, response_status) FROM stdin;
1	3	login_success	usuarios	127.0.0.1	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	2025-09-06 01:42:38.895892	t	Successful login	\N	POST	http://127.0.0.1:5000/login	200
\.


--
-- TOC entry 6195 (class 0 OID 25788)
-- Dependencies: 229
-- Data for Name: auditoria_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_compra (auditoria_id, tabla, registro_id, usuario_id, fecha_cambio, accion, campos_modificados, valor_anterior, valor_nuevo) FROM stdin;
\.


--
-- TOC entry 6197 (class 0 OID 25795)
-- Dependencies: 231
-- Data for Name: auditoria_general; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_general (auditoria_id, tabla, registro_id, usuario_id, fecha_cambio, accion, campos_modificados, valor_anterior, valor_nuevo) FROM stdin;
\.


--
-- TOC entry 6199 (class 0 OID 25802)
-- Dependencies: 233
-- Data for Name: auditoria_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_servicio (auditoria_id, tabla, registro_id, usuario_id, fecha_cambio, accion, campos_modificados, valor_anterior, valor_nuevo) FROM stdin;
\.


--
-- TOC entry 6201 (class 0 OID 25809)
-- Dependencies: 235
-- Data for Name: auditoria_venta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auditoria_venta (auditoria_id, tabla, registro_id, usuario_id, fecha_cambio, accion, campos_modificados, valor_anterior, valor_nuevo) FROM stdin;
\.


--
-- TOC entry 6203 (class 0 OID 25816)
-- Dependencies: 237
-- Data for Name: bancos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bancos (banco_id, nombre) FROM stdin;
\.


--
-- TOC entry 6205 (class 0 OID 25822)
-- Dependencies: 239
-- Data for Name: caja_timbrados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.caja_timbrados (caja_id, timbrado_id, fecha_desde, fecha_hasta) FROM stdin;
\.


--
-- TOC entry 6206 (class 0 OID 25826)
-- Dependencies: 240
-- Data for Name: cajas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cajas (caja_id, nro_caja, sucursal_id, activo) FROM stdin;
\.


--
-- TOC entry 6208 (class 0 OID 25831)
-- Dependencies: 242
-- Data for Name: categorias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categorias (categoria_id, nombre_categoria, estado) FROM stdin;
1	compresor	t
2	resistencia	t
3	gas	t
\.


--
-- TOC entry 6210 (class 0 OID 25836)
-- Dependencies: 244
-- Data for Name: ciudades; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ciudades (id, nombre) FROM stdin;
1	Asuncion
2	Luque
3	Lambare
4	Fdo de la Mora
\.


--
-- TOC entry 6212 (class 0 OID 25840)
-- Dependencies: 246
-- Data for Name: clientes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clientes (cliente_id, nombre, direccion, ruc, telefono, email, estado, ciudad_id, usuario_id, lista_id) FROM stdin;
\.


--
-- TOC entry 6214 (class 0 OID 25847)
-- Dependencies: 248
-- Data for Name: cobros; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cobros (cobro_id, venta_id, fecha_cobro, monto, usuario_id, caja_id, observacion) FROM stdin;
\.


--
-- TOC entry 6216 (class 0 OID 25854)
-- Dependencies: 250
-- Data for Name: compra_cabecera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.compra_cabecera (compra_id, proveedor_id, usuario_id, fecha_compra, monto_compra, estado, observaciones, almacen_id, orden_compra_id, sucursal_id, condicion_pago, timbrado, nro_factura, fecha_comprobante, tipo_doc_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva) FROM stdin;
\.


--
-- TOC entry 6218 (class 0 OID 25866)
-- Dependencies: 252
-- Data for Name: cuentas_bancarias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas_bancarias (cuenta_id, numero_cuenta, moneda, activa, banco_id) FROM stdin;
\.


--
-- TOC entry 6220 (class 0 OID 25874)
-- Dependencies: 254
-- Data for Name: cuentas_por_cobrar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas_por_cobrar (cuenta_cobrar_id, venta_id, cliente_id, fecha_emision, fecha_vencimiento, monto_total, saldo_pendiente, estado, usuario_id) FROM stdin;
\.


--
-- TOC entry 6222 (class 0 OID 25880)
-- Dependencies: 256
-- Data for Name: cuentas_por_pagar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cuentas_por_pagar (cuenta_pagar_id, compra_id, proveedor_id, fecha_emision, fecha_vencimiento, monto_adeudado, saldo_pendiente, estado) FROM stdin;
\.


--
-- TOC entry 6391 (class 0 OID 44707)
-- Dependencies: 425
-- Data for Name: departamentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.departamentos (departamento_id, nombre_departamento) FROM stdin;
\.


--
-- TOC entry 6224 (class 0 OID 25886)
-- Dependencies: 258
-- Data for Name: descuentos_aplicados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.descuentos_aplicados (desc_aplicado_id, tipo_descuento_id, monto_descuento, fecha_aplicacion, usuario_id, origen_tipo, origen_id) FROM stdin;
\.


--
-- TOC entry 6228 (class 0 OID 25901)
-- Dependencies: 262
-- Data for Name: detalle_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_compras (detalle_compra_id, compra_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6230 (class 0 OID 25905)
-- Dependencies: 264
-- Data for Name: detalle_pedido_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_pedido_compra (ped_compra_det_id, pedido_compra_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6231 (class 0 OID 25908)
-- Dependencies: 265
-- Data for Name: detalle_presupuesto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_presupuesto (detalle_presup_id, presu_prov_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6233 (class 0 OID 25912)
-- Dependencies: 267
-- Data for Name: detalle_producto_presupuesto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_producto_presupuesto (id_detalle_producto, producto_id, cantidad, precio_unitario, presu_serv_id) FROM stdin;
\.


--
-- TOC entry 6235 (class 0 OID 25917)
-- Dependencies: 269
-- Data for Name: detalle_remision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.detalle_remision (detalle_remision_id, nota_remision_id, producto_id, cantidad) FROM stdin;
\.


--
-- TOC entry 6237 (class 0 OID 25921)
-- Dependencies: 271
-- Data for Name: diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostico (diagnostico_id, recepcion_id, fecha_diagnostico, tecnico_id, observacion, estado_diagnostico, visita_tecnica_id, tipo_diag_id, motivo) FROM stdin;
\.


--
-- TOC entry 6238 (class 0 OID 25929)
-- Dependencies: 272
-- Data for Name: diagnostico_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diagnostico_detalle (detalle_id, diagnostico_id, equipo_id, observacion, cantidad) FROM stdin;
\.


--
-- TOC entry 6241 (class 0 OID 25938)
-- Dependencies: 275
-- Data for Name: empleados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empleados (id_empleado, nombre, cedula, puesto, fecha_nacimiento, fecha_contratacion, direccion, telefono, email, cont_emer_nombre, cont_emer_numero) FROM stdin;
\.


--
-- TOC entry 6243 (class 0 OID 25944)
-- Dependencies: 277
-- Data for Name: empresa; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.empresa (id, nombre, direccion, telefono, email, id_ciudad, ruc) FROM stdin;
\.


--
-- TOC entry 6245 (class 0 OID 25950)
-- Dependencies: 279
-- Data for Name: entidad_emisora; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.entidad_emisora (entidad_emisora_id, nombre, descripcion, activo) FROM stdin;
\.


--
-- TOC entry 6247 (class 0 OID 25957)
-- Dependencies: 281
-- Data for Name: equipos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.equipos (equipo_id, tipo_equipo_id, numero_serie, estado) FROM stdin;
\.


--
-- TOC entry 6250 (class 0 OID 25962)
-- Dependencies: 284
-- Data for Name: formas_cobro; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formas_cobro (forma_cobro_id, nombre, activo) FROM stdin;
\.


--
-- TOC entry 6252 (class 0 OID 25967)
-- Dependencies: 286
-- Data for Name: garantias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.garantias (garantia_id, orden_servicio_id, fecha_inicio, fecha_fin, condiciones) FROM stdin;
\.


--
-- TOC entry 6254 (class 0 OID 25974)
-- Dependencies: 288
-- Data for Name: impuestos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.impuestos (impuesto_id, nombre, porcentaje) FROM stdin;
1	iva5	5
2	iva10	10
\.


--
-- TOC entry 6258 (class 0 OID 25986)
-- Dependencies: 292
-- Data for Name: libro_compras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libro_compras (libro_compra_id, compra_id, fecha, proveedor_id, nro_factura, timbrado, condicion_pago, monto_exento, monto_iva_5, monto_iva_10, monto_compra, tipo_doc_id) FROM stdin;
\.


--
-- TOC entry 6260 (class 0 OID 25995)
-- Dependencies: 294
-- Data for Name: libro_ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.libro_ventas (libro_venta_id, venta_id, fecha, cliente_id, nro_factura, timbrado, condicion_pago, monto_exento, monto_iva_5, monto_iva_10, monto_venta, tipo_doc_id) FROM stdin;
\.


--
-- TOC entry 6262 (class 0 OID 26004)
-- Dependencies: 296
-- Data for Name: lista_precios_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lista_precios_detalle (lista_det_id, lista_id, producto_id, precio) FROM stdin;
\.


--
-- TOC entry 6264 (class 0 OID 26008)
-- Dependencies: 298
-- Data for Name: listas_precios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.listas_precios (lista_id, nombre, descripcion, fecha_inicio, fecha_fin, activa) FROM stdin;
\.


--
-- TOC entry 6385 (class 0 OID 44668)
-- Dependencies: 419
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (attempt_id, usuario_id, username, ip_address, user_agent, attempt_time, success, failure_reason) FROM stdin;
\.


--
-- TOC entry 6266 (class 0 OID 26015)
-- Dependencies: 300
-- Data for Name: marca_tarjetas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marca_tarjetas (marca_tarjeta_id, nombre, entidad_emisora_id, descripcion, activo) FROM stdin;
\.


--
-- TOC entry 6268 (class 0 OID 26022)
-- Dependencies: 302
-- Data for Name: marcas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.marcas (marca_id, descripcion) FROM stdin;
\.


--
-- TOC entry 6387 (class 0 OID 44682)
-- Dependencies: 421
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulos (modulo_id, nombre, descripcion, icono, orden, activo) FROM stdin;
\.


--
-- TOC entry 6270 (class 0 OID 26026)
-- Dependencies: 304
-- Data for Name: motivo_ajuste; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.motivo_ajuste (motivo_id, descripcion) FROM stdin;
\.


--
-- TOC entry 6272 (class 0 OID 26030)
-- Dependencies: 306
-- Data for Name: motivo_cambios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.motivo_cambios (motivo_id, tipo_cambio, descripcion) FROM stdin;
\.


--
-- TOC entry 6274 (class 0 OID 26036)
-- Dependencies: 308
-- Data for Name: movimientos_caja; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_caja (movimiento_id, caja_id, fecha, tipo_movimiento_id, monto, descripcion, forma_pago_id, referencia_id, referencia_tipo, usuario_id) FROM stdin;
\.


--
-- TOC entry 6276 (class 0 OID 26044)
-- Dependencies: 310
-- Data for Name: movimientos_inventario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.movimientos_inventario (movimiento_id, tipo_movimiento, cantidad, fecha_movimiento, producto_id, almacen_id, detalle, documento_id, usuario_id, tipo_doc_id) FROM stdin;
\.


--
-- TOC entry 6278 (class 0 OID 26051)
-- Dependencies: 312
-- Data for Name: nota_credito_cabecera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_credito_cabecera (nota_credito_id, tipo_operacion, proveedor_id, cliente_id, sucursal_id, almacen_id, usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id, monto_nc, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva) FROM stdin;
\.


--
-- TOC entry 6280 (class 0 OID 26065)
-- Dependencies: 314
-- Data for Name: nota_credito_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_credito_detalle (nota_credito_detalle_id, nota_credito_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6282 (class 0 OID 26069)
-- Dependencies: 316
-- Data for Name: nota_debito_cabecera; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_debito_cabecera (nota_debito_id, tipo_operacion, proveedor_id, cliente_id, sucursal_id, almacen_id, usuario_id, fecha_registro, nro_nota, motivo, estado, referencia_id, monto_nd, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva) FROM stdin;
\.


--
-- TOC entry 6284 (class 0 OID 26083)
-- Dependencies: 318
-- Data for Name: nota_debito_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_debito_detalle (nota_debito_detalle_id, nota_debito_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6286 (class 0 OID 26087)
-- Dependencies: 320
-- Data for Name: nota_remision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_remision (remision_id, fecha_remision, usuario_id, origen_almacen_id, destino_sucursal_id, destino_almacen_id, tipo_remision, referencia_id, estado, observaciones) FROM stdin;
\.


--
-- TOC entry 6287 (class 0 OID 26097)
-- Dependencies: 321
-- Data for Name: nota_remision_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nota_remision_detalle (detalle_id, remision_id, producto_id, cantidad) FROM stdin;
\.


--
-- TOC entry 6290 (class 0 OID 26102)
-- Dependencies: 324
-- Data for Name: orden_compra_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden_compra_detalle (orden_compra_detalle_id, orden_compra_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6293 (class 0 OID 26107)
-- Dependencies: 327
-- Data for Name: orden_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden_servicio (orden_servicio_id, fecha_solicitud, usuario_id, estado, monto_servicio, observaciones, monto_final, tecnico_id, presu_serv_id, forma_cobro_id, fecha_ejecucion, impresa) FROM stdin;
\.


--
-- TOC entry 6295 (class 0 OID 26117)
-- Dependencies: 329
-- Data for Name: orden_servicio_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden_servicio_detalle (serv_deta_id, orden_servicio_id, servicio_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6296 (class 0 OID 26121)
-- Dependencies: 330
-- Data for Name: orden_servicio_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.orden_servicio_productos (or_ser_prod_id, orden_servicio_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6298 (class 0 OID 26125)
-- Dependencies: 332
-- Data for Name: ordenes_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ordenes_compra (orden_compra_id, proveedor_id, usuario_id, presu_prov_id, fecha_orden, estado, monto_oc, observaciones, almacen_id, nro_comprobante) FROM stdin;
\.


--
-- TOC entry 6300 (class 0 OID 26133)
-- Dependencies: 334
-- Data for Name: pagos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pagos (pago_id, cuenta_pagar_id, proveedor_id, usuario_id, fecha_pago, monto_pagado, metodo_pago, nro_comprobante, observaciones) FROM stdin;
\.


--
-- TOC entry 6389 (class 0 OID 44693)
-- Dependencies: 423
-- Data for Name: password_reset_tokens; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.password_reset_tokens (token_id, usuario_id, token, expires_at, used, created_at) FROM stdin;
\.


--
-- TOC entry 6302 (class 0 OID 26140)
-- Dependencies: 336
-- Data for Name: pedido_compra; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_compra (pedido_compra_id, fecha_pedido, estado, usuario_id, comentario, sucursal_id, almacen_id, nro_comprobante) FROM stdin;
\.


--
-- TOC entry 6303 (class 0 OID 26147)
-- Dependencies: 337
-- Data for Name: pedido_proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.pedido_proveedor (pedido_prov_id, pedido_compra_id, proveedor_id, fecha_envio, usuario_id) FROM stdin;
\.


--
-- TOC entry 6307 (class 0 OID 26154)
-- Dependencies: 341
-- Data for Name: permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.permisos (permiso_id, nombre, descripcion, activo, created_at, updated_at, id) FROM stdin;
70	crear_usuarios	\N	t	2025-08-29 23:17:02.508477-03	\N	70
71	leer_usuarios	\N	t	2025-08-29 23:17:02.508477-03	\N	71
72	actualizar_usuarios	\N	t	2025-08-29 23:17:02.508477-03	\N	72
73	eliminar_usuarios	\N	t	2025-08-29 23:17:02.508477-03	\N	73
74	crear_roles	\N	t	2025-08-29 23:17:02.508477-03	\N	74
75	leer_roles	\N	t	2025-08-29 23:17:02.508477-03	\N	75
76	actualizar_roles	\N	t	2025-08-29 23:17:02.508477-03	\N	76
77	eliminar_roles	\N	t	2025-08-29 23:17:02.508477-03	\N	77
78	crear_servicios	\N	t	2025-08-29 23:17:02.508477-03	\N	78
79	leer_servicios	\N	t	2025-08-29 23:17:02.508477-03	\N	79
80	actualizar_servicios	\N	t	2025-08-29 23:17:02.508477-03	\N	80
81	eliminar_servicios	\N	t	2025-08-29 23:17:02.508477-03	\N	81
82	crear_clientes	\N	t	2025-08-29 23:17:02.508477-03	\N	82
83	leer_clientes	\N	t	2025-08-29 23:17:02.508477-03	\N	83
84	actualizar_clientes	\N	t	2025-08-29 23:17:02.508477-03	\N	84
85	eliminar_clientes	\N	t	2025-08-29 23:17:02.508477-03	\N	85
86	crear_facturas	\N	t	2025-08-29 23:17:02.508477-03	\N	86
87	leer_facturas	\N	t	2025-08-29 23:17:02.508477-03	\N	87
88	actualizar_facturas	\N	t	2025-08-29 23:17:02.508477-03	\N	88
89	eliminar_facturas	\N	t	2025-08-29 23:17:02.508477-03	\N	89
90	gestionar_reportes	\N	t	2025-08-29 23:17:02.508477-03	\N	90
91	gestionar_ajustes	\N	t	2025-08-29 23:17:02.508477-03	\N	91
92	acceso_administrador	\N	t	2025-08-29 23:17:02.508477-03	\N	92
93	acceso_super_administrador	\N	t	2025-08-29 23:17:02.508477-03	\N	93
\.


--
-- TOC entry 6309 (class 0 OID 26160)
-- Dependencies: 343
-- Data for Name: presupuesto_producto_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuesto_producto_detalle (det_pres_producto_id, presu_serv_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6311 (class 0 OID 26164)
-- Dependencies: 345
-- Data for Name: presupuesto_proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuesto_proveedor (presu_prov_id, usuario_id, fecha_presupuesto, estado, observaciones, monto_presu_prov, nro_comprobante, pedido_prov_id) FROM stdin;
\.


--
-- TOC entry 6312 (class 0 OID 26171)
-- Dependencies: 346
-- Data for Name: presupuesto_servicio_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuesto_servicio_detalle (det_pres_serv_id, presu_serv_id, servicio_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6314 (class 0 OID 26176)
-- Dependencies: 348
-- Data for Name: presupuesto_servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.presupuesto_servicios (presu_serv_id, fecha_presupuesto, estado, monto_presu_ser, observaciones, descuento_id, usuario_id, sucursal_id, promocion_id, nro_presupuesto, diagnostico_id, valido_desde, valido_hasta, tipo_presu) FROM stdin;
\.


--
-- TOC entry 6317 (class 0 OID 26188)
-- Dependencies: 351
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.productos (producto_id, nombre_producto, descripcion_producto, precio_unitario, stock, categoria_id, impuesto_id, precio_costo, precio_venta, stock_minimo, stock_maximo, marca_id, unidad_id, cod_product, estado) FROM stdin;
2	Kit de instalacion	Kit de instalacion para aires de 12mil BTU	250000	3	1	2	\N	\N	\N	\N	\N	\N	\N	t
1	gas r410	gas para aire acondicionado	85000	16	3	2	\N	\N	\N	\N	\N	\N	\N	t
4	Capacitor 10	Capacitor para AA de 12000 a 18000 BTU	30000	15	1	1	\N	\N	\N	\N	\N	\N	\N	t
5	Capacitor de 5	Capacitor para AA de 12000	25000	0	1	2	\N	\N	\N	\N	\N	\N	\N	t
3	gas r22	gas r22 para equipos viejos	90000	1	3	2	\N	\N	\N	\N	\N	\N	\N	t
\.


--
-- TOC entry 6319 (class 0 OID 26196)
-- Dependencies: 353
-- Data for Name: promociones_aplicadas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promociones_aplicadas (promo_aplicada_id, tipo_promo_id, monto_beneficio, fecha_aplicacion, usuario_id, origen_tipo, origen_id) FROM stdin;
\.


--
-- TOC entry 6321 (class 0 OID 26201)
-- Dependencies: 355
-- Data for Name: proveedores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.proveedores (proveedor_id, nombre_proveedor, correo, telefono, ruc, direccion, ciudad_id, usuario_id) FROM stdin;
\.


--
-- TOC entry 6323 (class 0 OID 26207)
-- Dependencies: 357
-- Data for Name: recaudaciones_a_depositar; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recaudaciones_a_depositar (recaudacion_id, arqueo_id, usuario_id, forma_cobro_id, monto, fecha, estado, fecha_deposito, cuenta_id) FROM stdin;
\.


--
-- TOC entry 6325 (class 0 OID 26213)
-- Dependencies: 359
-- Data for Name: recepcion_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepcion_equipo (recepcion_id, fecha_recepcion, usuario_id, sucursal_id, estado_recepcion, observaciones, nro_recepcion, solicitud_id) FROM stdin;
\.


--
-- TOC entry 6326 (class 0 OID 26219)
-- Dependencies: 360
-- Data for Name: recepcion_equipo_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recepcion_equipo_detalle (detalle_id, recepcion_id, equipo_id, cantidad, observaciones) FROM stdin;
\.


--
-- TOC entry 6329 (class 0 OID 26227)
-- Dependencies: 363
-- Data for Name: reclamos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.reclamos (reclamo_id, cliente_id, orden_servicio_id, fecha_reclamo, recibido_por, gestionado_por, descripcion, resolucion, fecha_resolucion, observaciones, estado) FROM stdin;
\.


--
-- TOC entry 6331 (class 0 OID 26235)
-- Dependencies: 365
-- Data for Name: rol_permisos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.rol_permisos (rol_id, permiso_id, created_at) FROM stdin;
6	70	2025-09-05 19:59:29.987506-03
6	71	2025-09-05 19:59:29.987506-03
6	72	2025-09-05 19:59:29.987506-03
6	73	2025-09-05 19:59:29.987506-03
6	74	2025-09-05 19:59:29.987506-03
6	75	2025-09-05 19:59:29.987506-03
6	76	2025-09-05 19:59:29.987506-03
6	77	2025-09-05 19:59:29.987506-03
6	78	2025-09-05 19:59:29.987506-03
6	79	2025-09-05 19:59:29.987506-03
6	80	2025-09-05 19:59:29.987506-03
6	81	2025-09-05 19:59:29.987506-03
6	82	2025-09-05 19:59:29.987506-03
6	83	2025-09-05 19:59:29.987506-03
6	84	2025-09-05 19:59:29.987506-03
6	85	2025-09-05 19:59:29.987506-03
6	86	2025-09-05 19:59:29.987506-03
6	87	2025-09-05 19:59:29.987506-03
6	88	2025-09-05 19:59:29.987506-03
6	89	2025-09-05 19:59:29.987506-03
6	90	2025-09-05 19:59:29.987506-03
6	91	2025-09-05 19:59:29.987506-03
6	92	2025-09-05 19:59:29.987506-03
6	93	2025-09-05 19:59:29.987506-03
\.


--
-- TOC entry 6332 (class 0 OID 26238)
-- Dependencies: 366
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (rol_id, nombre, descripcion, activo, created_at, updated_at, id) FROM stdin;
6	Super Administrador	\N	t	2025-09-05 19:59:29.987506-03	\N	6
\.


--
-- TOC entry 6334 (class 0 OID 26242)
-- Dependencies: 368
-- Data for Name: salida_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.salida_equipo (salida_id, recepcion_id, fecha_salida, entregado_por, retirado_por, documento_entrega, observaciones) FROM stdin;
\.


--
-- TOC entry 6395 (class 0 OID 44728)
-- Dependencies: 429
-- Data for Name: security_alerts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.security_alerts (alert_id, alert_type, usuario_id, ip_address, descripcion, fecha_hora, severity, resuelto, email_sent) FROM stdin;
\.


--
-- TOC entry 6336 (class 0 OID 26249)
-- Dependencies: 370
-- Data for Name: servicio_productos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicio_productos (servicio_producto_id, servicio_id, producto_id, cantidad) FROM stdin;
\.


--
-- TOC entry 6339 (class 0 OID 26257)
-- Dependencies: 373
-- Data for Name: servicios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servicios (servicio_id, nombre, descripcion, precio_base, tipo_serv_id) FROM stdin;
\.


--
-- TOC entry 6340 (class 0 OID 26263)
-- Dependencies: 374
-- Data for Name: solicitud_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_servicio (solicitud_id, fecha_solicitud, cliente_id, direccion, sucursal_id, descripcion_problema, recepcionado_por, fecha_programada, estado_solicitud, observaciones, ciudad_id, nro_solicitud, tipo_atencion) FROM stdin;
\.


--
-- TOC entry 6341 (class 0 OID 26271)
-- Dependencies: 375
-- Data for Name: solicitud_servicio_det; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.solicitud_servicio_det (detalle_id, solicitud_id, servicio_id, cantidad, precio_unitario, observaciones) FROM stdin;
\.


--
-- TOC entry 6256 (class 0 OID 25980)
-- Dependencies: 290
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock (inventario_id, producto_id, almacen_id, cantidad_disponible, stock_minimo, stock_maximo, fecha_actualizacion) FROM stdin;
\.


--
-- TOC entry 6344 (class 0 OID 26279)
-- Dependencies: 378
-- Data for Name: subtipo_diagnostico; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.subtipo_diagnostico (subtipo_id, tipo_diag_id, nombre, descripcion) FROM stdin;
\.


--
-- TOC entry 6346 (class 0 OID 26285)
-- Dependencies: 380
-- Data for Name: sucursales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sucursales (sucursal_id, nombre, direccion, telefono, email, id_ciudad, id_empresa) FROM stdin;
\.


--
-- TOC entry 6348 (class 0 OID 26291)
-- Dependencies: 382
-- Data for Name: timbrados; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.timbrados (timbrado_id, numero, fecha_inicio, fecha_fin, sucursal_id, punto_expedicion, establecimiento, nro_desde, nro_hasta, activo) FROM stdin;
\.


--
-- TOC entry 6226 (class 0 OID 25891)
-- Dependencies: 260
-- Data for Name: tipo_descuentos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_descuentos (tipo_descuento_id, fecha_creacion, descripcion, porcentaje, usuario_id, activo, nro_descuento, global) FROM stdin;
\.


--
-- TOC entry 6350 (class 0 OID 26297)
-- Dependencies: 384
-- Data for Name: tipo_descuentos_sucursales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_descuentos_sucursales (tipo_descuento_id, sucursal_id) FROM stdin;
\.


--
-- TOC entry 6351 (class 0 OID 26300)
-- Dependencies: 385
-- Data for Name: tipo_diagnosticos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_diagnosticos (tipo_diag_id, descripcion, activo, nombre) FROM stdin;
\.


--
-- TOC entry 6353 (class 0 OID 26305)
-- Dependencies: 387
-- Data for Name: tipo_documento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_documento (tipo_doc_id, descripcion) FROM stdin;
1	prueba
\.


--
-- TOC entry 6355 (class 0 OID 26309)
-- Dependencies: 389
-- Data for Name: tipo_equipo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_equipo (tipo_equipo_id, nombre, activo, descripcion) FROM stdin;
\.


--
-- TOC entry 6357 (class 0 OID 26314)
-- Dependencies: 391
-- Data for Name: tipo_movimiento; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_movimiento (tipo_movimiento_id, nombre) FROM stdin;
\.


--
-- TOC entry 6359 (class 0 OID 26318)
-- Dependencies: 393
-- Data for Name: tipo_promociones; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_promociones (tipo_promo_id, nombre, descripcion, tipo_promo, valor_beneficio, tipo_valor, fecha_inicio, fecha_fin, activo, usuario_id, fecha_creacion, nro_promocion, global) FROM stdin;
\.


--
-- TOC entry 6360 (class 0 OID 26328)
-- Dependencies: 394
-- Data for Name: tipo_promociones_sucursales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_promociones_sucursales (tipo_promo_id, sucursal_id) FROM stdin;
\.


--
-- TOC entry 6362 (class 0 OID 26332)
-- Dependencies: 396
-- Data for Name: tipo_servicio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tipo_servicio (tipo_serv_id, descripcion, nombre, activo) FROM stdin;
\.


--
-- TOC entry 6364 (class 0 OID 26337)
-- Dependencies: 398
-- Data for Name: transferencia_stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transferencia_stock (transferencia_id, fecha, usuario_id, almacen_origen_id, almacen_destino_id, estado, motivo) FROM stdin;
\.


--
-- TOC entry 6365 (class 0 OID 26344)
-- Dependencies: 399
-- Data for Name: transferencia_stock_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.transferencia_stock_detalle (transferencia_detalle_id, transferencia_id, producto_id, cantidad, observaciones) FROM stdin;
\.


--
-- TOC entry 6368 (class 0 OID 26352)
-- Dependencies: 402
-- Data for Name: unidades_medida; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.unidades_medida (unidad_id, nombre, abreviatura) FROM stdin;
\.


--
-- TOC entry 6381 (class 0 OID 35910)
-- Dependencies: 415
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, two_factor_secret) FROM stdin;
\.


--
-- TOC entry 6370 (class 0 OID 26356)
-- Dependencies: 404
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (usuario_id, nombre, email, password, fecha_creacion, rol_id, id_empleado, username, activo, created_at, created_by, updated_at, updated_by, is_deleted, deleted_at, deleted_by, audit_data, failed_attempts, locked_until, last_login_attempt, password_changed_at, totp_secret, is_2fa_enabled) FROM stdin;
3	Super Administrador	gabriel.galca84@gmail.com	scrypt:32768:8:1$79YhKxclPZQEfrJm$127665cfb1543f017c79a0dd77e0dc84378e6f1b89aeb7e44574c81edc6244f7052731d3d5bbcbb3a8d8a834b6597445d640d4379c7aa8327ef4a13caf498bdf	2025-09-05 20:00:02.815805	6	\N	Administrador	t	2025-09-05 22:23:21.594794	\N	2025-09-05 22:23:21.594794	\N	f	\N	\N	\N	0	\N	\N	2025-09-05 23:14:45.226879	\N	f
\.


--
-- TOC entry 6371 (class 0 OID 26360)
-- Dependencies: 405
-- Data for Name: usuarios_sucursales; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios_sucursales (id, id_usuario, id_sucursal) FROM stdin;
\.


--
-- TOC entry 6397 (class 0 OID 44742)
-- Dependencies: 431
-- Data for Name: ventanas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventanas (ventana_id, modulo_id, nombre, ruta, icono, orden, activo) FROM stdin;
\.


--
-- TOC entry 6374 (class 0 OID 26365)
-- Dependencies: 408
-- Data for Name: ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas (venta_id, cliente_id, fecha_venta, estado, tipo_documento, monto_venta, caja_id, tipo_doc_id, nro_factura, forma_cobro_id, monto_gravada_5, monto_gravada_10, monto_exenta, monto_iva, condicion_pago) FROM stdin;
\.


--
-- TOC entry 6375 (class 0 OID 26375)
-- Dependencies: 409
-- Data for Name: ventas_detalle; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ventas_detalle (detalle_venta_id, venta_id, producto_id, cantidad, precio_unitario) FROM stdin;
\.


--
-- TOC entry 6378 (class 0 OID 26380)
-- Dependencies: 412
-- Data for Name: visita_tecnica; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.visita_tecnica (visita_id, solicitud_id, fecha_visita, creado_por, tecnico_id, estado_visita, sucursal_id, fecha_creacion, nro_visita, motivo_estado, motivo_cambio_id, reclamo_id) FROM stdin;
\.


--
-- TOC entry 6507 (class 0 OID 0)
-- Dependencies: 218
-- Name: accesos_acceso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.accesos_acceso_id_seq', 1, false);


--
-- TOC entry 6508 (class 0 OID 0)
-- Dependencies: 220
-- Name: ajustes_inventario_ajuste_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ajustes_inventario_ajuste_id_seq', 1, false);


--
-- TOC entry 6509 (class 0 OID 0)
-- Dependencies: 222
-- Name: ajustes_inventario_detalle_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ajustes_inventario_detalle_detalle_id_seq', 1, false);


--
-- TOC entry 6510 (class 0 OID 0)
-- Dependencies: 224
-- Name: almacenes_almacen_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.almacenes_almacen_id_seq', 2, true);


--
-- TOC entry 6511 (class 0 OID 0)
-- Dependencies: 226
-- Name: apertura_cierre_caja_apertura_cierre_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.apertura_cierre_caja_apertura_cierre_id_seq', 1, false);


--
-- TOC entry 6512 (class 0 OID 0)
-- Dependencies: 228
-- Name: arqueo_caja_arqueo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.arqueo_caja_arqueo_id_seq', 1, false);


--
-- TOC entry 6513 (class 0 OID 0)
-- Dependencies: 426
-- Name: audit_logs_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_log_id_seq', 1, true);


--
-- TOC entry 6514 (class 0 OID 0)
-- Dependencies: 230
-- Name: auditoria_compra_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_compra_auditoria_id_seq', 1, false);


--
-- TOC entry 6515 (class 0 OID 0)
-- Dependencies: 232
-- Name: auditoria_general_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_general_auditoria_id_seq', 1, false);


--
-- TOC entry 6516 (class 0 OID 0)
-- Dependencies: 234
-- Name: auditoria_servicio_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_servicio_auditoria_id_seq', 1, false);


--
-- TOC entry 6517 (class 0 OID 0)
-- Dependencies: 236
-- Name: auditoria_venta_auditoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auditoria_venta_auditoria_id_seq', 1, false);


--
-- TOC entry 6518 (class 0 OID 0)
-- Dependencies: 238
-- Name: bancos_banco_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bancos_banco_id_seq', 1, false);


--
-- TOC entry 6519 (class 0 OID 0)
-- Dependencies: 241
-- Name: cajas_caja_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cajas_caja_id_seq', 1, false);


--
-- TOC entry 6520 (class 0 OID 0)
-- Dependencies: 243
-- Name: categorias_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categorias_categoria_id_seq', 3, true);


--
-- TOC entry 6521 (class 0 OID 0)
-- Dependencies: 245
-- Name: ciudades_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ciudades_id_seq', 4, true);


--
-- TOC entry 6522 (class 0 OID 0)
-- Dependencies: 247
-- Name: clientes_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.clientes_cliente_id_seq', 1, false);


--
-- TOC entry 6523 (class 0 OID 0)
-- Dependencies: 249
-- Name: cobros_cobro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cobros_cobro_id_seq', 1, false);


--
-- TOC entry 6524 (class 0 OID 0)
-- Dependencies: 251
-- Name: compra_cabecera_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.compra_cabecera_compra_id_seq', 1, false);


--
-- TOC entry 6525 (class 0 OID 0)
-- Dependencies: 253
-- Name: cuentas_bancarias_cuenta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_bancarias_cuenta_id_seq', 1, false);


--
-- TOC entry 6526 (class 0 OID 0)
-- Dependencies: 255
-- Name: cuentas_por_cobrar_cuenta_cobrar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_por_cobrar_cuenta_cobrar_id_seq', 1, false);


--
-- TOC entry 6527 (class 0 OID 0)
-- Dependencies: 257
-- Name: cuentas_por_pagar_cuenta_pagar_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cuentas_por_pagar_cuenta_pagar_id_seq', 1, false);


--
-- TOC entry 6528 (class 0 OID 0)
-- Dependencies: 424
-- Name: departamentos_departamento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.departamentos_departamento_id_seq', 1, false);


--
-- TOC entry 6529 (class 0 OID 0)
-- Dependencies: 259
-- Name: descuentos_aplicados_desc_aplicado_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.descuentos_aplicados_desc_aplicado_id_seq', 1, false);


--
-- TOC entry 6530 (class 0 OID 0)
-- Dependencies: 261
-- Name: descuentos_descuento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.descuentos_descuento_id_seq', 1, false);


--
-- TOC entry 6531 (class 0 OID 0)
-- Dependencies: 263
-- Name: detalle_compras_detalle_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_compras_detalle_compra_id_seq', 1, false);


--
-- TOC entry 6532 (class 0 OID 0)
-- Dependencies: 266
-- Name: detalle_presupuesto_detalle_presup_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_presupuesto_detalle_presup_id_seq', 1, false);


--
-- TOC entry 6533 (class 0 OID 0)
-- Dependencies: 268
-- Name: detalle_producto_presupuesto_id_detalle_producto_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_producto_presupuesto_id_detalle_producto_seq', 1, false);


--
-- TOC entry 6534 (class 0 OID 0)
-- Dependencies: 270
-- Name: detalle_remision_detalle_remision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.detalle_remision_detalle_remision_id_seq', 1, false);


--
-- TOC entry 6535 (class 0 OID 0)
-- Dependencies: 273
-- Name: diagnostico_detalle_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostico_detalle_detalle_id_seq', 1, false);


--
-- TOC entry 6536 (class 0 OID 0)
-- Dependencies: 274
-- Name: diagnostico_diagnostico_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diagnostico_diagnostico_id_seq', 1, false);


--
-- TOC entry 6537 (class 0 OID 0)
-- Dependencies: 276
-- Name: empleados_id_empleado_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empleados_id_empleado_seq', 1, true);


--
-- TOC entry 6538 (class 0 OID 0)
-- Dependencies: 278
-- Name: empresa_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.empresa_id_seq', 1, true);


--
-- TOC entry 6539 (class 0 OID 0)
-- Dependencies: 280
-- Name: entidad_emisora_entidad_emisora_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.entidad_emisora_entidad_emisora_id_seq', 1, false);


--
-- TOC entry 6540 (class 0 OID 0)
-- Dependencies: 282
-- Name: equipos_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.equipos_equipo_id_seq', 1, false);


--
-- TOC entry 6541 (class 0 OID 0)
-- Dependencies: 283
-- Name: factura_numero_factura_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.factura_numero_factura_seq', 308, true);


--
-- TOC entry 6542 (class 0 OID 0)
-- Dependencies: 285
-- Name: formas_cobro_forma_cobro_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formas_cobro_forma_cobro_id_seq', 1, false);


--
-- TOC entry 6543 (class 0 OID 0)
-- Dependencies: 287
-- Name: garantias_garantia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.garantias_garantia_id_seq', 1, false);


--
-- TOC entry 6544 (class 0 OID 0)
-- Dependencies: 289
-- Name: impuestos_impuesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.impuestos_impuesto_id_seq', 2, true);


--
-- TOC entry 6545 (class 0 OID 0)
-- Dependencies: 291
-- Name: inventarios_inventario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.inventarios_inventario_id_seq', 39, true);


--
-- TOC entry 6546 (class 0 OID 0)
-- Dependencies: 293
-- Name: libro_compras_libro_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libro_compras_libro_compra_id_seq', 1, false);


--
-- TOC entry 6547 (class 0 OID 0)
-- Dependencies: 295
-- Name: libro_ventas_libro_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.libro_ventas_libro_venta_id_seq', 1, false);


--
-- TOC entry 6548 (class 0 OID 0)
-- Dependencies: 297
-- Name: lista_precios_detalle_lista_det_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lista_precios_detalle_lista_det_id_seq', 1, false);


--
-- TOC entry 6549 (class 0 OID 0)
-- Dependencies: 299
-- Name: listas_precios_lista_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.listas_precios_lista_id_seq', 1, false);


--
-- TOC entry 6550 (class 0 OID 0)
-- Dependencies: 418
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_attempts_attempt_id_seq', 1, false);


--
-- TOC entry 6551 (class 0 OID 0)
-- Dependencies: 301
-- Name: marca_tarjetas_marca_tarjeta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marca_tarjetas_marca_tarjeta_id_seq', 1, false);


--
-- TOC entry 6552 (class 0 OID 0)
-- Dependencies: 303
-- Name: marcas_marca_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.marcas_marca_id_seq', 1, false);


--
-- TOC entry 6553 (class 0 OID 0)
-- Dependencies: 420
-- Name: modulos_modulo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulos_modulo_id_seq', 1, false);


--
-- TOC entry 6554 (class 0 OID 0)
-- Dependencies: 305
-- Name: motivo_ajuste_motivo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.motivo_ajuste_motivo_id_seq', 1, false);


--
-- TOC entry 6555 (class 0 OID 0)
-- Dependencies: 307
-- Name: motivos_cambios_visita_motivo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.motivos_cambios_visita_motivo_id_seq', 1, false);


--
-- TOC entry 6556 (class 0 OID 0)
-- Dependencies: 309
-- Name: movimientos_caja_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_caja_movimiento_id_seq', 1, false);


--
-- TOC entry 6557 (class 0 OID 0)
-- Dependencies: 311
-- Name: movimientos_inventario_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.movimientos_inventario_movimiento_id_seq', 1, false);


--
-- TOC entry 6558 (class 0 OID 0)
-- Dependencies: 313
-- Name: nota_credito_cabecera_nota_credito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_credito_cabecera_nota_credito_id_seq', 1, false);


--
-- TOC entry 6559 (class 0 OID 0)
-- Dependencies: 315
-- Name: nota_credito_detalle_nota_credito_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_credito_detalle_nota_credito_detalle_id_seq', 1, false);


--
-- TOC entry 6560 (class 0 OID 0)
-- Dependencies: 317
-- Name: nota_debito_cabecera_nota_debito_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_debito_cabecera_nota_debito_id_seq', 1, false);


--
-- TOC entry 6561 (class 0 OID 0)
-- Dependencies: 319
-- Name: nota_debito_detalle_nota_debito_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_debito_detalle_nota_debito_detalle_id_seq', 1, false);


--
-- TOC entry 6562 (class 0 OID 0)
-- Dependencies: 322
-- Name: nota_remision_detalle_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_remision_detalle_detalle_id_seq', 1, false);


--
-- TOC entry 6563 (class 0 OID 0)
-- Dependencies: 323
-- Name: nota_remision_remision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nota_remision_remision_id_seq', 1, false);


--
-- TOC entry 6564 (class 0 OID 0)
-- Dependencies: 325
-- Name: orden_compra_detalle_orden_compra_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_compra_detalle_orden_compra_detalle_id_seq', 1, false);


--
-- TOC entry 6565 (class 0 OID 0)
-- Dependencies: 328
-- Name: orden_servicio_detalle_serv_deta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_servicio_detalle_serv_deta_id_seq', 5, true);


--
-- TOC entry 6566 (class 0 OID 0)
-- Dependencies: 326
-- Name: orden_servicio_orden_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_servicio_orden_servicio_id_seq', 22, true);


--
-- TOC entry 6567 (class 0 OID 0)
-- Dependencies: 331
-- Name: orden_servicio_productos_or_ser_prod_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.orden_servicio_productos_or_ser_prod_id_seq', 1, false);


--
-- TOC entry 6568 (class 0 OID 0)
-- Dependencies: 333
-- Name: ordenes_compra_orden_compra_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ordenes_compra_orden_compra_id_seq', 1, false);


--
-- TOC entry 6569 (class 0 OID 0)
-- Dependencies: 335
-- Name: pagos_pago_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pagos_pago_id_seq', 1, false);


--
-- TOC entry 6570 (class 0 OID 0)
-- Dependencies: 422
-- Name: password_reset_tokens_token_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.password_reset_tokens_token_id_seq', 1, false);


--
-- TOC entry 6571 (class 0 OID 0)
-- Dependencies: 338
-- Name: pedido_proveedor_p_proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_proveedor_p_proveedor_id_seq', 1, false);


--
-- TOC entry 6572 (class 0 OID 0)
-- Dependencies: 339
-- Name: pedido_proveedor_pedido_prov_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedido_proveedor_pedido_prov_id_seq', 1, false);


--
-- TOC entry 6573 (class 0 OID 0)
-- Dependencies: 340
-- Name: pedidos_proveedor_detalles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.pedidos_proveedor_detalles_id_seq', 1, false);


--
-- TOC entry 6574 (class 0 OID 0)
-- Dependencies: 417
-- Name: permisos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_id_seq', 116, true);


--
-- TOC entry 6575 (class 0 OID 0)
-- Dependencies: 342
-- Name: permisos_permiso_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.permisos_permiso_id_seq', 116, true);


--
-- TOC entry 6576 (class 0 OID 0)
-- Dependencies: 344
-- Name: presupuesto_producto_detalle_det_pres_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuesto_producto_detalle_det_pres_producto_id_seq', 1, false);


--
-- TOC entry 6577 (class 0 OID 0)
-- Dependencies: 347
-- Name: presupuesto_servicio_detalle_det_pres_serv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuesto_servicio_detalle_det_pres_serv_id_seq', 1, false);


--
-- TOC entry 6578 (class 0 OID 0)
-- Dependencies: 349
-- Name: presupuesto_servicios_presu_serv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuesto_servicios_presu_serv_id_seq', 1, false);


--
-- TOC entry 6579 (class 0 OID 0)
-- Dependencies: 350
-- Name: presupuestos_compra_presupuesto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.presupuestos_compra_presupuesto_id_seq', 1, false);


--
-- TOC entry 6580 (class 0 OID 0)
-- Dependencies: 352
-- Name: productos_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.productos_producto_id_seq', 5, true);


--
-- TOC entry 6581 (class 0 OID 0)
-- Dependencies: 354
-- Name: promociones_aplicadas_promo_aplicada_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promociones_aplicadas_promo_aplicada_id_seq', 1, false);


--
-- TOC entry 6582 (class 0 OID 0)
-- Dependencies: 356
-- Name: proveedores_proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.proveedores_proveedor_id_seq', 1, false);


--
-- TOC entry 6583 (class 0 OID 0)
-- Dependencies: 358
-- Name: recaudaciones_a_depositar_recaudacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recaudaciones_a_depositar_recaudacion_id_seq', 1, false);


--
-- TOC entry 6584 (class 0 OID 0)
-- Dependencies: 361
-- Name: recepcion_equipo_detalle_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recepcion_equipo_detalle_detalle_id_seq', 1, false);


--
-- TOC entry 6585 (class 0 OID 0)
-- Dependencies: 362
-- Name: recepcion_equipo_recepcion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recepcion_equipo_recepcion_id_seq', 1, false);


--
-- TOC entry 6586 (class 0 OID 0)
-- Dependencies: 364
-- Name: reclamos_reclamo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.reclamos_reclamo_id_seq', 1, false);


--
-- TOC entry 6587 (class 0 OID 0)
-- Dependencies: 416
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- TOC entry 6588 (class 0 OID 0)
-- Dependencies: 367
-- Name: roles_rol_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_rol_id_seq', 6, true);


--
-- TOC entry 6589 (class 0 OID 0)
-- Dependencies: 369
-- Name: salida_equipo_salida_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.salida_equipo_salida_id_seq', 1, false);


--
-- TOC entry 6590 (class 0 OID 0)
-- Dependencies: 428
-- Name: security_alerts_alert_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.security_alerts_alert_id_seq', 1, false);


--
-- TOC entry 6591 (class 0 OID 0)
-- Dependencies: 371
-- Name: servicio_productos_servicio_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicio_productos_servicio_producto_id_seq', 3, true);


--
-- TOC entry 6592 (class 0 OID 0)
-- Dependencies: 372
-- Name: servicios_servicio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servicios_servicio_id_seq', 8, true);


--
-- TOC entry 6593 (class 0 OID 0)
-- Dependencies: 376
-- Name: solicitud_servicio_det_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_servicio_det_detalle_id_seq', 1, false);


--
-- TOC entry 6594 (class 0 OID 0)
-- Dependencies: 377
-- Name: solicitud_servicio_solicitud_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.solicitud_servicio_solicitud_id_seq', 1, false);


--
-- TOC entry 6595 (class 0 OID 0)
-- Dependencies: 379
-- Name: subtipo_diagnostico_subtipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.subtipo_diagnostico_subtipo_id_seq', 1, false);


--
-- TOC entry 6596 (class 0 OID 0)
-- Dependencies: 381
-- Name: sucursales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sucursales_id_seq', 1, true);


--
-- TOC entry 6597 (class 0 OID 0)
-- Dependencies: 383
-- Name: timbrados_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.timbrados_id_seq', 1, false);


--
-- TOC entry 6598 (class 0 OID 0)
-- Dependencies: 386
-- Name: tipo_diagnosticos_tipo_diag_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_diagnosticos_tipo_diag_id_seq', 1, false);


--
-- TOC entry 6599 (class 0 OID 0)
-- Dependencies: 388
-- Name: tipo_documento_tipo_doc_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_documento_tipo_doc_id_seq', 1, true);


--
-- TOC entry 6600 (class 0 OID 0)
-- Dependencies: 390
-- Name: tipo_equipo_tipo_equipo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_equipo_tipo_equipo_id_seq', 1, false);


--
-- TOC entry 6601 (class 0 OID 0)
-- Dependencies: 392
-- Name: tipo_movimiento_tipo_movimiento_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_movimiento_tipo_movimiento_id_seq', 1, false);


--
-- TOC entry 6602 (class 0 OID 0)
-- Dependencies: 395
-- Name: tipo_promociones_tipo_promo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_promociones_tipo_promo_id_seq', 1, false);


--
-- TOC entry 6603 (class 0 OID 0)
-- Dependencies: 397
-- Name: tipo_servicio_tipo_serv_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tipo_servicio_tipo_serv_id_seq', 1, false);


--
-- TOC entry 6604 (class 0 OID 0)
-- Dependencies: 400
-- Name: transferencia_stock_detalle_transferencia_detalle_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transferencia_stock_detalle_transferencia_detalle_id_seq', 1, false);


--
-- TOC entry 6605 (class 0 OID 0)
-- Dependencies: 401
-- Name: transferencia_stock_transferencia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.transferencia_stock_transferencia_id_seq', 1, false);


--
-- TOC entry 6606 (class 0 OID 0)
-- Dependencies: 403
-- Name: unidades_medida_unidad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.unidades_medida_unidad_id_seq', 1, false);


--
-- TOC entry 6607 (class 0 OID 0)
-- Dependencies: 414
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- TOC entry 6608 (class 0 OID 0)
-- Dependencies: 406
-- Name: usuarios_sucursales_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_sucursales_id_seq', 1, false);


--
-- TOC entry 6609 (class 0 OID 0)
-- Dependencies: 407
-- Name: usuarios_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_usuario_id_seq', 3, true);


--
-- TOC entry 6610 (class 0 OID 0)
-- Dependencies: 430
-- Name: ventanas_ventana_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventanas_ventana_id_seq', 1, false);


--
-- TOC entry 6611 (class 0 OID 0)
-- Dependencies: 410
-- Name: ventas_detalle_detalle_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_detalle_detalle_venta_id_seq', 1, false);


--
-- TOC entry 6612 (class 0 OID 0)
-- Dependencies: 411
-- Name: ventas_venta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ventas_venta_id_seq', 1, false);


--
-- TOC entry 6613 (class 0 OID 0)
-- Dependencies: 413
-- Name: visita_tecnica_visita_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.visita_tecnica_visita_id_seq', 1, false);


--
-- TOC entry 5528 (class 2606 OID 26482)
-- Name: accesos accesos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesos
    ADD CONSTRAINT accesos_pkey PRIMARY KEY (acceso_id);


--
-- TOC entry 5532 (class 2606 OID 26484)
-- Name: ajustes_inventario_detalle ajustes_inventario_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario_detalle
    ADD CONSTRAINT ajustes_inventario_detalle_pkey PRIMARY KEY (detalle_id);


--
-- TOC entry 5530 (class 2606 OID 26486)
-- Name: ajustes_inventario ajustes_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT ajustes_inventario_pkey PRIMARY KEY (ajuste_id);


--
-- TOC entry 5534 (class 2606 OID 26488)
-- Name: almacenes almacenes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_pkey PRIMARY KEY (almacen_id);


--
-- TOC entry 5536 (class 2606 OID 26490)
-- Name: apertura_cierre_caja apertura_cierre_caja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apertura_cierre_caja
    ADD CONSTRAINT apertura_cierre_caja_pkey PRIMARY KEY (apertura_cierre_id);


--
-- TOC entry 5538 (class 2606 OID 26492)
-- Name: arqueo_caja arqueo_caja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arqueo_caja
    ADD CONSTRAINT arqueo_caja_pkey PRIMARY KEY (arqueo_id);


--
-- TOC entry 5836 (class 2606 OID 44721)
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (log_id);


--
-- TOC entry 5540 (class 2606 OID 26494)
-- Name: auditoria_compra auditoria_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_compra
    ADD CONSTRAINT auditoria_compra_pkey PRIMARY KEY (auditoria_id);


--
-- TOC entry 5542 (class 2606 OID 26496)
-- Name: auditoria_general auditoria_general_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_general
    ADD CONSTRAINT auditoria_general_pkey PRIMARY KEY (auditoria_id);


--
-- TOC entry 5544 (class 2606 OID 26498)
-- Name: auditoria_servicio auditoria_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_servicio
    ADD CONSTRAINT auditoria_servicio_pkey PRIMARY KEY (auditoria_id);


--
-- TOC entry 5546 (class 2606 OID 26500)
-- Name: auditoria_venta auditoria_venta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auditoria_venta
    ADD CONSTRAINT auditoria_venta_pkey PRIMARY KEY (auditoria_id);


--
-- TOC entry 5548 (class 2606 OID 26502)
-- Name: bancos bancos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT bancos_nombre_key UNIQUE (nombre);


--
-- TOC entry 5550 (class 2606 OID 26504)
-- Name: bancos bancos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bancos
    ADD CONSTRAINT bancos_pkey PRIMARY KEY (banco_id);


--
-- TOC entry 5552 (class 2606 OID 26506)
-- Name: caja_timbrados caja_timbrados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_timbrados
    ADD CONSTRAINT caja_timbrados_pkey PRIMARY KEY (caja_id, timbrado_id);


--
-- TOC entry 5554 (class 2606 OID 26508)
-- Name: cajas cajas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT cajas_pkey PRIMARY KEY (caja_id);


--
-- TOC entry 5556 (class 2606 OID 26510)
-- Name: categorias categorias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categorias
    ADD CONSTRAINT categorias_pkey PRIMARY KEY (categoria_id);


--
-- TOC entry 5558 (class 2606 OID 26512)
-- Name: ciudades ciudades_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ciudades
    ADD CONSTRAINT ciudades_pkey PRIMARY KEY (id);


--
-- TOC entry 5560 (class 2606 OID 26514)
-- Name: clientes clientes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_pkey PRIMARY KEY (cliente_id);


--
-- TOC entry 5564 (class 2606 OID 26516)
-- Name: cobros cobros_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cobros
    ADD CONSTRAINT cobros_pkey PRIMARY KEY (cobro_id);


--
-- TOC entry 5566 (class 2606 OID 26518)
-- Name: compra_cabecera compra_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT compra_cabecera_pkey PRIMARY KEY (compra_id);


--
-- TOC entry 5568 (class 2606 OID 26520)
-- Name: cuentas_bancarias cuentas_bancarias_numero_cuenta_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_bancarias
    ADD CONSTRAINT cuentas_bancarias_numero_cuenta_key UNIQUE (numero_cuenta);


--
-- TOC entry 5570 (class 2606 OID 26522)
-- Name: cuentas_bancarias cuentas_bancarias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_bancarias
    ADD CONSTRAINT cuentas_bancarias_pkey PRIMARY KEY (cuenta_id);


--
-- TOC entry 5572 (class 2606 OID 26524)
-- Name: cuentas_por_cobrar cuentas_por_cobrar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT cuentas_por_cobrar_pkey PRIMARY KEY (cuenta_cobrar_id);


--
-- TOC entry 5574 (class 2606 OID 26526)
-- Name: cuentas_por_pagar cuentas_por_pagar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_pagar
    ADD CONSTRAINT cuentas_por_pagar_pkey PRIMARY KEY (cuenta_pagar_id);


--
-- TOC entry 5834 (class 2606 OID 44712)
-- Name: departamentos departamentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.departamentos
    ADD CONSTRAINT departamentos_pkey PRIMARY KEY (departamento_id);


--
-- TOC entry 5576 (class 2606 OID 26528)
-- Name: descuentos_aplicados descuentos_aplicados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos_aplicados
    ADD CONSTRAINT descuentos_aplicados_pkey PRIMARY KEY (desc_aplicado_id);


--
-- TOC entry 5578 (class 2606 OID 26530)
-- Name: tipo_descuentos descuentos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos
    ADD CONSTRAINT descuentos_pkey PRIMARY KEY (tipo_descuento_id);


--
-- TOC entry 5582 (class 2606 OID 26532)
-- Name: detalle_compras detalle_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_pkey PRIMARY KEY (detalle_compra_id);


--
-- TOC entry 5586 (class 2606 OID 26534)
-- Name: detalle_presupuesto detalle_presupuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_presupuesto
    ADD CONSTRAINT detalle_presupuesto_pkey PRIMARY KEY (detalle_presup_id);


--
-- TOC entry 5588 (class 2606 OID 26536)
-- Name: detalle_producto_presupuesto detalle_producto_presupuesto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_producto_presupuesto
    ADD CONSTRAINT detalle_producto_presupuesto_pkey PRIMARY KEY (id_detalle_producto);


--
-- TOC entry 5590 (class 2606 OID 26538)
-- Name: detalle_remision detalle_remision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_remision
    ADD CONSTRAINT detalle_remision_pkey PRIMARY KEY (detalle_remision_id);


--
-- TOC entry 5594 (class 2606 OID 26540)
-- Name: diagnostico_detalle diagnostico_detalle_diagnostico_id_equipo_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_detalle
    ADD CONSTRAINT diagnostico_detalle_diagnostico_id_equipo_id_key UNIQUE (diagnostico_id, equipo_id);


--
-- TOC entry 5596 (class 2606 OID 26542)
-- Name: diagnostico_detalle diagnostico_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_detalle
    ADD CONSTRAINT diagnostico_detalle_pkey PRIMARY KEY (detalle_id);


--
-- TOC entry 5592 (class 2606 OID 26544)
-- Name: diagnostico diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT diagnostico_pkey PRIMARY KEY (diagnostico_id);


--
-- TOC entry 5800 (class 2606 OID 26546)
-- Name: usuarios email; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT email UNIQUE (email);


--
-- TOC entry 5598 (class 2606 OID 26548)
-- Name: empleados empleados_cedula_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_cedula_key UNIQUE (cedula);


--
-- TOC entry 5600 (class 2606 OID 26550)
-- Name: empleados empleados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empleados
    ADD CONSTRAINT empleados_pkey PRIMARY KEY (id_empleado);


--
-- TOC entry 5602 (class 2606 OID 26552)
-- Name: empresa empresa_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_pkey PRIMARY KEY (id);


--
-- TOC entry 5604 (class 2606 OID 26554)
-- Name: entidad_emisora entidad_emisora_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entidad_emisora
    ADD CONSTRAINT entidad_emisora_nombre_key UNIQUE (nombre);


--
-- TOC entry 5606 (class 2606 OID 26556)
-- Name: entidad_emisora entidad_emisora_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.entidad_emisora
    ADD CONSTRAINT entidad_emisora_pkey PRIMARY KEY (entidad_emisora_id);


--
-- TOC entry 5608 (class 2606 OID 26558)
-- Name: equipos equipos_numero_serie_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_numero_serie_key UNIQUE (numero_serie);


--
-- TOC entry 5610 (class 2606 OID 26560)
-- Name: equipos equipos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_pkey PRIMARY KEY (equipo_id);


--
-- TOC entry 5612 (class 2606 OID 26562)
-- Name: formas_cobro formas_cobro_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formas_cobro
    ADD CONSTRAINT formas_cobro_nombre_key UNIQUE (nombre);


--
-- TOC entry 5614 (class 2606 OID 26564)
-- Name: formas_cobro formas_cobro_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formas_cobro
    ADD CONSTRAINT formas_cobro_pkey PRIMARY KEY (forma_cobro_id);


--
-- TOC entry 5616 (class 2606 OID 26566)
-- Name: garantias garantias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT garantias_pkey PRIMARY KEY (garantia_id);


--
-- TOC entry 5618 (class 2606 OID 26568)
-- Name: impuestos impuestos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impuestos
    ADD CONSTRAINT impuestos_pkey PRIMARY KEY (impuesto_id);


--
-- TOC entry 5620 (class 2606 OID 26570)
-- Name: stock inventarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT inventarios_pkey PRIMARY KEY (inventario_id);


--
-- TOC entry 5622 (class 2606 OID 26572)
-- Name: stock inventarios_producto_id_almacen_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT inventarios_producto_id_almacen_id_key UNIQUE (producto_id, almacen_id);


--
-- TOC entry 5624 (class 2606 OID 26574)
-- Name: libro_compras libro_compras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT libro_compras_pkey PRIMARY KEY (libro_compra_id);


--
-- TOC entry 5626 (class 2606 OID 26576)
-- Name: libro_ventas libro_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT libro_ventas_pkey PRIMARY KEY (libro_venta_id);


--
-- TOC entry 5628 (class 2606 OID 26578)
-- Name: lista_precios_detalle lista_precios_detalle_lista_id_producto_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_precios_detalle
    ADD CONSTRAINT lista_precios_detalle_lista_id_producto_id_key UNIQUE (lista_id, producto_id);


--
-- TOC entry 5630 (class 2606 OID 26580)
-- Name: lista_precios_detalle lista_precios_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_precios_detalle
    ADD CONSTRAINT lista_precios_detalle_pkey PRIMARY KEY (lista_det_id);


--
-- TOC entry 5632 (class 2606 OID 26582)
-- Name: listas_precios listas_precios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.listas_precios
    ADD CONSTRAINT listas_precios_pkey PRIMARY KEY (lista_id);


--
-- TOC entry 5824 (class 2606 OID 44675)
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (attempt_id);


--
-- TOC entry 5634 (class 2606 OID 26584)
-- Name: marca_tarjetas marca_tarjetas_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marca_tarjetas
    ADD CONSTRAINT marca_tarjetas_nombre_key UNIQUE (nombre);


--
-- TOC entry 5636 (class 2606 OID 26586)
-- Name: marca_tarjetas marca_tarjetas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marca_tarjetas
    ADD CONSTRAINT marca_tarjetas_pkey PRIMARY KEY (marca_tarjeta_id);


--
-- TOC entry 5638 (class 2606 OID 26588)
-- Name: marcas marcas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marcas
    ADD CONSTRAINT marcas_pkey PRIMARY KEY (marca_id);


--
-- TOC entry 5826 (class 2606 OID 44691)
-- Name: modulos modulos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_nombre_key UNIQUE (nombre);


--
-- TOC entry 5828 (class 2606 OID 44689)
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (modulo_id);


--
-- TOC entry 5640 (class 2606 OID 26590)
-- Name: motivo_ajuste motivo_ajuste_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivo_ajuste
    ADD CONSTRAINT motivo_ajuste_pkey PRIMARY KEY (motivo_id);


--
-- TOC entry 5642 (class 2606 OID 26592)
-- Name: motivo_cambios motivos_cambios_visita_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivo_cambios
    ADD CONSTRAINT motivos_cambios_visita_pkey PRIMARY KEY (motivo_id);


--
-- TOC entry 5644 (class 2606 OID 26594)
-- Name: motivo_cambios motivos_cambios_visita_tipo_cambio_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.motivo_cambios
    ADD CONSTRAINT motivos_cambios_visita_tipo_cambio_key UNIQUE (tipo_cambio);


--
-- TOC entry 5646 (class 2606 OID 26596)
-- Name: movimientos_caja movimientos_caja_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja
    ADD CONSTRAINT movimientos_caja_pkey PRIMARY KEY (movimiento_id);


--
-- TOC entry 5648 (class 2606 OID 26598)
-- Name: movimientos_inventario movimientos_inventario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_pkey PRIMARY KEY (movimiento_id);


--
-- TOC entry 5734 (class 2606 OID 26600)
-- Name: roles nombre; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT nombre UNIQUE (nombre);


--
-- TOC entry 5742 (class 2606 OID 26602)
-- Name: servicios nombre_unico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT nombre_unico UNIQUE (nombre);


--
-- TOC entry 5650 (class 2606 OID 26604)
-- Name: nota_credito_cabecera nota_credito_cabecera_nro_nota_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_nro_nota_key UNIQUE (nro_nota);


--
-- TOC entry 5652 (class 2606 OID 26606)
-- Name: nota_credito_cabecera nota_credito_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_pkey PRIMARY KEY (nota_credito_id);


--
-- TOC entry 5654 (class 2606 OID 26608)
-- Name: nota_credito_detalle nota_credito_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalle
    ADD CONSTRAINT nota_credito_detalle_pkey PRIMARY KEY (nota_credito_detalle_id);


--
-- TOC entry 5656 (class 2606 OID 26610)
-- Name: nota_debito_cabecera nota_debito_cabecera_nro_nota_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_nro_nota_key UNIQUE (nro_nota);


--
-- TOC entry 5658 (class 2606 OID 26612)
-- Name: nota_debito_cabecera nota_debito_cabecera_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_pkey PRIMARY KEY (nota_debito_id);


--
-- TOC entry 5660 (class 2606 OID 26614)
-- Name: nota_debito_detalle nota_debito_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_detalle
    ADD CONSTRAINT nota_debito_detalle_pkey PRIMARY KEY (nota_debito_detalle_id);


--
-- TOC entry 5664 (class 2606 OID 26616)
-- Name: nota_remision_detalle nota_remision_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision_detalle
    ADD CONSTRAINT nota_remision_detalle_pkey PRIMARY KEY (detalle_id);


--
-- TOC entry 5662 (class 2606 OID 26618)
-- Name: nota_remision nota_remision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision
    ADD CONSTRAINT nota_remision_pkey PRIMARY KEY (remision_id);


--
-- TOC entry 5682 (class 2606 OID 26620)
-- Name: pedido_compra nro_comprobante_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_compra
    ADD CONSTRAINT nro_comprobante_unique UNIQUE (nro_comprobante);


--
-- TOC entry 5666 (class 2606 OID 26622)
-- Name: orden_compra_detalle orden_compra_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_compra_detalle
    ADD CONSTRAINT orden_compra_detalle_pkey PRIMARY KEY (orden_compra_detalle_id);


--
-- TOC entry 5672 (class 2606 OID 26624)
-- Name: orden_servicio_detalle orden_servicio_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_detalle
    ADD CONSTRAINT orden_servicio_detalle_pkey PRIMARY KEY (serv_deta_id);


--
-- TOC entry 5668 (class 2606 OID 26626)
-- Name: orden_servicio orden_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT orden_servicio_pkey PRIMARY KEY (orden_servicio_id);


--
-- TOC entry 5670 (class 2606 OID 26628)
-- Name: orden_servicio orden_servicio_presu_serv_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT orden_servicio_presu_serv_id_key UNIQUE (presu_serv_id);


--
-- TOC entry 5674 (class 2606 OID 26630)
-- Name: orden_servicio_productos orden_servicio_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_productos
    ADD CONSTRAINT orden_servicio_productos_pkey PRIMARY KEY (or_ser_prod_id);


--
-- TOC entry 5676 (class 2606 OID 26632)
-- Name: ordenes_compra ordenes_compra_nro_comprobante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT ordenes_compra_nro_comprobante_key UNIQUE (nro_comprobante);


--
-- TOC entry 5678 (class 2606 OID 26634)
-- Name: ordenes_compra ordenes_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT ordenes_compra_pkey PRIMARY KEY (orden_compra_id);


--
-- TOC entry 5680 (class 2606 OID 26636)
-- Name: pagos pagos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT pagos_pkey PRIMARY KEY (pago_id);


--
-- TOC entry 5830 (class 2606 OID 44698)
-- Name: password_reset_tokens password_reset_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (token_id);


--
-- TOC entry 5832 (class 2606 OID 44700)
-- Name: password_reset_tokens password_reset_tokens_token_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_token_key UNIQUE (token);


--
-- TOC entry 5684 (class 2606 OID 26638)
-- Name: pedido_compra pedido_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_compra
    ADD CONSTRAINT pedido_proveedor_pkey PRIMARY KEY (pedido_compra_id);


--
-- TOC entry 5686 (class 2606 OID 26640)
-- Name: pedido_proveedor pedido_proveedor_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_proveedor
    ADD CONSTRAINT pedido_proveedor_pkey1 PRIMARY KEY (pedido_prov_id);


--
-- TOC entry 5584 (class 2606 OID 26642)
-- Name: detalle_pedido_compra pedidos_proveedor_detalles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_compra
    ADD CONSTRAINT pedidos_proveedor_detalles_pkey PRIMARY KEY (ped_compra_det_id);


--
-- TOC entry 5688 (class 2606 OID 26644)
-- Name: permisos permisos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_nombre_key UNIQUE (nombre);


--
-- TOC entry 5690 (class 2606 OID 26646)
-- Name: permisos permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.permisos
    ADD CONSTRAINT permisos_pkey PRIMARY KEY (permiso_id);


--
-- TOC entry 5764 (class 2606 OID 26648)
-- Name: tipo_descuentos_sucursales pk_tipo_descuentos_sucursales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos_sucursales
    ADD CONSTRAINT pk_tipo_descuentos_sucursales PRIMARY KEY (tipo_descuento_id, sucursal_id);


--
-- TOC entry 5784 (class 2606 OID 26650)
-- Name: tipo_promociones_sucursales pk_tipo_promociones_sucursales; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones_sucursales
    ADD CONSTRAINT pk_tipo_promociones_sucursales PRIMARY KEY (tipo_promo_id, sucursal_id);


--
-- TOC entry 5692 (class 2606 OID 26652)
-- Name: presupuesto_producto_detalle presupuesto_producto_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_producto_detalle
    ADD CONSTRAINT presupuesto_producto_detalle_pkey PRIMARY KEY (det_pres_producto_id);


--
-- TOC entry 5694 (class 2606 OID 26654)
-- Name: presupuesto_proveedor presupuesto_proveedor_nro_comprobante_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_proveedor
    ADD CONSTRAINT presupuesto_proveedor_nro_comprobante_key UNIQUE (nro_comprobante);


--
-- TOC entry 5698 (class 2606 OID 26656)
-- Name: presupuesto_servicio_detalle presupuesto_servicio_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicio_detalle
    ADD CONSTRAINT presupuesto_servicio_detalle_pkey PRIMARY KEY (det_pres_serv_id);


--
-- TOC entry 5700 (class 2606 OID 26658)
-- Name: presupuesto_servicios presupuesto_servicios_nro_presupuesto_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT presupuesto_servicios_nro_presupuesto_key UNIQUE (nro_presupuesto);


--
-- TOC entry 5702 (class 2606 OID 26660)
-- Name: presupuesto_servicios presupuesto_servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT presupuesto_servicios_pkey PRIMARY KEY (presu_serv_id);


--
-- TOC entry 5696 (class 2606 OID 26662)
-- Name: presupuesto_proveedor presupuestos_compra_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_proveedor
    ADD CONSTRAINT presupuestos_compra_pkey PRIMARY KEY (presu_prov_id);


--
-- TOC entry 5706 (class 2606 OID 26664)
-- Name: productos productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_pkey PRIMARY KEY (producto_id);


--
-- TOC entry 5708 (class 2606 OID 26666)
-- Name: promociones_aplicadas promociones_aplicadas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_aplicadas
    ADD CONSTRAINT promociones_aplicadas_pkey PRIMARY KEY (promo_aplicada_id);


--
-- TOC entry 5710 (class 2606 OID 26668)
-- Name: proveedores proveedores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_pkey PRIMARY KEY (proveedor_id);


--
-- TOC entry 5712 (class 2606 OID 26670)
-- Name: proveedores proveedores_ruc_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT proveedores_ruc_key UNIQUE (ruc);


--
-- TOC entry 5716 (class 2606 OID 26672)
-- Name: recaudaciones_a_depositar recaudaciones_a_depositar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT recaudaciones_a_depositar_pkey PRIMARY KEY (recaudacion_id);


--
-- TOC entry 5726 (class 2606 OID 26674)
-- Name: recepcion_equipo_detalle recepcion_equipo_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo_detalle
    ADD CONSTRAINT recepcion_equipo_detalle_pkey PRIMARY KEY (detalle_id);


--
-- TOC entry 5720 (class 2606 OID 26676)
-- Name: recepcion_equipo recepcion_equipo_nro_recepcion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT recepcion_equipo_nro_recepcion_key UNIQUE (nro_recepcion);


--
-- TOC entry 5722 (class 2606 OID 26678)
-- Name: recepcion_equipo recepcion_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT recepcion_equipo_pkey PRIMARY KEY (recepcion_id);


--
-- TOC entry 5724 (class 2606 OID 26680)
-- Name: recepcion_equipo recepcion_equipo_solicitud_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT recepcion_equipo_solicitud_id_key UNIQUE (solicitud_id);


--
-- TOC entry 5730 (class 2606 OID 26682)
-- Name: reclamos reclamos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos
    ADD CONSTRAINT reclamos_pkey PRIMARY KEY (reclamo_id);


--
-- TOC entry 5732 (class 2606 OID 26684)
-- Name: rol_permisos rol_permisos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_pkey PRIMARY KEY (rol_id, permiso_id);


--
-- TOC entry 5736 (class 2606 OID 26686)
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (rol_id);


--
-- TOC entry 5714 (class 2606 OID 26688)
-- Name: proveedores ruc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT ruc UNIQUE (ruc);


--
-- TOC entry 5738 (class 2606 OID 26690)
-- Name: salida_equipo salida_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salida_equipo
    ADD CONSTRAINT salida_equipo_pkey PRIMARY KEY (salida_id);


--
-- TOC entry 5838 (class 2606 OID 44735)
-- Name: security_alerts security_alerts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_pkey PRIMARY KEY (alert_id);


--
-- TOC entry 5740 (class 2606 OID 26692)
-- Name: servicio_productos servicio_productos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_productos
    ADD CONSTRAINT servicio_productos_pkey PRIMARY KEY (servicio_producto_id);


--
-- TOC entry 5744 (class 2606 OID 26694)
-- Name: servicios servicios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT servicios_pkey PRIMARY KEY (servicio_id);


--
-- TOC entry 5750 (class 2606 OID 26696)
-- Name: solicitud_servicio_det solicitud_servicio_det_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio_det
    ADD CONSTRAINT solicitud_servicio_det_pkey PRIMARY KEY (detalle_id);


--
-- TOC entry 5746 (class 2606 OID 26698)
-- Name: solicitud_servicio solicitud_servicio_nro_solicitud_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT solicitud_servicio_nro_solicitud_key UNIQUE (nro_solicitud);


--
-- TOC entry 5748 (class 2606 OID 26700)
-- Name: solicitud_servicio solicitud_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT solicitud_servicio_pkey PRIMARY KEY (solicitud_id);


--
-- TOC entry 5752 (class 2606 OID 26702)
-- Name: subtipo_diagnostico subtipo_diagnostico_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtipo_diagnostico
    ADD CONSTRAINT subtipo_diagnostico_pkey PRIMARY KEY (subtipo_id);


--
-- TOC entry 5754 (class 2606 OID 26704)
-- Name: subtipo_diagnostico subtipo_diagnostico_unico; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtipo_diagnostico
    ADD CONSTRAINT subtipo_diagnostico_unico UNIQUE (tipo_diag_id, nombre);


--
-- TOC entry 5756 (class 2606 OID 26706)
-- Name: sucursales sucursales_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursales
    ADD CONSTRAINT sucursales_nombre_key UNIQUE (nombre);


--
-- TOC entry 5758 (class 2606 OID 26708)
-- Name: sucursales sucursales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursales
    ADD CONSTRAINT sucursales_pkey PRIMARY KEY (sucursal_id);


--
-- TOC entry 5760 (class 2606 OID 26710)
-- Name: timbrados timbrados_numero_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timbrados
    ADD CONSTRAINT timbrados_numero_key UNIQUE (numero);


--
-- TOC entry 5762 (class 2606 OID 26712)
-- Name: timbrados timbrados_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timbrados
    ADD CONSTRAINT timbrados_pkey PRIMARY KEY (timbrado_id);


--
-- TOC entry 5580 (class 2606 OID 26714)
-- Name: tipo_descuentos tipo_descuentos_nro_descuento_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos
    ADD CONSTRAINT tipo_descuentos_nro_descuento_key UNIQUE (nro_descuento);


--
-- TOC entry 5766 (class 2606 OID 26716)
-- Name: tipo_diagnosticos tipo_diagnosticos_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_diagnosticos
    ADD CONSTRAINT tipo_diagnosticos_nombre_key UNIQUE (nombre);


--
-- TOC entry 5768 (class 2606 OID 26718)
-- Name: tipo_diagnosticos tipo_diagnosticos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_diagnosticos
    ADD CONSTRAINT tipo_diagnosticos_pkey PRIMARY KEY (tipo_diag_id);


--
-- TOC entry 5770 (class 2606 OID 26720)
-- Name: tipo_documento tipo_documento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_documento
    ADD CONSTRAINT tipo_documento_pkey PRIMARY KEY (tipo_doc_id);


--
-- TOC entry 5772 (class 2606 OID 26722)
-- Name: tipo_equipo tipo_equipo_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_equipo
    ADD CONSTRAINT tipo_equipo_nombre_key UNIQUE (nombre);


--
-- TOC entry 5774 (class 2606 OID 26724)
-- Name: tipo_equipo tipo_equipo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_equipo
    ADD CONSTRAINT tipo_equipo_pkey PRIMARY KEY (tipo_equipo_id);


--
-- TOC entry 5776 (class 2606 OID 26726)
-- Name: tipo_movimiento tipo_movimiento_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_nombre_key UNIQUE (nombre);


--
-- TOC entry 5778 (class 2606 OID 26728)
-- Name: tipo_movimiento tipo_movimiento_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_movimiento
    ADD CONSTRAINT tipo_movimiento_pkey PRIMARY KEY (tipo_movimiento_id);


--
-- TOC entry 5780 (class 2606 OID 26730)
-- Name: tipo_promociones tipo_promociones_nro_promocion_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones
    ADD CONSTRAINT tipo_promociones_nro_promocion_key UNIQUE (nro_promocion);


--
-- TOC entry 5782 (class 2606 OID 26732)
-- Name: tipo_promociones tipo_promociones_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones
    ADD CONSTRAINT tipo_promociones_pkey PRIMARY KEY (tipo_promo_id);


--
-- TOC entry 5786 (class 2606 OID 26734)
-- Name: tipo_servicio tipo_servicio_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_servicio
    ADD CONSTRAINT tipo_servicio_nombre_key UNIQUE (nombre);


--
-- TOC entry 5788 (class 2606 OID 26736)
-- Name: tipo_servicio tipo_servicio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_servicio
    ADD CONSTRAINT tipo_servicio_pkey PRIMARY KEY (tipo_serv_id);


--
-- TOC entry 5792 (class 2606 OID 26738)
-- Name: transferencia_stock_detalle transferencia_stock_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock_detalle
    ADD CONSTRAINT transferencia_stock_detalle_pkey PRIMARY KEY (transferencia_detalle_id);


--
-- TOC entry 5790 (class 2606 OID 26740)
-- Name: transferencia_stock transferencia_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock
    ADD CONSTRAINT transferencia_stock_pkey PRIMARY KEY (transferencia_id);


--
-- TOC entry 5794 (class 2606 OID 26742)
-- Name: unidades_medida unidades_medida_abreviatura_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_medida
    ADD CONSTRAINT unidades_medida_abreviatura_key UNIQUE (abreviatura);


--
-- TOC entry 5796 (class 2606 OID 26744)
-- Name: unidades_medida unidades_medida_nombre_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_medida
    ADD CONSTRAINT unidades_medida_nombre_key UNIQUE (nombre);


--
-- TOC entry 5798 (class 2606 OID 26746)
-- Name: unidades_medida unidades_medida_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.unidades_medida
    ADD CONSTRAINT unidades_medida_pkey PRIMARY KEY (unidad_id);


--
-- TOC entry 5718 (class 2606 OID 26748)
-- Name: recaudaciones_a_depositar unique_apertura_forma; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT unique_apertura_forma UNIQUE (arqueo_id, forma_cobro_id);


--
-- TOC entry 5704 (class 2606 OID 26750)
-- Name: presupuesto_servicios unique_nro_presupuesto; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT unique_nro_presupuesto UNIQUE (nro_presupuesto);


--
-- TOC entry 5562 (class 2606 OID 26752)
-- Name: clientes unique_ruc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT unique_ruc UNIQUE (ruc);


--
-- TOC entry 5728 (class 2606 OID 26754)
-- Name: recepcion_equipo_detalle uq_recepcion_equipo; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo_detalle
    ADD CONSTRAINT uq_recepcion_equipo UNIQUE (recepcion_id, equipo_id);


--
-- TOC entry 5818 (class 2606 OID 35919)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 5820 (class 2606 OID 35915)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 5822 (class 2606 OID 35917)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 5802 (class 2606 OID 26756)
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (usuario_id);


--
-- TOC entry 5806 (class 2606 OID 26758)
-- Name: usuarios_sucursales usuarios_sucursales_id_usuario_id_sucursal_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_sucursales
    ADD CONSTRAINT usuarios_sucursales_id_usuario_id_sucursal_key UNIQUE (id_usuario, id_sucursal);


--
-- TOC entry 5808 (class 2606 OID 26760)
-- Name: usuarios_sucursales usuarios_sucursales_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_sucursales
    ADD CONSTRAINT usuarios_sucursales_pkey PRIMARY KEY (id);


--
-- TOC entry 5804 (class 2606 OID 44778)
-- Name: usuarios usuarios_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_username_key UNIQUE (username);


--
-- TOC entry 5840 (class 2606 OID 44747)
-- Name: ventanas ventanas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventanas
    ADD CONSTRAINT ventanas_pkey PRIMARY KEY (ventana_id);


--
-- TOC entry 5812 (class 2606 OID 26762)
-- Name: ventas_detalle ventas_detalle_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT ventas_detalle_pkey PRIMARY KEY (detalle_venta_id);


--
-- TOC entry 5810 (class 2606 OID 26764)
-- Name: ventas ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT ventas_pkey PRIMARY KEY (venta_id);


--
-- TOC entry 5814 (class 2606 OID 26766)
-- Name: visita_tecnica visita_tecnica_nro_visita_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT visita_tecnica_nro_visita_key UNIQUE (nro_visita);


--
-- TOC entry 5816 (class 2606 OID 26768)
-- Name: visita_tecnica visita_tecnica_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT visita_tecnica_pkey PRIMARY KEY (visita_id);


--
-- TOC entry 5841 (class 2606 OID 26769)
-- Name: accesos accesos_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.accesos
    ADD CONSTRAINT accesos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5842 (class 2606 OID 26774)
-- Name: ajustes_inventario ajustes_inventario_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT ajustes_inventario_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5845 (class 2606 OID 26779)
-- Name: ajustes_inventario_detalle ajustes_inventario_detalle_ajuste_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario_detalle
    ADD CONSTRAINT ajustes_inventario_detalle_ajuste_id_fkey FOREIGN KEY (ajuste_id) REFERENCES public.ajustes_inventario(ajuste_id) ON DELETE CASCADE;


--
-- TOC entry 5846 (class 2606 OID 26784)
-- Name: ajustes_inventario_detalle ajustes_inventario_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario_detalle
    ADD CONSTRAINT ajustes_inventario_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5843 (class 2606 OID 26789)
-- Name: ajustes_inventario ajustes_inventario_motivo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT ajustes_inventario_motivo_id_fkey FOREIGN KEY (motivo_id) REFERENCES public.motivo_ajuste(motivo_id);


--
-- TOC entry 5844 (class 2606 OID 26794)
-- Name: ajustes_inventario ajustes_inventario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ajustes_inventario
    ADD CONSTRAINT ajustes_inventario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5847 (class 2606 OID 26799)
-- Name: almacenes almacenes_id_sucursal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.almacenes
    ADD CONSTRAINT almacenes_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 6035 (class 2606 OID 44722)
-- Name: audit_logs audit_logs_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5855 (class 2606 OID 26804)
-- Name: clientes clientes_lista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT clientes_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES public.listas_precios(lista_id);


--
-- TOC entry 5861 (class 2606 OID 26809)
-- Name: compra_cabecera compra_cabecera_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT compra_cabecera_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5862 (class 2606 OID 26814)
-- Name: compra_cabecera compra_cabecera_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT compra_cabecera_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5863 (class 2606 OID 26819)
-- Name: compra_cabecera compra_cabecera_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT compra_cabecera_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5867 (class 2606 OID 26824)
-- Name: cuentas_bancarias cuentas_bancarias_banco_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_bancarias
    ADD CONSTRAINT cuentas_bancarias_banco_id_fkey FOREIGN KEY (banco_id) REFERENCES public.bancos(banco_id);


--
-- TOC entry 5873 (class 2606 OID 26829)
-- Name: descuentos_aplicados descuentos_aplicados_tipo_descuento_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos_aplicados
    ADD CONSTRAINT descuentos_aplicados_tipo_descuento_id_fkey FOREIGN KEY (tipo_descuento_id) REFERENCES public.tipo_descuentos(tipo_descuento_id);


--
-- TOC entry 5874 (class 2606 OID 26834)
-- Name: descuentos_aplicados descuentos_aplicados_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.descuentos_aplicados
    ADD CONSTRAINT descuentos_aplicados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5876 (class 2606 OID 26839)
-- Name: detalle_compras detalle_compras_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_compra_id_fkey FOREIGN KEY (compra_id) REFERENCES public.compra_cabecera(compra_id) ON DELETE CASCADE;


--
-- TOC entry 5877 (class 2606 OID 26844)
-- Name: detalle_compras detalle_compras_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_compras
    ADD CONSTRAINT detalle_compras_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5889 (class 2606 OID 26849)
-- Name: diagnostico_detalle diagnostico_detalle_diagnostico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_detalle
    ADD CONSTRAINT diagnostico_detalle_diagnostico_id_fkey FOREIGN KEY (diagnostico_id) REFERENCES public.diagnostico(diagnostico_id) ON DELETE CASCADE;


--
-- TOC entry 5890 (class 2606 OID 26854)
-- Name: diagnostico_detalle diagnostico_detalle_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico_detalle
    ADD CONSTRAINT diagnostico_detalle_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(equipo_id);


--
-- TOC entry 5885 (class 2606 OID 26859)
-- Name: diagnostico diagnostico_tipo_diag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT diagnostico_tipo_diag_id_fkey FOREIGN KEY (tipo_diag_id) REFERENCES public.tipo_diagnosticos(tipo_diag_id);


--
-- TOC entry 5891 (class 2606 OID 26864)
-- Name: empresa empresa_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.empresa
    ADD CONSTRAINT empresa_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudades(id);


--
-- TOC entry 5892 (class 2606 OID 26869)
-- Name: equipos equipos_tipo_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.equipos
    ADD CONSTRAINT equipos_tipo_equipo_id_fkey FOREIGN KEY (tipo_equipo_id) REFERENCES public.tipo_equipo(tipo_equipo_id);


--
-- TOC entry 5894 (class 2606 OID 26874)
-- Name: stock fk_almacen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT fk_almacen FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id) NOT VALID;


--
-- TOC entry 5909 (class 2606 OID 26879)
-- Name: movimientos_inventario fk_almacen; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_almacen FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id) NOT VALID;


--
-- TOC entry 5848 (class 2606 OID 26884)
-- Name: apertura_cierre_caja fk_apertura_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.apertura_cierre_caja
    ADD CONSTRAINT fk_apertura_caja FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5974 (class 2606 OID 26889)
-- Name: recaudaciones_a_depositar fk_arqueo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT fk_arqueo FOREIGN KEY (arqueo_id) REFERENCES public.arqueo_caja(arqueo_id) ON DELETE CASCADE;


--
-- TOC entry 5849 (class 2606 OID 26894)
-- Name: arqueo_caja fk_arqueo_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arqueo_caja
    ADD CONSTRAINT fk_arqueo_caja FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5850 (class 2606 OID 26899)
-- Name: arqueo_caja fk_arqueo_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arqueo_caja
    ADD CONSTRAINT fk_arqueo_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5851 (class 2606 OID 26904)
-- Name: arqueo_caja fk_arqueo_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.arqueo_caja
    ADD CONSTRAINT fk_arqueo_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5858 (class 2606 OID 26909)
-- Name: cobros fk_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cobros
    ADD CONSTRAINT fk_caja FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id);


--
-- TOC entry 5852 (class 2606 OID 26914)
-- Name: caja_timbrados fk_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_timbrados
    ADD CONSTRAINT fk_caja FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6021 (class 2606 OID 26919)
-- Name: ventas fk_cajas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_cajas FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id);


--
-- TOC entry 5966 (class 2606 OID 26924)
-- Name: productos fk_categoria; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_categoria FOREIGN KEY (categoria_id) REFERENCES public.categorias(categoria_id);


--
-- TOC entry 5856 (class 2606 OID 26929)
-- Name: clientes fk_ciudades; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT fk_ciudades FOREIGN KEY (ciudad_id) REFERENCES public.ciudades(id);


--
-- TOC entry 5972 (class 2606 OID 26934)
-- Name: proveedores fk_ciudades; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT fk_ciudades FOREIGN KEY (ciudad_id) REFERENCES public.ciudades(id);


--
-- TOC entry 6022 (class 2606 OID 26939)
-- Name: ventas fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON DELETE SET NULL;


--
-- TOC entry 5994 (class 2606 OID 26944)
-- Name: solicitud_servicio fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- TOC entry 5983 (class 2606 OID 26949)
-- Name: reclamos fk_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos
    ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- TOC entry 5864 (class 2606 OID 26954)
-- Name: compra_cabecera fk_compra_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT fk_compra_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 6027 (class 2606 OID 26959)
-- Name: visita_tecnica fk_creador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_creador FOREIGN KEY (creado_por) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5975 (class 2606 OID 26964)
-- Name: recaudaciones_a_depositar fk_cuenta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT fk_cuenta FOREIGN KEY (cuenta_id) REFERENCES public.cuentas_bancarias(cuenta_id);


--
-- TOC entry 5871 (class 2606 OID 26969)
-- Name: cuentas_por_pagar fk_cuenta_compra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_pagar
    ADD CONSTRAINT fk_cuenta_compra FOREIGN KEY (compra_id) REFERENCES public.compra_cabecera(compra_id) ON DELETE CASCADE;


--
-- TOC entry 5872 (class 2606 OID 26974)
-- Name: cuentas_por_pagar fk_cuenta_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_pagar
    ADD CONSTRAINT fk_cuenta_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5868 (class 2606 OID 26979)
-- Name: cuentas_por_cobrar fk_cxc_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT fk_cxc_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id) ON DELETE SET NULL;


--
-- TOC entry 5869 (class 2606 OID 26984)
-- Name: cuentas_por_cobrar fk_cxc_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT fk_cxc_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL;


--
-- TOC entry 5870 (class 2606 OID 26989)
-- Name: cuentas_por_cobrar fk_cxc_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cuentas_por_cobrar
    ADD CONSTRAINT fk_cxc_venta FOREIGN KEY (venta_id) REFERENCES public.ventas(venta_id) ON DELETE CASCADE;


--
-- TOC entry 5961 (class 2606 OID 26994)
-- Name: presupuesto_servicios fk_descuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT fk_descuento FOREIGN KEY (descuento_id) REFERENCES public.tipo_descuentos(tipo_descuento_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 6004 (class 2606 OID 26999)
-- Name: tipo_descuentos_sucursales fk_descuento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos_sucursales
    ADD CONSTRAINT fk_descuento FOREIGN KEY (tipo_descuento_id) REFERENCES public.tipo_descuentos(tipo_descuento_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5880 (class 2606 OID 27004)
-- Name: detalle_presupuesto fk_detalle_presupuesto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_presupuesto
    ADD CONSTRAINT fk_detalle_presupuesto FOREIGN KEY (presu_prov_id) REFERENCES public.presupuesto_proveedor(presu_prov_id) ON DELETE CASCADE;


--
-- TOC entry 5881 (class 2606 OID 27009)
-- Name: detalle_presupuesto fk_detalle_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_presupuesto
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) NOT VALID;


--
-- TOC entry 5933 (class 2606 OID 27014)
-- Name: orden_compra_detalle fk_detalle_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_compra_detalle
    ADD CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 6014 (class 2606 OID 27019)
-- Name: usuarios fk_empleados; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_empleados FOREIGN KEY (id_empleado) REFERENCES public.empleados(id_empleado);


--
-- TOC entry 5989 (class 2606 OID 27024)
-- Name: salida_equipo fk_entregado_por; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salida_equipo
    ADD CONSTRAINT fk_entregado_por FOREIGN KEY (entregado_por) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5976 (class 2606 OID 27029)
-- Name: recaudaciones_a_depositar fk_forma_cobro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT fk_forma_cobro FOREIGN KEY (forma_cobro_id) REFERENCES public.formas_cobro(forma_cobro_id);


--
-- TOC entry 6023 (class 2606 OID 27034)
-- Name: ventas fk_forma_cobro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_forma_cobro FOREIGN KEY (forma_cobro_id) REFERENCES public.formas_cobro(forma_cobro_id);


--
-- TOC entry 5935 (class 2606 OID 27039)
-- Name: orden_servicio fk_forma_cobro; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT fk_forma_cobro FOREIGN KEY (forma_cobro_id) REFERENCES public.formas_cobro(forma_cobro_id);


--
-- TOC entry 5905 (class 2606 OID 27044)
-- Name: movimientos_caja fk_forma_pago; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja
    ADD CONSTRAINT fk_forma_pago FOREIGN KEY (forma_pago_id) REFERENCES public.formas_cobro(forma_cobro_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5984 (class 2606 OID 27049)
-- Name: reclamos fk_gestionado_por; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos
    ADD CONSTRAINT fk_gestionado_por FOREIGN KEY (gestionado_por) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5967 (class 2606 OID 27054)
-- Name: productos fk_impuesto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_impuesto FOREIGN KEY (impuesto_id) REFERENCES public.impuestos(impuesto_id);


--
-- TOC entry 5896 (class 2606 OID 27059)
-- Name: libro_compras fk_libro_compra_compra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT fk_libro_compra_compra FOREIGN KEY (compra_id) REFERENCES public.compra_cabecera(compra_id) ON DELETE CASCADE;


--
-- TOC entry 5897 (class 2606 OID 27064)
-- Name: libro_compras fk_libro_compra_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT fk_libro_compra_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5899 (class 2606 OID 27069)
-- Name: libro_ventas fk_libro_ventas_cliente; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT fk_libro_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- TOC entry 5900 (class 2606 OID 27074)
-- Name: libro_ventas fk_libro_ventas_tipo_doc; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT fk_libro_ventas_tipo_doc FOREIGN KEY (tipo_doc_id) REFERENCES public.tipo_documento(tipo_doc_id);


--
-- TOC entry 5901 (class 2606 OID 27079)
-- Name: libro_ventas fk_libro_ventas_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_ventas
    ADD CONSTRAINT fk_libro_ventas_venta FOREIGN KEY (venta_id) REFERENCES public.ventas(venta_id) ON DELETE CASCADE;


--
-- TOC entry 5968 (class 2606 OID 27084)
-- Name: productos fk_marcas; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT fk_marcas FOREIGN KEY (marca_id) REFERENCES public.marcas(marca_id);


--
-- TOC entry 6028 (class 2606 OID 27089)
-- Name: visita_tecnica fk_motivo_cambio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_motivo_cambio FOREIGN KEY (motivo_cambio_id) REFERENCES public.motivo_cambios(motivo_id);


--
-- TOC entry 5906 (class 2606 OID 27094)
-- Name: movimientos_caja fk_mov_caja; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja
    ADD CONSTRAINT fk_mov_caja FOREIGN KEY (caja_id) REFERENCES public.cajas(caja_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5865 (class 2606 OID 27099)
-- Name: compra_cabecera fk_orden; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT fk_orden FOREIGN KEY (orden_compra_id) REFERENCES public.ordenes_compra(orden_compra_id);


--
-- TOC entry 5934 (class 2606 OID 27104)
-- Name: orden_compra_detalle fk_orden_detalle; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_compra_detalle
    ADD CONSTRAINT fk_orden_detalle FOREIGN KEY (orden_compra_id) REFERENCES public.ordenes_compra(orden_compra_id) ON DELETE CASCADE;


--
-- TOC entry 5893 (class 2606 OID 27109)
-- Name: garantias fk_orden_garantia; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.garantias
    ADD CONSTRAINT fk_orden_garantia FOREIGN KEY (orden_servicio_id) REFERENCES public.orden_servicio(orden_servicio_id);


--
-- TOC entry 5943 (class 2606 OID 27114)
-- Name: ordenes_compra fk_orden_presu_prov; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT fk_orden_presu_prov FOREIGN KEY (presu_prov_id) REFERENCES public.presupuesto_proveedor(presu_prov_id) ON DELETE SET NULL;


--
-- TOC entry 5944 (class 2606 OID 27119)
-- Name: ordenes_compra fk_orden_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT fk_orden_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5939 (class 2606 OID 27124)
-- Name: orden_servicio_detalle fk_orden_servicio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_detalle
    ADD CONSTRAINT fk_orden_servicio FOREIGN KEY (orden_servicio_id) REFERENCES public.orden_servicio(orden_servicio_id) ON DELETE CASCADE;


--
-- TOC entry 5985 (class 2606 OID 27129)
-- Name: reclamos fk_orden_servicio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos
    ADD CONSTRAINT fk_orden_servicio FOREIGN KEY (orden_servicio_id) REFERENCES public.orden_servicio(orden_servicio_id);


--
-- TOC entry 5945 (class 2606 OID 27134)
-- Name: ordenes_compra fk_orden_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT fk_orden_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5947 (class 2606 OID 27139)
-- Name: pagos fk_pago_cuenta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pago_cuenta FOREIGN KEY (cuenta_pagar_id) REFERENCES public.cuentas_por_pagar(cuenta_pagar_id) ON DELETE CASCADE;


--
-- TOC entry 5948 (class 2606 OID 27144)
-- Name: pagos fk_pago_proveedor; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pago_proveedor FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5949 (class 2606 OID 27149)
-- Name: pagos fk_pago_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pagos
    ADD CONSTRAINT fk_pago_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5878 (class 2606 OID 27154)
-- Name: detalle_pedido_compra fk_pedido_compra; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_compra
    ADD CONSTRAINT fk_pedido_compra FOREIGN KEY (pedido_compra_id) REFERENCES public.pedido_compra(pedido_compra_id) ON DELETE CASCADE;


--
-- TOC entry 5936 (class 2606 OID 27159)
-- Name: orden_servicio fk_presupuesto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT fk_presupuesto FOREIGN KEY (presu_serv_id) REFERENCES public.presupuesto_servicios(presu_serv_id);


--
-- TOC entry 5882 (class 2606 OID 27164)
-- Name: detalle_producto_presupuesto fk_presupuesto_servicios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_producto_presupuesto
    ADD CONSTRAINT fk_presupuesto_servicios FOREIGN KEY (presu_serv_id) REFERENCES public.presupuesto_servicios(presu_serv_id);


--
-- TOC entry 5957 (class 2606 OID 27169)
-- Name: presupuesto_proveedor fk_presupuesto_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_proveedor
    ADD CONSTRAINT fk_presupuesto_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5895 (class 2606 OID 27174)
-- Name: stock fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) NOT VALID;


--
-- TOC entry 5910 (class 2606 OID 27179)
-- Name: movimientos_inventario fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) NOT VALID;


--
-- TOC entry 6025 (class 2606 OID 27184)
-- Name: ventas_detalle fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5991 (class 2606 OID 27189)
-- Name: servicio_productos fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_productos
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5883 (class 2606 OID 27194)
-- Name: detalle_producto_presupuesto fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_producto_presupuesto
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5884 (class 2606 OID 27199)
-- Name: detalle_remision fk_producto; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_remision
    ADD CONSTRAINT fk_producto FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5962 (class 2606 OID 27204)
-- Name: presupuesto_servicios fk_promociones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT fk_promociones FOREIGN KEY (promocion_id) REFERENCES public.tipo_promociones(tipo_promo_id);


--
-- TOC entry 5886 (class 2606 OID 27209)
-- Name: diagnostico fk_recepcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT fk_recepcion FOREIGN KEY (recepcion_id) REFERENCES public.recepcion_equipo(recepcion_id);


--
-- TOC entry 5990 (class 2606 OID 27214)
-- Name: salida_equipo fk_recepcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.salida_equipo
    ADD CONSTRAINT fk_recepcion FOREIGN KEY (recepcion_id) REFERENCES public.recepcion_equipo(recepcion_id);


--
-- TOC entry 5986 (class 2606 OID 27219)
-- Name: reclamos fk_recibido_por; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.reclamos
    ADD CONSTRAINT fk_recibido_por FOREIGN KEY (recibido_por) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6015 (class 2606 OID 27224)
-- Name: usuarios fk_rol; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id);


--
-- TOC entry 5992 (class 2606 OID 27229)
-- Name: servicio_productos fk_servicio; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicio_productos
    ADD CONSTRAINT fk_servicio FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5959 (class 2606 OID 27234)
-- Name: presupuesto_servicio_detalle fk_servicios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicio_detalle
    ADD CONSTRAINT fk_servicios FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id);


--
-- TOC entry 5940 (class 2606 OID 27239)
-- Name: orden_servicio_detalle fk_servicios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_detalle
    ADD CONSTRAINT fk_servicios FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id);


--
-- TOC entry 5993 (class 2606 OID 27244)
-- Name: servicios fk_servicios_tipo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servicios
    ADD CONSTRAINT fk_servicios_tipo FOREIGN KEY (tipo_serv_id) REFERENCES public.tipo_servicio(tipo_serv_id);


--
-- TOC entry 6029 (class 2606 OID 27249)
-- Name: visita_tecnica fk_solicitud; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_solicitud FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_servicio(solicitud_id);


--
-- TOC entry 5854 (class 2606 OID 27254)
-- Name: cajas fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cajas
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5995 (class 2606 OID 27259)
-- Name: solicitud_servicio fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5978 (class 2606 OID 27264)
-- Name: recepcion_equipo fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5963 (class 2606 OID 27269)
-- Name: presupuesto_servicios fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id) ON UPDATE CASCADE;


--
-- TOC entry 6005 (class 2606 OID 27274)
-- Name: tipo_descuentos_sucursales fk_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos_sucursales
    ADD CONSTRAINT fk_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6030 (class 2606 OID 27279)
-- Name: visita_tecnica fk_sucursal_visita; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_sucursal_visita FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 6007 (class 2606 OID 27284)
-- Name: tipo_promociones_sucursales fk_sucursales; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones_sucursales
    ADD CONSTRAINT fk_sucursales FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6031 (class 2606 OID 27289)
-- Name: visita_tecnica fk_tecnico; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_tecnico FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5887 (class 2606 OID 27294)
-- Name: diagnostico fk_tecnico; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT fk_tecnico FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5937 (class 2606 OID 27299)
-- Name: orden_servicio fk_tecnico_orden; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT fk_tecnico_orden FOREIGN KEY (tecnico_id) REFERENCES public.usuarios(usuario_id) ON DELETE SET NULL;


--
-- TOC entry 5853 (class 2606 OID 27304)
-- Name: caja_timbrados fk_timbrado; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.caja_timbrados
    ADD CONSTRAINT fk_timbrado FOREIGN KEY (timbrado_id) REFERENCES public.timbrados(timbrado_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 6024 (class 2606 OID 27309)
-- Name: ventas fk_tipo_docu; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas
    ADD CONSTRAINT fk_tipo_docu FOREIGN KEY (tipo_doc_id) REFERENCES public.tipo_documento(tipo_doc_id);


--
-- TOC entry 5907 (class 2606 OID 27314)
-- Name: movimientos_caja fk_tipo_movimiento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja
    ADD CONSTRAINT fk_tipo_movimiento FOREIGN KEY (tipo_movimiento_id) REFERENCES public.tipo_movimiento(tipo_movimiento_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 6008 (class 2606 OID 27319)
-- Name: tipo_promociones_sucursales fk_tipo_promociones; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones_sucursales
    ADD CONSTRAINT fk_tipo_promociones FOREIGN KEY (tipo_promo_id) REFERENCES public.tipo_promociones(tipo_promo_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 5911 (class 2606 OID 27324)
-- Name: movimientos_inventario fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) NOT VALID;


--
-- TOC entry 5977 (class 2606 OID 27329)
-- Name: recaudaciones_a_depositar fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recaudaciones_a_depositar
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5979 (class 2606 OID 27334)
-- Name: recepcion_equipo fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5964 (class 2606 OID 27339)
-- Name: presupuesto_servicios fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5938 (class 2606 OID 27344)
-- Name: orden_servicio fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5859 (class 2606 OID 27349)
-- Name: cobros fk_usuario; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cobros
    ADD CONSTRAINT fk_usuario FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5875 (class 2606 OID 27354)
-- Name: tipo_descuentos fk_usuario_creador; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_descuentos
    ADD CONSTRAINT fk_usuario_creador FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 5996 (class 2606 OID 27359)
-- Name: solicitud_servicio fk_usuario_recepcion; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT fk_usuario_recepcion FOREIGN KEY (recepcionado_por) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5950 (class 2606 OID 27364)
-- Name: pedido_compra fk_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_compra
    ADD CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5908 (class 2606 OID 27369)
-- Name: movimientos_caja fk_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_caja
    ADD CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 5857 (class 2606 OID 27374)
-- Name: clientes fk_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clientes
    ADD CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5973 (class 2606 OID 27379)
-- Name: proveedores fk_usuarios; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.proveedores
    ADD CONSTRAINT fk_usuarios FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6026 (class 2606 OID 27384)
-- Name: ventas_detalle fk_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ventas_detalle
    ADD CONSTRAINT fk_venta FOREIGN KEY (venta_id) REFERENCES public.ventas(venta_id) ON DELETE CASCADE;


--
-- TOC entry 5860 (class 2606 OID 27389)
-- Name: cobros fk_venta; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cobros
    ADD CONSTRAINT fk_venta FOREIGN KEY (venta_id) REFERENCES public.ventas(venta_id) ON DELETE CASCADE;


--
-- TOC entry 6032 (class 2606 OID 27394)
-- Name: visita_tecnica fk_visita_reclamo; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.visita_tecnica
    ADD CONSTRAINT fk_visita_reclamo FOREIGN KEY (reclamo_id) REFERENCES public.reclamos(reclamo_id) ON DELETE SET NULL;


--
-- TOC entry 5888 (class 2606 OID 27399)
-- Name: diagnostico fk_visita_tecnica; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diagnostico
    ADD CONSTRAINT fk_visita_tecnica FOREIGN KEY (visita_tecnica_id) REFERENCES public.visita_tecnica(visita_id);


--
-- TOC entry 5902 (class 2606 OID 27404)
-- Name: lista_precios_detalle lista_precios_detalle_lista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_precios_detalle
    ADD CONSTRAINT lista_precios_detalle_lista_id_fkey FOREIGN KEY (lista_id) REFERENCES public.listas_precios(lista_id);


--
-- TOC entry 5903 (class 2606 OID 27409)
-- Name: lista_precios_detalle lista_precios_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lista_precios_detalle
    ADD CONSTRAINT lista_precios_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 6033 (class 2606 OID 44676)
-- Name: login_attempts login_attempts_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5904 (class 2606 OID 27414)
-- Name: marca_tarjetas marca_tarjetas_entidad_emisora_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.marca_tarjetas
    ADD CONSTRAINT marca_tarjetas_entidad_emisora_id_fkey FOREIGN KEY (entidad_emisora_id) REFERENCES public.entidad_emisora(entidad_emisora_id) ON DELETE RESTRICT;


--
-- TOC entry 5912 (class 2606 OID 27419)
-- Name: movimientos_inventario movimientos_inventario_tipo_doc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.movimientos_inventario
    ADD CONSTRAINT movimientos_inventario_tipo_doc_id_fkey FOREIGN KEY (tipo_doc_id) REFERENCES public.tipo_documento(tipo_doc_id);


--
-- TOC entry 5913 (class 2606 OID 27424)
-- Name: nota_credito_cabecera nota_credito_cabecera_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5914 (class 2606 OID 27429)
-- Name: nota_credito_cabecera nota_credito_cabecera_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- TOC entry 5915 (class 2606 OID 27434)
-- Name: nota_credito_cabecera nota_credito_cabecera_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5916 (class 2606 OID 27439)
-- Name: nota_credito_cabecera nota_credito_cabecera_sucursal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5917 (class 2606 OID 27444)
-- Name: nota_credito_cabecera nota_credito_cabecera_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_cabecera
    ADD CONSTRAINT nota_credito_cabecera_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5918 (class 2606 OID 27449)
-- Name: nota_credito_detalle nota_credito_detalle_nota_credito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalle
    ADD CONSTRAINT nota_credito_detalle_nota_credito_id_fkey FOREIGN KEY (nota_credito_id) REFERENCES public.nota_credito_cabecera(nota_credito_id) ON DELETE CASCADE;


--
-- TOC entry 5919 (class 2606 OID 27454)
-- Name: nota_credito_detalle nota_credito_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_credito_detalle
    ADD CONSTRAINT nota_credito_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5920 (class 2606 OID 27459)
-- Name: nota_debito_cabecera nota_debito_cabecera_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5921 (class 2606 OID 27464)
-- Name: nota_debito_cabecera nota_debito_cabecera_cliente_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(cliente_id);


--
-- TOC entry 5922 (class 2606 OID 27469)
-- Name: nota_debito_cabecera nota_debito_cabecera_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5923 (class 2606 OID 27474)
-- Name: nota_debito_cabecera nota_debito_cabecera_sucursal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_sucursal_id_fkey FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5924 (class 2606 OID 27479)
-- Name: nota_debito_cabecera nota_debito_cabecera_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_cabecera
    ADD CONSTRAINT nota_debito_cabecera_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5925 (class 2606 OID 27484)
-- Name: nota_debito_detalle nota_debito_detalle_nota_debito_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_detalle
    ADD CONSTRAINT nota_debito_detalle_nota_debito_id_fkey FOREIGN KEY (nota_debito_id) REFERENCES public.nota_debito_cabecera(nota_debito_id) ON DELETE CASCADE;


--
-- TOC entry 5926 (class 2606 OID 27489)
-- Name: nota_debito_detalle nota_debito_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_debito_detalle
    ADD CONSTRAINT nota_debito_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5927 (class 2606 OID 27494)
-- Name: nota_remision nota_remision_destino_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision
    ADD CONSTRAINT nota_remision_destino_almacen_id_fkey FOREIGN KEY (destino_almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5928 (class 2606 OID 27499)
-- Name: nota_remision nota_remision_destino_sucursal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision
    ADD CONSTRAINT nota_remision_destino_sucursal_id_fkey FOREIGN KEY (destino_sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5931 (class 2606 OID 27504)
-- Name: nota_remision_detalle nota_remision_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision_detalle
    ADD CONSTRAINT nota_remision_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5932 (class 2606 OID 27509)
-- Name: nota_remision_detalle nota_remision_detalle_remision_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision_detalle
    ADD CONSTRAINT nota_remision_detalle_remision_id_fkey FOREIGN KEY (remision_id) REFERENCES public.nota_remision(remision_id);


--
-- TOC entry 5929 (class 2606 OID 27514)
-- Name: nota_remision nota_remision_origen_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision
    ADD CONSTRAINT nota_remision_origen_almacen_id_fkey FOREIGN KEY (origen_almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5930 (class 2606 OID 27519)
-- Name: nota_remision nota_remision_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nota_remision
    ADD CONSTRAINT nota_remision_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5941 (class 2606 OID 27524)
-- Name: orden_servicio_productos orden_servicio_productos_orden_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_productos
    ADD CONSTRAINT orden_servicio_productos_orden_servicio_id_fkey FOREIGN KEY (orden_servicio_id) REFERENCES public.orden_servicio(orden_servicio_id);


--
-- TOC entry 5942 (class 2606 OID 27529)
-- Name: orden_servicio_productos orden_servicio_productos_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.orden_servicio_productos
    ADD CONSTRAINT orden_servicio_productos_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5946 (class 2606 OID 27534)
-- Name: ordenes_compra ordenes_compra_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ordenes_compra
    ADD CONSTRAINT ordenes_compra_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 6034 (class 2606 OID 44701)
-- Name: password_reset_tokens password_reset_tokens_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.password_reset_tokens
    ADD CONSTRAINT password_reset_tokens_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5951 (class 2606 OID 27539)
-- Name: pedido_compra pedido_compra_almacen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_compra
    ADD CONSTRAINT pedido_compra_almacen_id_fkey FOREIGN KEY (almacen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 5952 (class 2606 OID 27544)
-- Name: pedido_proveedor pedido_proveedor_pedido_compra_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_proveedor
    ADD CONSTRAINT pedido_proveedor_pedido_compra_id_fkey FOREIGN KEY (pedido_compra_id) REFERENCES public.pedido_compra(pedido_compra_id);


--
-- TOC entry 5953 (class 2606 OID 27549)
-- Name: pedido_proveedor pedido_proveedor_proveedor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_proveedor
    ADD CONSTRAINT pedido_proveedor_proveedor_id_fkey FOREIGN KEY (proveedor_id) REFERENCES public.proveedores(proveedor_id);


--
-- TOC entry 5954 (class 2606 OID 27554)
-- Name: pedido_proveedor pedido_proveedor_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.pedido_proveedor
    ADD CONSTRAINT pedido_proveedor_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5879 (class 2606 OID 27559)
-- Name: detalle_pedido_compra pedidos_proveedor_detalles_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.detalle_pedido_compra
    ADD CONSTRAINT pedidos_proveedor_detalles_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5955 (class 2606 OID 27564)
-- Name: presupuesto_producto_detalle presupuesto_producto_detalle_presu_serv_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_producto_detalle
    ADD CONSTRAINT presupuesto_producto_detalle_presu_serv_id_fkey FOREIGN KEY (presu_serv_id) REFERENCES public.presupuesto_servicios(presu_serv_id) ON DELETE CASCADE;


--
-- TOC entry 5956 (class 2606 OID 27569)
-- Name: presupuesto_producto_detalle presupuesto_producto_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_producto_detalle
    ADD CONSTRAINT presupuesto_producto_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 5958 (class 2606 OID 27574)
-- Name: presupuesto_proveedor presupuesto_proveedor_pedido_prov_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_proveedor
    ADD CONSTRAINT presupuesto_proveedor_pedido_prov_id_fkey FOREIGN KEY (pedido_prov_id) REFERENCES public.pedido_proveedor(pedido_prov_id);


--
-- TOC entry 5960 (class 2606 OID 27579)
-- Name: presupuesto_servicio_detalle presupuesto_servicio_detalle_presu_serv_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicio_detalle
    ADD CONSTRAINT presupuesto_servicio_detalle_presu_serv_id_fkey FOREIGN KEY (presu_serv_id) REFERENCES public.presupuesto_servicios(presu_serv_id) ON DELETE CASCADE;


--
-- TOC entry 5965 (class 2606 OID 27584)
-- Name: presupuesto_servicios presupuesto_servicios_diagnostico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.presupuesto_servicios
    ADD CONSTRAINT presupuesto_servicios_diagnostico_id_fkey FOREIGN KEY (diagnostico_id) REFERENCES public.diagnostico(diagnostico_id);


--
-- TOC entry 5969 (class 2606 OID 27589)
-- Name: productos productos_unidad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.productos
    ADD CONSTRAINT productos_unidad_id_fkey FOREIGN KEY (unidad_id) REFERENCES public.unidades_medida(unidad_id);


--
-- TOC entry 5970 (class 2606 OID 27594)
-- Name: promociones_aplicadas promociones_aplicadas_tipo_promo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_aplicadas
    ADD CONSTRAINT promociones_aplicadas_tipo_promo_id_fkey FOREIGN KEY (tipo_promo_id) REFERENCES public.tipo_promociones(tipo_promo_id);


--
-- TOC entry 5971 (class 2606 OID 27599)
-- Name: promociones_aplicadas promociones_aplicadas_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promociones_aplicadas
    ADD CONSTRAINT promociones_aplicadas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5981 (class 2606 OID 27604)
-- Name: recepcion_equipo_detalle recepcion_equipo_detalle_equipo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo_detalle
    ADD CONSTRAINT recepcion_equipo_detalle_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES public.equipos(equipo_id);


--
-- TOC entry 5982 (class 2606 OID 27609)
-- Name: recepcion_equipo_detalle recepcion_equipo_detalle_recepcion_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo_detalle
    ADD CONSTRAINT recepcion_equipo_detalle_recepcion_id_fkey FOREIGN KEY (recepcion_id) REFERENCES public.recepcion_equipo(recepcion_id) ON DELETE CASCADE;


--
-- TOC entry 5980 (class 2606 OID 27614)
-- Name: recepcion_equipo recepcion_equipo_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recepcion_equipo
    ADD CONSTRAINT recepcion_equipo_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_servicio(solicitud_id);


--
-- TOC entry 5987 (class 2606 OID 27619)
-- Name: rol_permisos rol_permisos_permiso_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES public.permisos(permiso_id) ON DELETE CASCADE;


--
-- TOC entry 5988 (class 2606 OID 27624)
-- Name: rol_permisos rol_permisos_rol_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.rol_permisos
    ADD CONSTRAINT rol_permisos_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES public.roles(rol_id) ON DELETE CASCADE;


--
-- TOC entry 6036 (class 2606 OID 44736)
-- Name: security_alerts security_alerts_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.security_alerts
    ADD CONSTRAINT security_alerts_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 5997 (class 2606 OID 27629)
-- Name: solicitud_servicio solicitud_servicio_ciudad_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio
    ADD CONSTRAINT solicitud_servicio_ciudad_id_fkey FOREIGN KEY (ciudad_id) REFERENCES public.ciudades(id);


--
-- TOC entry 5998 (class 2606 OID 27634)
-- Name: solicitud_servicio_det solicitud_servicio_det_servicio_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio_det
    ADD CONSTRAINT solicitud_servicio_det_servicio_id_fkey FOREIGN KEY (servicio_id) REFERENCES public.servicios(servicio_id);


--
-- TOC entry 5999 (class 2606 OID 27639)
-- Name: solicitud_servicio_det solicitud_servicio_det_solicitud_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.solicitud_servicio_det
    ADD CONSTRAINT solicitud_servicio_det_solicitud_id_fkey FOREIGN KEY (solicitud_id) REFERENCES public.solicitud_servicio(solicitud_id);


--
-- TOC entry 6000 (class 2606 OID 27644)
-- Name: subtipo_diagnostico subtipo_diagnostico_tipo_diag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.subtipo_diagnostico
    ADD CONSTRAINT subtipo_diagnostico_tipo_diag_id_fkey FOREIGN KEY (tipo_diag_id) REFERENCES public.tipo_diagnosticos(tipo_diag_id) ON DELETE CASCADE;


--
-- TOC entry 6001 (class 2606 OID 27649)
-- Name: sucursales sucursales_id_ciudad_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursales
    ADD CONSTRAINT sucursales_id_ciudad_fkey FOREIGN KEY (id_ciudad) REFERENCES public.ciudades(id) ON DELETE SET NULL;


--
-- TOC entry 6002 (class 2606 OID 27654)
-- Name: sucursales sucursales_id_empresa_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sucursales
    ADD CONSTRAINT sucursales_id_empresa_fkey FOREIGN KEY (id_empresa) REFERENCES public.empresa(id) ON DELETE CASCADE;


--
-- TOC entry 6003 (class 2606 OID 27659)
-- Name: timbrados timbrado_sucursal; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.timbrados
    ADD CONSTRAINT timbrado_sucursal FOREIGN KEY (sucursal_id) REFERENCES public.sucursales(sucursal_id);


--
-- TOC entry 5866 (class 2606 OID 27664)
-- Name: compra_cabecera tipo_documento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.compra_cabecera
    ADD CONSTRAINT tipo_documento FOREIGN KEY (tipo_doc_id) REFERENCES public.tipo_documento(tipo_doc_id);


--
-- TOC entry 5898 (class 2606 OID 27669)
-- Name: libro_compras tipo_documento; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.libro_compras
    ADD CONSTRAINT tipo_documento FOREIGN KEY (tipo_doc_id) REFERENCES public.tipo_documento(tipo_doc_id);


--
-- TOC entry 6006 (class 2606 OID 27674)
-- Name: tipo_promociones tipo_promociones_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tipo_promociones
    ADD CONSTRAINT tipo_promociones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6009 (class 2606 OID 27679)
-- Name: transferencia_stock transferencia_stock_almacen_destino_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock
    ADD CONSTRAINT transferencia_stock_almacen_destino_id_fkey FOREIGN KEY (almacen_destino_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 6010 (class 2606 OID 27684)
-- Name: transferencia_stock transferencia_stock_almacen_origen_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock
    ADD CONSTRAINT transferencia_stock_almacen_origen_id_fkey FOREIGN KEY (almacen_origen_id) REFERENCES public.almacenes(almacen_id);


--
-- TOC entry 6012 (class 2606 OID 27689)
-- Name: transferencia_stock_detalle transferencia_stock_detalle_producto_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock_detalle
    ADD CONSTRAINT transferencia_stock_detalle_producto_id_fkey FOREIGN KEY (producto_id) REFERENCES public.productos(producto_id);


--
-- TOC entry 6013 (class 2606 OID 27694)
-- Name: transferencia_stock_detalle transferencia_stock_detalle_transferencia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock_detalle
    ADD CONSTRAINT transferencia_stock_detalle_transferencia_id_fkey FOREIGN KEY (transferencia_id) REFERENCES public.transferencia_stock(transferencia_id) ON DELETE CASCADE;


--
-- TOC entry 6011 (class 2606 OID 27699)
-- Name: transferencia_stock transferencia_stock_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.transferencia_stock
    ADD CONSTRAINT transferencia_stock_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6016 (class 2606 OID 44759)
-- Name: usuarios usuarios_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6017 (class 2606 OID 44769)
-- Name: usuarios usuarios_deleted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6019 (class 2606 OID 27704)
-- Name: usuarios_sucursales usuarios_sucursales_id_sucursal_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_sucursales
    ADD CONSTRAINT usuarios_sucursales_id_sucursal_fkey FOREIGN KEY (id_sucursal) REFERENCES public.sucursales(sucursal_id) ON DELETE CASCADE;


--
-- TOC entry 6020 (class 2606 OID 27709)
-- Name: usuarios_sucursales usuarios_sucursales_id_usuario_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios_sucursales
    ADD CONSTRAINT usuarios_sucursales_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuarios(usuario_id) ON DELETE CASCADE;


--
-- TOC entry 6018 (class 2606 OID 44764)
-- Name: usuarios usuarios_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.usuarios(usuario_id);


--
-- TOC entry 6037 (class 2606 OID 44748)
-- Name: ventanas ventanas_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

-- Índices adicionales para optimización en Neon
-- Estos índices mejoran el rendimiento de consultas comunes

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_username ON public.usuarios(username);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON public.usuarios(activo);

-- Índices para productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_marca ON public.productos(marca_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);

-- Índices para clientes
CREATE INDEX IF NOT EXISTS idx_clientes_ruc ON public.clientes(ruc);
CREATE INDEX IF NOT EXISTS idx_clientes_estado ON public.clientes(estado);

-- Índices para ventas
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON public.ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_cliente ON public.ventas(cliente_id);
CREATE INDEX IF NOT EXISTS idx_ventas_usuario ON public.ventas(usuario_id);

-- Índices para compras
CREATE INDEX IF NOT EXISTS idx_compra_cabecera_fecha ON public.compra_cabecera(fecha_compra);
CREATE INDEX IF NOT EXISTS idx_compra_cabecera_proveedor ON public.compra_cabecera(proveedor_id);

-- Índices para auditoría
CREATE INDEX IF NOT EXISTS idx_audit_logs_fecha ON public.audit_logs(fecha_hora);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON public.audit_logs(usuario_id);

--

--
-- Sistema de Gestión de Taller JC v5 - Optimizado para Neon Database
-- Database dump complete - Ready for Neon deployment
--
-- Características optimizadas para Neon:
-- - Eliminadas declaraciones de OWNER (no compatibles con Neon)
-- - Mantenida compatibilidad con PostgreSQL estándar
-- - Incluye datos iniciales esenciales para el funcionamiento
-- - Estructura optimizada para rendimiento en la nube
--

