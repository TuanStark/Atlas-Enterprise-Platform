import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface SalaryStructureProps {
  tenantId: Identifier;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class SalaryStructure extends AggregateRoot<SalaryStructureProps> {
  static create(
    props: Omit<SalaryStructureProps, 'createdAt' | 'updatedAt' | 'isActive'> & {
      isActive?: boolean;
    },
  ): SalaryStructure {
    const now = new Date();
    return new SalaryStructure(Identifier.create(), {
      ...props,
      isActive: props.isActive ?? true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static rehydrate(id: Identifier, props: SalaryStructureProps): SalaryStructure {
    return new SalaryStructure(id, props);
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

  update(props: Partial<Omit<SalaryStructureProps, 'tenantId' | 'createdAt' | 'updatedAt'>>): void {
    if (props.code !== undefined) this.props.code = props.code;
    if (props.name !== undefined) this.props.name = props.name;
    if (props.description !== undefined) this.props.description = props.description;
    if (props.isActive !== undefined) this.props.isActive = props.isActive;
    this.props.updatedAt = new Date();
  }
}
