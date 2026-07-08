

import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import {
    Email,
    User,
    UserStatus,
} from '../../domain';

import {
    CreateUserDto,
    UserDto,
} from '../dto';

export class UserMapper {

    static toDomain(
        dto: CreateUserDto,
    ): User {

        return User.create({
            tenantId: Identifier.create(dto.tenantId),
            principalId: Identifier.create(dto.principalId),
            email: Email.create(dto.email),
            firstName: dto.firstName,
            lastName: dto.lastName,
            displayName: dto.displayName,
            status: UserStatus.ACTIVE,
            type: dto.type,
        });
    }

    static toDto(
        user: User,
    ): UserDto {

        return {
            id: user.id.getValue(),
            tenantId: user.tenantId.getValue(),
            principalId: user.principalId.getValue(),
            email: user.email.value,
            firstName: user.firstName,
            lastName: user.lastName,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            status: user.status,
            type: user.type,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,

        };

    }

}