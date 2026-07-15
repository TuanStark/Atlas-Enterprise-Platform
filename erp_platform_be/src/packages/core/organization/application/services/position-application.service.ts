import { PositionDomainService } from '@core/organization/domain/services/position-domain.service';
import { CreatePositionDto } from '@core/organization/dto/create-position.dto';
import { Injectable } from '@nestjs/common';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

@Injectable()
export class PositionApplicationService {
  constructor(private readonly domainService: PositionDomainService) {}

  async create(organizationId: Identifier, dto: CreatePositionDto) {
    return this.domainService.create(
      organizationId,
      dto.code,
      dto.name,
      dto.description,
      dto.level,
    );
  }
}
