import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  } | null;
  searchTerm?: string;
  onSearch?: (term: string) => void;
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  onCreate?: () => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  createButtonText?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
}

export function DataTable<T extends Record<string, any>>({
  title,
  data,
  columns,
  loading = false,
  error = null,
  pagination = null,
  searchTerm = '',
  onSearch,
  onSort,
  onPageChange,
  onLimitChange,
  onCreate,
  onView,
  onEdit,
  onDelete,
  createButtonText = 'Nuevo',
  emptyMessage = 'No se encontraron datos',
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: string) => {
    if (!onSort) return;
    
    const newOrder = sortColumn === column && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortOrder(newOrder);
    onSort(column, newOrder);
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange && pagination && newPage >= 1 && newPage <= pagination.total_pages) {
      onPageChange(newPage);
    }
  };

  const handleLimitChange = (newLimit: number) => {
    if (onLimitChange) {
      onLimitChange(newLimit);
    }
  };

  const getDefaultRender = (column: Column<T>) => {
    return (item: T) => {
      const value = item[column.key];
      
      // Handle different data types
      if (typeof value === 'boolean') {
        return (
          <Badge className={value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
            {value ? 'Sí' : 'No'}
          </Badge>
        );
      }
      
      if (typeof value === 'object' && value !== null) {
        return <span className="text-gray-600">{JSON.stringify(value)}</span>;
      }
      
      return <span className="text-gray-900">{value || '-'}</span>;
    };
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {onCreate && (
            <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {createButtonText}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search */}
        {onSearch && (
          <div className="flex items-center gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Cargando...</span>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`text-left py-3 px-4 font-medium text-gray-900 ${
                        column.sortable ? 'cursor-pointer hover:bg-gray-50' : ''
                      }`}
                      style={{ width: column.width }}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-1">
                        {column.label}
                        {column.sortable && sortColumn === column.key && (
                          <span className="text-xs">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                  {(onView || onEdit || onDelete) && (
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    {columns.map((column) => (
                      <td key={column.key} className="py-3 px-4">
                        {column.render ? column.render(item) : getDefaultRender(column)(item)}
                      </td>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {onView && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onView(item)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {onEdit && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => onEdit(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700" 
                              onClick={() => onDelete(item)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && data.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {emptyMessage}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
                {pagination.total} resultados
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <select
                value={pagination.limit}
                onChange={(e) => handleLimitChange(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value={10}>10 por página</option>
                <option value={25}>25 por página</option>
                <option value={50}>50 por página</option>
                <option value={100}>100 por página</option>
              </select>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <span className="text-sm px-2">
                  Página {pagination.page} de {pagination.total_pages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.total_pages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
