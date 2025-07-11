import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { RescheduleType } from '../enums/reschedule-type.enum';

export class RescheduleAppointmentDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(10)
  @Max(180)
  shift_minutes: number;

  @IsNotEmpty()
  @IsEnum(RescheduleType)
  reschedule_type: RescheduleType;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsNumber({}, { each: true })
  appointment_ids: number[];
}
