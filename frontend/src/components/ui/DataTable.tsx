/**
 * Enhanced DataTable Component
 * Improved table component with sorting, pagination, striped rows, loading states, and actions
 */

import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';
import { cn } from '@/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  id?: string;
  cell?: (info: { row: { original: T }; index: number }) => ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  sticky?: 'left' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  striped?: boolean;
  pageSize?: number;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay registros para mostrar',
  rowClassName,
  onRowClick,
  striped = true,
  pageSize = 10,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to first page when data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data]);

  // Sorting function
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !column.accessorKey) return;

    const key = column.accessorKey;
    let direction: 'asc' | 'desc' = 'asc';

    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        // Reset sorting
        setSortConfig({ key: null, direction: null });
        return;
      }
    }

    setSortConfig({ key, direction });
  };

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = sortedData.slice(startIndex, endIndex);

  // Loading state
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#032DFF]"></div>
          <p className="mt-3 text-sm text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="mt-3 text-sm text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Alignment classes
  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return 'text-left';
  };

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Header */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.id || String(col.accessorKey) || index}
                  className={cn(
                    'px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider',
                    getAlignClass(col.align),
                    col.sortable && 'cursor-pointer select-none hover:bg-gray-100 transition-colors',
                    col.sticky && 'sticky z-10 bg-gray-50',
                    col.sticky === 'right' && 'right-0',
                    col.sticky === 'left' && 'left-0'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col)}
                >
                  <div className="flex items-center gap-1">
                    <span>{col.header}</span>
                    {col.sortable && col.accessorKey && (
                      <span className="ml-1">
                       {sortConfig.key === col.accessorKey ? (
                          sortConfig.direction === 'asc' ? (
                            <IconChevronUp size={14} className="text-[#032DFF]" />
                          ) : (
                            <IconChevronDown size={14} className="text-[#032DFF]" />
                          )
                        ) : (
                          <IconSelector size={14} className="text-gray-400" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                  striped && rowIndex % 2 === 1 && 'bg-gray-50',
                  rowClassName?.(row, startIndex + rowIndex)
                )}
                onClick={() => onRowClick?.(row, startIndex + rowIndex)}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.id || String(col.accessorKey) || colIndex}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm',
                      getAlignClass(col.align),
                      col.sticky && 'sticky z-10 bg-white',
                      col.sticky === 'right' && 'right-0',
                      col.sticky === 'left' && 'left-0',
                      // Add shadow for sticky columns to create depth effect
                      col.sticky === 'right' && 'shadow-[-4px_0_6px_-2px_rgba(0,0,0,0.1)]',
                      col.sticky === 'left' && 'shadow-[4px_0_6px_-2px_rgba(0,0,0,0.1)]',
                      // Maintain striped background for sticky columns
                      col.sticky && striped && rowIndex % 2 === 1 && 'bg-gray-50'
                    )}
                  >
                    {col.cell
                      ? col.cell({ row: { original: row }, index: startIndex + rowIndex })
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '-')
                      : null}
                  </td>
                ))}{' '}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> de{' '}
                  <span className="font-medium">{sortedData.length}</span> registros
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Anterior</span>
                    <IconChevronDown size={16} className="rotate-90" />
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    // Show first, last, current, and pages around current
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                            page === currentPage
                              ? 'z-10 bg-[#032DFF] border-[#032DFF] text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          )}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      (page === currentPage - 2 && page > 1) ||
                      (page === currentPage + 2 && page < totalPages)
                    ) {
                      return (
                        <span
                          key={page}
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                        >
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Siguiente</span>
                    <IconChevronDown size={16} className="-rotate-90" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}