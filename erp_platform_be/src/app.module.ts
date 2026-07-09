import { Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './configs/config.module';
import { TenantModule } from './packages/core/tenant/tenant.module';
import { PrincipalModule } from './packages/core/principal/principal.module';
import { IdentityModule } from './packages/core/identity/identity.module';
import { AuthenticationModule } from './packages/core/authentication/authentication.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { ResultTransformInterceptor } from './common/interceptors/result-transform.interceptor';

@Module({
  imports: [
    ConfigModule,
    TenantModule,
    PrincipalModule,
    IdentityModule,
    AuthenticationModule,
  ],
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
  ],
})
export class AppModule {}

