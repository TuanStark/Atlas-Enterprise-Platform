export interface Pagination {
    readonly page: number;
    readonly limit: number;
}

export interface CursorPagination {
    readonly cursor?: string;
    readonly limit: number;
}