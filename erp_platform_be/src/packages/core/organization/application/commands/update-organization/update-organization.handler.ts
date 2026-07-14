import { HttpStatus, Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import * as organizationRepository from '@core/organization/domain/repositories/organization.repository';
import { UpdateOrganizationCommand } from './update-organization.command';
import { Result } from '@shared-kernel/application';
import { OrganizationErrorCode, OrganizationMessages } from '@core/organization/domain';

@CommandHandler(UpdateOrganizationCommand)
export class UpdateOrganizationHandler implements ICommandHandler<UpdateOrganizationCommand> {
  constructor(
    @Inject(organizationRepository.ORGANIZATION_REPOSITORY)
    private readonly repository: organizationRepository.OrganizationRepository,
  ) {}

  async execute(command: UpdateOrganizationCommand): Promise<Result<void>> {
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

    if (command.dto.name) {
      organization.rename(command.dto.name);
    }

    if (command.dto.description !== undefined) {
      organization.changeDescription(command.dto.description);
    }

    if (command.dto.isActive !== undefined) {
      if (command.dto.isActive) {
        organization.activate();
      } else {
        organization.deactivate();
      }
    }

    await this.repository.update(organization);
    return Result.success(undefined);
  }
}
