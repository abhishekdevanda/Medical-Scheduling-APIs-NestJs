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
  @HttpCode(HttpStatus.CREATED)
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
  @HttpCode(HttpStatus.CREATED)
  async createTimeslots(@Body() dto: CreateTimeslotDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.createTimeslots(user.sub, dto);
  }

  // Update Requests
  @Patch('schedule_type')
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


  @Patch('availabilty/:availabilty_id')
  @HttpCode(HttpStatus.OK)
  async updateAvailabilty(
    @Param('availabilty_id', ParseIntPipe) availabilty_id: number,
    @Body() dto: UpdateDoctorAvailabilityDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Unauthorized: Not a doctor');
    }
    return this.doctorService.updateAvailabilty(user.sub, availabilty_id, dto);
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
    return this.doctorService.deleteTimeslot(user.sub, timeslot_id);
  }
}
