import { Injectable, UnauthorizedException, ExecutionContext, CanActivate } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException('No token');

    try {
      const payload = this.jwtService.verify<{ email: string; role: string; clinicId: string | null }>(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authorization = request.headers['authorization'];
    if (!authorization) return undefined;
    const [, token] = authorization.split(' ');
    return token;
  }
}