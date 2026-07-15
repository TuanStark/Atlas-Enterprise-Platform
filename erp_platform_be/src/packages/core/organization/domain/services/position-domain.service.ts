import { Injectable, Inject } from '@nestjs/common';
import * as positionRepository from '../repositories/position.repository';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { Position } from '../entities/position';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';

@Injectable()
export class PositionDomainService {
    constructor(
        @Inject(positionRepository.POSITION_REPOSITORY)
        private readonly repository: positionRepository.PositionRepository,
    ) { }

    async create(
        organizationId: Identifier,
        code: string,
        name: string,
        description?: string,
        level?: number,
    ): Promise<Position> {
        const exists = await this.repository.existsByCode(organizationId, code);

        if (exists) {
            throw new EntityAlreadyExistsException('Position', 'code', code);
        }

        const position = Position.create({
            organizationId,
            code,
            name,
            description,
            level,
        });

        await this.repository.save(position);

        return position;
    }
}
