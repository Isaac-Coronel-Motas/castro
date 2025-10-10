// Tipos para informes del módulo de Ventas

export interface FiltrosBaseInformeVentas {
  fecha_desde?: string;
  fecha_hasta?: string;
  sucursal_id?: number;
  cliente_id?: number;
  usuario_id?: number;
  estado?: string;
  tipo_periodo?: 'dia' | 'semana' | 'mes' | 'año';
}

export interface FiltrosInformePedidos extends FiltrosBaseInformeVentas {
  tipo_documento?: string;
  forma_cobro_id?: number;
}

export interface FiltrosInformeVentas extends FiltrosBaseInformeVentas {
  tipo_documento?: string;
  forma_cobro_id?: number;
  condicion_pago?: string;
  caja_id?: number;
}

export interface FiltrosInformeCobros extends FiltrosBaseInformeVentas {
  caja_id?: number;
  usuario_id?: number;
}

export interface FiltrosInformePresupuestos extends FiltrosBaseInformeVentas {
  tipo_presu?: string;
  valido_desde?: string;
  valido_hasta?: string;
}

export interface FiltrosInformeRemisiones extends FiltrosBaseInformeVentas {
  tipo_remision?: string;
  origen_almacen_id?: number;
  destino_sucursal_id?: number;
}

export interface FiltrosInformeNotas extends FiltrosBaseInformeVentas {
  tipo_operacion?: string;
  almacen_id?: number;
}

export interface FiltrosInformeCajas extends FiltrosBaseInformeVentas {
  caja_id?: number;
  activo?: boolean;
}

// Interfaces para datos de informes

export interface ResumenInformeVentas {
  total_ventas: number;
  total_cobros: number;
  total_pedidos: number;
  total_clientes: number;
  total_usuarios: number;
  total_abiertas: number;
  total_cerradas: number;
  total_canceladas: number;
  tendencia_ventas: number;
  tendencia_cobros: number;
  tendencia_pedidos: number;
  tendencia_clientes: number;
}

export interface DistribucionPorEstadoVentas {
  estado: string;
  cantidad: string;
  monto: string;
}

export interface TopCliente {
  cliente_id: number | null;
  nombre: string | null;
  email: string | null;
  total_pedidos: string;
  total_ventas: string;
}

export interface TopUsuario {
  usuario_id: number;
  nombre: string;
  email: string;
  total_transacciones: number;
  total_ventas: number;
}

export interface DistribucionPorSucursalVentas {
  sucursal_id: number;
  nombre: string;
  total_transacciones: number;
  total_ventas: number;
}

export interface DistribucionPorCajaVentas {
  nro_caja: string | null;
  total_transacciones: string;
  total_ventas: string;
}

export interface DistribucionPorFormaCobro {
  forma_cobro_id: number;
  forma_cobro_nombre: string;
  cantidad: number;
  porcentaje: number;
  valor_total: number;
}

export interface DistribucionPorCondicionPago {
  condicion_pago: string;
  cantidad: number;
  porcentaje: number;
  valor_total: number;
}

export interface TendenciaMensualVentas {
  año: string;
  mes: string;
  mes_nombre: string;
  total_transacciones: string;
  total_ventas: string;
}

// Interfaces principales de informes

export interface InformeDashboardVentas {
  resumen: ResumenInformeVentas;
  distribucion_por_estado: DistribucionPorEstadoVentas[];
  top_clientes: TopCliente[];
  top_usuarios: TopUsuario[];
  distribucion_por_sucursal: DistribucionPorSucursalVentas[];
  distribucion_por_caja: DistribucionPorCajaVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformePedidos {
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstadoVentas[];
  top_clientes: TopCliente[];
  por_forma_cobro: DistribucionPorFormaCobro[];
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformeVentas {
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstadoVentas[];
  top_clientes: TopCliente[];
  top_usuarios: TopUsuario[];
  por_forma_cobro: DistribucionPorFormaCobro[];
  por_condicion_pago: DistribucionPorCondicionPago[];
  por_sucursal: DistribucionPorSucursalVentas[];
  por_caja: DistribucionPorCaja[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformeCobros {
  resumen: ResumenInformeVentas;
  top_clientes: TopCliente[];
  top_usuarios: TopUsuario[];
  por_caja: DistribucionPorCaja[];
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformePresupuestos {
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstadoVentas[];
  top_clientes: TopCliente[];
  top_usuarios: TopUsuario[];
  por_tipo_presu: Array<{
    tipo_presu: string;
    cantidad: number;
    porcentaje: number;
    valor_total: number;
  }>;
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformeRemisiones {
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstadoVentas[];
  por_tipo_remision: Array<{
    tipo_remision: string;
    cantidad: number;
    porcentaje: number;
  }>;
  top_usuarios: TopUsuario[];
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformeNotas {
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstadoVentas[];
  por_tipo_operacion: Array<{
    tipo_operacion: string;
    cantidad: number;
    porcentaje: number;
    valor_total: number;
  }>;
  top_clientes: TopCliente[];
  top_usuarios: TopUsuario[];
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}

export interface InformeCajas {
  resumen: {
    total_cajas: number;
    cajas_activas: number;
    cajas_inactivas: number;
    total_ventas: number;
    total_cobros: number;
  };
  por_caja: DistribucionPorCaja[];
  por_sucursal: DistribucionPorSucursalVentas[];
  tendencias_mensuales: TendenciaMensualVentas[];
}