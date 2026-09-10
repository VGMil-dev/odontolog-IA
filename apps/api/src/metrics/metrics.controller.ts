import { Controller, Get, UseGuards } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('real')
  async getReal() {
    const metrics = await this.metricsService.getRealMetrics();
    return { ok: true, metrics };
  }
}