export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  sortOrder?: 'asc' | 'desc';
}

export type Currency = 'ILS' | 'USD' | 'EUR' | 'GBP';
export type Language = 'he' | 'en';

export interface Address {
  street?: string;
  city?: string;
  zip?: string;
  country?: string;
}
