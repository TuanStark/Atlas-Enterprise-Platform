import { Identifier } from './primitives/identifier';

export abstract class Entity<Props> {
  protected constructor(
    public readonly id: Identifier,
    protected readonly props: Props,
  ) {}

  public getId(): Identifier {
    return this.id;
  }

  public equals(object?: Entity<Props>): boolean {
    if (!object) {
      return false;
    }

    return this.id.equals(object.id);
  }
}
