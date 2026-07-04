export class Page<T> {
    constructor(
        public readonly items: ReadonlyArray<T>,
        public readonly totalItems: number,
        public readonly page: number,
        public readonly limit: number,
    ) { }

    get totalPages(): number {
        return Math.ceil(this.totalItems / this.limit);
    }

    get hasNextPage(): boolean {
        return this.page < this.totalPages;
    }

    get hasPreviousPage(): boolean {
        return this.page > 1;
    }
}