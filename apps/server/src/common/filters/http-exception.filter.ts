import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

import { LoggerService } from '@/logger/logger.service';

type RequestWithId = Request & {
    requestId?: string;
    startedAtNs?: bigint;
};

interface ErrorResponseBody {
    statusCode: number;
    timestamp: string;
    path: string;
    requestId?: string;
    message: string | string[];
    error: string;
}

interface NestErrorResponse {
    message: string | string[];
    error: string;
}

interface PartialNestErrorResponse {
    message?: string | string[];
    error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService) {}

    catch(exception: unknown, host: ArgumentsHost): void {
        const context = host.switchToHttp();
        const response = context.getResponse<Response>();
        const request = context.getRequest<RequestWithId>();
        const statusCode = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : undefined;
        const normalizedResponse = this.normalizeExceptionResponse(exceptionResponse, statusCode);
        const stack = exception instanceof Error ? exception.stack : undefined;
        const latencyMs = request.startedAtNs ? Number(process.hrtime.bigint() - request.startedAtNs) / 1_000_000 : undefined;

        this.logger.setContext({
            method: request.method,
            path: request.originalUrl,
            status: statusCode,
            latency_ms: latencyMs === undefined ? undefined : Math.round(latencyMs),
            ip: request.ip,
            userAgent: request.header('user-agent'),
        });
        this.logger.error(normalizedResponse.message.toString(), stack, HttpExceptionFilter.name);

        const body: ErrorResponseBody = {
            statusCode,
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
            requestId: request.requestId,
            message: normalizedResponse.message,
            error: normalizedResponse.error,
        };

        response.status(statusCode).json(body);
    }

    private normalizeExceptionResponse(response: string | object | undefined, statusCode: number): NestErrorResponse {
        if (typeof response === 'string') {
            return {
                message: response,
                error: HttpStatus[statusCode] ?? 'Error',
            };
        }

        if (this.isNestErrorResponse(response)) {
            return {
                message: response.message ?? 'Unexpected error',
                error: response.error ?? (HttpStatus[statusCode] ?? 'Error'),
            };
        }

        return {
            message: 'Unexpected error',
            error: HttpStatus[statusCode] ?? 'Error',
        };
    }

    private isNestErrorResponse(value: unknown): value is PartialNestErrorResponse {
        return typeof value === 'object' && value !== null;
    }
}
