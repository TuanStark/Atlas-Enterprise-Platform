import { Body, Controller, Get, HttpCode, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { CreateEmployeeDto } from '../../application/dto/create-employee.dto';
import { UpdateEmployeeDto } from '../../application/dto/update-employee.dto';
import {
  SyncEmployeeContactsDto,
  SyncEmployeeAddressesDto,
  SyncEmployeeEmergencyContactsDto,
  SyncEmployeeDocumentsDto,
} from '../../application/dto/employee-child.dto';
import { CreateEmployeeCommand } from '../../application/commands/create-employee/create-employee.command';
import { UpdateEmployeeCommand } from '../../application/commands/update-employee/update-employee.command';
import {
  SyncEmployeeContactsCommand,
  SyncEmployeeAddressesCommand,
  SyncEmployeeEmergencyContactsCommand,
  SyncEmployeeDocumentsCommand,
} from '../../application/commands/employee-child.commands';
import { GetEmployeeQuery } from '../../application/queries/get-employee/get-employee.query';
import { ListEmployeesQuery } from '../../application/queries/list-employees/list-employees.query';

@ApiTags('Employees')
@Controller('employees')
export class EmployeeController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new employee' })
  @ApiCreatedResponse({ type: String, description: 'ID of the created employee' })
  create(@CurrentContext() context: RequestContext, @Body() dto: CreateEmployeeDto) {
    return this.commandBus.execute(
      new CreateEmployeeCommand(Identifier.create(context.tenantId), dto),
    );
  }

  @Get()
  @ApiOperation({ summary: 'List all employees' })
  @ApiOkResponse({ description: 'List of employees' })
  list(@CurrentContext() context: RequestContext) {
    return this.queryBus.execute(new ListEmployeesQuery(Identifier.create(context.tenantId)));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employee by ID' })
  @ApiOkResponse({ description: 'Employee details' })
  getById(@CurrentContext() context: RequestContext, @Param('id') id: string) {
    return this.queryBus.execute(
      new GetEmployeeQuery(Identifier.create(context.tenantId), Identifier.create(id)),
    );
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update employee information' })
  @ApiOkResponse({ description: 'Employee updated' })
  update(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
  ) {
    return this.commandBus.execute(
      new UpdateEmployeeCommand(Identifier.create(context.tenantId), Identifier.create(id), dto),
    );
  }

  @Post(':id/contacts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync employee contacts' })
  @ApiOkResponse({ description: 'Contacts synced' })
  syncContacts(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: SyncEmployeeContactsDto,
  ) {
    return this.commandBus.execute(
      new SyncEmployeeContactsCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/addresses')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync employee addresses' })
  @ApiOkResponse({ description: 'Addresses synced' })
  syncAddresses(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: SyncEmployeeAddressesDto,
  ) {
    return this.commandBus.execute(
      new SyncEmployeeAddressesCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/emergency-contacts')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync employee emergency contacts' })
  @ApiOkResponse({ description: 'Emergency contacts synced' })
  syncEmergencyContacts(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: SyncEmployeeEmergencyContactsDto,
  ) {
    return this.commandBus.execute(
      new SyncEmployeeEmergencyContactsCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }

  @Post(':id/documents')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync employee documents' })
  @ApiOkResponse({ description: 'Documents synced' })
  syncDocuments(
    @CurrentContext() context: RequestContext,
    @Param('id') id: string,
    @Body() dto: SyncEmployeeDocumentsDto,
  ) {
    return this.commandBus.execute(
      new SyncEmployeeDocumentsCommand(
        Identifier.create(context.tenantId),
        Identifier.create(id),
        dto,
      ),
    );
  }
}
