import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface ContractTypeProps {
  tenantId: Identifier;
  code: string;
  name: string;
  durationMonth?: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ContractType extends AggregateRoot<ContractTypeProps> {
  static create(
    props: Omit<ContractTypeProps, 'isActive' | 'createdAt' | 'updatedAt'>,
  ): ContractType {
    const now = new Date();
    return new ContractType(Identifier.create(), {
      ...props,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: ContractTypeProps): ContractType {
    return new ContractType(id, props);
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

  get durationMonth() {
    return this.props.durationMonth;
  }

  get description() {
    return this.props.description;
  }

  get isActive() {
    return this.props.isActive;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  update(name: string, durationMonth?: number, description?: string, isActive?: boolean) {
    this.props.name = name;
    this.props.durationMonth = durationMonth;
    this.props.description = description;
    if (isActive !== undefined) {
      this.props.isActive = isActive;
    }
    this.props.updatedAt = new Date();
  }
}
