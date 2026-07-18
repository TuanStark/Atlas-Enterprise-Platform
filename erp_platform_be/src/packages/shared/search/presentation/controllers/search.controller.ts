import { Controller, Get, Query } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentContext } from '@core/identity/presentation/decorators/current-context.decorator';
import type { RequestContext } from '@shared-kernel/application/request-context';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { GlobalSearchQuery, SearchResultDto } from '../../application/queries/search.queries';
import { RequirePermission } from '@core/rbac/presentation/decorators/require-permission.decorator';

@ApiTags('Global Search')
@Controller('search')
export class SearchController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  @RequirePermission('shared.search:read')
  @ApiOperation({ summary: 'Perform a global search' })
  @ApiOkResponse({ description: 'Search results' })
  async search(
    @CurrentContext() context: RequestContext,
    @Query('q') query: string,
  ): Promise<SearchResultDto[]> {
    return this.queryBus.execute(
      new GlobalSearchQuery(Identifier.create(context.tenantId), query || ''),
    );
  }
}
