import { AsyncLocalStorage } from 'node:async_hooks';

import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RequestLogContext {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  latency_ms?: number;
  ip?: string;
  userAgent?: string;
}

type LogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose';

interface LogRecord extends RequestLogContext {
  timestamp: string;
  level: LogLevel;
  msg: string;
  service: string;
  env: string;
  stack?: string;
  context?: string;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly storage = new AsyncLocalStorage<RequestLogContext>();
  private readonly service: string;
  private readonly env: string;

  constructor(private readonly configService: ConfigService) {
    this.service = this.configService.get<string>('APP_URL') ?? 'cv-server';
    this.env = this.configService.get<string>('NODE_ENV') ?? 'development';
  }

  runWithContext<T>(context: RequestLogContext, callback: () => T): T {
    return this.storage.run(context, callback);
  }

  setContext(context: RequestLogContext): void {
    const store = this.storage.getStore();

    if (store) {
      Object.assign(store, context);
    }
  }

  log(message: string, context?: string): void {
    this.write('log', message, undefined, context);
  }

  error(message: string, stack?: string, context?: string): void {
    this.write('error', message, stack, context);
  }

  warn(message: string, context?: string): void {
    this.write('warn', message, undefined, context);
  }

  debug(message: string, context?: string): void {
    this.write('debug', message, undefined, context);
  }

  verbose(message: string, context?: string): void {
    this.write('verbose', message, undefined, context);
  }

  private write(
    level: LogLevel,
    message: string,
    stack?: string,
    context?: string,
  ): void {
    const record: LogRecord = {
      timestamp: new Date().toISOString(),
      level,
      msg: message,
      service: this.service,
      env: this.env,
      ...this.storage.getStore(),
      stack,
      context,
    };

    process.stdout.write(`${JSON.stringify(record)}\n`);
  }
}
