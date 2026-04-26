import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, tap } from 'rxjs';

import { AuditAction } from '@/database/enums';

import { AuditService } from './audit.service';

const MUTATING_METHOD_ACTION: Record<string, AuditAction> = {
  POST: AuditAction.Create,
  PATCH: AuditAction.Update,
  PUT: AuditAction.Update,
  DELETE: AuditAction.Delete,
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const action = MUTATING_METHOD_ACTION[request.method];
    const path = request.originalUrl ?? request.url;

    if (!action || !path.startsWith('/api/admin')) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((responseBody: unknown) => {
        void this.auditService.record({
          action,
          entityType: this.resolveEntityType(path),
          entityId: this.resolveEntityId(request, responseBody),
          oldValue: null,
          newValue: this.toRecord(responseBody) ?? this.toRecord(request.body),
          ip: request.ip ?? null,
          userAgent: request.header('user-agent') ?? null,
          sessionId: request.sessionID ?? null,
        });
      }),
    );
  }

  private resolveEntityType(path: string): string | null {
    const [cleanPath] = path.split('?');
    const segments = cleanPath.split('/').filter(Boolean);
    const adminIndex = segments.indexOf('admin');

    return adminIndex >= 0 ? (segments[adminIndex + 1] ?? null) : null;
  }

  private resolveEntityId(
    request: Request,
    responseBody: unknown,
  ): string | null {
    const idParam = request.params.id;

    if (typeof idParam === 'string') {
      return idParam;
    }

    if (this.hasStringId(responseBody)) {
      return responseBody.id;
    }

    if (this.hasMediaId(responseBody)) {
      return responseBody.media.id;
    }

    return null;
  }

  private toRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : null;
  }

  private hasStringId(value: unknown): value is { id: string } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'id' in value &&
      typeof value.id === 'string'
    );
  }

  private hasMediaId(value: unknown): value is { media: { id: string } } {
    return (
      typeof value === 'object' &&
      value !== null &&
      'media' in value &&
      typeof value.media === 'object' &&
      value.media !== null &&
      'id' in value.media &&
      typeof value.media.id === 'string'
    );
  }
}
