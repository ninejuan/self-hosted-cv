import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContextHost } from '@nestjs/core/helpers/execution-context-host';
import { Reflector } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';

import { AuthGuard } from './auth.guard';

class TestController {}

function testHandler(): void {}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthGuard, { provide: Reflector, useValue: reflector }],
    }).compile();

    guard = module.get(AuthGuard);
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

  it('allows when not public but session authenticated', () => {
    reflector.getAllAndOverride.mockReturnValue(false);
    const context = new ExecutionContextHost(
      [
        {
          originalUrl: '/api/admin/profile',
          url: '/api/admin/profile',
          session: { isAuthenticated: true },
        },
      ],
      TestController,
      testHandler,
    );

    expect(guard.canActivate(context)).toBe(true);
  });
});
