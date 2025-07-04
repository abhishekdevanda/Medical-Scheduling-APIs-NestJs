import {
  IsString,
  IsEnum,
  IsArray,
  ArrayNotEmpty,
  IsDate,
  // IsInt,
  // Min,
  IsOptional,
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

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Weekday, { each: true })
  weekdays?: Weekday[];

  // @IsInt()
  // @Min(5) // Minimum 5 minutes
  // slot_duration: number;

  // @IsOptional()
  // @IsInt()
  // @Min(1)
  // patients_per_slot?: number;
}
