import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: LoggerService) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const httpContext = context.switchToHttp();
        const request = httpContext.getRequest<Request>();
        const response = httpContext.getResponse<Response>();
        const startedAt = process.hrtime.bigint();

        return next.handle().pipe(
            tap(() => {
                const latencyMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;

                this.logger.setContext({
                    method: request.method,
                    path: request.originalUrl,
                    status: response.statusCode,
                    latency_ms: Math.round(latencyMs),
                    ip: request.ip,
                    userAgent: request.header('user-agent'),
                });
                this.logger.log('request completed', LoggingInterceptor.name);
            }),
        );
    }
}
