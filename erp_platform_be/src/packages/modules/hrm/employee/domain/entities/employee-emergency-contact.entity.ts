import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmployeeEmergencyContactProps {
  employeeId: Identifier;
  fullName?: string;
  relationship?: string;
  phone?: string;
  email?: string;
  address?: string;
  priority?: number;
  createdAt?: Date;
}

export class EmployeeEmergencyContact extends Entity<EmployeeEmergencyContactProps> {
  static create(props: Omit<EmployeeEmergencyContactProps, 'createdAt'>): EmployeeEmergencyContact {
    return new EmployeeEmergencyContact(Identifier.create(), {
      ...props,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: EmployeeEmergencyContactProps): EmployeeEmergencyContact {
    return new EmployeeEmergencyContact(id, props);
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get fullName() {
    return this.props.fullName;
  }

  get relationship() {
    return this.props.relationship;
  }

  get phone() {
    return this.props.phone;
  }

  get email() {
    return this.props.email;
  }

  get address() {
    return this.props.address;
  }

  get priority() {
    return this.props.priority;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
