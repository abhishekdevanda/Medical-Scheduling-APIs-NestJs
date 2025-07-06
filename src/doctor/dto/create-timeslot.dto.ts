import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTimeslotDto {
  @IsNotEmpty()
  @IsNumber()
  availability_id: number;

  @IsNotEmpty()
  @IsString()
  start_time: string;

  @IsNotEmpty()
  @IsString()
  end_time: string;

  @IsOptional()
  @IsNumber()
  max_patients: number;
}
