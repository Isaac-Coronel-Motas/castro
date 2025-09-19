import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface UseApiOptions {
  initialData?: any[];
  autoFetch?: boolean;
}

interface UseApiReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  refetch: () => Promise<void>;
  create: (item: any) => Promise<boolean>;
  update: (id: string | number, item: any) => Promise<boolean>;
  delete: (id: string | number) => Promise<boolean>;
  search: (term: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSorting: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  setPagination: (page: number, limit: number) => void;
}

export function useApi<T = any>(
  endpoint: string,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const { token } = useAuth();
  const [data, setData] = useState<T[]>(options.initialData || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null>(null);
  
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sorting, setSorting] = useState<{ sortBy: string; sortOrder: 'asc' | 'desc' }>({
    sortBy: 'created_at',
    sortOrder: 'desc'
  });
  const [paginationParams, setPaginationParams] = useState({ page: 1, limit: 10 });
  const [searchTerm, setSearchTerm] = useState('');

  const buildUrl = () => {
    const params = new URLSearchParams();
    
    // Pagination
    params.append('page', paginationParams.page.toString());
    params.append('limit', paginationParams.limit.toString());
    
    // Search
    if (searchTerm) {
      params.append('search', searchTerm);
    }
    
    // Sorting
    params.append('sort_by', sorting.sortBy);
    params.append('sort_order', sorting.sortOrder);
    
    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    return `${endpoint}?${params.toString()}`;
  };

  const fetchData = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(buildUrl(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result: ApiResponse<T[]> = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setPagination(result.pagination || null);
      } else {
        setError(result.message || 'Error al cargar los datos');
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const create = async (item: any): Promise<{ success: boolean; errors?: any[] }> => {
    if (!token) return { success: false };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        await fetchData(); // Refresh data
        return { success: true };
      } else {
        setError(result.message || 'Error al crear el elemento');
        return { success: false, errors: result.data };
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Create Error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: string | number, item: any): Promise<{ success: boolean; errors?: any[] }> => {
    if (!token) return { success: false };
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      const result: ApiResponse<T> = await response.json();
      
      if (result.success) {
        await fetchData(); // Refresh data
        return { success: true };
      } else {
        setError(result.message || 'Error al actualizar el elemento');
        return { success: false, errors: result.data };
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Update Error:', err);
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: string | number): Promise<boolean> => {
    if (!token) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const result: ApiResponse<any> = await response.json();
      
      if (result.success) {
        await fetchData(); // Refresh data
        return true;
      } else {
        setError(result.message || 'Error al eliminar el elemento');
        return false;
      }
    } catch (err) {
      setError('Error de conexión');
      console.error('Delete Error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const search = (term: string) => {
    setSearchTerm(term);
    setPaginationParams(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const setFiltersHandler = (newFilters: Record<string, any>) => {
    setFilters(newFilters);
    setPaginationParams(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const setSortingHandler = (sortBy: string, sortOrder: 'asc' | 'desc') => {
    setSorting({ sortBy, sortOrder });
    setPaginationParams(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const setPaginationHandler = (page: number, limit: number) => {
    setPaginationParams({ page, limit });
  };

  // Auto-fetch on mount and when dependencies change
  useEffect(() => {
    if (options.autoFetch !== false && token) {
      fetchData();
    }
  }, [token, filters, sorting, paginationParams, searchTerm]);

  return {
    data,
    loading,
    error,
    pagination,
    refetch: fetchData,
    create,
    update,
    delete: deleteItem,
    search,
    setFilters: setFiltersHandler,
    setSorting: setSortingHandler,
    setPagination: setPaginationHandler,
  };
}
