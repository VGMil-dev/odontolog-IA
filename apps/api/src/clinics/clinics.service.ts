import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClinicsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.clinic.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.clinic.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.clinic.create({ data });
  }

  async update(id: string, data: any) {
    return this.prisma.clinic.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.clinic.delete({ where: { id } });
  }
}