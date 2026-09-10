import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getRealMetrics() {
    const activeClinics = await this.prisma.clinic.count();
    const totalDoctors = await this.prisma.doctor.count({ where: { isActive: true } });
    const totalAppointments = await this.prisma.appointment.count();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayAppointments = await this.prisma.appointment.count({
      where: { startTime: { gte: startOfToday } },
    });
    const totalUsers = await this.prisma.user.count();

    return {
      activeClinics,
      mrr: activeClinics * 3,
      totalDoctors,
      totalUsers,
      totalAppointments,
      todayAppointments,
      retentionRate: 85,
      channels: {
        telegramPercent: 65,
        whatsappPercent: 35,
      },
    };
  }
}