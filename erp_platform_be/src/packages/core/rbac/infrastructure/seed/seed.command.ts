import { NestFactory } from '@nestjs/core';
import { Module, Logger } from '@nestjs/common';
import { PrismaModule } from 'src/database/prisma.module';
import { RbacSeeder } from './rbac-seeder';
import { PrismaService } from 'src/database/prisma.service';

@Module({
  imports: [PrismaModule],
  providers: [RbacSeeder],
})
class SeedModule { }

async function bootstrap() {
  const logger = new Logger('RbacSeed');
  const app = await NestFactory.createApplicationContext(SeedModule);

  const prisma = app.get(PrismaService);
  const seeder = app.get(RbacSeeder);

  const tenantId = process.argv[2];

  if (!tenantId) {
    // Seed for all tenants
    const tenants = await prisma.tenant.findMany({ select: { id: true, code: true } });

    if (tenants.length === 0) {
      logger.warn('No tenants found. Please create a tenant first.');
      await app.close();
      return;
    }

    for (const tenant of tenants) {
      logger.log(`Seeding tenant: ${tenant.code} (${tenant.id})`);
      await seeder.seed(tenant.id);
    }
  } else {
    await seeder.seed(tenantId);
  }

  await app.close();
  logger.log('Seed completed successfully.');
}

bootstrap().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
