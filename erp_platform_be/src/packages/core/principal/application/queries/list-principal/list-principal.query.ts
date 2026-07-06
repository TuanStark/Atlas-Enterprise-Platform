import { Pagination } from '@shared-kernel/application';

export class ListPrincipalQuery {
  constructor(public readonly pagination?: Pagination) {}
}
