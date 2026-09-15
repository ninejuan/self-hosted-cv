import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthGuard } from './auth.guard';

class TestController {}

function testHandler(): void {}

const SESSION_MAX_LIFETIME = 86400;

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let requireTwoFactor: boolean;

  beforeEach(async () => {
    requireTwoFactor = false;
    reflector = { getAllAndOverride: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: Reflector, useValue: reflector },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) => {
              if (key === 'SESSION_MAX_LIFETIME') {
                return SESSION_MAX_LIFETIME;
              }

              if (key === 'REQUIRE_2FA') {
                return requireTwoFactor;
              }

              return defaultValue;
            }),
          },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows when route is @Public', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/admin/profile',
          url: '/api/admin/profile',
          session: {},
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies when not public and session unauthenticated', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/cv',
          url: '/api/cv',
          session: {},
        },
      ],
      TestController,
      testHandler,
    );

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Authentication required'),
    );
  });

  it('allows authenticated session within absolute lifetime', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/admin/profile',
          url: '/api/admin/profile',
          session: { isAuthenticated: true, authenticatedAt: Date.now() },
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a password-level session on a non-allowlisted route when 2FA is required', () => {
    requireTwoFactor = true;
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          method: 'GET',
          path: '/api/admin/profile',
          session: {
            isAuthenticated: true,
            authenticatedAt: Date.now(),
            authLevel: 'password',
          },
        },
      ],
      TestController,
      testHandler,
    );

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException('Multi-factor authentication required'),
    );
  });

  it('allows a password-level session to verify 2FA when 2FA is required', () => {
    requireTwoFactor = true;
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          method: 'POST',
          path: '/api/auth/2fa/verify',
          session: {
            isAuthenticated: true,
            authenticatedAt: Date.now(),
            authLevel: 'password',
          },
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows an MFA-level session on an admin route when 2FA is required', () => {
    requireTwoFactor = true;
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          method: 'GET',
          path: '/api/admin/profile',
          session: {
            isAuthenticated: true,
            authenticatedAt: Date.now(),
            authLevel: 'mfa',
          },
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows an authenticated session regardless of auth level when 2FA is not required', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          method: 'GET',
          path: '/api/admin/profile',
          session: {
            isAuthenticated: true,
            authenticatedAt: Date.now(),
            authLevel: 'password',
          },
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects authenticated session at absolute lifetime', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const now = Date.now();
    jest.spyOn(Date, 'now').mockReturnValue(now);
    const destroy = jest.fn();
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/admin/profile',
          url: '/api/admin/profile',
          session: {
            isAuthenticated: true,
            authenticatedAt: now - SESSION_MAX_LIFETIME * 1000,
            destroy,
          },
        },
      ],
      TestController,
      testHandler,
    );

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Authentication required'),
    );
    expect(destroy).toHaveBeenCalledTimes(1);
  });

  it('rejects authenticated session missing authenticatedAt', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/admin/profile',
          url: '/api/admin/profile',
          session: { isAuthenticated: true, destroy: jest.fn() },
        },
      ],
      TestController,
      testHandler,
    );

    expect(() => guard.canActivate(context)).toThrow(
      new UnauthorizedException('Authentication required'),
    );
  });
});
