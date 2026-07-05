import { Tenant, TenantStatus } from '../../domain';
import { TenantCode, TenantName } from '../../domain/value-objects';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

export class TenantDomainMapper {
    public static toDomain(dto: CreateTenantDto): Tenant {
        return Tenant.create({
            code: TenantCode.create(dto.code),
            name: TenantName.create(dto.name),
            legalName: dto.legalName,
            taxCode: dto.taxCode,
            email: dto.email,
            phone: dto.phone,
            timezone: dto.timezone,
            locale: dto.locale,
            currency: dto.currency,
            status: TenantStatus.ACTIVE,
        });
    }

    public static updateDomain(tenant: Tenant, dto: UpdateTenantDto): void {
        if (dto.name !== undefined) {
            tenant.changeName(TenantName.create(dto.name));
        }

        if (dto.legalName !== undefined) {
            tenant.changeLegalName(dto.legalName);
        }

        if (dto.taxCode !== undefined) {
            tenant.changeTaxCode(dto.taxCode);
        }

        if (dto.email !== undefined) {
            tenant.changeEmail(dto.email);
        }

        if (dto.phone !== undefined) {
            tenant.changePhone(dto.phone);
        }

        if (dto.timezone !== undefined) {
            tenant.changeTimezone(dto.timezone);
        }

        if (dto.locale !== undefined) {
            tenant.changeLocale(dto.locale);
        }

        if (dto.currency !== undefined) {
            tenant.changeCurrency(dto.currency);
        }
    }
}