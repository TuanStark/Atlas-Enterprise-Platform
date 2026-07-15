import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class EmployeeContactDto {
  @IsString()
  contactType: string;

  @IsString()
  value: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class SyncEmployeeContactsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeContactDto)
  contacts: EmployeeContactDto[];
}

export class EmployeeAddressDto {
  @IsString()
  addressType: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  addressLine?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class SyncEmployeeAddressesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeAddressDto)
  addresses: EmployeeAddressDto[];
}

export class EmployeeEmergencyContactDto {
  @IsString()
  fullName: string;

  @IsString()
  relationship: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  priority?: number;
}

export class SyncEmployeeEmergencyContactsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeEmergencyContactDto)
  emergencyContacts: EmployeeEmergencyContactDto[];
}

export class EmployeeDocumentDto {
  @IsString()
  documentType: string;

  @IsString()
  documentNumber: string;

  @IsOptional()
  @IsString()
  issuedDate?: string;

  @IsOptional()
  @IsString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  issuedPlace?: string;

  @IsOptional()
  @IsString()
  fileId?: string;
}

export class SyncEmployeeDocumentsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmployeeDocumentDto)
  documents: EmployeeDocumentDto[];
}
