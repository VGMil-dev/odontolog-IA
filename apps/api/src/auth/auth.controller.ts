import { Controller, Post, Body, Get, Req, UseGuards, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.strategy';

class LoginDto {
  email!: string;
  password!: string;
}

class ImpersonateDto {
  targetClinicId!: string;
}

@Controller('api/auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Req() req: any) {
    return { ok: true, user: req.user };
  }

  @Post('impersonate')
  @UseGuards(JwtAuthGuard)
  async impersonate(@Req() req: any, @Body() dto: ImpersonateDto) {
    const user = req.user;
    if (!user || (user as any).role !== 'SUPER_ADMIN') {
      return { ok: false, error: 'Forbidden' };
    }
    const token = await this.auth.createSessionToken(
      user.email,
      'CLINIC_ADMIN',
      dto.targetClinicId,
    );
    return { ok: true, token, impersonatedClinicId: dto.targetClinicId };
  }
}