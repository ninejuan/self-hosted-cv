import {
  ValidationPipe,
  type INestApplication,
  type InjectionToken,
} from '@nestjs/common';
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import {
  getOptionsToken,
  type ThrottlerModuleOptions,
} from '@nestjs/throttler';
import cookieParser from 'cookie-parser';
import csurf from 'csurf';
import type { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import type { Server } from 'node:http';

import { AppModule } from '@/app.module';
import { AdminBootstrapService } from '@/modules/auth/admin-bootstrap.service';
import { MinioService } from '@/modules/minio/minio.service';

export type TestProviderOverride = {
  readonly provide: InjectionToken;
  readonly useValue: unknown;
};

export type CreateTestAppOptions = {
  readonly overrides?: readonly TestProviderOverride[];
  readonly useLiveInfrastructure?: boolean;
};

const databaseStub = {
  addModels: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
  getRepository: jest.fn(),
  query: jest.fn().mockResolvedValue([[], undefined]),
  repositoryMode: false,
  transaction: jest.fn(),
};

const redisStub = {
  del: jest.fn().mockResolvedValue(0),
  get: jest.fn().mockResolvedValue(null),
  ping: jest.fn().mockResolvedValue('PONG'),
  quit: jest.fn().mockResolvedValue('OK'),
  set: jest.fn().mockResolvedValue('OK'),
  eval: jest.fn().mockResolvedValue(0),
  call: jest.fn().mockResolvedValue([0, 0, 0, 0]),
  disconnect: jest.fn(),
};

const moduleInitStub = {
  onModuleInit: jest.fn().mockResolvedValue(undefined),
};

// Omit the Redis storage adapter so the forRootAsync factory doesn't open a real
// ioredis connection against the stub (NOAUTH); Nest uses in-memory storage in tests.
const createTestThrottlerOptions = (
  configService: ConfigService,
): ThrottlerModuleOptions => ({
  throttlers: [
    {
      ttl: configService.get<number>('LOGIN_LOCKOUT_DURATION', 900) * 1000,
      limit: configService.get<number>('LOGIN_MAX_ATTEMPTS', 5),
    },
  ],
});

export async function createTestApp(
  options: CreateTestAppOptions = {},
): Promise<INestApplication<Server>> {
  let moduleBuilder = Test.createTestingModule({ imports: [AppModule] });

  if (options.useLiveInfrastructure !== true) {
    moduleBuilder = moduleBuilder
      .overrideProvider(getConnectionToken())
      .useValue(databaseStub)
      .overrideProvider(getRedisConnectionToken())
      .useValue(redisStub)
      .overrideProvider(getOptionsToken())
      .useFactory({
        factory: createTestThrottlerOptions,
        inject: [ConfigService],
      })
      .overrideProvider(AdminBootstrapService)
      .useValue(moduleInitStub)
      .overrideProvider(MinioService)
      .useValue(moduleInitStub);
  }

  for (const override of options.overrides ?? []) {
    moduleBuilder = moduleBuilder
      .overrideProvider(override.provide)
      .useValue(override.useValue);
  }

  const moduleFixture = await moduleBuilder.compile();
  const app = moduleFixture.createNestApplication<INestApplication<Server>>();

  app.use(
    session({
      name: 'cv.sid',
      secret: process.env.SESSION_SECRET ?? 'test-session-secret',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      store: new session.MemoryStore(),
      cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: Number(process.env.SESSION_MAX_LIFETIME ?? 86400) * 1000,
      },
    }),
  );
  app.use(cookieParser());
  const csrfProtection = csurf({ cookie: { httpOnly: true, sameSite: 'lax' } });
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
      csrfProtection(request, response, next);
      return;
    }

    next();
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.init();
  return app;
}
