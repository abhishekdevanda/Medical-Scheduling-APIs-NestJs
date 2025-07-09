import {
  IsMilitaryTime,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateTimeslotDto {
  @IsNotEmpty()
  @IsNumber()
  availability_id: number;

  @IsNotEmpty()
  @IsString()
  @IsMilitaryTime()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  @IsMilitaryTime()
  end_time: string;

  @IsOptional()
  @IsNumber()
  max_patients: number;
}
