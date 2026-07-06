import { PageMeta, CursorPageMeta } from '../result/pagination-meta';

export class Page<T> {
  public readonly totalPages: number;
  public readonly hasNextPage: boolean;
  public readonly hasPreviousPage: boolean;
  public readonly meta: PageMeta;

  constructor(
    public readonly items: ReadonlyArray<T>,
    public readonly totalItems: number,
    public readonly page: number,
    public readonly limit: number,
  ) {
    this.meta = new PageMeta(totalItems, page, limit);
    this.totalPages = this.meta.totalPages;
    this.hasNextPage = this.meta.hasNextPage;
    this.hasPreviousPage = this.meta.hasPreviousPage;
  }

  public static of<T>(
    items: ReadonlyArray<T>,
    totalItems: number,
    page: number,
    limit: number,
  ): Page<T> {
    return new Page<T>(items, totalItems, page, limit);
  }
}

export class CursorPage<T> {
  public readonly meta: CursorPageMeta;

  constructor(
    public readonly items: ReadonlyArray<T>,
    limit: number,
    hasNextPage: boolean,
    nextCursor?: string,
  ) {
    this.meta = new CursorPageMeta(limit, hasNextPage, nextCursor);
  }
}
