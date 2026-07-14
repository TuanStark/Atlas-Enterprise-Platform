import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as organizationRepository from '@core/organization/domain/repositories/organization.repository';
import { DeleteOrganizationCommand } from './delete-organization.command';
import { ORGANIZATION_REPOSITORY } from '@core/organization/domain/repositories/organization.repository';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';
import { Result } from '@shared-kernel/application';

@CommandHandler(DeleteOrganizationCommand)
export class DeleteOrganizationHandler implements ICommandHandler<DeleteOrganizationCommand> {
  constructor(
    @Inject(ORGANIZATION_REPOSITORY)
    private readonly repository: organizationRepository.OrganizationRepository,
  ) {}

  async execute(command: DeleteOrganizationCommand): Promise<Result<void>> {
    const organization = await this.repository.findById(
      Identifier.create(command.tenantId),
      Identifier.create(command.organizationId),
    );

    if (!organization) {
      return Result.failure({
        statusCode: HttpStatus.NOT_FOUND,
        code: OrganizationErrorCode.ORGANIZATION_NOT_FOUND,
        message: OrganizationMessages.ERROR.ORGANIZATION_NOT_FOUND,
      });
    }

    await this.repository.delete(organization);
    return Result.success(undefined);
  }
}
