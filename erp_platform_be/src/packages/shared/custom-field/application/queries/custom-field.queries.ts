import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CUSTOM_FIELD_REPOSITORY } from '../../domain/repositories/custom-field.repository';
import type { CustomFieldRepository } from '../../domain/repositories/custom-field.repository';
import { CustomFieldDefinitionDto, CustomFieldValueDto } from '../dto/custom-field.dto';

export class ListCustomFieldDefinitionsQuery {
  constructor(
    public readonly tenantId: Identifier,
    public readonly targetModule: string,
    public readonly targetEntity: string,
  ) {}
}

export class GetCustomFieldValuesQuery {
  constructor(public readonly targetRecordId: Identifier) {}
}

@QueryHandler(ListCustomFieldDefinitionsQuery)
export class ListCustomFieldDefinitionsHandler implements IQueryHandler<ListCustomFieldDefinitionsQuery> {
  constructor(
    @Inject(CUSTOM_FIELD_REPOSITORY)
    private readonly repository: CustomFieldRepository,
  ) {}

  async execute(query: ListCustomFieldDefinitionsQuery): Promise<CustomFieldDefinitionDto[]> {
    const definitions = await this.repository.findDefinitionsForEntity(
      query.tenantId,
      query.targetModule,
      query.targetEntity,
    );

    return definitions.map((def) => ({
      id: def.id,
      tenantId: def.tenantId,
      targetModule: def.targetModule,
      targetEntity: def.targetEntity,
      code: def.code,
      name: def.name,
      fieldType: def.fieldType,
      isRequired: def.isRequired,
      defaultValue: def.defaultValue || undefined,
      options: (def.customFieldDefinitionCustomFieldOptions || []).map((o: any) => ({
        value: o.value,
        label: o.label,
        sortOrder: o.sortOrder || undefined,
      })),
    }));
  }
}

@QueryHandler(GetCustomFieldValuesQuery)
export class GetCustomFieldValuesHandler implements IQueryHandler<GetCustomFieldValuesQuery> {
  constructor(
    @Inject(CUSTOM_FIELD_REPOSITORY)
    private readonly repository: CustomFieldRepository,
  ) {}

  async execute(query: GetCustomFieldValuesQuery): Promise<CustomFieldValueDto[]> {
    const values = await this.repository.findValuesForRecord(query.targetRecordId);

    return values.map((val) => ({
      id: val.id,
      customFieldDefinitionId: val.customFieldDefinitionId,
      targetRecordId: val.targetRecordId,
      value: val.value,
      definition: val.customFieldDefinition
        ? {
            id: val.customFieldDefinition.id,
            tenantId: val.customFieldDefinition.tenantId,
            targetModule: val.customFieldDefinition.targetModule,
            targetEntity: val.customFieldDefinition.targetEntity,
            code: val.customFieldDefinition.code,
            name: val.customFieldDefinition.name,
            fieldType: val.customFieldDefinition.fieldType,
            isRequired: val.customFieldDefinition.isRequired,
            defaultValue: val.customFieldDefinition.defaultValue || undefined,
            options: [],
          }
        : undefined,
    }));
  }
}
