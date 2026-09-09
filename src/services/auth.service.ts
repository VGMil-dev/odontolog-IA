import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { SecureLogger } from '../utils/logger.js';
import { pgService } from './pg.service.js';

export class AuthService {
  private secret: string;

  constructor() {
    this.secret = env.ADMIN_SESSION_SECRET || 'fallback_secret';
  }

  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Valida credenciales contra la base de datos de PostgreSQL
   */
  public async validateCredentials(user: string, pass: string): Promise<{ valid: boolean, role?: string, clinicId?: string | null }> {
    if (!user || !pass) return { valid: false };

    try {
      const res = await pgService.query('SELECT * FROM users WHERE email = $1', [user]);
      if (res.rows.length === 0) return { valid: false };

      const dbUser = res.rows[0];
      const hashedPass = this.hashPassword(pass);

      const passBuffer = Buffer.from(hashedPass);
      const expectedPassBuffer = Buffer.from(dbUser.password_hash);

      if (passBuffer.length === expectedPassBuffer.length && crypto.timingSafeEqual(passBuffer, expectedPassBuffer)) {
        return { valid: true, role: dbUser.role, clinicId: dbUser.clinic_id };
      }
      return { valid: false };
    } catch (err) {
      SecureLogger.error('AuthService', 'Error validating credentials', err);
      return { valid: false };
    }
  }

  /**
   * Genera un token firmado con HMAC-SHA256 con validez de 7 días.
   */
  public createSessionToken(user: string, role: string, clinicId: string | null): string {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const clinicStr = clinicId || 'null';
    const payload = `${user}:${role}:${clinicStr}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    return token;
  }

  /**
   * Verifica la firma y expiración del token.
   */
  public verifyToken(token: string): { valid: boolean; user?: string, role?: string, clinicId?: string | null } {
    try {
      if (!token) return { valid: false };

      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 5) return { valid: false };

      const [user, role, clinicStr, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);

      if (Date.now() > expiresAt) {
        return { valid: false };
      }

      const payload = `${user}:${role}:${clinicStr}:${expiresAtStr}`;
      const expectedSig = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

      const sigBuffer = Buffer.from(signature);
      const expectedSigBuffer = Buffer.from(expectedSig);

      if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
        return { valid: false };
      }

      return { valid: true, user, role, clinicId: clinicStr === 'null' ? null : clinicStr };
    } catch {
      return { valid: false };
    }
  }

  /**
   * Middleware de Express para proteger rutas que requieren permisos de administrador.
   */
  public requireAdminAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'] || '';
    const cookieHeader = req.headers['cookie'] || '';

    let token = '';

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (cookieHeader.includes('odonto_admin_token=')) {
      const match = cookieHeader.match(/odonto_admin_token=([^;]+)/);
      if (match) token = match[1].trim();
    }

    const { valid, user, role, clinicId } = authService.verifyToken(token);

    if (!valid || role !== 'admin') {
      SecureLogger.warn('AuthService', `Acceso denegado a ruta protegida: ${req.path}`);
      return res.status(401).json({
        ok: false,
        error: 'No autorizado. Se requieren credenciales de Administrador válidas.',
      });
    }

    (req as any).adminUser = user;
    (req as any).adminRole = role;
    (req as any).adminClinicId = clinicId;
    next();
  }
}

export const authService = new AuthService();
