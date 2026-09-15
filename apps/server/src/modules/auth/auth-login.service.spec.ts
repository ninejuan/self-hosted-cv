/* eslint-disable @typescript-eslint/unbound-method -- asserting calls on jest.fn() session mocks */
import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import { Test, type TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import type Redis from 'ioredis';
import type { Transaction } from 'sequelize';
import type { Sequelize } from 'sequelize-typescript';

import { AuditService } from '@/modules/audit/audit.service';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';
import { createMockModel, type MockModel } from '@/test-utils/mock-model';

import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';
import { LoginAttemptService } from './login-attempt.service';
import { TwoFactorService } from './two-factor.service';

type SettingRecord = { value: Record<string, unknown> };

describe('AuthService login', () => {
  let service: AuthService;
  let settingModel: MockModel<SettingRecord>;
  let requireTwoFactor: boolean;
  let loginAttemptService: {
    isAccountLocked: jest.MockedFunction<
      LoginAttemptService['isAccountLocked']
    >;
    recordFailure: jest.MockedFunction<LoginAttemptService['recordFailure']>;
    reset: jest.MockedFunction<LoginAttemptService['reset']>;
  };

  beforeEach(async () => {
    requireTwoFactor = false;
    process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    settingModel = createMockModel<SettingRecord>();
    loginAttemptService = {
      isAccountLocked: jest.fn().mockResolvedValue(false),
      recordFailure: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };
    const transaction = { id: 'test-transaction' } as Transaction;
    const sequelize: Pick<Sequelize, 'transaction'> = {
      transaction: jest.fn((callback: (value: Transaction) => unknown) =>
        Promise.resolve(callback(transaction)),
      ),
    };
    const redis: Pick<Redis, 'scan' | 'del'> = {
      scan: jest.fn().mockResolvedValue(['0', []]),
      del: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthSessionService,
        TwoFactorService,
        { provide: LoginAttemptService, useValue: loginAttemptService },
        { provide: AuditService, useValue: { record: jest.fn() } },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue?: unknown) =>
              key === 'REQUIRE_2FA' ? requireTwoFactor : defaultValue,
            ),
          },
        },
        { provide: getModelToken(AppSetting), useValue: settingModel },
        { provide: getConnectionToken(), useValue: sequelize },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  afterEach(() => {
    delete process.env.TOTP_ENCRYPTION_KEY;
    jest.restoreAllMocks();
  });

  it('records full authentication before saving the regenerated session', async () => {
    const now = 1_789_499_200_000;
    jest.spyOn(Date, 'now').mockReturnValue(now);
    settingModel.findOne
      .mockResolvedValueOnce({ value: { username: 'admin' } })
      .mockResolvedValueOnce({
        value: { hash: await bcrypt.hash('password', 4) },
      })
      .mockResolvedValueOnce({ value: { enabled: false } });
    const request = createRequest();

    await service.login({ username: 'admin', password: 'password' }, request);

    expect(request.session.regenerate).toHaveBeenCalledTimes(1);
    expect(request.session.isAuthenticated).toBe(true);
    expect(request.session.authenticatedAt).toBe(now);
    expect(request.session.authLevel).toBe('mfa');
    expect(request.session.username).toBe('admin');
    expect(request.session.save).toHaveBeenCalledTimes(1);
    expect(loginAttemptService.reset).toHaveBeenCalledWith('admin');
  });

  it('records password authentication when required 2FA is not configured', async () => {
    requireTwoFactor = true;
    settingModel.findOne
      .mockResolvedValueOnce({ value: { username: 'admin' } })
      .mockResolvedValueOnce({
        value: { hash: await bcrypt.hash('password', 4) },
      })
      .mockResolvedValueOnce({ value: { enabled: false } });
    const request = createRequest();

    await service.login({ username: 'admin', password: 'password' }, request);

    expect(request.session.isAuthenticated).toBe(true);
    expect(request.session.authenticatedAt).toEqual(expect.any(Number));
    expect(request.session.authLevel).toBe('password');
  });

  it('records MFA authentication when a configured TOTP is verified', async () => {
    settingModel.findOne
      .mockResolvedValueOnce({ value: { username: 'admin' } })
      .mockResolvedValueOnce({
        value: { hash: await bcrypt.hash('password', 4) },
      })
      .mockResolvedValueOnce({ value: { enabled: true } });
    jest
      .spyOn(TwoFactorService.prototype, 'verifyLoginToken')
      .mockResolvedValue(true);
    const request = createRequest();

    await service.login(
      { username: 'admin', password: 'password', totpCode: '123456' },
      request,
    );

    expect(request.session.authLevel).toBe('mfa');
  });

  it('records an account failure for an invalid password', async () => {
    settingModel.findOne
      .mockResolvedValueOnce({ value: { username: 'admin' } })
      .mockResolvedValueOnce({
        value: { hash: await bcrypt.hash('correct-password', 4) },
      });

    await expect(
      service.login(
        { username: 'admin', password: 'invalid-password' },
        createRequest(),
      ),
    ).rejects.toThrow('Invalid username or password');

    expect(loginAttemptService.recordFailure).toHaveBeenCalledWith(
      'admin',
      '127.0.0.1',
    );
  });

  it('throws 429 before loading credentials when the account is locked', async () => {
    loginAttemptService.isAccountLocked.mockResolvedValueOnce(true);

    await expect(
      service.login(
        { username: 'admin', password: 'password' },
        createRequest(),
      ),
    ).rejects.toMatchObject({ status: HttpStatus.TOO_MANY_REQUESTS });

    expect(settingModel.findOne).not.toHaveBeenCalled();
  });
});

function createRequest(): Request {
  const regenerate = jest.fn((callback: (error?: Error) => void) => callback());
  const save = jest.fn((callback: (error?: Error) => void) => callback());

  return {
    ip: '127.0.0.1',
    sessionID: 'current-session',
    header: jest.fn().mockReturnValue('jest'),
    session: { regenerate, save },
  } as unknown as Request;
}
