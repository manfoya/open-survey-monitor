export interface PaginationQuery {
  page?: string;
  size?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
}

export interface PaginationMeta {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}
