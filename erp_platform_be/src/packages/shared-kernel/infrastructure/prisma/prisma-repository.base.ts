import { PrismaService } from 'src/database/prisma.service';
import { PersistenceMapper } from './mapper.interface';

export abstract class PrismaRepositoryBase<TDomain, TPersistence> {
  protected constructor(protected readonly prisma: PrismaService) {}
  protected abstract mapper: PersistenceMapper<TDomain, TPersistence>;
}
