import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  async findAll(@Query('clinicId') clinicId?: string) {
    const appointments = await this.appointmentsService.findAll(clinicId);
    return { ok: true, appointments };
  }

  @Post()
  async create(@Body() body: any) {
    const appointment = await this.appointmentsService.create(body);
    return { ok: true, appointment };
  }
}