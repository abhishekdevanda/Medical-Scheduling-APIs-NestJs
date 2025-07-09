import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Column,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/patient/entities/patient.entity';
import { DoctorTimeSlot } from 'src/doctor/entities/doctor-time-slot.entity';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { AppointmentStatus } from '../enums/appointment-status.enum';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  appointment_id: number;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
    name: 'appointment_status',
  })
  appointment_status: AppointmentStatus;

  @Column({ type: 'timestamp' })
  scheduled_on: Date;

  @Column({ type: 'varchar', nullable: true })
  reason: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Relations
  @ManyToOne(() => Doctor, (doctor) => doctor.appointments)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(() => Patient, (patient) => patient.appointments)
  @JoinColumn({ name: 'patient_id' })
  patient: Patient;

  @ManyToOne(() => DoctorTimeSlot, (slot) => slot.appointments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'time_slot_id' })
  time_slot: DoctorTimeSlot;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
