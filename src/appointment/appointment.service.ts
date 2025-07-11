import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { DoctorTimeSlot } from 'src/doctor/entities/doctor-time-slot.entity';
import { TimeSlotStatus } from 'src/doctor/enums/availability.enums';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { NewAppointmentDto } from './dto/new-appointment.dto';
import { UserRole } from 'src/auth/enums/user.enums';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(DoctorTimeSlot)
    private timeslotRepo: Repository<DoctorTimeSlot>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async newAppointment(patientId: number, dto: NewAppointmentDto) {
    try {
      const { doctor_id, timeslot_id } = dto;

      const timeslot = await this.timeslotRepo.findOne({
        where: { timeslot_id, is_deleted: false },
        relations: ['doctor', 'doctor.user', 'availability'],
      });
      if (!timeslot) {
        throw new NotFoundException('Time slot not found');
      }

      if (timeslot.status !== TimeSlotStatus.AVAILABLE) {
        throw new ConflictException('Time slot is no longer available');
      }

      const availability = timeslot.availability;

      const now = new Date();
      if (now < availability.booking_start_at) {
        throw new ConflictException('Booking window not opened yet');
      }
      if (now > availability.booking_end_at) {
        throw new ConflictException('Booking window closed');
      }
      if (timeslot.doctor.user_id !== doctor_id) {
        throw new BadRequestException(
          'Time slot does not belong to this doctor',
        );
      }

      const patient = await this.patientRepo.findOne({
        where: { user_id: patientId },
        relations: ['user'],
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const { doctor, ...timeSlotWithoutDoctor } = timeslot;

      const existingAppointmentInSession = await this.appointmentRepo.findOne({
        where: {
          patient: { user_id: patientId },
          appointment_status: AppointmentStatus.SCHEDULED,
          time_slot: {
            doctor: { user_id: doctor.user_id },
            availability: {
              date: availability.date,
              session: availability.session,
            },
          },
        },
      });

      if (existingAppointmentInSession) {
        throw new ConflictException(
          'You already have an appointment with this doctor in this session.',
        );
      }

      const existingAppointmentsCount = await this.appointmentRepo.count({
        where: {
          appointment_status: AppointmentStatus.SCHEDULED,
          time_slot: { timeslot_id: timeslot.timeslot_id },
        },
      });

      if (existingAppointmentsCount >= timeslot.max_patients) {
        throw new ConflictException('This time slot is already full.');
      }

      const reporting_time = this.calculateReportingTime(
        timeslot,
        existingAppointmentsCount,
      );

      const appointment = this.appointmentRepo.create({
        doctor,
        patient,
        time_slot: timeslot,
        appointment_status: AppointmentStatus.SCHEDULED,
        scheduled_on: new Date(),
        reason: dto.reason,
        notes: dto.notes,
      });

      await this.appointmentRepo.save(appointment);

      if (existingAppointmentsCount + 1 >= timeslot.max_patients) {
        timeslot.status = TimeSlotStatus.BOOKED;
        await this.timeslotRepo.save(timeslot);
      }

      return {
        message: 'Appointment booked successfully',
        data: {
          reporting_time,
          ...appointment,
          doctor: {
            ...doctor,
            user: { profile: doctor.user.profile },
          },
          patient: {
            ...patient,
            user: { profile: patient.user.profile },
          },
          time_slot: timeSlotWithoutDoctor,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error creating appointment:', error);
      throw new InternalServerErrorException('Error creating appointment');
    }
  }

  async viewAppointments(
    userId: number,
    role: UserRole,
    status?: AppointmentStatus,
  ) {
    try {
      // Appointments for patient
      if (role === UserRole.PATIENT) {
        if (status && status === AppointmentStatus.SCHEDULED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              patient: { user_id: userId },
              appointment_status: AppointmentStatus.SCHEDULED,
            },
            relations: ['doctor', 'doctor.user', 'time_slot'],
            order: { scheduled_on: 'ASC' },
          });

          return this.buildViewAppointmentResponse(
            'your upcoming appointments',
            appointments,
            role,
          );
        }
        if (status && status === AppointmentStatus.COMPLETED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              patient: { user_id: userId },
              appointment_status: AppointmentStatus.COMPLETED,
            },
            relations: ['doctor', 'doctor.user', 'time_slot'],
            order: { scheduled_on: 'DESC' },
          });

          return this.buildViewAppointmentResponse(
            'your completed appointments',
            appointments,
            role,
          );
        }
        if (status && status === AppointmentStatus.CANCELLED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              patient: { user_id: userId },
              appointment_status: AppointmentStatus.CANCELLED,
            },
            relations: ['doctor', 'doctor.user', 'time_slot'],
            order: { scheduled_on: 'DESC' },
          });

          return this.buildViewAppointmentResponse(
            'your cancelled appointments',
            appointments,
            role,
          );
        }
        const appointments = await this.appointmentRepo.find({
          where: { patient: { user_id: userId } },
          relations: ['doctor', 'doctor.user', 'time_slot'],
          order: { scheduled_on: 'DESC' },
        });
        return this.buildViewAppointmentResponse(
          'your all appointments',
          appointments,
          role,
        );
      }
      // Appointments for doctor
      else if (role === UserRole.DOCTOR) {
        if (status && status === AppointmentStatus.SCHEDULED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              doctor: { user_id: userId },
              appointment_status: AppointmentStatus.SCHEDULED,
            },
            relations: ['patient', 'patient.user', 'time_slot'],
            order: { scheduled_on: 'ASC' },
          });

          return this.buildViewAppointmentResponse(
            'your upcoming appointments',
            appointments,
            role,
          );
        }
        if (status && status === AppointmentStatus.COMPLETED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              doctor: { user_id: userId },
              appointment_status: AppointmentStatus.COMPLETED,
            },
            relations: ['patient', 'patient.user', 'time_slot'],
            order: { scheduled_on: 'DESC' },
          });

          return this.buildViewAppointmentResponse(
            'your completed appointments',
            appointments,
            role,
          );
        }
        if (status && status === AppointmentStatus.CANCELLED) {
          const appointments = await this.appointmentRepo.find({
            where: {
              doctor: { user_id: userId },
              appointment_status: AppointmentStatus.CANCELLED,
            },
            relations: ['patient', 'patient.user', 'time_slot'],
            order: { scheduled_on: 'DESC' },
          });

          return this.buildViewAppointmentResponse(
            'your cancelled appointments',
            appointments,
            role,
          );
        }
        const appointments = await this.appointmentRepo.find({
          where: { doctor: { user_id: userId } },
          relations: ['patient', 'patient.user', 'time_slot'],
          order: { scheduled_on: 'DESC' },
        });
        return this.buildViewAppointmentResponse(
          'your all appointments',
          appointments,
          role,
        );
      } else {
        throw new BadRequestException('Invalid user role');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Error fetching upcoming appointments',
      );
    }
  }

  async cancelAppointment(
    appointmentId: number,
    userId: number,
    role: UserRole,
  ) {
    try {
      const appointment = await this.appointmentRepo.findOne({
        where: { appointment_id: appointmentId },
        relations: ['doctor', 'patient', 'time_slot', 'time_slot.availability'],
      });
      if (!appointment) {
        throw new NotFoundException('Appointment not found');
      }
      if (role === UserRole.PATIENT && appointment.patient.user_id !== userId) {
        throw new ConflictException(
          'You can only cancel your own appointments',
        );
      }
      if (role === UserRole.DOCTOR && appointment.doctor.user_id !== userId) {
        throw new ConflictException(
          'You can only cancel your own appointments',
        );
      }
      if (
        appointment.appointment_status === AppointmentStatus.CANCELLED ||
        appointment.appointment_status === AppointmentStatus.COMPLETED
      ) {
        throw new ConflictException(
          'Appointment already cancelled or completed',
        );
      }

      const now = new Date();
      const consultStartAt = this.combineDateAndTime(
        appointment.time_slot.availability.date,
        appointment.time_slot.start_time,
      );

      if (now >= consultStartAt) {
        throw new ConflictException(
          'You can only cancel appointments before the consultation starts',
        );
      }

      appointment.appointment_status = AppointmentStatus.CANCELLED;
      await this.appointmentRepo.save(appointment);

      return {
        message: 'Appointment cancelled successfully',
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error cancelling appointment');
    }
  }

  async rescheduleAppointments(
    doctorId: number,
    dto: RescheduleAppointmentDto,
  ) {
    try {
      // reschedule appointments that are provided by doctor
      if (dto.appointment_ids && dto.appointment_ids.length > 0) {
        const appointments = await this.appointmentRepo.find({
          where: {
            appointment_id: In(dto.appointment_ids),
            doctor: { user_id: doctorId },
            appointment_status: AppointmentStatus.SCHEDULED,
            time_slot: {
              availability: {
                date: new Date(new Date().toISOString().split('T')[0]), // today's date
              },
            },
          },
          relations: [
            'doctor',
            'patient',
            'time_slot',
            'timeslot.availability',
          ],
        });
        if (!appointments || appointments.length === 0) {
          throw new NotFoundException('No appointments found');
        }
        console.log('Appointments to reschedule:', appointments);
      } else {
        const appointments = await this.appointmentRepo.find({
          where: {
            doctor: { user_id: doctorId },
            appointment_status: AppointmentStatus.SCHEDULED,
            time_slot: {
              availability: {
                date: new Date(new Date().toISOString().split('T')[0]), // today's date
              },
            },
          },
          relations: [
            'doctor',
            'patient',
            'time_slot',
            'time_slot.availability',
          ],
        });
        if (!appointments || appointments.length === 0) {
          throw new NotFoundException('No appointments found');
        }
        console.log('All appointments to reschedule:', appointments);
      }
      return;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Error rescheduling appointment');
    }
  }

  private calculateReportingTime(
    timeslot: DoctorTimeSlot,
    patientIndex: number,
  ): string {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };
    const toStr = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const startMins = toMin(timeslot.start_time);
    const endMins = toMin(timeslot.end_time);
    const totalDuration = endMins - startMins;

    const timePerPatient = totalDuration / timeslot.max_patients;

    const reportingTimeMins = startMins + timePerPatient * patientIndex;

    return toStr(reportingTimeMins);
  }

  private buildViewAppointmentResponse(
    message: string,
    appointments: Appointment[],
    role: UserRole,
  ) {
    const data = appointments.map((appointment) => {
      return {
        appointment_id: appointment.appointment_id,
        appointment_status: appointment.appointment_status,
        scheduled_on: appointment.scheduled_on,
        reason: appointment.reason,
        notes: appointment.notes,
        ...(role === UserRole.PATIENT
          ? {
              doctor: {
                ...appointment.doctor,
                user: {
                  profile: appointment.doctor?.user.profile,
                },
              },
            }
          : {
              patient: {
                ...appointment.patient,
                user: {
                  profile: appointment.patient?.user.profile,
                },
              },
            }),
      };
    });

    return {
      message,
      total: data.length,
      data,
    };
  }
  private combineDateAndTime(date: Date, timeStr: string): Date {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const result = new Date(date);
    result.setHours(hours, minutes, 0, 0);
    return result;
  }
}
