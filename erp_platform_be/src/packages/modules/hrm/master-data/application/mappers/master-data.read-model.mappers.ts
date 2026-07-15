import { EmploymentType } from '../../domain/entities/employment-type.entity';
import { ContractType } from '../../domain/entities/contract-type.entity';
import { JobTitle } from '../../domain/entities/job-title.entity';
import { WorkLocation } from '../../domain/entities/work-location.entity';
import {
  EmploymentTypeReadModel,
  ContractTypeReadModel,
  JobTitleReadModel,
  WorkLocationReadModel,
} from '../read-models/master-data.read-models';

export class EmploymentTypeReadModelMapper {
  static toReadModel(entity: EmploymentType): EmploymentTypeReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class ContractTypeReadModelMapper {
  static toReadModel(entity: ContractType): ContractTypeReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      durationMonth: entity.durationMonth,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class JobTitleReadModelMapper {
  static toReadModel(entity: JobTitle): JobTitleReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

export class WorkLocationReadModelMapper {
  static toReadModel(entity: WorkLocation): WorkLocationReadModel {
    return {
      id: entity.id.toString(),
      tenantId: entity.tenantId.toString(),
      code: entity.code,
      name: entity.name,
      address: entity.address,
      timezone: entity.timezone,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}
