import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Result } from '@shared-kernel/application';
import { BaseCrudControllerHelper } from '@shared-kernel/presentation/controllers/base-crud.controller';
import { AssignRoleDto } from '../../application/dto/assign-role.dto';
import { PrincipalRoleDto } from '../../application/dto/principal-role.dto';
import { AssignRoleToPrincipalCommand } from '../../application/commands/assign-role-to-principal/assign-role-to-principal.command';
import { RemoveRoleFromPrincipalCommand } from '../../application/commands/remove-role-from-principal/remove-role-from-principal.command';
import { ListPrincipalRolesQuery } from '../../application/queries/list-principal-roles/list-principal-roles.query';

@ApiTags('Principal Roles')
@Controller('principals')
export class PrincipalRoleController extends BaseCrudControllerHelper {
  constructor(commandBus: CommandBus, queryBus: QueryBus) {
    super(commandBus, queryBus);
  }

  @Post(':principalId/roles')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to principal' })
  @ApiOkResponse({ description: 'Role assigned successfully.' })
  async assignRole(
    @Param('principalId') principalId: string,
    @Body() dto: AssignRoleDto,
  ): Promise<Result<void>> {
    return this.commandBus.execute(
      new AssignRoleToPrincipalCommand(principalId, dto.roleId, dto.scopeId),
    );
  }

  @Delete(':principalId/roles/:roleId/scopes/:scopeId')
  @ApiOperation({ summary: 'Remove role from principal' })
  @ApiOkResponse({ description: 'Role removed successfully.' })
  async removeRole(
    @Param('principalId') principalId: string,
    @Param('roleId') roleId: string,
    @Param('scopeId') scopeId: string,
  ): Promise<Result<void>> {
    return this.commandBus.execute(
      new RemoveRoleFromPrincipalCommand(principalId, roleId, scopeId),
    );
  }

  @Get(':principalId/roles')
  @ApiOperation({ summary: 'List roles of principal' })
  @ApiOkResponse({ type: [PrincipalRoleDto] })
  async listRoles(
    @Param('principalId') principalId: string,
  ): Promise<Result<PrincipalRoleDto[]>> {
    return this.queryBus.execute(new ListPrincipalRolesQuery(principalId));
  }
}
