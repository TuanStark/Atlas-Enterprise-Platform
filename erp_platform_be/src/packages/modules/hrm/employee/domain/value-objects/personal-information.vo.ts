import { Gender, MaritalStatus } from '@prisma/client';
import { BusinessRuleViolationException } from '@shared-kernel/exceptions';

export interface PersonalInformationProps {
  gender?: Gender;
  dateOfBirth?: Date;
  maritalStatus?: MaritalStatus;
  nationality?: string;
  nationalId?: string;
  passportNo?: string;
  taxNumber?: string;
}
export class PersonalInformation {
  private constructor(private readonly props: PersonalInformationProps) {}
  static create(props: PersonalInformationProps): PersonalInformation {
    if (props.dateOfBirth && props.dateOfBirth > new Date()) {
      throw new BusinessRuleViolationException('Date of birth cannot be in the future.');
    }
    return new PersonalInformation({ ...props });
  }
  get gender(): Gender | undefined {
    return this.props.gender;
  }
  get dateOfBirth(): Date | undefined {
    return this.props.dateOfBirth;
  }
  get maritalStatus(): MaritalStatus | undefined {
    return this.props.maritalStatus;
  }
  get nationality(): string | undefined {
    return this.props.nationality;
  }
  get nationalId(): string | undefined {
    return this.props.nationalId;
  }
  get passportNo(): string | undefined {
    return this.props.passportNo;
  }
  get taxNumber(): string | undefined {
    return this.props.taxNumber;
  }
  equals(other: PersonalInformation): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
