import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

const SESSION_KEY_PREFIX = 'cv:sess:';
const SCAN_COUNT = 100;

@Injectable()
export class AuthSessionService {
  constructor(
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {}

  async destroyOtherSessions(currentSessionId: string): Promise<void> {
    const currentSessionKey = `${SESSION_KEY_PREFIX}${currentSessionId}`;
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.redis.scan(
        cursor,
        'MATCH',
        `${SESSION_KEY_PREFIX}*`,
        'COUNT',
        SCAN_COUNT,
      );
      const keysToDelete = keys.filter((key) => key !== currentSessionKey);

      if (keysToDelete.length > 0) {
        await this.redis.del(...keysToDelete);
      }

      cursor = nextCursor;
    } while (cursor !== '0');
  }
}
