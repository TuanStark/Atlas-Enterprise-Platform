export class CreateContractDto {
  employmentId: string;
  contractTypeId: string;
  contractNumber: string;
  startDate: Date;
  endDate?: Date;
  baseSalary?: number;
  workingHours?: string;
  contractTemplateId?: string;
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
