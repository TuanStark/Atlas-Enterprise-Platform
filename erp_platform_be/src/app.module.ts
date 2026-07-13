import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './configs/config.module';
import { TenantModule } from './packages/core/tenant/tenant.module';
import { PrincipalModule } from './packages/core/principal/principal.module';
import { IdentityModule } from './packages/core/identity/identity.module';
import { AuthenticationModule } from './packages/core/authentication/authentication.module';
import { AuthorizationModule } from './packages/core/rbac/rbac.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResultTransformInterceptor } from './common/interceptors/result-transform.interceptor';
import { AuthorizationGuard } from './packages/core/rbac/infrastructure/guards/authorization.guard';

@Module({
  imports: [ConfigModule, TenantModule, PrincipalModule, IdentityModule, AuthenticationModule, AuthorizationModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResultTransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthorizationGuard,
    },
  ],
})
export class AppModule {}
