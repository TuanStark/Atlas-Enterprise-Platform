import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PermissionController } from './presentation/controller/rbac.controller';
import { PrismaModule } from 'src/database/prisma.module';
import {
    CreatePermissionHandler,
    DeletePermissionHandler,
    GetPermissionHandler,
    ListPermissionHandler,
    UpdatePermissionHandler,
} from './application';
import { PERMISSION_REPOSITORY } from './domain';
import { PrismaPermissionRepository } from './infrastructure';

@Module({
    imports: [CqrsModule, PrismaModule],
    controllers: [PermissionController],
    providers: [
        CreatePermissionHandler,
        UpdatePermissionHandler,
        DeletePermissionHandler,
        GetPermissionHandler,
        ListPermissionHandler,
        {
            provide: PERMISSION_REPOSITORY,
            useClass: PrismaPermissionRepository,
        },
    ],

    exports: [PERMISSION_REPOSITORY],
})
export class AuthorizationModule { }
