import { createHmac } from 'node:crypto';

import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type Redis from 'ioredis';

import { LoginAttemptService } from './login-attempt.service';

describe('LoginAttemptService', () => {
  let service: LoginAttemptService;
  let redis: Pick<Redis, 'eval' | 'get' | 'del'>;

  const hmacKey = 'test-hmac-key';
  const accountKey = `cv:auth:fail:account:${createHmac('sha256', hmacKey)
    .update('admin')
    .digest('hex')}`;

  beforeEach(async () => {
    redis = {
      eval: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      del: jest.fn().mockResolvedValue(1),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginAttemptService,
        {
          provide: ConfigService,
          useValue: new ConfigService({
            AUTH_FAIL_HMAC_KEY: hmacKey,
            AUTH_ACCOUNT_MAX_FAILURES: 50,
            AUTH_ACCOUNT_WINDOW: 900,
          }),
        },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    service = module.get(LoginAttemptService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordFailure', () => {
    it('evals Lua incrementing the IP and account keys', async () => {
      await service.recordFailure(' Admin ', '127.0.0.1');

      expect(redis.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('INCR', key)"),
        2,
        'cv:auth:fail:ip:127.0.0.1',
        accountKey,
        900,
      );
    });
  });

  describe('isAccountLocked', () => {
    it.each([
      ['at the threshold', '50', true],
      ['below the threshold', '49', false],
    ])('returns the lock state %s', async (_case, count, expected) => {
      jest.mocked(redis.get).mockResolvedValueOnce(count);

      await expect(service.isAccountLocked('ADMIN')).resolves.toBe(expected);
      expect(redis.get).toHaveBeenCalledWith(accountKey);
    });
  });

  describe('reset', () => {
    it('deletes the account key', async () => {
      await service.reset('admin');

      expect(redis.del).toHaveBeenCalledWith(accountKey);
    });
  });

  it('uses the session secret as the HMAC key when no dedicated key is set', async () => {
    const sessionSecret = 'test-session-secret';
    const fallbackAccountKey = `cv:auth:fail:account:${createHmac(
      'sha256',
      sessionSecret,
    )
      .update('admin')
      .digest('hex')}`;
    const module = await Test.createTestingModule({
      providers: [
        LoginAttemptService,
        {
          provide: ConfigService,
          useValue: new ConfigService({ SESSION_SECRET: sessionSecret }),
        },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    await module.get(LoginAttemptService).reset('admin');

    expect(redis.del).toHaveBeenCalledWith(fallbackAccountKey);
  });
});
