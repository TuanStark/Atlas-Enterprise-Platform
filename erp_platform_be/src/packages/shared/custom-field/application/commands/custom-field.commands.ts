import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CUSTOM_FIELD_REPOSITORY } from '../../domain/repositories/custom-field.repository';
import type {
  CustomFieldRepository,
  CustomFieldDefinitionCreateInput,
  CustomFieldValueSaveInput,
} from '../../domain/repositories/custom-field.repository';

export class CreateCustomFieldDefinitionCommand {
  constructor(public readonly input: CustomFieldDefinitionCreateInput) {}
}

export class DeleteCustomFieldDefinitionCommand {
  constructor(public readonly id: Identifier) {}
}

export class SaveCustomFieldValuesCommand {
  constructor(public readonly values: CustomFieldValueSaveInput[]) {}
}

@CommandHandler(CreateCustomFieldDefinitionCommand)
export class CreateCustomFieldDefinitionHandler implements ICommandHandler<CreateCustomFieldDefinitionCommand> {
  constructor(
    @Inject(CUSTOM_FIELD_REPOSITORY)
    private readonly repository: CustomFieldRepository,
  ) {}

  async execute(command: CreateCustomFieldDefinitionCommand): Promise<any> {
    return this.repository.createDefinition(command.input);
  }
}

@CommandHandler(DeleteCustomFieldDefinitionCommand)
export class DeleteCustomFieldDefinitionHandler implements ICommandHandler<DeleteCustomFieldDefinitionCommand> {
  constructor(
    @Inject(CUSTOM_FIELD_REPOSITORY)
    private readonly repository: CustomFieldRepository,
  ) {}

  async execute(command: DeleteCustomFieldDefinitionCommand): Promise<void> {
    await this.repository.deleteDefinition(command.id);
  }
}

@CommandHandler(SaveCustomFieldValuesCommand)
export class SaveCustomFieldValuesHandler implements ICommandHandler<SaveCustomFieldValuesCommand> {
  constructor(
    @Inject(CUSTOM_FIELD_REPOSITORY)
    private readonly repository: CustomFieldRepository,
  ) {}

  async execute(command: SaveCustomFieldValuesCommand): Promise<void> {
    await this.repository.saveValues(command.values);
  }
}
