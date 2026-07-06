import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Result } from '../../application/result/result';

export abstract class BaseCrudControllerHelper {
  protected constructor(
    protected readonly commandBus: CommandBus,
    protected readonly queryBus: QueryBus,
  ) {}

  protected async executeCreate<TCreateDto>(
    CommandClass: new (dto: TCreateDto) => any,
    dto: TCreateDto,
  ): Promise<Result<void>> {
    return this.commandBus.execute(new CommandClass(dto));
  }

  protected async executeGet<TDto>(
    QueryClass: new (id: string) => any,
    id: string,
  ): Promise<Result<TDto>> {
    return this.queryBus.execute(new QueryClass(id));
  }

  protected async executeList<TListResult>(
    QueryClass: new () => any,
  ): Promise<Result<TListResult>> {
    return this.queryBus.execute(new QueryClass());
  }

  protected async executeUpdate<TUpdateDto, TDto>(
    CommandClass: new (id: string, dto: TUpdateDto) => any,
    id: string,
    dto: TUpdateDto,
  ): Promise<Result<TDto>> {
    return this.commandBus.execute(new CommandClass(id, dto));
  }

  protected async executeActivate(
    CommandClass: new (id: string) => any,
    id: string,
  ): Promise<Result<void>> {
    return this.commandBus.execute(new CommandClass(id));
  }

  protected async executeSuspend(
    CommandClass: new (id: string) => any,
    id: string,
  ): Promise<Result<void>> {
    return this.commandBus.execute(new CommandClass(id));
  }
}
