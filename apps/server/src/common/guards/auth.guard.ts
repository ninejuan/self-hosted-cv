import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

// Password-level sessions may only enroll in MFA or end the session.
const PASSWORD_LEVEL_ALLOWED_ROUTES = new Set([
  'POST /api/auth/2fa/setup',
  'POST /api/auth/2fa/verify',
  'POST /api/auth/logout',
]);

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    if (request.session?.isAuthenticated === true) {
      const authenticatedAt = request.session.authenticatedAt;
      const absoluteLifetimeMs =
        Number(this.configService.get('SESSION_MAX_LIFETIME', 86400)) * 1000;

      if (
        authenticatedAt === undefined ||
        Date.now() - authenticatedAt >= absoluteLifetimeMs
      ) {
        request.session.destroy(() => undefined);
        throw new UnauthorizedException('Authentication required');
      }

      const requiresTwoFactor = this.configService.get<boolean>(
        'REQUIRE_2FA',
        false,
      );
      const isEnrollmentRoute = PASSWORD_LEVEL_ALLOWED_ROUTES.has(
        `${request.method} ${request.path}`,
      );

      if (
        requiresTwoFactor &&
        request.session.authLevel !== 'mfa' &&
        !isEnrollmentRoute
      ) {
        throw new ForbiddenException('Multi-factor authentication required');
      }

      return true;
    }

    throw new UnauthorizedException('Authentication required');
  }
}
