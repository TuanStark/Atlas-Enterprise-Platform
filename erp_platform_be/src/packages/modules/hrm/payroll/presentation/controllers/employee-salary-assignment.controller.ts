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
  CreateEmployeeSalaryAssignmentDto,
  UpdateEmployeeSalaryAssignmentDto,
} from '../../application/dto/employee-salary-assignment.dto';
import {
  CreateEmployeeSalaryAssignmentCommand,
  UpdateEmployeeSalaryAssignmentCommand,
  DeleteEmployeeSalaryAssignmentCommand,
} from '../../application/commands/employee-salary-assignment.commands';
import {
  GetEmployeeSalaryAssignmentQuery,
  ListEmployeeSalaryAssignmentsQuery,
  ListSalaryAssignmentsByEmploymentQuery,
} from '../../application/queries/employee-salary-assignment.queries';

@ApiTags('Employee Salary Assignments')
@Controller('salary-assignments')
export class EmployeeSalaryAssignmentController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a salary assignment' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created salary assignment' })
  create(
    @CurrentContext() context: RequestContext,
    @Body() dto: CreateEmployeeSalaryAssignmentDto,
  ) {
    return this.commandBus.execute(
      new CreateEmployeeSalaryAssignmentCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all salary assignments' })
  @ApiOkResponse({ description: 'List of salary assignments' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(
      new ListEmployeeSalaryAssignmentsQuery(Identifier.create(context.tenantId)),
    );
  }

  @Get('employment/:employmentId')
  @ApiOperation({ summary: 'List salary assignments by employment ID' })
  @ApiOkResponse({ description: 'List of salary assignments' })
  listByEmployment(
    @CurrentContext() context: RequestContext,
    @Param('employmentId') employmentId: string,
  ) {
    return this.queryBus.execute(
      new ListSalaryAssignmentsByEmploymentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(employmentId),
      ),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get salary assignment by ID' })
  @ApiOkResponse({ description: 'Salary assignment details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetEmployeeSalaryAssignmentQuery(
        Identifier.create(context.tenantId),
        Identifier.create(id),
      ),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update salary assignment' })
  @ApiOkResponse({ description: 'Salary assignment updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeSalaryAssignmentDto,
  ) {
    return this.commandBus.execute(
      new UpdateEmployeeSalaryAssignmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete salary assignment' })
  @ApiOkResponse({ description: 'Salary assignment deleted' })
  delete(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.commandBus.execute(
      new DeleteEmployeeSalaryAssignmentCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
      ),
    );
  }
}
