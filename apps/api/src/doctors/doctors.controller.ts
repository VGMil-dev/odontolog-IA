import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/clinics/:clinicId/doctors')
@UseGuards(JwtAuthGuard)
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async findAll(@Param('clinicId') clinicId: string) {
    const doctors = await this.doctorsService.findAll(clinicId);
    return { ok: true, doctors };
  }

  @Post()
  async create(@Param('clinicId') clinicId: string, @Body() body: any) {
    const doctor = await this.doctorsService.create(clinicId, body);
    return { ok: true, doctor };
  }

  @Patch(':doctorId')
  async update(
    @Param('clinicId') clinicId: string,
    @Param('doctorId') doctorId: string,
    @Body() body: any,
  ) {
    const doctor = await this.doctorsService.update(clinicId, doctorId, body);
    return { ok: true, doctor };
  }

  @Delete(':doctorId')
  async remove(@Param('clinicId') clinicId: string, @Param('doctorId') doctorId: string) {
    await this.doctorsService.remove(clinicId, doctorId);
    return { ok: true };
  }

  @Post(':doctorId/toggle-status')
  async toggleStatus(@Param('clinicId') clinicId: string, @Param('doctorId') doctorId: string) {
    const doctor = await this.doctorsService.toggleStatus(clinicId, doctorId);
    return { ok: true, doctor };
  }
}