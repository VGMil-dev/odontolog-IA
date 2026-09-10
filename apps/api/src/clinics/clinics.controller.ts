import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ClinicsService } from './clinics.service';
import { JwtAuthGuard } from '../auth/jwt.strategy';

@Controller('api/clinics')
@UseGuards(JwtAuthGuard)
export class ClinicsController {
  constructor(private readonly clinicsService: ClinicsService) {}

  @Get()
  async findAll() {
    const clinics = await this.clinicsService.findAll();
    return { ok: true, clinics };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const clinic = await this.clinicsService.findOne(id);
    return { ok: true, clinic };
  }

  @Post()
  async create(@Body() body: any) {
    const clinic = await this.clinicsService.create(body);
    return { ok: true, clinic };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const clinic = await this.clinicsService.update(id, body);
    return { ok: true, clinic };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.clinicsService.delete(id);
    return { ok: true };
  }

  @Post(':id/meta-whatsapp')
  async updateMeta(@Param('id') id: string, @Body() body: any) {
    const clinic = await this.clinicsService.update(id, {
      metaPhoneNumberId: body.metaPhoneNumberId,
      metaWabaId: body.metaWabaId,
      metaAccessToken: body.metaAccessToken,
    });
    return { ok: true, clinic };
  }

  @Post(':id/telegram')
  async updateTelegram(@Param('id') id: string, @Body() body: any) {
    const clinic = await this.clinicsService.update(id, {
      telegramBotToken: body.telegramBotToken,
    });
    return { ok: true, clinic };
  }
}