import type { ReactNode } from 'react';
import { cn } from '@/utils';

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  id?: string;
  cell?: (info: { row: { original: T } }) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
}: DataTableProps<T>) {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Cargando datos...</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No hay registros para mostrar.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-medium uppercase text-xs border-b border-gray-200">
            <tr>
              {columns.map((col, index) => (
                <th key={col.id || String(col.accessorKey) || index} className="px-6 py-3 whitespace-nowrap">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={col.id || String(col.accessorKey) || colIndex} className="px-6 py-4 whitespace-nowrap">
                    {col.cell
                      ? col.cell({ row: { original: row } })
                      : col.accessorKey
                      ? String(row[col.accessorKey])
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
