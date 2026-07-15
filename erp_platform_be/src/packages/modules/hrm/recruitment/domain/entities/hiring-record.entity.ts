import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';

export interface HiringRecordProps {
  applicationId: Identifier;
  employeeId?: Identifier;
  employmentId?: Identifier;
  hiredAt: Date;
}

export class HiringRecord extends Entity<HiringRecordProps> {
  static create(props: Omit<HiringRecordProps, 'hiredAt'> & { hiredAt?: Date }): HiringRecord {
    return new HiringRecord(Identifier.create(), {
      ...props,
      hiredAt: props.hiredAt ?? new Date(),
    });
  }

  static rehydrate(id: Identifier, props: HiringRecordProps): HiringRecord {
    return new HiringRecord(id, props);
  }

  get applicationId() {
    return this.props.applicationId;
  }

  get employeeId() {
    return this.props.employeeId;
  }

  get employmentId() {
    return this.props.employmentId;
  }

  get hiredAt() {
    return this.props.hiredAt;
  }

  update(props: Partial<Omit<HiringRecordProps, 'applicationId'>>): void {
    if (props.employeeId !== undefined) this.props.employeeId = props.employeeId;
    if (props.employmentId !== undefined) this.props.employmentId = props.employmentId;
  }
}
