import {
    Pagination,
} from '@shared-kernel/application';

export class ListUserQuery {
    constructor(
        public readonly pagination?: Pagination,
    ) { }
}