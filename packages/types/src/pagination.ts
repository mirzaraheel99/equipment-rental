export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export type SortDirection = 'asc' | 'desc';

export interface SortParam {
  field: string;
  direction: SortDirection;
}

export type FilterOperator =
  'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'notIn';

export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: unknown;
}
