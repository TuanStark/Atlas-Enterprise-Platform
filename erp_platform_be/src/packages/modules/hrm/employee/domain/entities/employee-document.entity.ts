import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmployeeDocumentProps {
  employeeId: Identifier;
  documentType?: string;
  documentNumber?: string;
  issuedDate?: Date;
  expiryDate?: Date;
  issuedPlace?: string;
  fileId?: string;
  createdAt?: Date;
}

export class EmployeeDocument extends Entity<EmployeeDocumentProps> {
  static create(props: Omit<EmployeeDocumentProps, 'createdAt'>): EmployeeDocument {
    return new EmployeeDocument(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: EmployeeDocumentProps): EmployeeDocument {
    return new EmployeeDocument(id, props);
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get documentType() {
    return this.props.documentType;
  }

  get documentNumber() {
    return this.props.documentNumber;
  }

  get issuedDate() {
    return this.props.issuedDate;
  }

  get expiryDate() {
    return this.props.expiryDate;
  }

  get issuedPlace() {
    return this.props.issuedPlace;
  }

  get fileId() {
    return this.props.fileId;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
