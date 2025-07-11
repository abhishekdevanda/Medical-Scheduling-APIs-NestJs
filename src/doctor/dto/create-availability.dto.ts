import {
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDate,
  // IsInt,
  // Min,
  IsOptional,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { Session, Weekday } from '../enums/availability.enums';
import { Type } from 'class-transformer';

export class CreateDoctorAvailabilityDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsString()
  consulting_start_time: string;

  @IsString()
  consulting_end_time: string;

  @IsEnum(Session)
  session: Session;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  booking_start_date: Date;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  booking_start_time: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  booking_end_date: Date;

  @IsNotEmpty()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  booking_end_time: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Weekday, { each: true })
  weekdays?: Weekday[];
}
