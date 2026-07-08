import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './configs/config.module';
import { TenantModule } from './packages/core/tenant/tenant.module';
import { PrincipalModule } from './packages/core/principal/principal.module';

@Module({
  imports: [ConfigModule, TenantModule, PrincipalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

