export interface PaginationMeta {
    readonly page: number;
    readonly limit: number;
    readonly totalItems: number;
    readonly totalPages: number;
    readonly hasNextPage: boolean;
    readonly hasPreviousPage: boolean;
}

export class PageMeta implements PaginationMeta {
    public readonly page: number;
    public readonly limit: number;
    public readonly totalItems: number;
    public readonly totalPages: number;
    public readonly hasNextPage: boolean;
    public readonly hasPreviousPage: boolean;

    constructor(totalItems: number, page: number, limit: number) {
        this.totalItems = Math.max(0, totalItems);
        this.page = Math.max(1, page);
        this.limit = Math.max(1, limit);
        this.totalPages = Math.ceil(this.totalItems / this.limit);
        this.hasNextPage = this.page < this.totalPages;
        this.hasPreviousPage = this.page > 1;
    }
}

export interface CursorPaginationMeta {
    readonly limit: number;
    readonly nextCursor?: string;
    readonly hasNextPage: boolean;
}

export class CursorPageMeta implements CursorPaginationMeta {
    public readonly limit: number;
    public readonly nextCursor?: string;
    public readonly hasNextPage: boolean;

    constructor(limit: number, hasNextPage: boolean, nextCursor?: string) {
        this.limit = Math.max(1, limit);
        this.hasNextPage = hasNextPage;
        this.nextCursor = nextCursor;
    }
}
