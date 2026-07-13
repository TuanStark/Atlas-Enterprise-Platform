import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionController } from './presentation/controller/rbac.controller';
import { RoleController } from './presentation/controller/role.controller';
import { PrincipalRoleController } from './presentation/controller/principal-role.controller';
import { PrismaModule } from 'src/database/prisma.module';
import { AuthorizationGuard } from './infrastructure/guards/authorization.guard';
import {
  CreatePermissionHandler,
  DeletePermissionHandler,
  GetPermissionHandler,
  ListPermissionHandler,
  UpdatePermissionHandler,
  CreateRoleHandler,
  GetRoleHandler,
  ListRoleHandler,
  AssignPermissionToRoleHandler,
  AssignRoleToPrincipalHandler,
  RemoveRoleFromPrincipalHandler,
  ListPrincipalRolesHandler,
  GetPrincipalPermissionsHandler,
} from './application';
import { PERMISSION_REPOSITORY, ROLE_REPOSITORY, PRINCIPAL_ROLE_REPOSITORY, PERMISSION_RESOLVER, PERMISSION_CACHE } from './domain';
import { PrismaPermissionRepository, PrismaRoleRepository, PrismaPrincipalRoleRepository, PrismaPermissionResolver } from './infrastructure';
import { MemoryPermissionCache } from './infrastructure/cache/memory-permission-cache';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [PermissionController, RoleController, PrincipalRoleController],
  providers: [
    CreatePermissionHandler,
    UpdatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionHandler,
    ListPermissionHandler,
    CreateRoleHandler,
    GetRoleHandler,
    ListRoleHandler,
    AssignPermissionToRoleHandler,
    AssignRoleToPrincipalHandler,
    RemoveRoleFromPrincipalHandler,
    ListPrincipalRolesHandler,
    GetPrincipalPermissionsHandler,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PrismaPermissionRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
    {
      provide: PRINCIPAL_ROLE_REPOSITORY,
      useClass: PrismaPrincipalRoleRepository,
    },
    {
      provide: PERMISSION_RESOLVER,
      useClass: PrismaPermissionResolver,
    },
    AuthorizationGuard,
    {
      provide: PERMISSION_CACHE,
      useClass: MemoryPermissionCache,
    },
  ],

  exports: [PERMISSION_REPOSITORY, ROLE_REPOSITORY, PRINCIPAL_ROLE_REPOSITORY, PERMISSION_RESOLVER, AuthorizationGuard],
})
export class AuthorizationModule {}
