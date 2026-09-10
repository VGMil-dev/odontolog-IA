import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class DoctorsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId: string) {
    return this.prisma.doctor.findMany({
      where: { clinicId },
      orderBy: { name: 'asc' },
    });
  }

  async create(clinicId: string, data: any) {
    return this.prisma.doctor.create({
      data: {
        clinicId,
        name: data.name,
        specialty: data.specialty,
        specialtyLabel: data.specialtyLabel,
        calendarId: data.calendarId,
        slotDurationMin: data.slotDurationMin ?? 30,
        isActive: data.isActive ?? true,
        availableDays: data.availableDays ?? [],
      },
    });
  }

  async update(clinicId: string, doctorId: string, data: any) {
    await this.findOne(clinicId, doctorId);
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: {
        name: data.name,
        specialty: data.specialty,
        specialtyLabel: data.specialtyLabel,
        calendarId: data.calendarId,
        slotDurationMin: data.slotDurationMin,
        availableDays: data.availableDays,
      },
    });
  }

  async remove(clinicId: string, doctorId: string) {
    await this.findOne(clinicId, doctorId);
    return this.prisma.doctor.delete({ where: { id: doctorId } });
  }

  async toggleStatus(clinicId: string, doctorId: string) {
    const doctor = await this.findOne(clinicId, doctorId);
    return this.prisma.doctor.update({
      where: { id: doctorId },
      data: { isActive: !doctor.isActive },
    });
  }

  private async findOne(clinicId: string, doctorId: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: { id: doctorId, clinicId },
    });
    if (!doctor) throw new NotFoundException('Doctor no encontrado');
    return doctor;
  }
}