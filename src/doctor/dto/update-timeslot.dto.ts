import {
  IsMilitaryTime,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateTimeslotDto {
  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  start_time?: string;

  @IsOptional()
  @IsString()
  @IsMilitaryTime()
  end_time?: string;

  @IsOptional()
  @IsNumber()
  max_patients?: number;
}
