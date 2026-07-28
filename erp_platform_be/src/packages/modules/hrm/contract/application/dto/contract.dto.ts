export class CreateContractDto {
  employmentId: string;
  contractTypeId?: string;
  contractType?: string;
  contractNumber?: string;
  startDate: Date;
  endDate?: Date;
  baseSalary?: number;
  workingHours?: string;
  contractTemplateId?: string;
}

export class UpdateContractDto {
  contractType?: string;
  startDate?: Date;
  endDate?: Date;
  baseSalary?: number;
  workingHours?: string;
}

export class CreateContractAnnexDto {
  annexNumber: string;
  content?: string;
  effectiveDate: Date;
  fileId?: string;
}

export class SignContractDto {
  signedDate: Date;
  fileId?: string;
}

export class TerminateContractDto {
  terminationDate: Date;
  reason?: string;
}
