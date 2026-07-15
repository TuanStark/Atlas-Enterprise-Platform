import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
  CreateEmploymentDto,
  UpdateEmploymentStatusDto,
  TerminateEmploymentDto,
  CreateEmploymentContractDto,
} from '../../application/dto/employment.dto';
import {
  CreateEmploymentCommand,
  UpdateEmploymentStatusCommand,
  TerminateEmploymentCommand,
  CreateEmploymentContractCommand,
} from '../../application/commands/employment.commands';
import {
  GetEmploymentQuery,
  GetEmploymentsByEmployeeQuery,
} from '../../application/queries/employment.queries';

@ApiTags('Employments')
@Controller()
export class EmploymentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('employees/:employeeId/employments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create an employment record for an employee' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created employment' })
  create(
    @CurrentContext() context: RequestContext,
    @Param('employeeId') employeeId: string,
    @Body() dto: CreateEmploymentDto,
  ) {
    dto.employeeId = employeeId;
    return this.commandBus.execute(
      new CreateEmploymentCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get('employees/:employeeId/employments')
  @ApiOperation({ summary: 'List employment history of an employee' })
  @ApiOkResponse({ description: 'List of employments' })
  listByEmployee(
    @CurrentContext() context: RequestContext,
    @Param('employeeId') employeeId: string,
  ) {
    return this.queryBus.execute(
      new GetEmploymentsByEmployeeQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employeeId),
      ),
    );
  }

  @Get('employments/:id')
  @ApiOperation({ summary: 'Get employment details by ID' })
  @ApiOkResponse({ description: 'Employment details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetEmploymentQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch('employments/:id/status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update employment status' })
  @ApiOkResponse({ description: 'Employment status updated' })
  updateStatus(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmploymentStatusDto,
  ) {
    return this.commandBus.execute(
      new UpdateEmploymentStatusCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        context.principalId,
        dto,
      ),
    );
  }

  @Post('employments/:id/terminate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Terminate employment' })
  @ApiOkResponse({ description: 'Employment terminated' })
  terminate(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: TerminateEmploymentDto,
  ) {
    return this.commandBus.execute(
      new TerminateEmploymentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        context.principalId,
        dto,
      ),
    );
  }

  @Post('employments/:id/contracts')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add contract to employment' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created contract' })
  addContract(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: CreateEmploymentContractDto,
  ) {
    return this.commandBus.execute(
      new CreateEmploymentContractCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }
}
