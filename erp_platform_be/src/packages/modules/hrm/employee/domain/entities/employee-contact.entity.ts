import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmployeeContactProps {
  employeeId: Identifier;
  contactType?: string;
  value?: string;
  isPrimary?: boolean;
  verifiedAt?: Date;
  createdAt?: Date;
}

export class EmployeeContact extends Entity<EmployeeContactProps> {
  static create(props: Omit<EmployeeContactProps, 'createdAt'>): EmployeeContact {
    return new EmployeeContact(Identifier.create(), {
      ...props,
      isPrimary: props.isPrimary ?? false,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: EmployeeContactProps): EmployeeContact {
    return new EmployeeContact(id, props);
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get contactType() {
    return this.props.contactType;
  }

  get value() {
    return this.props.value;
  }

  get isPrimary() {
    return this.props.isPrimary;
  }

  get verifiedAt() {
    return this.props.verifiedAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
