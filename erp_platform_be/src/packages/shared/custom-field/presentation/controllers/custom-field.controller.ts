import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateCustomFieldDefinitionDto, SaveCustomFieldValuesDto, CustomFieldDefinitionDto, CustomFieldValueDto } from '../../application/dto/custom-field.dto';
import { CreateCustomFieldDefinitionCommand, DeleteCustomFieldDefinitionCommand, SaveCustomFieldValuesCommand } from '../../application/commands/custom-field.commands';
import { ListCustomFieldDefinitionsQuery, GetCustomFieldValuesQuery } from '../../application/queries/custom-field.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Custom Fields')
@Controller('custom-fields')
export class CustomFieldController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('definitions')
  @RequirePermission('shared.custom-field:write')
  @ApiOperation({ summary: 'Create custom field definition' })
  @ApiCreatedResponse({ type: CustomFieldDefinitionDto })
  async createDefinition(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateCustomFieldDefinitionDto,
  ): Promise<CustomFieldDefinitionDto> {
    return this.commandBus.execute(
      new CreateCustomFieldDefinitionCommand({
        tenantId: context.tenantId,
        targetModule: dto.targetModule,
        targetEntity: dto.targetEntity,
        code: dto.code,
        name: dto.name,
        fieldType: dto.fieldType,
        isRequired: dto.isRequired,
        defaultValue: dto.defaultValue,
        validationRules: dto.validationRules,
        displayOrder: dto.displayOrder,
        metadata: dto.metadata,
        createdByPrincipalId: context.principalId,
        options: dto.options,
      }),
    );
  }

  @Delete('definitions/:id')
  @RequirePermission('shared.custom-field:write')
  @ApiOperation({ summary: 'Delete custom field definition' })
  @ApiOkResponse({ description: 'Custom field definition and its values deleted successfully' })
  async deleteDefinition(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteCustomFieldDefinitionCommand(Identifier.create(id)));
  }

  @Get('definitions/:targetModule/:targetEntity')
  @RequirePermission('shared.custom-field:read')
  @ApiOperation({ summary: 'List custom field definitions for entity' })
  @ApiOkResponse({ type: [CustomFieldDefinitionDto] })
  async listDefinitions(
    @CurrentContext() context: RequestContext,
    @Param('targetModule') targetModule: string,
    @Param('targetEntity') targetEntity: string,
  ): Promise<CustomFieldDefinitionDto[]> {
    return this.queryBus.execute(
      new ListCustomFieldDefinitionsQuery(
        Identifier.create(context.tenantId),
        targetModule,
        targetEntity,
      ),
    );
  }

  @Post('values')
  @RequirePermission('shared.custom-field:write')
  @ApiOperation({ summary: 'Save custom field values for record' })
  @ApiOkResponse({ description: 'Custom field values saved successfully' })
  async saveValues(
    @Body() dto: SaveCustomFieldValuesDto[],
  ): Promise<void> {
    await this.commandBus.execute(
      new SaveCustomFieldValuesCommand(
        dto.map((v) => ({
          customFieldDefinitionId: v.customFieldDefinitionId,
          targetRecordId: v.targetRecordId,
          value: v.value,
        })),
      ),
    );
  }

  @Get('values/:targetRecordId')
  @RequirePermission('shared.custom-field:read')
  @ApiOperation({ summary: 'Get custom field values for record' })
  @ApiOkResponse({ type: [CustomFieldValueDto] })
  async getValues(@Param('targetRecordId') targetRecordId: string): Promise<CustomFieldValueDto[]> {
    return this.queryBus.execute(new GetCustomFieldValuesQuery(Identifier.create(targetRecordId)));
  }
}
