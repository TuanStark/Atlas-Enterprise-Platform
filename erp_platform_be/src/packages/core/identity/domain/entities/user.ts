import { Email } from '../value-objects';

import { UserStatus, UserType } from '../enums';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';

export interface UserProps {
  id: Identifier;
  tenantId: Identifier;
  principalId: Identifier;
  email: Email;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  type: UserType;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  version: number;
}

export class User extends AggregateRoot<UserProps> {
  private constructor(props: UserProps) {
    super(props.id, props);
  }

  public static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt' | 'version'>): User {
    const now = new Date();
    return new User({
      ...props,
      id: Identifier.create(),
      version: 1,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static restore(props: UserProps): User {
    return new User(props);
  }

  get tenantId() {
    return this.props.tenantId;
  }

  get principalId() {
    return this.props.principalId;
  }

  get email() {
    return this.props.email;
  }

  get firstName() {
    return this.props.firstName;
  }

  get lastName() {
    return this.props.lastName;
  }

  get displayName() {
    return this.props.displayName;
  }

  get avatarUrl() {
    return this.props.avatarUrl;
  }

  get status() {
    return this.props.status;
  }

  get type() {
    return this.props.type;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  get version() {
    return this.props.version;
  }

  rename(firstName: string, lastName: string) {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.touch();
  }

  changeDisplayName(value: string) {
    this.props.displayName = value;
    this.touch();
  }

  changeAvatar(avatar: string) {
    this.props.avatarUrl = avatar;
    this.touch();
  }

  activate() {
    this.props.status = UserStatus.ACTIVE;
    this.touch();
  }

  deactivate() {
    this.props.status = UserStatus.INACTIVE;
    this.touch();
  }

  lock() {
    this.props.status = UserStatus.LOCKED;
    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();
    this.props.version++;
  }
}
