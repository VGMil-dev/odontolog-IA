import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async findAll(clinicId?: string) {
    return this.prisma.appointment.findMany({
      where: clinicId ? { clinicId } : undefined,
      orderBy: { startTime: 'asc' },
    });
  }

  async create(data: any) {
    return this.prisma.appointment.create({
      data: {
        clinicId: data.clinicId,
        name: data.name,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        status: data.status ?? 'scheduled',
      },
    });
  }
}