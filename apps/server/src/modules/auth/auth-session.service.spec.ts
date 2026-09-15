import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Test, type TestingModule } from '@nestjs/testing';
import type Redis from 'ioredis';

import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let redis: Pick<Redis, 'scan' | 'del'>;

  beforeEach(async () => {
    redis = {
      scan: jest
        .fn()
        .mockResolvedValueOnce([
          '4',
          ['cv:sess:current-session', 'cv:sess:first-session'],
        ])
        .mockResolvedValueOnce(['0', ['cv:sess:second-session']]),
      del: jest.fn().mockResolvedValue(1),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthSessionService,
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    service = module.get(AuthSessionService);
  });

  it('deletes every session except the current session across scan pages', async () => {
    await service.destroyOtherSessions('current-session');

    expect(redis.del).toHaveBeenNthCalledWith(1, 'cv:sess:first-session');
    expect(redis.del).toHaveBeenNthCalledWith(2, 'cv:sess:second-session');
    expect(redis.del).not.toHaveBeenCalledWith('cv:sess:current-session');
  });
});
