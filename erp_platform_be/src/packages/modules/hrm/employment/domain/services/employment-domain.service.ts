import { Inject, Injectable } from '@nestjs/common';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { EntityAlreadyExistsException } from '@shared-kernel/exceptions';
import { Employment, CreateEmploymentProps } from '../aggregates/employment.aggregate';
import { EMPLOYMENT_REPOSITORY } from '../repositories/employment.repository';
import type { EmploymentRepository } from '../repositories/employment.repository';

@Injectable()
export class EmploymentDomainService {
  constructor(
    @Inject(EMPLOYMENT_REPOSITORY)
    private readonly repository: EmploymentRepository,
  ) {}

  async create(props: CreateEmploymentProps): Promise<Employment> {
    const exists = await this.repository.existsByEmployeeCode(props.tenantId, props.employeeCode);

    if (exists) {
      throw new EntityAlreadyExistsException('Employment', 'employeeCode', props.employeeCode);
    }

    const employment = Employment.create(props);
    await this.repository.save(employment);

    return employment;
  }
}
