import equal from 'fast-deep-equal';

export abstract class ValueObject<Props> {
  protected readonly props: Readonly<Props>;

  protected constructor(props: Props) {
    this.props = Object.freeze(props);
  }

  public equals(other?: ValueObject<Props>): boolean {
    if (!other) {
      return false;
    }

    return equal(this.props, other.props);
  }

  public get value(): Props {
    return this.props;
  }
}
