import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DoctorAvailability } from './doctor-availability.entity';
import { Doctor } from './doctor.entity';
import { Session, TimeSlotStatus } from '../enums/availability.enums';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('doctor_time_slots')
export class DoctorTimeSlot {
  @PrimaryGeneratedColumn()
  timeslot_id: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({
    type: 'enum',
    enum: Session,
  })
  session: Session;

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({
    type: 'enum',
    enum: TimeSlotStatus,
    default: TimeSlotStatus.AVAILABLE,
  })
  status: TimeSlotStatus;

  @Column({ type: 'int' })
  max_patients: number;

  @Column({ type: 'boolean', default: false })
  is_deleted: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relationships
  @ManyToOne(() => Doctor, (doctor) => doctor.time_slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @ManyToOne(
    () => DoctorAvailability,
    (availability) => availability.time_slots,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'availability_id' })
  availability: DoctorAvailability;

  @OneToMany(() => Appointment, (appointment) => appointment.time_slot)
  appointments: Appointment[];
}
