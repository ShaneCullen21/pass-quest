import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string | null;
  direction: SortDirection;
}

export function useTableSort<T>(data: T[], defaultSortKey?: string) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: defaultSortKey || null,
    direction: null,
  });

  const sortedData = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key!);
      const bValue = getNestedValue(b, sortConfig.key!);

      if (aValue === bValue) return 0;

      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current.key === key) {
        // Cycle through: asc -> desc -> null (default)
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        } else if (current.direction === 'desc') {
          return { key: null, direction: null };
        } else {
          return { key, direction: 'asc' };
        }
      } else {
        // New column, start with ascending
        return { key, direction: 'asc' };
      }
    });
  };

  return {
    sortedData,
    sortConfig,
    handleSort,
  };
}

// Helper function to get nested object values by string path
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}