// ===== TIPOS PARA INFORMES DE VENTAS =====

export interface FiltrosInformeVentas {
  fecha_desde: string;
  fecha_hasta: string;
  sucursal_id: string;
  cliente_id: string;
  categoria_id: string;
  estado: string;
  tipo_periodo: 'dia' | 'semana' | 'mes' | 'trimestre' | 'año';
}

export interface ResumenInformeVentas {
  total_ventas: number;
  total_ventas_cerradas: number;
  total_ventas_abiertas: number;
  total_ventas_canceladas: number;
  total_cobros: number;
  total_notas_credito: number;
  total_notas_debito: number;
  valor_total_ventas: number;
  valor_total_cobros: number;
  valor_total_notas_credito: number;
  valor_total_notas_debito: number;
}

export interface PeriodoInforme {
  fecha_desde: string;
  fecha_hasta: string;
  tipo_periodo: string;
}

export interface DistribucionPorEstado {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface TopCliente {
  cliente_id: number;
  cliente_nombre: string;
  total_ventas: number;
  monto_total: number;
  porcentaje: number;
}

export interface DistribucionPorSucursal {
  sucursal_id: number;
  sucursal_nombre: string;
  total_ventas: number;
  monto_total: number;
  porcentaje: number;
}

export interface TopProducto {
  producto_id: number;
  nombre_producto: string;
  nombre_categoria: string;
  total_vendido: number;
  monto_total: number;
  porcentaje: number;
}

export interface DistribucionPorCategoria {
  categoria_id: number;
  nombre_categoria: string;
  total_ventas: number;
  total_productos: number;
  monto_total: number;
  porcentaje: number;
}

export interface TendenciaPeriodo {
  periodo: string;
  cantidad: number;
  monto: number;
  tendencia: 'up' | 'down' | 'stable';
}

export interface TendenciasInforme {
  ventas_periodo: TendenciaPeriodo[];
}

export interface InformeVentas {
  periodo: PeriodoInforme;
  resumen: ResumenInformeVentas;
  por_estado: DistribucionPorEstado[];
  por_cliente: TopCliente[];
  por_sucursal: DistribucionPorSucursal[];
  por_producto: TopProducto[];
  por_categoria: DistribucionPorCategoria[];
  tendencias: TendenciasInforme;
}

// ===== TIPOS PARA EXPORTACIÓN =====

export interface ExportarInformeVentasRequest {
  tipo: 'pdf' | 'excel';
  formato: 'completo' | 'resumen' | 'detallado';
  filtros: FiltrosInformeVentas;
}

export interface ReporteDisponible {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: 'pdf' | 'excel';
  endpoint: string;
  icono: string;
}

// ===== TIPOS PARA MÉTRICAS ADICIONALES =====

export interface MetricaVentas {
  titulo: string;
  valor: number;
  valor_anterior?: number;
  tendencia: 'up' | 'down' | 'stable';
  porcentaje_cambio?: number;
  icono: string;
  color: string;
}

export interface GraficoVentas {
  titulo: string;
  tipo: 'line' | 'bar' | 'pie' | 'doughnut';
  datos: any[];
  opciones?: any;
}

// ===== TIPOS PARA DASHBOARD =====

export interface DashboardVentas {
  metricas: MetricaVentas[];
  graficos: GraficoVentas[];
  resumen: ResumenInformeVentas;
  alertas: string[];
  recomendaciones: string[];
}
