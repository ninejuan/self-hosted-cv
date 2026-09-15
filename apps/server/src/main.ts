import { randomBytes } from 'node:crypto';
import { IncomingMessage } from 'node:http';

import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { applyCsrf } from '@/common/security/csrf';
import { MigrationRunner } from '@/database/migration-runner';
import { LoggerService } from '@/logger/logger.service';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const cspNonces = new WeakMap<IncomingMessage, string>();

  const sessionRedis = new Redis({
    host: configService.get<string>('REDIS_HOST', 'localhost'),
    port: Number(configService.get('REDIS_PORT', 6379)),
    password: configService.get<string>('REDIS_PASSWORD') || undefined,
  });

  app.useLogger(logger);
  app.use((request: Request, _response: Response, next: NextFunction) => {
    cspNonces.set(request, randomBytes(16).toString('base64'));
    next();
  });
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          frameAncestors: ["'none'"],
          objectSrc: ["'none'"],
          scriptSrc: [
            "'self'",
            'https://www.googletagmanager.com',
            (request) => `'nonce-${cspNonces.get(request) ?? ''}'`,
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'", 'https://www.google-analytics.com'],
          fontSrc: ["'self'", 'data:'],
          formAction: ["'self'"],
        },
      },
      frameguard: { action: 'deny' },
      hsts: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );
  app.use(
    session({
      name: 'cv.sid',
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: new RedisStore({
        client: sessionRedis,
        prefix: 'cv:sess:',
        ttl: Number(configService.get('SESSION_IDLE_TIMEOUT', 1800)),
      }),
      cookie: {
        httpOnly: true,
        secure: configService.get<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: Number(configService.get('SESSION_IDLE_TIMEOUT', 1800)) * 1000,
      },
    }),
  );
  app.use(cookieParser());
  applyCsrf(app, {
    secret: configService.getOrThrow<string>('SESSION_SECRET'),
    secure: configService.get<string>('NODE_ENV') === 'production',
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger));

  try {
    await app.get(MigrationRunner).runPendingMigrations();
  } catch (error) {
    const stack = error instanceof Error ? error.stack : undefined;
    const message =
      error instanceof Error ? error.message : 'Unknown migration error';

    logger.error(`Database migration failed: ${message}`, stack, 'Bootstrap');
    await app.close();
    process.exit(1);
  }

  await app.listen(configService.get<number>('APP_PORT') ?? 3000);
}
void bootstrap();
