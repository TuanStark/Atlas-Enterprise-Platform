import { UserStatus, UserType } from '../../domain';

export class UserDto {
  id: string;
  tenantId: string;
  principalId: string;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  status: UserStatus;
  type: UserType;
  createdAt: Date;
  updatedAt: Date;
}
