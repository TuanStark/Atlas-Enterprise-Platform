export class OrganizationDto {
  id!: string;
  tenantId!: string;
  code!: string;
  name!: string;
  description?: string;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt?: Date;
}
