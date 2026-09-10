import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TreatmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string) {
    return this.prisma.treatment.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    });
  }

  async create(clinicId: string, data: any) {
    return this.prisma.treatment.create({
      data: {
        clinicId,
        name: data.name,
        specialty: data.specialty,
        priceRange: data.priceRange,
        assignedDoctorId: data.assignedDoctorId,
        description: data.description,
      },
    });
  }

  async update(clinicId: string, treatmentId: string, data: any) {
    await this.findOne(clinicId, treatmentId);
    return this.prisma.treatment.update({
      where: { id: treatmentId },
      data: {
        name: data.name,
        specialty: data.specialty,
        priceRange: data.priceRange,
        assignedDoctorId: data.assignedDoctorId,
        description: data.description,
      },
    });
  }

  async remove(clinicId: string, treatmentId: string) {
    await this.findOne(clinicId, treatmentId);
    return this.prisma.treatment.delete({ where: { id: treatmentId } });
  }

  private async findOne(clinicId: string, treatmentId: string) {
    const treatment = await this.prisma.treatment.findFirst({
      where: { id: treatmentId, clinicId },
    });
    if (!treatment) throw new NotFoundException('Tratamiento no encontrado');
    return treatment;
  }
}