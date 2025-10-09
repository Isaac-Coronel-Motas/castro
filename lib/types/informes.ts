// Tipos para el sistema de informes de compras
export interface FiltrosInformeBase {
  fecha_desde?: string
  fecha_hasta?: string
  sucursal_id?: number
  proveedor_id?: number
  cliente_id?: number
  almacen_id?: number
  estado?: string
  tipo_periodo?: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año'
}

// Filtros específicos por módulo
export interface FiltrosInformePedidos extends FiltrosInformeBase {
  tipo_documento?: string
  usuario_id?: number
}

export interface FiltrosInformePresupuestos extends FiltrosInformeBase {
  valido_hasta?: string
  descuento_min?: number
  descuento_max?: number
}

export interface FiltrosInformeOrdenes extends FiltrosInformeBase {
  tipo_documento?: string
  condicion_pago?: string
}

export interface FiltrosInformeRegistro extends FiltrosInformeBase {
  tipo_doc_id?: number
  nro_factura?: string
  condicion_pago?: string
}

export interface FiltrosInformeAjustes extends FiltrosInformeBase {
  motivo_id?: number
  tipo_movimiento?: 'entrada' | 'salida' | 'ajuste'
}

export interface FiltrosInformeNotas extends FiltrosInformeBase {
  tipo_operacion?: 'compra' | 'venta'
  tipo_nota?: 'credito' | 'debito'
}

export interface FiltrosInformeTransferencias extends FiltrosInformeBase {
  almacen_origen_id?: number
  almacen_destino_id?: number
  motivo?: string
}

// Estructuras de datos para informes
export interface ResumenInforme {
  total_registros: number
  valor_total: number
  promedio_por_registro: number
  tendencia_periodo_anterior: number
  porcentaje_cambio: number
}

export interface DistribucionPorEstado {
  estado: string
  cantidad: number
  porcentaje: number
  valor_total: number
}

export interface DistribucionPorProveedor {
  proveedor_id: number
  proveedor_nombre: string
  cantidad_registros: number
  valor_total: number
  porcentaje: number
}

export interface DistribucionPorCliente {
  cliente_id: number
  cliente_nombre: string
  cantidad_registros: number
  valor_total: number
  porcentaje: number
}

export interface DistribucionPorSucursal {
  sucursal_id: number
  sucursal_nombre: string
  cantidad_registros: number
  valor_total: number
  porcentaje: number
}

export interface DistribucionPorAlmacen {
  almacen_id: number
  almacen_nombre: string
  cantidad_registros: number
  valor_total: number
  porcentaje: number
}

export interface TendenciaMensual {
  mes: string
  año: number
  cantidad: number
  valor_total: number
  tendencia: 'up' | 'down' | 'stable'
}

export interface TendenciaDiaria {
  fecha: string
  cantidad: number
  valor_total: number
  tendencia: 'up' | 'down' | 'stable'
}

// Informes específicos por módulo
export interface InformePedidos {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_proveedor: DistribucionPorProveedor[]
  por_sucursal: DistribucionPorSucursal[]
  por_usuario: Array<{
    usuario_id: number
    usuario_nombre: string
    cantidad_pedidos: number
    valor_total: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformePresupuestos {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_proveedor: DistribucionPorProveedor[]
  por_sucursal: DistribucionPorSucursal[]
  por_descuento: Array<{
    rango_descuento: string
    cantidad: number
    porcentaje: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformeOrdenes {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_proveedor: DistribucionPorProveedor[]
  por_sucursal: DistribucionPorSucursal[]
  por_condicion_pago: Array<{
    condicion_pago: string
    cantidad: number
    porcentaje: number
    valor_total: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformeRegistroCompras {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_proveedor: DistribucionPorProveedor[]
  por_sucursal: DistribucionPorSucursal[]
  por_tipo_documento: Array<{
    tipo_doc_id: number
    tipo_doc_nombre: string
    cantidad: number
    porcentaje: number
    valor_total: number
  }>
  por_condicion_pago: Array<{
    condicion_pago: string
    cantidad: number
    porcentaje: number
    valor_total: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformeAjustesInventario {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_almacen: DistribucionPorAlmacen[]
  por_motivo: Array<{
    motivo_id: number
    motivo_nombre: string
    cantidad: number
    porcentaje: number
  }>
  por_tipo_movimiento: Array<{
    tipo_movimiento: string
    cantidad: number
    porcentaje: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformeNotasCreditoDebito {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_tipo_operacion: Array<{
    tipo_operacion: string
    cantidad: number
    porcentaje: number
    valor_total: number
  }>
  por_tipo_nota: Array<{
    tipo_nota: string
    cantidad: number
    porcentaje: number
    valor_total: number
  }>
  por_proveedor: DistribucionPorProveedor[]
  por_cliente: DistribucionPorCliente[]
  por_sucursal: DistribucionPorSucursal[]
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

export interface InformeTransferencias {
  resumen: ResumenInforme
  por_estado: DistribucionPorEstado[]
  por_almacen_origen: DistribucionPorAlmacen[]
  por_almacen_destino: DistribucionPorAlmacen[]
  por_motivo: Array<{
    motivo: string
    cantidad: number
    porcentaje: number
  }>
  tendencias_mensuales: TendenciaMensual[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

// Dashboard consolidado
export interface DashboardCompras {
  resumen_general: {
    total_pedidos: number
    total_presupuestos: number
    total_ordenes: number
    total_compras: number
    total_ajustes: number
    total_notas: number
    total_transferencias: number
    valor_total_compras: number
    valor_total_ordenes: number
    valor_total_presupuestos: number
  }
  tendencias_generales: {
    compras_mensuales: TendenciaMensual[]
    ordenes_mensuales: TendenciaMensual[]
    presupuestos_mensuales: TendenciaMensual[]
  }
  top_proveedores: DistribucionPorProveedor[]
  distribucion_por_estado: {
    pedidos: DistribucionPorEstado[]
    presupuestos: DistribucionPorEstado[]
    ordenes: DistribucionPorEstado[]
    compras: DistribucionPorEstado[]
  }
  distribucion_por_sucursal: DistribucionPorSucursal[]
  periodo: {
    fecha_desde: string
    fecha_hasta: string
  }
}

// Respuestas de API
export interface InformeApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: { [key: string]: string }
}

// Opciones de exportación
export interface OpcionesExportacion {
  formato: 'pdf' | 'excel' | 'csv'
  incluir_graficos: boolean
  incluir_detalles: boolean
  pagina_tamaño: 'A4' | 'A3' | 'Letter'
  orientacion: 'portrait' | 'landscape'
}

// Configuración de informe
export interface ConfiguracionInforme {
  titulo: string
  subtitulo?: string
  logo_empresa?: string
  pie_pagina?: string
  mostrar_fecha_generacion: boolean
  mostrar_usuario_generacion: boolean
  mostrar_filtros_aplicados: boolean
}
