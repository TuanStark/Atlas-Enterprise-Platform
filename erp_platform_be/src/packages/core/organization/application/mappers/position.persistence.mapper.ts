import { Position } from '@core/organization/domain/entities/position';
import { Position as PrismaPosition } from '@prisma/client';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export class PositionPersistenceMapper {
  static toDomain(prisma: PrismaPosition): Position {
    return Position.rehydrate(Identifier.create(prisma.id), {
      organizationId: Identifier.create(prisma.organizationId),
      code: prisma.code ?? '',
      name: prisma.name ?? '',
      description: prisma.description ?? undefined,
      level: prisma.level ?? undefined,
    });
  }

  static toPersistence(entity: Position) {
    return {
      id: entity.id.toString(),
      organizationId: entity.organizationId.toString(),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      level: entity.level,
    };
  }
}
