import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { Doctor } from 'src/doctor/entities/doctor.entity';
import { CreateDoctorAvailabilityDto } from './dto/create-availabilty.dto';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorTimeSlot } from './entities/doctor-time-slot.entity';
import { TimeSlotStatus, Weekday } from './enums/availability.enums';
import { ScheduleType } from './enums/schedule-type.enums';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepo: Repository<Doctor>,
    @InjectRepository(DoctorAvailability)
    private availabilityRepo: Repository<DoctorAvailability>,
    @InjectRepository(DoctorTimeSlot)
    private timeSlotRepo: Repository<DoctorTimeSlot>,
  ) {}

  async getProfile(doctorId: number) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user_id: doctorId },
        relations: ['user'],
      });
      if (!doctor) throw new NotFoundException('Doctor profile not found');
      const doctorWithProfile = {
        ...doctor,
        user: doctor.user.profile,
      };
      return { message: 'Doctor Profile', data: doctorWithProfile };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching doctor profile');
    }
  }

  async getDoctorDetails(doctorId: number) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user_id: doctorId },
        relations: ['user'],
      });
      if (!doctor) throw new NotFoundException('No doctor found');
      const doctorWithProfile = {
        ...doctor,
        user: doctor.user.profile,
      };
      return { message: 'Doctor Details', data: doctorWithProfile };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching doctor details');
    }
  }

  async searchDoctors(query?: string) {
    try {
      let where:
        | FindOptionsWhere<Doctor>
        | FindOptionsWhere<Doctor>[]
        | undefined = undefined;
      if (query) {
        where = [
          { clinic_name: ILike(`%${query}%`) },
          { specialization: ILike(`%${query}%`) },
          { user: { first_name: ILike(`%${query}%`) } },
          { user: { last_name: ILike(`%${query}%`) } },
        ];
      }
      const doctors = await this.doctorRepo.find({
        where,
        relations: ['user'],
      });
      const doctorWithProfile = doctors.map((doctor) => ({
        ...doctor,
        user: doctor.user.profile,
      }));
      return { total_results: doctors.length, data: doctorWithProfile };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error searching doctors');
    }
  }

  async createAvailability(doctorId: number, dto: CreateDoctorAvailabilityDto) {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user_id: doctorId },
        relations: ['user'],
      });
      if (!doctor) throw new NotFoundException('Doctor not found');

      if (!dto.date && (!dto.weekdays || dto.weekdays.length === 0)) {
        throw new BadRequestException(
          'Either date or weekdays must be provided',
        );
      }
      let datesToCreate: Date[] = [];

      if (dto.date) {
        const specificDate = dto.date; // dto.date instanceof Date ? dto.date : new Date(dto.date);
        if (specificDate < new Date()) {
          throw new BadRequestException('Date is in the past');
        }
        datesToCreate = [specificDate];
      }
      // If only weekdays are provided, create recurring availabilities
      else if (dto.weekdays && dto.weekdays.length > 0) {
        datesToCreate = this.generateDatesForWeekdays(dto.weekdays, 4); // Generate dates for next 4 weeks
      }

      const existingDates: string[] = [];
      for (const date of datesToCreate) {
        const existing = await this.availabilityRepo.findOne({
          where: {
            doctor: { user_id: doctorId },
            date: date,
            session: dto.session,
          },
        });

        if (existing) {
          existingDates.push(date.toDateString());
        }
      }

      // If all dates already have availabilities, throw conflict error
      if (existingDates.length === datesToCreate.length) {
        throw new ConflictException(
          `Availability already exists for the requested ${datesToCreate.length > 1 ? 'dates' : 'date'}: ${existingDates.join(', ')} (session: ${dto.session})`,
        );
      }

      // If some dates have availabilities, filter them out
      if (existingDates.length > 0) {
        datesToCreate = datesToCreate.filter(
          (date) => !existingDates.includes(date.toDateString()),
        );
      }

      const createdAvailabilities: DoctorAvailability[] = [];
      for (const date of datesToCreate) {
        // Check for existing availability on this date
        const existing = await this.availabilityRepo.findOne({
          where: {
            doctor: { user_id: doctorId },
            date: date,
            session: dto.session,
          },
        });

        if (existing) {
          continue;
        }
        const availability = this.availabilityRepo.create({
          ...dto,
          date: date,
          doctor,
          // Store weekdays only if we're using recurring pattern
          weekdays: dto.date ? undefined : dto.weekdays,
        });

        await this.availabilityRepo.save(availability);
        createdAvailabilities.push(availability);
      }
      return {
        message: 'Availability created',
        data: createdAvailabilities.map((a) => ({
          availability_id: a.availability_id,
          date: a.date.toDateString(),
          session: a.session,
          consulting_start_time: a.consulting_start_time,
          consulting_end_time: a.consulting_end_time,
          weekdays: a.weekdays,
        })),
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        console.log(error);
        throw error;
      }
      throw new InternalServerErrorException('Error creating availability');
    }
  }

  async getAvailableTimeSlots(doctorId: number, page: number, limit: number) {
    const doctor = await this.doctorRepo.findOne({
      where: { user_id: doctorId },
    });
    if (!doctor) {
      throw new BadRequestException('Invalid doctor ID');
    }

    try {
      const [slots, count] = await this.timeSlotRepo.findAndCount({
        where: {
          doctor: { user_id: doctorId },
          status: TimeSlotStatus.AVAILABLE,
        },
        order: { date: 'ASC', session: 'ASC', start_time: 'ASC' },
        skip: (page - 1) * limit,
        take: limit,
        relations: ['availability'],
      });

      if (!slots.length) {
        return {
          total: 0,
          page,
          limit,
          slots: [],
        };
      }

      return {
        total: count,
        page,
        limit,
        slots: slots.map((s) => ({
          timeslot_id: s.timeslot_id,
          date: s.date,
          session: s.session,
          start_time: s.start_time.slice(0, 5),
          end_time: s.end_time.slice(0, 5),
          max_patients: s.max_patients,
        })),
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error fetching time slots');
    }
  }

  async updateScheduleType(
    doctorId: number,
    scheduleType: ScheduleType,
  ): Promise<{ message: string }> {
    try {
      const doctor = await this.doctorRepo.findOne({
        where: { user_id: doctorId },
      });

      if (!doctor) {
        throw new NotFoundException('Doctor not found');
      }

      doctor.schedule_type = scheduleType;
      await this.doctorRepo.save(doctor);

      return { message: `Doctor schedule type updated to ${scheduleType}` };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating schedule type');
    }
  }

  private generateSlots(
    startTime: string,
    endTime: string,
    interval: number,
  ): { start: string; end: string }[] {
    const toMin = (t: string) => {
      const [h, m] = t.split(':').map(Number);
      return h * 60 + m;
    };

    const toStr = (m: number) => {
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    };

    const startMins = toMin(startTime);
    const endMins = toMin(endTime);

    if (endMins <= startMins) {
      throw new BadRequestException('End time must be after start time');
    }

    const slots: { start: string; end: string }[] = [];
    let current = startMins;

    while (current + interval <= endMins) {
      slots.push({
        start: toStr(current),
        end: toStr(current + interval),
      });
      current += interval;
    }

    return slots;
  }

  private generateDatesForWeekdays(
    weekdays: Weekday[],
    weeksAhead: number,
  ): Date[] {
    const dates: Date[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekdayMap = {
      [Weekday.Sunday]: 0,
      [Weekday.Monday]: 1,
      [Weekday.Tuesday]: 2,
      [Weekday.Wednesday]: 3,
      [Weekday.Thursday]: 4,
      [Weekday.Friday]: 5,
      [Weekday.Saturday]: 6,
    };

    // Generate dates for the specified number of weeks ahead
    for (let week = 0; week < weeksAhead; week++) {
      for (const weekday of weekdays) {
        const targetDay = weekdayMap[weekday];
        const date = new Date(today);

        // Calculate days to add to reach the target weekday
        const daysToAdd = ((targetDay + 7 - date.getDay()) % 7) + week * 7;
        date.setDate(date.getDate() + daysToAdd);

        // Only add future dates
        if (date > today) {
          dates.push(date);
        }
      }
    }

    return dates.sort((a, b) => a.getTime() - b.getTime());
  }
}
