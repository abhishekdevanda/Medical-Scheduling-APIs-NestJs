import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Req,
  ForbiddenException,
  Post,
  Body,
  Patch,
  UnauthorizedException,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';
import { JwtPayload } from 'src/auth/auth.service';
import { UserRole } from 'src/auth/enums/user.enums';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';

@Controller('api/v1/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // GET Requests
  @Get('profile')
  async getProfile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.getProfile(user.sub);
  }

  @Get('search')
  async searchDoctors(@Query('query') query: string) {
    return this.doctorService.searchDoctors(query);
  }

  @Get(':id')
  async getDoctorDetails(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorDetails(id);
  }

  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    return this.doctorService.getAvailableTimeSlots(id, page, limit);
  }

  // Post Requests
  @Post('availability')
  async createAvailability(
    @Body() dto: CreateDoctorAvailabilityDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.createAvailability(user.sub, dto);
  }

  @Post('timeslot')
  async createTimeslots(@Body() dto: CreateTimeslotDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.createTimeslots(user.sub, dto);
  }

  // Patch Requests
  @Patch('schedule_type')
  async updateScheduleType(
    @Body() dto: UpdateScheduleDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new UnauthorizedException('Unauthorized: Not a doctor');
    }
    return this.doctorService.updateScheduleType(user.sub, dto.schedule_type);
  }
}
