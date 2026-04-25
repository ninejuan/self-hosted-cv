import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();
        const path = request.originalUrl ?? request.url;

        if (!path.startsWith('/api/admin')) {
            return true;
        }

        if (request.session?.isAuthenticated === true) {
            return true;
        }

        throw new UnauthorizedException('Authentication required');
    }
}
