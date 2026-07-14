import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { TRANSACTION_RUNNER } from '@shared-kernel/application';
import { PrismaTransaction } from '../packages/shared-kernel/infrastructure/prisma/prisma-transaction';
import { DatabaseSeederService } from './database-seeder.service';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: TRANSACTION_RUNNER,
      useClass: PrismaTransaction,
    },
    DatabaseSeederService,
  ],
  exports: [PrismaService, TRANSACTION_RUNNER],
})
export class PrismaModule {}
