import {
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDate,
  IsOptional,
  Matches,
} from 'class-validator';
import { Session, Weekday } from '../enums/availability.enums';
import { Type } from 'class-transformer';

export class UpdateDoctorAvailabilityDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsOptional()
  @IsString()
  consulting_start_time?: string;

  @IsOptional()
  @IsString()
  consulting_end_time?: string;

  @IsOptional()
  @IsEnum(Session)
  session?: Session;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  booking_start_date?: Date;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Start time must be in HH:MM format',
  })
  booking_start_time?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  booking_end_date?: Date;

  @IsOptional()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'End time must be in HH:MM format',
  })
  booking_end_time?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Weekday, { each: true })
  weekdays?: Weekday[];
}
