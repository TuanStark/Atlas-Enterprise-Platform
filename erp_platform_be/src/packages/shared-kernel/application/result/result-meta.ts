import { PaginationMeta, CursorPaginationMeta } from './pagination-meta';

export type ResultMeta = PaginationMeta | CursorPaginationMeta | Record<string, any>;
