import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Doctor } from './doctor.entity';
import { Session, Weekday } from '../enums/availability.enums';
import { DoctorTimeSlot } from './doctor-time-slot.entity';

@Entity('doctor_availabilities')
@Unique([
  'doctor',
  'date',
  'session',
  'consulting_start_time',
  'consulting_end_time',
])
export class DoctorAvailability {
  @PrimaryGeneratedColumn()
  availability_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  consulting_start_time: string;

  @Column({ type: 'time' })
  consulting_end_time: string;

  @Column({ type: 'enum', enum: Session })
  session: Session;

  @Column({ type: 'enum', enum: Weekday, array: true, nullable: true })
  weekdays?: Weekday[];

  @Column({ type: 'timestamp' })
  booking_start_at: Date;

  @Column({ type: 'timestamp' })
  booking_end_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  // Relationships
  @ManyToOne(() => Doctor, (doctor) => doctor.availabilities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @OneToMany(() => DoctorTimeSlot, (slot) => slot.availability, {
    cascade: true,
  })
  time_slots: DoctorTimeSlot[];
}
