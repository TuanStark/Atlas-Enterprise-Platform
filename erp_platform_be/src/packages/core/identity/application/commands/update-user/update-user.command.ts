import { UpdateUserDto } from '../../dto';

export class UpdateUserCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdateUserDto,
  ) {}
}
