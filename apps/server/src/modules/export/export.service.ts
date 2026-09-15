import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import {
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type Redis from 'ioredis';
import { randomUUID } from 'node:crypto';

import { CvService } from '@/modules/cv/cv.service';
import { SettingsService } from '@/modules/settings/settings.service';

import { ExportArchiveBuilderService } from './export-archive-builder.service';

const EXPORT_LOCK_KEY = 'cv:export:lock';
const RELEASE_LOCK_SCRIPT =
  "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end";
const DEFAULT_LOCK_TTL_MS = 120_000;
const DEFAULT_MAX_EXEC_MS = 60_000;
const DEFAULT_MAX_OBJECTS = 100;
const DEFAULT_MAX_OBJECT_BYTES = 20 * 1024 * 1024;
const DEFAULT_MAX_TOTAL_BYTES = 100 * 1024 * 1024;

@Injectable()
export class ExportService {
  constructor(
    private readonly cvService: CvService,
    private readonly settingsService: SettingsService,
    private readonly archiveBuilder: ExportArchiveBuilderService,
    private readonly configService: ConfigService,
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {}

  async buildZip(canonicalUrl?: string): Promise<Buffer | null> {
    const token = randomUUID();
    const acquired = await this.redis.set(
      EXPORT_LOCK_KEY,
      token,
      'PX',
      this.getNumber('EXPORT_LOCK_TTL_MS', DEFAULT_LOCK_TTL_MS),
      'NX',
    );
    if (acquired !== 'OK') {
      throw new ConflictException('Export already running');
    }

    try {
      return await this.withTimeout(this.buildArchive(canonicalUrl));
    } finally {
      await this.redis.eval(RELEASE_LOCK_SCRIPT, 1, EXPORT_LOCK_KEY, token);
    }
  }

  private async buildArchive(canonicalUrl?: string): Promise<Buffer | null> {
    const cv = await this.cvService.getCv();
    if (!cv?.profile) return null;

    const site = await this.settingsService.getSiteSettings();
    return this.archiveBuilder.build(
      cv,
      site,
      {
        maxObjects: this.getNumber('EXPORT_MAX_OBJECTS', DEFAULT_MAX_OBJECTS),
        maxObjectBytes: this.getNumber(
          'EXPORT_MAX_OBJECT_BYTES',
          DEFAULT_MAX_OBJECT_BYTES,
        ),
        maxTotalBytes: this.getNumber(
          'EXPORT_MAX_TOTAL_BYTES',
          DEFAULT_MAX_TOTAL_BYTES,
        ),
      },
      canonicalUrl,
    );
  }

  private withTimeout<T>(operation: Promise<T>): Promise<T> {
    const timeoutMs = this.getNumber('EXPORT_MAX_EXEC_MS', DEFAULT_MAX_EXEC_MS);
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new GatewayTimeoutException('Export timed out')),
        timeoutMs,
      );
      operation.then(
        (value) => {
          clearTimeout(timeout);
          resolve(value);
        },
        (error: unknown) => {
          clearTimeout(timeout);
          reject(
            error instanceof Error
              ? error
              : new Error('Export failed with an unknown error'),
          );
        },
      );
    });
  }

  private getNumber(key: string, fallback: number): number {
    return this.configService.get<number>(key) ?? fallback;
  }
}
