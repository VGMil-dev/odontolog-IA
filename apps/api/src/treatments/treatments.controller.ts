import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { TreatmentsService } from './treatments.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/clinics/:clinicId/treatments')
@UseGuards(JwtAuthGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Get()
  async findAll(@Param('clinicId') clinicId: string) {
    const treatments = await this.treatmentsService.findAll(clinicId);
    return { ok: true, treatments };
  }

  @Post()
  async create(@Param('clinicId') clinicId: string, @Body() body: any) {
    const treatment = await this.treatmentsService.create(clinicId, body);
    return { ok: true, treatment };
  }

  @Patch(':treatmentId')
  async update(
    @Param('clinicId') clinicId: string,
    @Param('treatmentId') treatmentId: string,
    @Body() body: any,
  ) {
    const treatment = await this.treatmentsService.update(clinicId, treatmentId, body);
    return { ok: true, treatment };
  }

  @Delete(':treatmentId')
  async remove(@Param('clinicId') clinicId: string, @Param('treatmentId') treatmentId: string) {
    await this.treatmentsService.remove(clinicId, treatmentId);
    return { ok: true };
  }
}