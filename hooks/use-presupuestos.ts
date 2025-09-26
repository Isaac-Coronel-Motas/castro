import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  PresupuestoServicio, 
  PresupuestosServiciosApiResponse, 
  FiltrosPresupuestosServicios, 
  PresupuestoServicioCreate, 
  PresupuestoServicioUpdate, 
  PresupuestoServicioApiResponse, 
  PresupuestosServiciosStats, 
  PresupuestosServiciosStatsResponse 
} from '@/lib/types/presupuestos';
import { useAuth } from '@/contexts/auth-context';

// Hook para obtener lista de presupuestos de servicios
export interface UsePresupuestosServiciosOptions {
  filtros?: FiltrosPresupuestosServicios;
  autoFetch?: boolean;
}

export interface UsePresupuestosServiciosReturn {
  presupuestos: PresupuestoServicio[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  fetchPresupuestos: () => Promise<void>;
  refetchPresupuestos: () => Promise<void>;
}

export function usePresupuestosServicios(options: UsePresupuestosServiciosOptions = {}): UsePresupuestosServiciosReturn {
  const { token } = useAuth();
  const { filtros = {}, autoFetch = true } = options;
  
  const [presupuestos, setPresupuestos] = useState<PresupuestoServicio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null>(null);

  const currentOptions = useMemo(() => ({
    page: filtros.page || 1,
    limit: filtros.limit || 10,
    search: filtros.search || '',
    sort_by: filtros.sort_by || 'fecha_presupuesto',
    sort_order: filtros.sort_order || 'desc',
    estado: filtros.estado,
    tipo_presu: filtros.tipo_presu,
    usuario_id: filtros.usuario_id,
    sucursal_id: filtros.sucursal_id,
    fecha_desde: filtros.fecha_desde,
    fecha_hasta: filtros.fecha_hasta
  }), [filtros]);

  const fetchPresupuestos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(currentOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/ventas/presupuestos-servicios?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener presupuestos');
      }

      const data: PresupuestosServiciosApiResponse = await response.json();
      
      if (data.success) {
        setPresupuestos(data.data);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.message || 'Error al obtener presupuestos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener presupuestos:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOptions, token]);

  const refetchPresupuestos = useCallback(async () => {
    await fetchPresupuestos();
  }, [fetchPresupuestos]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchPresupuestos();
    }
  }, [fetchPresupuestos, autoFetch, token]);

  return {
    presupuestos,
    loading,
    error,
    pagination,
    fetchPresupuestos,
    refetchPresupuestos
  };
}

// Hook para estadísticas de presupuestos de servicios
export interface UsePresupuestosServiciosStatsReturn {
  stats: PresupuestosServiciosStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function usePresupuestosServiciosStats(): UsePresupuestosServiciosStatsReturn {
  const { token } = useAuth();
  const [stats, setStats] = useState<PresupuestosServiciosStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/presupuestos-servicios/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener estadísticas');
      }

      const data: PresupuestosServiciosStatsResponse = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener estadísticas de presupuestos:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
}

// Hook para crear presupuesto de servicio
export interface UseCreatePresupuestoServicioReturn {
  createPresupuesto: (presupuesto: PresupuestoServicioCreate) => Promise<PresupuestoServicio | null>;
  loading: boolean;
  error: string | null;
}

export function useCreatePresupuestoServicio(): UseCreatePresupuestoServicioReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPresupuesto = useCallback(async (presupuesto: PresupuestoServicioCreate): Promise<PresupuestoServicio | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/presupuestos-servicios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(presupuesto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear presupuesto');
      }

      const data: PresupuestoServicioApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear presupuesto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al crear presupuesto:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    createPresupuesto,
    loading,
    error
  };
}

// Hook para actualizar presupuesto de servicio
export interface UseUpdatePresupuestoServicioReturn {
  updatePresupuesto: (id: number, presupuesto: PresupuestoServicioUpdate) => Promise<PresupuestoServicio | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdatePresupuestoServicio(): UseUpdatePresupuestoServicioReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePresupuesto = useCallback(async (id: number, presupuesto: PresupuestoServicioUpdate): Promise<PresupuestoServicio | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/presupuestos-servicios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(presupuesto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar presupuesto');
      }

      const data: PresupuestoServicioApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar presupuesto');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al actualizar presupuesto:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    updatePresupuesto,
    loading,
    error
  };
}

// Hook para eliminar presupuesto de servicio
export interface UseDeletePresupuestoServicioReturn {
  deletePresupuesto: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useDeletePresupuestoServicio(): UseDeletePresupuestoServicioReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deletePresupuesto = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/presupuestos-servicios/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar presupuesto');
      }

      const data = await response.json();
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al eliminar presupuesto:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    deletePresupuesto,
    loading,
    error
  };
}
