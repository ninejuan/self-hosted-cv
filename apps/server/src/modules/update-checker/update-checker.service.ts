import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

interface GithubReleaseResponse {
  tag_name?: string;
  html_url?: string;
  published_at?: string;
}

interface UpdateCheckResponse {
  disabled: boolean;
  currentVersion: string;
  latestVersion: string | null;
  updateAvailable: boolean;
  releaseUrl: string | null;
  checkedAt: string | null;
}

const CACHE_KEY = 'cv:update-check:latest';
const DEFAULT_INTERVAL_SECONDS = 6 * 60 * 60;

@Injectable()
export class UpdateCheckerService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(getRedisConnectionToken()) private readonly redis: Redis,
  ) {}

  async check(): Promise<UpdateCheckResponse> {
    const currentVersion = await this.getCurrentVersion();

    if (this.configService.get<string>('DISABLE_UPDATE_CHECK') === 'true') {
      return {
        disabled: true,
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        releaseUrl: null,
        checkedAt: null,
      };
    }

    const cached = await this.redis.get(CACHE_KEY);

    if (cached) {
      return JSON.parse(cached) as UpdateCheckResponse;
    }

    const repo =
      this.configService.get<string>('GITHUB_REPO') ??
      'ninejuan/self-hosted-cv';
    const response = await fetch(
      `https://api.github.com/repos/${repo}/releases/latest`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'self-hosted-cv-update-checker',
        },
      },
    );

    if (!response.ok) {
      return {
        disabled: false,
        currentVersion,
        latestVersion: null,
        updateAvailable: false,
        releaseUrl: null,
        checkedAt: new Date().toISOString(),
      };
    }

    const release = (await response.json()) as GithubReleaseResponse;
    const latestVersion = this.normalizeVersion(release.tag_name ?? '');
    const result = {
      disabled: false,
      currentVersion,
      latestVersion,
      updateAvailable:
        latestVersion !== null &&
        this.compareVersions(latestVersion, currentVersion) > 0,
      releaseUrl: release.html_url ?? null,
      checkedAt: new Date().toISOString(),
    };

    await this.redis.set(
      CACHE_KEY,
      JSON.stringify(result),
      'EX',
      this.getTtlSeconds(),
    );

    return result;
  }

  private getTtlSeconds(): number {
    const configured = Number(
      this.configService.get<string>('UPDATE_CHECK_INTERVAL'),
    );

    return Number.isFinite(configured) && configured > 0
      ? configured
      : DEFAULT_INTERVAL_SECONDS;
  }

  private normalizeVersion(version: string): string | null {
    const normalized = version.trim().replace(/^v/i, '');

    return normalized.length > 0 ? normalized : null;
  }

  private compareVersions(left: string, right: string): number {
    const leftParts = left.split('.').map((part) => Number(part));
    const rightParts = right.split('.').map((part) => Number(part));
    const maxLength = Math.max(leftParts.length, rightParts.length);

    for (let index = 0; index < maxLength; index += 1) {
      const diff = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);

      if (diff !== 0) {
        return diff;
      }
    }

    return 0;
  }

  private async getCurrentVersion(): Promise<string> {
    const packageJson = JSON.parse(
      await readFile(join(process.cwd(), 'apps/server/package.json'), 'utf8'),
    ) as { version?: string };

    return packageJson.version ?? '0.0.0';
  }
}
