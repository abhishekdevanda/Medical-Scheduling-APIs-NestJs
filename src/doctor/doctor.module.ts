import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Doctor } from './entities/doctor.entity';
import { DoctorController } from './doctor.controller';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { DoctorService } from './doctor.service';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Doctor,
      DoctorAvailability,
      DoctorTimeSlot,
      Appointment,
    ]),
  ],
  controllers: [DoctorController],
  providers: [JwtStrategy, DoctorService],
})
export class DoctorModule {}
