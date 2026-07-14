import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface OrganizationUnitProps {
  organizationId: Identifier;
  parentUnitId?: Identifier;
  unitTypeId: Identifier;
  code: string;
  name: string;
  path?: string;
  level: number;
  sortOrder: number;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  version: number;
}

export class OrganizationUnit extends AggregateRoot<OrganizationUnitProps> {
  public static create(props: OrganizationUnitProps): OrganizationUnit {
    return new OrganizationUnit(Identifier.create(), props);
  }

  public static rehydrate(id: Identifier, props: OrganizationUnitProps): OrganizationUnit {
    return new OrganizationUnit(id, props);
  }

  get organizationId() {
    return this.props.organizationId;
  }

  get parentUnitId() {
    return this.props.parentUnitId;
  }

  get unitTypeId() {
    return this.props.unitTypeId;
  }

  get code() {
    return this.props.code;
  }

  get name() {
    return this.props.name;
  }

  get path() {
    return this.props.path;
  }

  get level() {
    return this.props.level;
  }

  get sortOrder() {
    return this.props.sortOrder;
  }

  get metadata() {
    return this.props.metadata;
  }

  get isActive() {
    return this.props.isActive;
  }

  get version() {
    return this.props.version;
  }

  rename(name: string) {
    if (this.props.name === name) {
      return;
    }
    this.props.name = name;
    this.touch();
  }

  moveTo(parentUnitId?: Identifier) {
    this.props.parentUnitId = parentUnitId;
    this.touch();
  }

  updateHierarchy(path: string, level: number) {
    this.props.path = path;
    this.props.level = level;
    this.touch();
  }

  changeSortOrder(sortOrder: number) {
    this.props.sortOrder = sortOrder;
    this.touch();
  }

  changeMetadata(metadata?: Record<string, unknown>) {
    this.props.metadata = metadata;
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

  private touch() {
    this.props.version++;
  }
}
