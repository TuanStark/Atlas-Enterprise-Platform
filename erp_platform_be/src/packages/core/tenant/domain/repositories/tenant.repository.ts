import { Repository } from '@shared-kernel/domain/events/event-bus.interface';
import { Tenant } from '../entities/tenant.entity';
import { TenantCode } from '../value-objects/tenant-code.vo';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface TenantRepository extends Repository<Tenant> {
  findByCode(code: TenantCode): Promise<Tenant | null>;

  existsByCode(code: TenantCode): Promise<boolean>;

  existsById(id: Identifier): Promise<boolean>;
}
