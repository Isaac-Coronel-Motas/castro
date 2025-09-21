import { useState, useEffect, useCallback } from 'react';
import { Venta, VentasApiResponse, FiltrosVentas } from '@/lib/types/ventas';

interface UseVentasOptions {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
  filters?: Partial<FiltrosVentas>;
}

interface UseVentasReturn {
  ventas: Venta[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  refetch: () => void;
  updateFilters: (newFilters: Partial<FiltrosVentas>) => void;
  updateSearch: (search: string) => void;
  updateSorting: (sort_by: string, sort_order: 'asc' | 'desc') => void;
  updatePagination: (page: number, limit?: number) => void;
}

export function useVentas(options: UseVentasOptions = {}): UseVentasReturn {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null>(null);

  const [currentOptions, setCurrentOptions] = useState<UseVentasOptions>({
    page: 1,
    limit: 10,
    search: '',
    sort_by: 'fecha_venta',
    sort_order: 'desc',
    filters: {},
    ...options,
  });

  const fetchVentas = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      // Parámetros de paginación
      searchParams.append('page', currentOptions.page?.toString() || '1');
      searchParams.append('limit', currentOptions.limit?.toString() || '10');
      
      // Parámetros de búsqueda y ordenamiento
      if (currentOptions.search) {
        searchParams.append('search', currentOptions.search);
      }
      if (currentOptions.sort_by) {
        searchParams.append('sort_by', currentOptions.sort_by);
      }
      if (currentOptions.sort_order) {
        searchParams.append('sort_order', currentOptions.sort_order);
      }

      // Filtros
      if (currentOptions.filters) {
        const filters = currentOptions.filters;
        if (filters.estado) searchParams.append('estado', filters.estado);
        if (filters.fecha_desde) searchParams.append('fecha_desde', filters.fecha_desde);
        if (filters.fecha_hasta) searchParams.append('fecha_hasta', filters.fecha_hasta);
        if (filters.cliente_id) searchParams.append('cliente_id', filters.cliente_id.toString());
        if (filters.caja_id) searchParams.append('caja_id', filters.caja_id.toString());
        if (filters.sucursal_id) searchParams.append('sucursal_id', filters.sucursal_id.toString());
        if (filters.forma_cobro_id) searchParams.append('forma_cobro_id', filters.forma_cobro_id.toString());
        if (filters.condicion_pago) searchParams.append('condicion_pago', filters.condicion_pago);
        if (filters.tipo_documento) searchParams.append('tipo_documento', filters.tipo_documento);
      }

      const response = await fetch(`/api/ventas/registro-ventas?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener las ventas');
      }

      const data: VentasApiResponse<Venta[]> = await response.json();
      
      if (data.success && data.data) {
        setVentas(data.data);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.message || 'Error al obtener las ventas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching ventas:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOptions]);

  const updateFilters = useCallback((newFilters: Partial<FiltrosVentas>) => {
    setCurrentOptions(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
      page: 1, // Reset to first page when filters change
    }));
  }, []);

  const updateSearch = useCallback((search: string) => {
    setCurrentOptions(prev => ({
      ...prev,
      search,
      page: 1, // Reset to first page when search changes
    }));
  }, []);

  const updateSorting = useCallback((sort_by: string, sort_order: 'asc' | 'desc') => {
    setCurrentOptions(prev => ({
      ...prev,
      sort_by,
      sort_order,
    }));
  }, []);

  const updatePagination = useCallback((page: number, limit?: number) => {
    setCurrentOptions(prev => ({
      ...prev,
      page,
      ...(limit && { limit }),
    }));
  }, []);

  const refetch = useCallback(() => {
    fetchVentas();
  }, [fetchVentas]);

  useEffect(() => {
    fetchVentas();
  }, [fetchVentas]);

  return {
    ventas,
    loading,
    error,
    pagination,
    refetch,
    updateFilters,
    updateSearch,
    updateSorting,
    updatePagination,
  };
}

// Hook para obtener estadísticas de ventas
interface UseVentasStatsReturn {
  stats: {
    totalVentas: number;
    ventasCompletadas: number;
    ingresosTotales: number;
    clientesAtendidos: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVentasStats(): UseVentasStatsReturn {
  const [stats, setStats] = useState<{
    totalVentas: number;
    ventasCompletadas: number;
    ingresosTotales: number;
    clientesAtendidos: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/informes', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const data: VentasApiResponse<any> = await response.json();
      
      if (data.success && data.data) {
        // Calcular estadísticas básicas desde los datos
        const ventas = data.data.ventas || [];
        const totalVentas = ventas.length;
        const ventasCompletadas = ventas.filter((v: Venta) => v.estado === 'cerrado').length;
        const ingresosTotales = ventas
          .filter((v: Venta) => v.estado === 'cerrado')
          .reduce((sum: number, v: Venta) => sum + (v.monto_venta || 0), 0);
        const clientesAtendidos = new Set(ventas.map((v: Venta) => v.cliente_id).filter(Boolean)).size;

        setStats({
          totalVentas,
          ventasCompletadas,
          ingresosTotales,
          clientesAtendidos,
        });
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error fetching ventas stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch,
  };
}

// Hook para crear una nueva venta
interface UseCreateVentaReturn {
  createVenta: (ventaData: any) => Promise<Venta | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateVenta(): UseCreateVentaReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createVenta = useCallback(async (ventaData: any): Promise<Venta | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/registro-ventas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ventaData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la venta');
      }

      const data: VentasApiResponse<Venta> = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear la venta');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error creating venta:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createVenta,
    loading,
    error,
  };
}
