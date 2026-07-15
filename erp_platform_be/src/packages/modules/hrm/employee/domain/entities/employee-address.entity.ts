import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface EmployeeAddressProps {
  employeeId: Identifier;
  addressType?: string;
  country?: string;
  state?: string;
  city?: string;
  district?: string;
  ward?: string;
  addressLine?: string;
  postalCode?: string;
  isPrimary?: boolean;
  createdAt?: Date;
}

export class EmployeeAddress extends Entity<EmployeeAddressProps> {
  static create(props: Omit<EmployeeAddressProps, 'createdAt'>): EmployeeAddress {
    return new EmployeeAddress(Identifier.create(), {
      ...props,
      isPrimary: props.isPrimary ?? false,
      createdAt: new Date(),
    });
  }

  static rehydrate(id: Identifier, props: EmployeeAddressProps): EmployeeAddress {
    return new EmployeeAddress(id, props);
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get addressType() {
    return this.props.addressType;
  }

  get country() {
    return this.props.country;
  }

  get state() {
    return this.props.state;
  }

  get city() {
    return this.props.city;
  }

  get district() {
    return this.props.district;
  }

  get ward() {
    return this.props.ward;
  }

  get addressLine() {
    return this.props.addressLine;
  }

  get postalCode() {
    return this.props.postalCode;
  }

  get isPrimary() {
    return this.props.isPrimary;
  }

  get createdAt() {
    return this.props.createdAt;
  }
}
