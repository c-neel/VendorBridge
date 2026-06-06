import { FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T | string;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
  emptyIcon?: React.ElementType;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  onRowClick,
  emptyIcon: EmptyIcon = FileX,
  emptyTitle = 'No data found',
  emptyDescription = 'There is no data to display matching your criteria.'
}: DataTableProps<T>) {

  return (
    <div className="overflow-x-auto w-full">
      <table className="table-premium w-full">
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={col.className}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`}>
                {columns.map((_, j) => (
                  <td key={`cell-${j}`}>
                    <div 
                      className="h-4 bg-surface-800/50 rounded w-full animate-pulse" 
                      style={{ animationDelay: `${(i * 100) + (j * 50)}ms` }} 
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((item) => (
              <tr 
                key={item.id} 
                onClick={() => onRowClick?.(item)}
                className={cn("group", onRowClick && "cursor-pointer hover:bg-surface-800/40 transition-colors")}
              >
                {columns.map((col, j) => (
                  <td key={`cell-${item.id}-${j}`} className={col.className}>
                    {col.cell ? col.cell(item) : col.accessorKey ? String(item[col.accessorKey as keyof T] || '') : ''}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="py-16 text-center">
                <EmptyIcon className="w-12 h-12 text-surface-600 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium text-white mb-1">{emptyTitle}</h3>
                <p className="text-surface-400 text-sm max-w-sm mx-auto">{emptyDescription}</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
