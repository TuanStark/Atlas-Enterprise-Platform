import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { SalaryComponentType } from '@prisma/client';

export interface SalaryComponentProps {
  tenantId: Identifier;
  code: string;
  name: string;
  componentType?: SalaryComponentType;
  calculationType?: string;
  defaultAmount?: number;
  taxable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SalaryComponent extends AggregateRoot<SalaryComponentProps> {
  static create(
    props: Omit<SalaryComponentProps, 'createdAt' | 'updatedAt' | 'taxable'> & {
      taxable?: boolean;
    },
  ): SalaryComponent {
    const now = new Date();
    return new SalaryComponent(Identifier.create(), {
      ...props,
      taxable: props.taxable ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: SalaryComponentProps): SalaryComponent {
    return new SalaryComponent(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get componentType() {
    return this.props.componentType;
  }

  get calculationType() {
    return this.props.calculationType;
  }

  get defaultAmount() {
    return this.props.defaultAmount;
  }

  get taxable() {
    return this.props.taxable;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(props: Partial<Omit<SalaryComponentProps, 'tenantId' | 'createdAt' | 'updatedAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.name !== undefined) this.props.name = props.name;
    if (props.componentType !== undefined) this.props.componentType = props.componentType;
    if (props.calculationType !== undefined) this.props.calculationType = props.calculationType;
    if (props.defaultAmount !== undefined) this.props.defaultAmount = props.defaultAmount;
    if (props.taxable !== undefined) this.props.taxable = props.taxable;
    this.props.updatedAt = new Date();
  }
}
