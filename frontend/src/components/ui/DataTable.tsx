/**
 * Enhanced DataTable Component
 * Improved table component with sorting, loading states, and actions
 */

import type { ReactNode } from 'react';
import { useState } from 'react';
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
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = 'No hay registros para mostrar',
  rowClassName,
  onRowClick,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null;
    direction: 'asc' | 'desc' | null;
  }>({ key: null, direction: null });

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
                    col.sortable && 'cursor-pointer select-none hover:bg-gray-100 transition-colors'
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
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50',
                  rowClassName?.(row, rowIndex)
                )}
                onClick={() => onRowClick?.(row, rowIndex)}
              >
                {columns.map((col, colIndex) => (
                  <td
                    key={col.id || String(col.accessorKey) || colIndex}
                    className={cn(
                      'px-6 py-4 whitespace-nowrap text-sm',
                      getAlignClass(col.align)
                    )}
                  >
                    {col.cell
                      ? col.cell({ row: { original: row }, index: rowIndex })
                      : col.accessorKey
                      ? String(row[col.accessorKey] ?? '-')
                      : null}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
