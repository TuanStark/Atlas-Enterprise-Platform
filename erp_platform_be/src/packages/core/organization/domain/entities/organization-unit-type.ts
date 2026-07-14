import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface OrganizationUnitTypeProps {
  code: string;
  name: string;
  description?: string;
}

export class OrganizationUnitType extends AggregateRoot<OrganizationUnitTypeProps> {
  static create(props: OrganizationUnitTypeProps) {
    return new OrganizationUnitType(Identifier.create(), props);
  }

  static rehydrate(id: Identifier, props: OrganizationUnitTypeProps) {
    return new OrganizationUnitType(id, props);
  }

  rename(name: string) {
    if (this.props.name === name) {
      return;
    }
    this.props.name = name;
  }

  changeDescription(description?: string) {
    this.props.description = description;
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
}
