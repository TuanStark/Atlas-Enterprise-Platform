import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { FILE_REPOSITORY } from '../../domain/repositories/file.repository';
import type { FileRepository, FileCreateInput } from '../../domain/repositories/file.repository';

export class CreateFileCommand {
  constructor(public readonly input: FileCreateInput) {}
}

export class DeleteFileCommand {
  constructor(public readonly id: Identifier) {}
}

@CommandHandler(CreateFileCommand)
export class CreateFileHandler implements ICommandHandler<CreateFileCommand> {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly repository: FileRepository,
  ) {}

  async execute(command: CreateFileCommand): Promise<any> {
    return this.repository.create(command.input);
  }
}

@CommandHandler(DeleteFileCommand)
export class DeleteFileHandler implements ICommandHandler<DeleteFileCommand> {
  constructor(
    @Inject(FILE_REPOSITORY)
    private readonly repository: FileRepository,
  ) {}

  async execute(command: DeleteFileCommand): Promise<void> {
    await this.repository.delete(command.id);
  }
}
