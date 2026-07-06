import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { PrincipalStatus, PrincipalType } from '../enums/principal-status';

interface PrincipalProps {
  tenantId: Identifier;
  type: PrincipalType;
  status: PrincipalStatus;
  displayName?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version: number;
}

export class Principal extends AggregateRoot<PrincipalProps> {
  private constructor(id: Identifier, props: PrincipalProps) {
    super(id, props);
  }

  static create(props: Omit<PrincipalProps, 'createdAt' | 'updatedAt' | 'version'>) {
    return new Principal(Identifier.create(), {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });
  }

  static rehydrate(id: Identifier, props: PrincipalProps): Principal {
    return new Principal(id, props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get type() {
    return this.props.type;
  }

  get status() {
    return this.props.status;
  }

  get displayName() {
    return this.props.displayName;
  }

  get metadata() {
    return this.props.metadata;
  }

  get version() {
    return this.props.version;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get deletedAt() {
    return this.props.deletedAt;
  }

  activate() {
    this.props.status = PrincipalStatus.ACTIVE;
    this.touch();
  }

  suspend() {
    this.props.status = PrincipalStatus.SUSPENDED;
    this.touch();
  }

  deactivate() {
    this.props.status = PrincipalStatus.INACTIVE;
    this.touch();
  }

  rename(displayName: string) {
    this.props.displayName = displayName;
    this.touch();
  }

  delete() {
    this.props.deletedAt = new Date();
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
