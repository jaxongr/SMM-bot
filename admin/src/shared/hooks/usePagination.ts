import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ITEMS_PER_PAGE } from '@/shared/utils/constants';
import type { PaginationParams } from '@/shared/types/api.types';

export function usePagination(defaultLimit = ITEMS_PER_PAGE) {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) || 1;
  const limit = Number(searchParams.get('limit')) || defaultLimit;
  const sortBy = searchParams.get('sortBy') || undefined;
  const sortOrder =
    (searchParams.get('sortOrder') as 'asc' | 'desc') || undefined;

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('page', String(newPage));
        return params;
      });
    },
    [setSearchParams],
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('limit', String(newLimit));
        params.set('page', '1');
        return params;
      });
    },
    [setSearchParams],
  );

  const setSortBy = useCallback(
    (field: string) => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('sortBy', field);
        params.set('page', '1');
        return params;
      });
    },
    [setSearchParams],
  );

  const setSortOrder = useCallback(
    (order: 'asc' | 'desc') => {
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set('sortOrder', order);
        return params;
      });
    },
    [setSearchParams],
  );

  const params: PaginationParams = useMemo(
    () => ({ page, limit, sortBy, sortOrder }),
    [page, limit, sortBy, sortOrder],
  );

  const tablePageChange = useCallback(
    (newPage: number, newPageSize: number) => {
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        p.set('page', String(newPage));
        p.set('limit', String(newPageSize));
        return p;
      });
    },
    [setSearchParams],
  );

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    params,
    setPage,
    setLimit,
    setSortBy,
    setSortOrder,
    tablePageChange,
  };
}
