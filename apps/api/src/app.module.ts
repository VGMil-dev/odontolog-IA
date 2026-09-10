import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { MetricsModule } from './metrics/metrics.module';
import { ClinicsModule } from './clinics/clinics.module';
import { DoctorsModule } from './doctors/doctors.module';
import { TreatmentsModule } from './treatments/treatments.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    MetricsModule,
    ClinicsModule,
    DoctorsModule,
    TreatmentsModule,
    AppointmentsModule,
    ChatModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}