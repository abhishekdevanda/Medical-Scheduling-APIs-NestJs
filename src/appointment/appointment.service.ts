import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { Appointment } from './entities/appointment.entity';
import { DoctorTimeSlot } from 'src/doctor/entities/doctor-time-slot.entity';
import { TimeSlotStatus } from 'src/doctor/enums/availability.enums';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { CreateAppointmentDto } from './dto/appointment.dto';
import { UserRole } from 'src/auth/enums/user.enums';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(DoctorTimeSlot)
    private timeSlotRepo: Repository<DoctorTimeSlot>,
    @InjectRepository(Patient)
    private patientRepo: Repository<Patient>,
  ) {}

  async createAppointment(patientId: number, dto: CreateAppointmentDto) {
    try {
      const { doctor_id, timeslot_id } = dto;

      const timeslot = await this.timeSlotRepo.findOne({
        where: { timeslot_id },
        relations: ['doctor', 'doctor.user', 'availability'],
      });
      if (!timeslot) {
        throw new NotFoundException('Time slot not found');
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

      if (timeslot.status !== TimeSlotStatus.AVAILABLE) {
        throw new ConflictException('Time slot is no longer available');
      }

      const { doctor, ...timeSlotWithoutDoctor } = timeslot;

      const existingAppointmentInSession = await this.appointmentRepo.findOne({
        where: {
          patient: { user_id: patientId },
          time_slot: {
            doctor: { user_id: doctor.user_id },
            date: timeslot.date,
            session: timeslot.session,
          },
        },
      });

      if (existingAppointmentInSession) {
        throw new ConflictException(
          'You already have an appointment with this doctor in this session.',
        );
      }

      const existingAppointmentsCount = await this.appointmentRepo.count({
        where: { time_slot: { timeslot_id: timeslot.timeslot_id } },
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
      });

      await this.appointmentRepo.save(appointment);

      if (existingAppointmentsCount + 1 >= timeslot.max_patients) {
        timeslot.status = TimeSlotStatus.BOOKED;
        await this.timeSlotRepo.save(timeslot);
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

  async viewAppointments(userId: number, role: UserRole) {
    try {
      if (role === UserRole.PATIENT) {
        const appointments = await this.appointmentRepo.find({
          where: {
            patient: { user_id: userId },
            appointment_status: AppointmentStatus.SCHEDULED,
          },
          relations: ['doctor', 'doctor.user', 'time_slot'],
          order: { scheduled_on: 'ASC' },
        });

        return this.buildAppointmentResponse(
          'Upcoming appointments for patient',
          appointments,
          role,
        );
      }
      if (role === UserRole.DOCTOR) {
        const appointments = await this.appointmentRepo.find({
          where: {
            doctor: { user_id: userId },
            appointment_status: AppointmentStatus.SCHEDULED,
          },
          relations: ['patient', 'patient.user', 'time_slot'],
          order: { scheduled_on: 'ASC' },
        });

        return this.buildAppointmentResponse(
          'Upcoming appointments for doctor',
          appointments,
          role,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error fetching appointments:', error);
      throw new InternalServerErrorException(
        'Error fetching upcoming appointments',
      );
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

  private buildAppointmentResponse(
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
}
