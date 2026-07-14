import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface OrganizationUnitTypeProps {
  organizationId: Identifier;
  code: string;
  name: string;
  description?: string;
  isActive: boolean;
  version: number;
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
    this.touch();
  }

  activate() {
    this.props.isActive = true;
    this.touch();
  }

  deactivate() {
    this.props.isActive = false;
    this.touch();
  }

  get organizationId() {
    return this.props.organizationId;
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

  get version() {
    return this.props.version;
  }

  private touch() {
    this.props.version++;
  }
}
