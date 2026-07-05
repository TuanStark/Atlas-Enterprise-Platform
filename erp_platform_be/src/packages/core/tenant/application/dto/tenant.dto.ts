export class TenantDto {
  id!: string;
  code!: string;
  name!: string;
  legalName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  locale?: string;
  currency?: string;
  status!: string;
  createdAt!: Date;
  updatedAt?: Date;
}
