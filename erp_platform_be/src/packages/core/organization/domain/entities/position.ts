import { AggregateRoot } from '@shared-kernel/domain/aggregate-root';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface PositionProps {
  organizationId: Identifier;
  code: string;
  name: string;
  description?: string;
  level?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Position extends AggregateRoot<PositionProps> {
  public static create(props: Omit<PositionProps, 'createdAt' | 'updatedAt'>): Position {
    return new Position(Identifier.create(), {
      ...props,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  public static rehydrate(id: Identifier, props: PositionProps): Position {
    return new Position(id, props);
  }

  rename(name: string) {
    if (this.props.name === name) {
      return;
    }
    this.props.name = name;
    this.touch();
  }

  changeCode(code: string) {
    if (this.props.code === code) {
      return;
    }
    this.props.code = code;
    this.touch();
  }

  changeDescription(description?: string) {
    this.props.description = description;
    this.touch();
  }

  changeLevel(level?: number) {
    this.props.level = level;
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

  get level() {
    return this.props.level;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  get updatedAt() {
    return this.props.updatedAt;
  }

  private touch() {
    this.props.updatedAt = new Date();
  }
}
