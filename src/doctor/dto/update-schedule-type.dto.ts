import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ScheduleType } from '../enums/schedule-type.enums';

export class UpdateScheduleTypeDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(ScheduleType)
  schedule_type: ScheduleType;
}
