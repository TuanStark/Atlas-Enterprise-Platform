import { Tenant } from '../../domain';
import { TenantDto } from '../dto/tenant.dto';

export class TenantResponseMapper {
    public static toResponse(tenant: Tenant): TenantDto {
        return {
            id: tenant.id.getValue(),
            code: tenant.code.getValue(),
            name: tenant.name.getValue(),
            legalName: tenant.legalName,
            taxCode: tenant.taxCode,
            email: tenant.email,
            phone: tenant.phone,
            timezone: tenant.timezone,
            locale: tenant.locale,
            currency: tenant.currency,
            status: tenant.status,
            createdAt: tenant.createdAt,
            updatedAt: tenant.updatedAt,
        };
    }
}
