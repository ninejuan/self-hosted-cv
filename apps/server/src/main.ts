import { randomBytes } from 'node:crypto';
import { IncomingMessage } from 'node:http';

import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import csurf from 'csurf';
import { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import helmet from 'helmet';
import Redis from 'ioredis';
import { RedisStore } from 'connect-redis';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { LoggingInterceptor } from '@/common/interceptors/logging.interceptor';
import { MigrationRunner } from '@/database/migration-runner';
import { LoggerService } from '@/logger/logger.service';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const configService = app.get(ConfigService);
  const logger = app.get(LoggerService);
  const redisClient = app.get<Redis>(getRedisConnectionToken());
  const cspNonces = new WeakMap<IncomingMessage, string>();

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
            (request) => `'nonce-${cspNonces.get(request) ?? ''}'`,
          ],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'blob:'],
          connectSrc: ["'self'"],
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
        client: redisClient,
        prefix: 'cv:sess:',
        ttl: configService.getOrThrow<number>('SESSION_MAX_LIFETIME'),
      }),
      cookie: {
        httpOnly: true,
        secure: configService.getOrThrow<string>('NODE_ENV') === 'production',
        sameSite: 'lax',
        maxAge: configService.getOrThrow<number>('SESSION_MAX_LIFETIME') * 1000,
      },
    }),
  );
  app.use((request: Request, response: Response, next: NextFunction) => {
    const path = request.originalUrl ?? request.url;
    const isLogin =
      request.method === 'POST' && path.startsWith('/api/auth/login');
    const isCsrfToken =
      request.method === 'GET' && path.startsWith('/api/auth/csrf-token');
    const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(
      request.method,
    );

    if ((isMutating && !isLogin) || isCsrfToken) {
      csurf()(request, response, next);
      return;
    }

    next();
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
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

  await app.listen(configService.getOrThrow<number>('PORT'));
}
void bootstrap();
