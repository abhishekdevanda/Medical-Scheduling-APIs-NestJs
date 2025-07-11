import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class NewAppointmentDto {
  @IsInt()
  doctor_id: number;

  @IsInt()
  @IsNotEmpty()
  timeslot_id: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
