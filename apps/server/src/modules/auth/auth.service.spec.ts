import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { BadRequestException } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import type Redis from 'ioredis';
import type { Transaction } from 'sequelize';
import speakeasy from 'speakeasy';
import type { Sequelize } from 'sequelize-typescript';

import { AuditService } from '@/modules/audit/audit.service';
import { AppSetting } from '@/modules/settings/entities/app-setting.entity';
import { createMockModel, MockModel } from '@/test-utils/mock-model';

import { AuthSessionService } from './auth-session.service';
import { AuthService } from './auth.service';
import { decryptSecret } from './totp-crypto';
import { TwoFactorService } from './two-factor.service';

type SettingRecord = { value: Record<string, unknown> };

describe('AuthService two-factor authentication', () => {
  let service: AuthService;
  let twoFactorService: TwoFactorService;
  let settingModel: MockModel<SettingRecord>;
  let auditService: { record: jest.MockedFunction<AuditService['record']> };
  let redis: Pick<Redis, 'scan' | 'del'>;
  const transaction = { id: 'test-transaction' } as Transaction;
  const sequelize: Pick<Sequelize, 'transaction'> = {
    transaction: jest.fn((callback: (value: Transaction) => unknown) =>
      Promise.resolve(callback(transaction)),
    ),
  };

  beforeEach(async () => {
    process.env.TOTP_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64');
    settingModel = createMockModel<SettingRecord>();
    auditService = { record: jest.fn().mockResolvedValue(undefined) };
    redis = {
      scan: jest.fn().mockResolvedValue(['0', []]),
      del: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        AuthSessionService,
        TwoFactorService,
        { provide: AuditService, useValue: auditService },
        { provide: getModelToken(AppSetting), useValue: settingModel },
        { provide: getConnectionToken(), useValue: sequelize },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    service = module.get(AuthService);
    twoFactorService = module.get(TwoFactorService);
  });

  afterEach(() => {
    delete process.env.TOTP_ENCRYPTION_KEY;
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('records the authentication time before saving the regenerated session', async () => {
      const now = 1_789_499_200_000;
      jest.spyOn(Date, 'now').mockReturnValue(now);
      settingModel.findOne
        .mockResolvedValueOnce({ value: { username: 'admin' } })
        .mockResolvedValueOnce({
          value: { hash: await bcrypt.hash('password', 4) },
        })
        .mockResolvedValueOnce({ value: { enabled: false } });
      const regenerate = jest.fn((callback: (error?: Error) => void) =>
        callback(),
      );
      const save = jest.fn((callback: (error?: Error) => void) => callback());
      const request = {
        ip: '127.0.0.1',
        sessionID: 'current-session',
        header: jest.fn().mockReturnValue('jest'),
        session: { regenerate, save },
      } as unknown as Request;

      await service.login({ username: 'admin', password: 'password' }, request);

      expect(regenerate).toHaveBeenCalledTimes(1);
      expect(request.session.isAuthenticated).toBe(true);
      expect(request.session.authenticatedAt).toBe(now);
      expect(request.session.username).toBe('admin');
      expect(save).toHaveBeenCalledTimes(1);
    });
  });

  describe('setupTwoFactor', () => {
    it('writes a pending secret without modifying the active secret or enabled state', async () => {
      settingModel.findOne.mockResolvedValue({
        value: { username: 'admin' },
      });

      await service.setupTwoFactor(createRequest());

      const writtenKeys = settingModel.upsert.mock.calls.map(
        ([setting]) => (setting as { key: string }).key,
      );
      const pendingWrite = settingModel.upsert.mock.calls.find(
        ([setting]) =>
          (setting as { key: string }).key === 'totp_pending_secret',
      );
      const storedSecret = (pendingWrite?.[0] as { value: { secret: string } })
        .value.secret;

      expect(writtenKeys).toContain('totp_pending_secret');
      expect(writtenKeys).not.toContain('totp_secret');
      expect(writtenKeys).not.toContain('totp_enabled');
      expect(storedSecret).toMatch(/^v1:/);
      expect(decryptSecret(storedSecret)).toEqual(expect.any(String));
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: '2fa_setup' }),
        transaction,
      );
    });
  });

  describe('verifyTwoFactor', () => {
    it('atomically promotes the pending secret, enables 2FA, and clears pending', async () => {
      const secret = speakeasy.generateSecret({ length: 32 }).base32;
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      settingModel.findOne.mockResolvedValue({ value: { secret } });

      await service.verifyTwoFactor({ code }, createRequest());

      expect(sequelize.transaction).toHaveBeenCalledTimes(1);
      const activeSecretWrite = settingModel.upsert.mock.calls.find(
        ([setting]) => (setting as { key: string }).key === 'totp_secret',
      );
      const activeSecret = (
        activeSecretWrite?.[0] as { value: { secret: string } }
      ).value.secret;

      expect(activeSecret).toMatch(/^v1:/);
      expect(decryptSecret(activeSecret)).toBe(secret);
      expect(settingModel.upsert).toHaveBeenCalledWith(
        { key: 'totp_enabled', value: { enabled: true } },
        { transaction },
      );
      expect(settingModel.destroy).toHaveBeenCalledWith({
        where: { key: 'totp_pending_secret' },
        transaction,
      });
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: '2fa_verify' }),
        transaction,
      );
    });

    it('throws when no pending secret exists', async () => {
      settingModel.findOne.mockResolvedValue(null);

      await expect(
        service.verifyTwoFactor({ code: '123456' }, createRequest()),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('disableTwoFactor', () => {
    it('requires a valid active TOTP and records the disable audit action', async () => {
      const secret = speakeasy.generateSecret({ length: 32 }).base32;
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      settingModel.findOne.mockResolvedValue({ value: { secret } });

      await service.disableTwoFactor({ code }, createRequest());

      expect(settingModel.destroy).toHaveBeenCalledWith({
        where: { key: ['totp_secret', 'totp_pending_secret'] },
        transaction,
      });
      expect(auditService.record).toHaveBeenCalledWith(
        expect.objectContaining({ action: '2fa_disable' }),
        transaction,
      );
    });

    it('succeeds when invalidating other sessions fails', async () => {
      const secret = speakeasy.generateSecret({ length: 32 }).base32;
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      settingModel.findOne.mockResolvedValue({ value: { secret } });
      jest
        .mocked(redis.scan)
        .mockRejectedValueOnce(new Error('Redis unavailable'));

      await expect(
        service.disableTwoFactor({ code }, createRequest()),
      ).resolves.toEqual({ enabled: false });
    });
  });

  describe('login token verification', () => {
    it('re-encrypts a legacy plaintext secret after successful verification', async () => {
      const secret = speakeasy.generateSecret({ length: 32 }).base32;
      const code = speakeasy.totp({ secret, encoding: 'base32' });
      settingModel.findOne.mockResolvedValue({ value: { secret } });

      await expect(twoFactorService.verifyLoginToken(code)).resolves.toBe(true);

      const migratedSecret = (
        settingModel.upsert.mock.calls[0]?.[0] as {
          value: { secret: string };
        }
      ).value.secret;
      expect(migratedSecret).toMatch(/^v1:/);
      expect(decryptSecret(migratedSecret)).toBe(secret);
    });
  });
});

function createRequest(): Request {
  return {
    ip: '127.0.0.1',
    sessionID: 'current-session',
    header: jest.fn().mockReturnValue('jest'),
  } as Request;
}
