import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from 'class-validator';

import { UserType } from '../../domain';

export class CreateUserDto {

    @IsUUID()
    tenantId: string;

    @IsUUID()
    principalId: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsOptional()
    @IsString()
    displayName?: string;

    @IsEnum(UserType)
    type: UserType;

}