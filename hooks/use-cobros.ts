import { useState, useEffect, useCallback, useMemo } from 'react';
import { Cobro, CobrosApiResponse, FiltrosCobros, CobroCreate, CobroUpdate, CobroApiResponse, CobroStats, CobroStatsResponse } from '@/lib/types/cobros';
import { useAuth } from '@/contexts/auth-context';

// Hook para obtener lista de cobros
export interface UseCobrosOptions {
  filtros?: FiltrosCobros;
  autoFetch?: boolean;
}

export interface UseCobrosReturn {
  cobros: Cobro[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  fetchCobros: () => Promise<void>;
  refetchCobros: () => Promise<void>;
}

export function useCobros(options: UseCobrosOptions = {}): UseCobrosReturn {
  const { token } = useAuth();
  const { filtros = {}, autoFetch = true } = options;
  
  const [cobros, setCobros] = useState<Cobro[]>([]);
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
    sort_by: filtros.sort_by || 'fecha_cobro',
    sort_order: filtros.sort_order || 'desc',
    venta_id: filtros.venta_id,
    caja_id: filtros.caja_id,
    fecha_desde: filtros.fecha_desde,
    fecha_hasta: filtros.fecha_hasta,
    usuario_id: filtros.usuario_id
  }), [filtros]);

  const fetchCobros = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(currentOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/ventas/cobros?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener cobros');
      }

      const data: CobrosApiResponse = await response.json();
      
      if (data.success) {
        setCobros(data.data);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.message || 'Error al obtener cobros');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener cobros:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOptions, token]);

  const refetchCobros = useCallback(async () => {
    await fetchCobros();
  }, [fetchCobros]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchCobros();
    }
  }, [fetchCobros, autoFetch, token]);

  return {
    cobros,
    loading,
    error,
    pagination,
    fetchCobros,
    refetchCobros
  };
}

// Hook para estadísticas de cobros
export interface UseCobrosStatsReturn {
  stats: CobroStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function useCobrosStats(): UseCobrosStatsReturn {
  const { token } = useAuth();
  const [stats, setStats] = useState<CobroStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/cobros/stats', {
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

      const data: CobroStatsResponse = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener estadísticas de cobros:', err);
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

// Hook para crear cobro
export interface UseCreateCobroReturn {
  createCobro: (cobro: CobroCreate) => Promise<Cobro | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateCobro(): UseCreateCobroReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCobro = useCallback(async (cobro: CobroCreate): Promise<Cobro | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/cobros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(cobro),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear cobro');
      }

      const data: CobroApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear cobro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al crear cobro:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    createCobro,
    loading,
    error
  };
}

// Hook para actualizar cobro
export interface UseUpdateCobroReturn {
  updateCobro: (id: number, cobro: CobroUpdate) => Promise<Cobro | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdateCobro(): UseUpdateCobroReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCobro = useCallback(async (id: number, cobro: CobroUpdate): Promise<Cobro | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/cobros/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(cobro),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar cobro');
      }

      const data: CobroApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar cobro');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al actualizar cobro:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    updateCobro,
    loading,
    error
  };
}

// Hook para eliminar cobro
export interface UseDeleteCobroReturn {
  deleteCobro: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useDeleteCobro(): UseDeleteCobroReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCobro = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/cobros/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar cobro');
      }

      const data = await response.json();
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al eliminar cobro:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    deleteCobro,
    loading,
    error
  };
}
