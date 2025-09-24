import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  NotaRemision, 
  NotasRemisionApiResponse, 
  FiltrosNotasRemision, 
  NotaRemisionCreate, 
  NotaRemisionUpdate, 
  NotaRemisionApiResponse, 
  NotasRemisionStats, 
  NotasRemisionStatsResponse,
  DetalleRemision,
  NotaRemisionDetalleApiResponse
} from '@/lib/types/notas-remision';
import { useAuth } from '@/contexts/auth-context';

// Hook para obtener lista de notas de remisión
export interface UseNotasRemisionOptions {
  filtros?: FiltrosNotasRemision;
  autoFetch?: boolean;
}

export interface UseNotasRemisionReturn {
  notasRemision: NotaRemision[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  fetchNotasRemision: () => Promise<void>;
  refetchNotasRemision: () => Promise<void>;
}

export function useNotasRemision(options: UseNotasRemisionOptions = {}): UseNotasRemisionReturn {
  const { token } = useAuth();
  const { filtros = {}, autoFetch = true } = options;
  
  const [notasRemision, setNotasRemision] = useState<NotaRemision[]>([]);
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
    sort_by: filtros.sort_by || 'fecha_remision',
    sort_order: filtros.sort_order || 'desc',
    estado: filtros.estado,
    tipo_remision: filtros.tipo_remision,
    usuario_id: filtros.usuario_id,
    origen_almacen_id: filtros.origen_almacen_id,
    destino_sucursal_id: filtros.destino_sucursal_id,
    destino_almacen_id: filtros.destino_almacen_id,
    fecha_desde: filtros.fecha_desde,
    fecha_hasta: filtros.fecha_hasta
  }), [filtros]);

  const fetchNotasRemision = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(currentOptions).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/ventas/notas-remision?${searchParams.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener notas de remisión');
      }

      const data: NotasRemisionApiResponse = await response.json();
      
      if (data.success) {
        setNotasRemision(data.data);
        setPagination(data.pagination || null);
      } else {
        throw new Error(data.message || 'Error al obtener notas de remisión');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener notas de remisión:', err);
    } finally {
      setLoading(false);
    }
  }, [currentOptions, token]);

  const refetchNotasRemision = useCallback(async () => {
    await fetchNotasRemision();
  }, [fetchNotasRemision]);

  useEffect(() => {
    if (autoFetch) {
      fetchNotasRemision();
    }
  }, [fetchNotasRemision, autoFetch]);

  return {
    notasRemision,
    loading,
    error,
    pagination,
    fetchNotasRemision,
    refetchNotasRemision
  };
}

// Hook para estadísticas de notas de remisión
export interface UseNotasRemisionStatsReturn {
  stats: NotasRemisionStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
}

export function useNotasRemisionStats(): UseNotasRemisionStatsReturn {
  const { token } = useAuth();
  const [stats, setStats] = useState<NotasRemisionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/notas-remision/stats', {
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

      const data: NotasRemisionStatsResponse = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener estadísticas de notas de remisión:', err);
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

// Hook para crear nota de remisión
export interface UseCreateNotaRemisionReturn {
  createNotaRemision: (notaRemision: NotaRemisionCreate) => Promise<NotaRemision | null>;
  loading: boolean;
  error: string | null;
}

export function useCreateNotaRemision(): UseCreateNotaRemisionReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createNotaRemision = useCallback(async (notaRemision: NotaRemisionCreate): Promise<NotaRemision | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ventas/notas-remision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(notaRemision),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear nota de remisión');
      }

      const data: NotaRemisionApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear nota de remisión');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al crear nota de remisión:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    createNotaRemision,
    loading,
    error
  };
}

// Hook para actualizar nota de remisión
export interface UseUpdateNotaRemisionReturn {
  updateNotaRemision: (id: number, notaRemision: NotaRemisionUpdate) => Promise<NotaRemision | null>;
  loading: boolean;
  error: string | null;
}

export function useUpdateNotaRemision(): UseUpdateNotaRemisionReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateNotaRemision = useCallback(async (id: number, notaRemision: NotaRemisionUpdate): Promise<NotaRemision | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/notas-remision/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(notaRemision),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar nota de remisión');
      }

      const data: NotaRemisionApiResponse = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar nota de remisión');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al actualizar nota de remisión:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    updateNotaRemision,
    loading,
    error
  };
}

// Hook para eliminar nota de remisión
export interface UseDeleteNotaRemisionReturn {
  deleteNotaRemision: (id: number) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function useDeleteNotaRemision(): UseDeleteNotaRemisionReturn {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteNotaRemision = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/notas-remision/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar nota de remisión');
      }

      const data = await response.json();
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al eliminar nota de remisión:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    deleteNotaRemision,
    loading,
    error
  };
}

// Hook para obtener detalles de una nota de remisión
export interface UseNotaRemisionDetallesReturn {
  detalles: DetalleRemision[];
  loading: boolean;
  error: string | null;
  fetchDetalles: (id: number) => Promise<void>;
}

export function useNotaRemisionDetalles(): UseNotaRemisionDetallesReturn {
  const { token } = useAuth();
  const [detalles, setDetalles] = useState<DetalleRemision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalles = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ventas/notas-remision/${id}/detalles`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener detalles');
      }

      const data: NotaRemisionDetalleApiResponse = await response.json();
      
      if (data.success) {
        setDetalles(data.data);
      } else {
        throw new Error(data.message || 'Error al obtener detalles');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error al obtener detalles de nota de remisión:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return {
    detalles,
    loading,
    error,
    fetchDetalles
  };
}
