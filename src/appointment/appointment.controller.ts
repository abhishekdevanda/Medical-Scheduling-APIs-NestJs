import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Param,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/new-appointment.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UserRole } from 'src/auth/enums/user.enums';
import { AppointmentStatus } from './enums/appointment-status.enum';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';

@Controller('api/v1/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async viewAppointments(
    @Req() req: Request,
    @Query('status') status?: AppointmentStatus,
  ) {
    const user = req.user as JwtPayload;
    return this.appointmentService.viewAppointments(
      user.sub,
      user.role,
      status,
    );
  }

  @Post('new')
  @HttpCode(HttpStatus.CREATED)
  async newAppointment(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.PATIENT) {
      throw new UnauthorizedException('Only patients can create appointments');
    }
    const patientId = user.sub;
    return this.appointmentService.newAppointment(
      patientId,
      createAppointmentDto,
    );
  }

  @Patch(':appointmentId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelAppointment(
    @Req() req: Request,
    @Param('appointmentId') appointmentId: number,
  ) {
    const user = req.user as JwtPayload;
    return this.appointmentService.cancelAppointment(
      appointmentId,
      user.sub,
      user.role,
    );
  }

  @Patch('reschedule')
  @HttpCode(HttpStatus.OK)
  async rescheduleAppointment(
    @Req() req: Request,
    @Body() dto: RescheduleAppointmentDto,
  ) {
    const user = req.user as JwtPayload;
    if (user.role !== UserRole.DOCTOR) {
      throw new UnauthorizedException(
        'Only doctors can reschedule appointments',
      );
    }
    return this.appointmentService.rescheduleAppointments(user.sub, dto);
  }
}
