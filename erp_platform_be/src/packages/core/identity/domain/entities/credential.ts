import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { PasswordHash } from '../value-objects';
import { CredentialType } from '../enums';

export interface CredentialProps {
  id: Identifier;
  principalId: Identifier;
  type: CredentialType;
  passwordHash: PasswordHash;
  passwordChangedAt: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

export class Credential extends AggregateRoot<CredentialProps> {
  private constructor(props: CredentialProps) {
    super(props.id, props);
  }

  static create(props: Omit<CredentialProps, 'createdAt' | 'updatedAt' | 'version'>) {
    return new Credential({
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
    });
  }

  static rehydrate(props: CredentialProps) {
    return new Credential(props);
  }

  get principalId() {
    return this.props.principalId;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get type() {
    return this.props.type;
  }

  changePassword(hash: PasswordHash) {
    this.props.passwordHash = hash;

    this.props.passwordChangedAt = new Date();

    this.touch();
  }

  private touch() {
    this.props.updatedAt = new Date();

    this.props.version++;
  }
}
