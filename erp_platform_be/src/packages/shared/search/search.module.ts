import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PrismaModule } from 'src/database/prisma.module';
import { SearchController } from './presentation/controllers/search.controller';
import { GlobalSearchHandler } from './application/queries/search.queries';

const QueryHandlers = [GlobalSearchHandler];

@Module({
  imports: [PrismaModule, CqrsModule],
  controllers: [SearchController],
  providers: [...QueryHandlers],
})
export class SearchModule {}
