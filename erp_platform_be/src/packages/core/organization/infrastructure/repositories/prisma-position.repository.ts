import { PositionPersistenceMapper } from '@core/organization/application/mappers/position.persistence.mapper';
import { Position } from '@core/organization/domain/entities/position';
import { PositionRepository } from '@core/organization/domain/repositories/position.repository';
import { Injectable } from '@nestjs/common';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class PrismaPositionRepository implements PositionRepository {
    constructor(private readonly prisma: PrismaService) { }

    async save(position: Position): Promise<void> {
        await this.prisma.position.create({
            data: PositionPersistenceMapper.toPersistence(position),
        });
    }

    async update(position: Position): Promise<void> {
        await this.prisma.position.update({
            where: {
                id: position.id.toString(),
            },
            data: PositionPersistenceMapper.toPersistence(position),
        });
    }

    async delete(position: Position): Promise<void> {
        await this.prisma.position.delete({
            where: {
                id: position.id.toString(),
            },
        });
    }

    async findById(organizationId: Identifier, id: Identifier): Promise<Position | null> {
        const prismaPosition = await this.prisma.position.findFirst({
            where: {
                id: id.toString(),

                organizationId: organizationId.toString(),
            },
        });
        if (!prismaPosition) {
            return null;
        }
        return PositionPersistenceMapper.toDomain(prismaPosition);
    }

    async existsByCode(organizationId: Identifier, code: string): Promise<boolean> {
        const count = await this.prisma.position.count({
            where: {
                organizationId: organizationId.toString(),
                code,
            },
        });
        return count > 0;
    }

    async findByCode(organizationId: Identifier, code: string): Promise<Position | null> {
        const prismaPosition = await this.prisma.position.findFirst({
            where: {
                organizationId: organizationId.toString(),
                code,
            },
        });

        return prismaPosition ? PositionPersistenceMapper.toDomain(prismaPosition) : null;
    }

    async findAll(organizationId: Identifier): Promise<Position[]> {
        const rows = await this.prisma.position.findMany({
            where: {
                organizationId: organizationId.toString(),
            },
            orderBy: {
                level: 'asc',
            },
        });

        return rows.map(PositionPersistenceMapper.toDomain);
    }
}
