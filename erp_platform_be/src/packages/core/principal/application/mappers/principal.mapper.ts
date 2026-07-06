import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Principal, PrincipalStatus } from '../../domain';
import { CreatePrincipalDto, PrincipalDto } from '../dto';

export class PrincipalMapper {
  static toDomain(dto: CreatePrincipalDto): Principal {
    return Principal.create({
      tenantId: Identifier.create(dto.tenantId),
      type: dto.type,
      status: PrincipalStatus.ACTIVE,
      displayName: dto.displayName,
      metadata: dto.metadata,
    });
  }

  static toDto(principal: Principal): PrincipalDto {
    return {
      id: principal.id.getValue(),
      tenantId: principal.tenantId.getValue(),
      type: principal.type,
      status: principal.status,
      displayName: principal.displayName,
      metadata: principal.metadata,
      createdAt: principal.createdAt,
      updatedAt: principal.updatedAt,
    };
  }
}
