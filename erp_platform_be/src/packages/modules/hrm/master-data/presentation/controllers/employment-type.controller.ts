import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  CreateEmploymentTypeDto,
  UpdateEmploymentTypeDto,
} from '../../application/dto/employment-type.dto';
import {
  CreateEmploymentTypeCommand,
  UpdateEmploymentTypeCommand,
  DeleteEmploymentTypeCommand,
} from '../../application/commands/employment-type.commands';
import {
  GetEmploymentTypeQuery,
  ListEmploymentTypesQuery,
} from '../../application/queries/master-data.queries';

@ApiTags('Employment Types')
@Controller('employment-types')
export class EmploymentTypeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an employment type' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created employment type' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateEmploymentTypeDto) {
    return this.commandBus.execute(
      new CreateEmploymentTypeCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all employment types' })
  @ApiOkResponse({ description: 'List of employment types' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListEmploymentTypesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employment type by ID' })
  @ApiOkResponse({ description: 'Employment type details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetEmploymentTypeQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update employment type' })
  @ApiOkResponse({ description: 'Employment type updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmploymentTypeDto,
  ) {
    return this.commandBus.execute(
      new UpdateEmploymentTypeCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete employment type' })
  @ApiOkResponse({ description: 'Employment type deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteEmploymentTypeCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
