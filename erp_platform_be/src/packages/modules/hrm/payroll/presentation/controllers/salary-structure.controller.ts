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
  CreateSalaryStructureDto,
  UpdateSalaryStructureDto,
} from '../../application/dto/salary-structure.dto';
import {
  CreateSalaryStructureCommand,
  UpdateSalaryStructureCommand,
  DeleteSalaryStructureCommand,
} from '../../application/commands/salary-structure.commands';
import {
  GetSalaryStructureQuery,
  ListSalaryStructuresQuery,
} from '../../application/queries/salary-structure.queries';

@ApiTags('Salary Structures')
@Controller('salary-structures')
export class SalaryStructureController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a salary structure' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created salary structure' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateSalaryStructureDto) {
    return this.commandBus.execute(
      new CreateSalaryStructureCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all salary structures' })
  @ApiOkResponse({ description: 'List of salary structures' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListSalaryStructuresQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary structure by ID' })
  @ApiOkResponse({ description: 'Salary structure details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetSalaryStructureQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update salary structure' })
  @ApiOkResponse({ description: 'Salary structure updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateSalaryStructureDto,
  ) {
    return this.commandBus.execute(
      new UpdateSalaryStructureCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete salary structure' })
  @ApiOkResponse({ description: 'Salary structure deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteSalaryStructureCommand(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }
}
