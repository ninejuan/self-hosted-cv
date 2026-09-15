import { createHmac } from 'node:crypto';

import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';

const ACCOUNT_KEY_PREFIX = 'cv:auth:fail:account:';
const IP_KEY_PREFIX = 'cv:auth:fail:ip:';
const DEFAULT_ACCOUNT_MAX_FAILURES = 50;
const DEFAULT_ACCOUNT_WINDOW_SECONDS = 900;

const INCREMENT_WITH_EXPIRY_SCRIPT = `
for keyIndex = 1, #KEYS do
    local key = KEYS[keyIndex]
    local count = redis.call('INCR', key)
    if count == 1 then
        redis.call('EXPIRE', key, ARGV[1])
    end
end
return 1
`;

@Injectable()
export class LoginAttemptService {
  private readonly accountMaxFailures: number;
  private readonly accountWindowSeconds: number;
  private readonly hmacKey: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {
    // A high threshold avoids letting an attacker remotely lock the sole admin out.
    this.accountMaxFailures = this.configService.get<number>(
      'AUTH_ACCOUNT_MAX_FAILURES',
      DEFAULT_ACCOUNT_MAX_FAILURES,
    );
    this.accountWindowSeconds = this.configService.get<number>(
      'AUTH_ACCOUNT_WINDOW',
      DEFAULT_ACCOUNT_WINDOW_SECONDS,
    );
    this.hmacKey =
      this.configService.get<string>('AUTH_FAIL_HMAC_KEY') ||
      this.configService.getOrThrow<string>('SESSION_SECRET');
  }

  async recordFailure(username: string, ip: string): Promise<void> {
    await this.redis.eval(
      INCREMENT_WITH_EXPIRY_SCRIPT,
      2,
      `${IP_KEY_PREFIX}${ip}`,
      this.createAccountKey(username),
      this.accountWindowSeconds,
    );
  }

  async isAccountLocked(username: string): Promise<boolean> {
    const storedCount = await this.redis.get(this.createAccountKey(username));
    const count = storedCount === null ? 0 : Number(storedCount);

    return count >= this.accountMaxFailures;
  }

  async reset(username: string): Promise<void> {
    await this.redis.del(this.createAccountKey(username));
  }

  private createAccountKey(username: string): string {
    const normalizedUsername = username.trim().toLowerCase();
    const digest = createHmac('sha256', this.hmacKey)
      .update(normalizedUsername)
      .digest('hex');

    return `${ACCOUNT_KEY_PREFIX}${digest}`;
  }
}
