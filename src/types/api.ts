export type ApiResponse<T> = {
  message?: string;
  data?: T;
};

export type PageMeta = {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
};

export type PagedResponse<T> = ApiResponse<T[]> & { meta?: PageMeta };
