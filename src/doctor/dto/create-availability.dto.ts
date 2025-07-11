import {
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDate,
  IsOptional,
  IsNotEmpty,
  IsMilitaryTime,
} from 'class-validator';
import { Session, Weekday } from '../enums/availability.enums';
import { Type } from 'class-transformer';

export class CreateDoctorAvailabilityDto {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;

  @IsNotEmpty()
  @IsString()
  @IsMilitaryTime()
  consulting_start_time: string;

  @IsNotEmpty()
  @IsString()
  @IsMilitaryTime()
  consulting_end_time: string;

  @IsNotEmpty()
  @IsEnum(Session)
  session: Session;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  booking_start_date: Date;

  @IsNotEmpty()
  @IsMilitaryTime()
  booking_start_time: string;

  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  booking_end_date: Date;

  @IsNotEmpty()
  @IsMilitaryTime()
  booking_end_time: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Weekday, { each: true })
  weekdays?: Weekday[];
}
