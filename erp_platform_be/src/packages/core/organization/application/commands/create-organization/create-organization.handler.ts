import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { OrganizationMapper } from '../../mappers';
import { CreateOrganizationCommand } from './create-organization.command';
import * as organizationRepository from '@core/organization/domain/repositories/organization.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { OrganizationCode } from '@core/organization/domain/value-objects/organization-code';
import { Result } from '@shared-kernel/application';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  constructor(
    @Inject(organizationRepository.ORGANIZATION_REPOSITORY)
    private readonly repository: organizationRepository.OrganizationRepository,
  ) {}

  async execute(command: CreateOrganizationCommand): Promise<Result<string>> {
    const tenantId = Identifier.create(command.dto.tenantId);
    const code = OrganizationCode.create(command.dto.code);
    const exists = await this.repository.existsByCode(tenantId, code);
    if (exists) {
      return Result.failure({
        statusCode: HttpStatus.CONFLICT,
        code: OrganizationErrorCode.ORGANIZATION_ALREADY_EXISTS,
        message: OrganizationMessages.ERROR.ORGANIZATION_ALREADY_EXISTS,
      });
    }

    const organization = OrganizationMapper.toDomain(command.dto);
    await this.repository.save(organization);
    return Result.success(organization.id.getValue(), {
      statusCode: HttpStatus.CREATED,
    });
  }
}
