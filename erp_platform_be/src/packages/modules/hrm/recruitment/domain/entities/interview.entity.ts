import { Entity } from '@shared-kernel/domain/entity';
import { Identifier } from '@shared-kernel/domain/primitives/identifier';
import { InterviewStatus } from '@prisma/client';

export interface InterviewProps {
  applicationId: Identifier;
  interviewerEmploymentId?: Identifier;
  scheduledAt?: Date;
  location?: string;
  meetingUrl?: string;
  result?: string;
  status: InterviewStatus;
}

export class Interview extends Entity<InterviewProps> {
  static create(props: Omit<InterviewProps, 'status'> & { status?: InterviewStatus }): Interview {
    return new Interview(Identifier.create(), {
      ...props,
      status: props.status ?? InterviewStatus.scheduled,
    });
  }

  static rehydrate(id: Identifier, props: InterviewProps): Interview {
    return new Interview(id, props);
  }

  get applicationId() {
    return this.props.applicationId;
  }

  get interviewerEmploymentId() {
    return this.props.interviewerEmploymentId;
  }

  get scheduledAt() {
    return this.props.scheduledAt;
  }

  get location() {
    return this.props.location;
  }

  get meetingUrl() {
    return this.props.meetingUrl;
  }

  get result() {
    return this.props.result;
  }

  get status() {
    return this.props.status;
  }

  update(props: Partial<Omit<InterviewProps, 'applicationId'>>): void {
    if (props.interviewerEmploymentId !== undefined)
      this.props.interviewerEmploymentId = props.interviewerEmploymentId;
    if (props.scheduledAt !== undefined) this.props.scheduledAt = props.scheduledAt;
    if (props.location !== undefined) this.props.location = props.location;
    if (props.meetingUrl !== undefined) this.props.meetingUrl = props.meetingUrl;
    if (props.result !== undefined) this.props.result = props.result;
    if (props.status !== undefined) this.props.status = props.status;
  }
}
