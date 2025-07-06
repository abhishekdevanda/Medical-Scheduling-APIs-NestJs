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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { DoctorService } from './doctor.service';
import { CreateDoctorAvailabilityDto } from './dto/create-availability.dto';
import { JwtPayload } from 'src/auth/auth.service';
import { UserRole } from 'src/auth/enums/user.enums';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Controller('api/v1/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

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
  async getDoctorDetails(@Param('id') id: string) {
    return this.doctorService.getDoctorDetails(Number(id));
  }

  @Get(':id/availability')
  async getAvailability(
    @Param('id') id: number,
    @Query('page') page = 1,
    @Query('limit') limit = 5,
  ) {
    return this.doctorService.getAvailableTimeSlots(id, page, limit);
  }

  @Post('availability')
  async setAvailability(
    @Body() dto: CreateDoctorAvailabilityDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new ForbiddenException('Access denied: Not a doctor');
    }
    return this.doctorService.createAvailability(user.sub, dto);
  }

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
