import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly BCRYPT_SALT = 12;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_SALT);
  }

  async validateCredentials(email: string, password: string): Promise<{ valid: boolean; role?: Role; clinicId?: string | null }> {
    if (!email || !password) return { valid: false };
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return { valid: false };
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return { valid: false };
    return { valid: true, role: user.role, clinicId: user.clinicId };
  }

  async login(email: string, password: string): Promise<{ ok: boolean; token?: string; user?: string; role?: Role; clinicId?: string | null; error?: string }> {
    const validation = await this.validateCredentials(email, password);
    if (!validation.valid) {
      return { ok: false, error: 'Credenciales inválidas.' };
    }
    const payload = { email, role: validation.role, clinicId: validation.clinicId };
    const token = this.jwt.sign(payload);
    return { ok: true, token, user: email, role: validation.role, clinicId: validation.clinicId };
  }

  async verifyToken(token: string): Promise<{ valid: boolean; user?: string; role?: Role; clinicId?: string | null }> {
    try {
      const payload = this.jwt.verify<{ email: string; role: Role; clinicId: string | null }>(token);
      return { valid: true, user: payload.email, role: payload.role, clinicId: payload.clinicId };
    } catch {
      return { valid: false };
    }
  }

  createSessionToken(email: string, role: Role, clinicId: string | null) {
    const payload = { email, role, clinicId };
    return this.jwt.sign(payload);
  }
}