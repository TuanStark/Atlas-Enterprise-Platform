import { UpdatePermissionDto } from '../../dto/update-permission.dto';

export class UpdatePermissionCommand {
  constructor(
    public readonly id: string,
    public readonly dto: UpdatePermissionDto,
  ) {}
}
