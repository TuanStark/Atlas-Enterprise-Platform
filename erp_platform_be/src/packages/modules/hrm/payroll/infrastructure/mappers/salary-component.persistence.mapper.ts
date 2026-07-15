import { SalaryComponent as PrismaSalaryComponent, Prisma } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryComponent } from '../../domain/aggregates/salary-component.aggregate';

export class SalaryComponentPersistenceMapper {
  static toDomain(prisma: PrismaSalaryComponent): SalaryComponent {
    return SalaryComponent.rehydrate(Identifier.create(prisma.id), {
      tenantId: Identifier.create(prisma.tenantId),
      code: prisma.code,
      name: prisma.name,
      componentType: prisma.componentType ?? undefined,
      calculationType: prisma.calculationType ?? undefined,
      defaultAmount: prisma.defaultAmount ? prisma.defaultAmount.toNumber() : undefined,
      taxable: prisma.taxable ?? true,
      createdAt: prisma.createdAt ?? new Date(),
      updatedAt: prisma.updatedAt ?? new Date(),
    });
  }

  static toPersistence(entity: SalaryComponent): PrismaSalaryComponent {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      componentType: entity.componentType ?? null,
      calculationType: entity.calculationType ?? null,
      defaultAmount:
        entity.defaultAmount !== undefined ? new Prisma.Decimal(entity.defaultAmount) : null,
      taxable: entity.taxable,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
