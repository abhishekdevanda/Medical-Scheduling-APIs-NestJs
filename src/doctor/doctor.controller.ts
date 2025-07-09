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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';
import { JwtPayload } from 'src/auth/auth.service';
import { UserRole } from 'src/auth/enums/user.enums';
import { UpdateScheduleTypeDto } from './dto/update-schedule-type.dto';
import { CreateTimeslotDto } from './dto/create-timeslot.dto';
import { UpdateTimeslotDto } from './dto/update-timeslot.dto';
import { UpdateDoctorAvailabilityDto } from './dto/update-availabilty.dto';

@Controller('api/v1/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  // GET Requests
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.getProfile(user.sub);
  }

  @Get('search')
  @HttpCode(HttpStatus.OK)
  async searchDoctors(@Query('query') query: string) {
    return this.doctorService.searchDoctors(query);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getDoctorDetails(@Param('id', ParseIntPipe) id: number) {
    return this.doctorService.getDoctorDetails(id);
  }

  @Get(':id/availability')
  @HttpCode(HttpStatus.OK)
  async getAvailability(
    @Param('id') id: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 5,
  ) {
    return this.doctorService.getAvailableTimeSlots(id, page, limit);
  }

  // Post Requests
  @Post('availability')
  @HttpCode(HttpStatus.CREATED)
  async newAvailability(
    @Body() dto: CreateDoctorAvailabilityDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.newAvailability(user.sub, dto);
  }

  @Post('timeslot')
  @HttpCode(HttpStatus.CREATED)
  async newTimeslot(@Body() dto: CreateTimeslotDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.newTimeslot(user.sub, dto);
  }

  // Update Requests
  @Patch('schedule_type')
  @HttpCode(HttpStatus.OK)
  async updateScheduleType(
    @Body() dto: UpdateScheduleTypeDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.updateScheduleType(user.sub, dto.schedule_type);
  }

  @Patch('availability/:availability_id')
  @HttpCode(HttpStatus.OK)
  async updateAvailabilty(
    @Param('availability_id', ParseIntPipe) availability_id: number,
    @Body() dto: UpdateDoctorAvailabilityDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.updateAvailabilty(user.sub, availability_id, dto);
  }

  @Patch('timeslot/:timeslot_id')
  @HttpCode(HttpStatus.OK)
  async updateTimeslot(
    @Param('timeslot_id', ParseIntPipe) timeslot_id: number,
    @Body() dto: UpdateTimeslotDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.updateTimeslot(user.sub, timeslot_id, dto);
  }

  //Delete Requests
  @Delete('availability/:availability_id')
  @HttpCode(HttpStatus.OK)
  async deleteAvailabilty(
    @Param('availability_id', ParseIntPipe) availability_id: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.softDeleteAvailability(user.sub, availability_id);
  }

  @Delete('timeslot/:timeslot_id')
  @HttpCode(HttpStatus.OK)
  async deleteTimeslot(
    @Param('timeslot_id', ParseIntPipe) timeslot_id: number,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.softDeleteTimeslot(user.sub, timeslot_id);
  }
}
