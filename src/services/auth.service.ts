import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { SecureLogger } from '../utils/logger.js';

export class AuthService {
  private secret: string;

  constructor() {
    this.secret = env.ADMIN_SESSION_SECRET;
  }

  /**
   * Valida credenciales contra las variables de entorno con prevención de timing attacks.
   */
  public validateCredentials(user: string, pass: string): boolean {
    if (!user || !pass) return false;

    const expectedUser = env.ADMIN_USER;
    const expectedPass = env.ADMIN_PASSWORD;

    const userBuffer = Buffer.from(user);
    const expectedUserBuffer = Buffer.from(expectedUser);

    const passBuffer = Buffer.from(pass);
    const expectedPassBuffer = Buffer.from(expectedPass);

    const userMatch = userBuffer.length === expectedUserBuffer.length && 
      crypto.timingSafeEqual(userBuffer, expectedUserBuffer);

    const passMatch = passBuffer.length === expectedPassBuffer.length && 
      crypto.timingSafeEqual(passBuffer, expectedPassBuffer);

    return userMatch && passMatch;
  }

  /**
   * Genera un token firmado con HMAC-SHA256 con validez de 7 días.
   */
  public createSessionToken(user: string): string {
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const payload = `${user}:${expiresAt}`;
    const signature = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');
    const token = Buffer.from(`${payload}:${signature}`).toString('base64');
    return token;
  }

  /**
   * Verifica la firma y expiración del token.
   */
  public verifyToken(token: string): { valid: boolean; user?: string } {
    try {
      if (!token) return { valid: false };

      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 3) return { valid: false };

      const [user, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);

      if (Date.now() > expiresAt) {
        return { valid: false };
      }

      const payload = `${user}:${expiresAtStr}`;
      const expectedSig = crypto.createHmac('sha256', this.secret).update(payload).digest('hex');

      const sigBuffer = Buffer.from(signature);
      const expectedSigBuffer = Buffer.from(expectedSig);

      if (sigBuffer.length !== expectedSigBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedSigBuffer)) {
        return { valid: false };
      }

      return { valid: true, user };
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

    const { valid, user } = authService.verifyToken(token);

    if (!valid) {
      SecureLogger.warn('AuthService', `Acceso denegado a ruta protegida: ${req.path}`);
      return res.status(401).json({
        ok: false,
        error: 'No autorizado. Se requieren credenciales de Administrador válidas.',
      });
    }

    (req as any).adminUser = user;
    next();
  }
}

export const authService = new AuthService();
