import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionController } from './presentation/controller/rbac.controller';
import { RoleController } from './presentation/controller/role.controller';
import { PrismaModule } from 'src/database/prisma.module';
import {
  CreatePermissionHandler,
  DeletePermissionHandler,
  GetPermissionHandler,
  ListPermissionHandler,
  UpdatePermissionHandler,
  CreateRoleHandler,
  GetRoleHandler,
  AssignPermissionToRoleHandler,
} from './application';
import { PERMISSION_REPOSITORY, ROLE_REPOSITORY } from './domain';
import { PrismaPermissionRepository, PrismaRoleRepository } from './infrastructure';

@Module({
  imports: [CqrsModule, PrismaModule],
  controllers: [PermissionController, RoleController],
  providers: [
    CreatePermissionHandler,
    UpdatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionHandler,
    ListPermissionHandler,
    CreateRoleHandler,
    GetRoleHandler,
    AssignPermissionToRoleHandler,
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PrismaPermissionRepository,
    },
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
  ],

  exports: [PERMISSION_REPOSITORY, ROLE_REPOSITORY],
})
export class AuthorizationModule {}
