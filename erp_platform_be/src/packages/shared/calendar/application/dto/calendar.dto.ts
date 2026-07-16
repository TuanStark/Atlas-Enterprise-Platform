import { ApiProperty } from '@nestjs/swagger';

export class HolidayDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  holidayDate: Date;

  @ApiProperty()
  name: string;

  @ApiProperty()
  recurring: boolean;
}

export class SystemCalendarDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ required: false })
  code?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty({ required: false })
  workDays?: any;

  @ApiProperty({ type: [HolidayDto], default: [] })
  holidays: HolidayDto[];
}
