import { Pagination, CursorPagination } from './pagination';

export class PageRequest implements Pagination {
    public readonly page: number;
    public readonly limit: number;

    private static readonly DEFAULT_PAGE = 1;
    private static readonly DEFAULT_LIMIT = 20;
    private static readonly DEFAULT_MAX_LIMIT = 100;

    constructor(
        page: number = 1,
        limit: number = 20,
        maxLimit: number = PageRequest.DEFAULT_MAX_LIMIT,
    ) {
        this.page = Number.isInteger(page) && page > 0 ? page : PageRequest.DEFAULT_PAGE;

        const validatedLimit = Number.isInteger(limit) && limit > 0 ? limit : PageRequest.DEFAULT_LIMIT;
        const validatedMaxLimit = Number.isInteger(maxLimit) && maxLimit > 0 ? maxLimit : PageRequest.DEFAULT_MAX_LIMIT;

        this.limit = Math.min(validatedLimit, validatedMaxLimit);
    }

    get offset(): number {
        return (this.page - 1) * this.limit;
    }

    public static create(
        params?: Partial<Pagination>,
        maxLimit: number = PageRequest.DEFAULT_MAX_LIMIT,
    ): PageRequest {
        return new PageRequest(params?.page, params?.limit, maxLimit);
    }
}

export class CursorPageRequest implements CursorPagination {
    public readonly cursor?: string;
    public readonly limit: number;

    private static readonly DEFAULT_LIMIT = 20;
    private static readonly DEFAULT_MAX_LIMIT = 100;

    constructor(
        cursor?: string,
        limit: number = 20,
        maxLimit: number = CursorPageRequest.DEFAULT_MAX_LIMIT,
    ) {
        this.cursor = cursor && cursor.trim() !== '' ? cursor.trim() : undefined;

        const validatedLimit = Number.isInteger(limit) && limit > 0 ? limit : CursorPageRequest.DEFAULT_LIMIT;
        const validatedMaxLimit = Number.isInteger(maxLimit) && maxLimit > 0 ? maxLimit : CursorPageRequest.DEFAULT_MAX_LIMIT;

        this.limit = Math.min(validatedLimit, validatedMaxLimit);
    }

    public static create(
        params?: Partial<CursorPagination>,
        maxLimit: number = CursorPageRequest.DEFAULT_MAX_LIMIT,
    ): CursorPageRequest {
        return new CursorPageRequest(params?.cursor, params?.limit, maxLimit);
    }
}
