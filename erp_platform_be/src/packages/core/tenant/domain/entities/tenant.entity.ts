import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { TenantCode } from '../value-objects/tenant-code.vo';
import { TenantName } from '../value-objects/tenant-name.vo';
import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { TenantCreatedEvent } from '../events/tenant-created.event';

export enum TenantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface TenantProps {
  id: Identifier;
  code: TenantCode;
  name: TenantName;
  legalName?: string;
  taxCode?: string;
  email?: string;
  phone?: string;
  logoFileId?: Identifier;
  timezone?: string;
  locale?: string;
  currency?: string;
  status: TenantStatus;
  metadata?: Record<string, unknown>;
  version: number;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Tenant extends AggregateRoot<TenantProps> {
  private constructor(props: TenantProps) {
    super(props.id, props);
  }

  public static create(props: Omit<TenantProps, 'id' | 'createdAt' | 'version'>): Tenant {
    const tenant = new Tenant({
      ...props,
      id: Identifier.create(),
      version: 1,
      createdAt: new Date(),
    });

    tenant.addDomainEvent(new TenantCreatedEvent(tenant.id));

    return tenant;
  }

  public static restore(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  // ---------- Getter ----------

  get code(): TenantCode {
    return this.props.code;
  }

  get name(): TenantName {
    return this.props.name;
  }

  get status(): TenantStatus {
    return this.props.status;
  }

  // ---------- Behaviors ----------

  public activate(): void {
    this.props.status = TenantStatus.ACTIVE;

    this.touch();
  }

  public deactivate(): void {
    this.props.status = TenantStatus.INACTIVE;

    this.touch();
  }

  public changeName(name: TenantName): void {
    this.props.name = name;

    this.touch();
  }

  public changeLegalName(legalName?: string): void {
    this.props.legalName = legalName;

    this.touch();
  }

  public changeEmail(email?: string): void {
    this.props.email = email;

    this.touch();
  }

  public changePhone(phone?: string): void {
    this.props.phone = phone;

    this.touch();
  }

  public updateMetadata(metadata?: Record<string, unknown>): void {
    this.props.metadata = metadata;

    this.touch();
  }

  public softDelete(): void {
    this.props.deletedAt = new Date();

    this.touch();
  }

  private touch(): void {
    this.props.updatedAt = new Date();

    this.props.version++;
  }
}
