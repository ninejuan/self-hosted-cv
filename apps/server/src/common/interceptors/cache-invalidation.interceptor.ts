import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request } from 'express';
import Redis from 'ioredis';
import { Observable, tap } from 'rxjs';

import { CV_CACHE_KEY } from '@/modules/cv/cv-cache.constants';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

@Injectable()
export class CacheInvalidationInterceptor implements NestInterceptor {
  constructor(
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const path = request.originalUrl ?? request.url;

    if (
      !MUTATING_METHODS.has(request.method) ||
      !path.startsWith('/api/admin')
    ) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void this.redis.del(CV_CACHE_KEY);
      }),
    );
  }
}
