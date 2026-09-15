import { getRedisConnectionToken } from '@nestjs-modules/ioredis';
import { ConflictException, PayloadTooLargeException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import type Redis from 'ioredis';

import { CvService } from '@/modules/cv/cv.service';
import { MinioService } from '@/modules/minio/minio.service';
import { SettingsService } from '@/modules/settings/settings.service';

import { ExportArchiveBuilderService } from './export-archive-builder.service';
import { ExportService } from './export.service';

type CvServiceMock = {
  readonly getCv: jest.MockedFunction<CvService['getCv']>;
};

type SettingsServiceMock = {
  readonly getSiteSettings: jest.MockedFunction<
    SettingsService['getSiteSettings']
  >;
};

type MinioServiceMock = {
  readonly getObject: jest.MockedFunction<MinioService['getObject']>;
  readonly getPublicUrl: jest.MockedFunction<MinioService['getPublicUrl']>;
  readonly statObjectSize: jest.MockedFunction<
    (key: string) => Promise<number>
  >;
};

describe('ExportService', () => {
  let service: ExportService;
  let cvService: CvServiceMock;
  let settingsService: SettingsServiceMock;
  let minioService: MinioServiceMock;
  let redis: Pick<Redis, 'eval' | 'set'>;

  beforeEach(async () => {
    process.env.EXPORT_MAX_TOTAL_BYTES = '10';
    cvService = { getCv: jest.fn().mockResolvedValue(createCv()) };
    settingsService = {
      getSiteSettings: jest.fn().mockResolvedValue(createSiteSettings()),
    };
    minioService = {
      getObject: jest.fn().mockResolvedValue(Buffer.from('image')),
      getPublicUrl: jest
        .fn()
        .mockReturnValue('http://localhost:47900/cv-assets/'),
      statObjectSize: jest.fn().mockResolvedValue(5),
    };
    redis = {
      eval: jest.fn().mockResolvedValue(1),
      set: jest.fn().mockResolvedValue('OK'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExportService,
        ExportArchiveBuilderService,
        { provide: CvService, useValue: cvService },
        { provide: SettingsService, useValue: settingsService },
        { provide: MinioService, useValue: minioService },
        { provide: ConfigService, useValue: new ConfigService() },
        { provide: getRedisConnectionToken(), useValue: redis },
      ],
    }).compile();

    service = module.get(ExportService);
  });

  afterEach(() => {
    delete process.env.EXPORT_MAX_TOTAL_BYTES;
    jest.clearAllMocks();
  });

  describe('buildZip', () => {
    it('throws 409 when lock is not acquired', async () => {
      redis.set = jest.fn().mockResolvedValue(null);

      await expect(service.buildZip()).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws 413 before downloading when total bytes exceed the configured cap', async () => {
      process.env.EXPORT_MAX_TOTAL_BYTES = '4';

      await expect(service.buildZip()).rejects.toBeInstanceOf(
        PayloadTooLargeException,
      );
      expect(minioService.getObject).not.toHaveBeenCalled();
    });

    it('releases the owned lock with compare-and-delete Lua in finally', async () => {
      await service.buildZip();

      const lockToken = jest.mocked(redis.set).mock.calls[0]?.[1];
      expect(typeof lockToken).toBe('string');
      expect(redis.eval).toHaveBeenCalledWith(
        expect.stringContaining("redis.call('get',KEYS[1])==ARGV[1]"),
        1,
        'cv:export:lock',
        lockToken,
      );
    });
  });
});

function createCv(): Awaited<ReturnType<CvService['getCv']>> {
  return {
    profile: {
      name: 'Ada Lovelace',
      profession: 'Engineer',
      avatarUrl: 'http://localhost:47900/cv-assets/avatar.png',
    },
    sections: [],
  };
}

function createSiteSettings(): Awaited<
  ReturnType<SettingsService['getSiteSettings']>
> {
  return {
    siteTitle: 'Ada CV',
    siteDescription: '',
    faviconUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImageUrl: '',
    themeColor: '#A8E765',
    googleAnalyticsId: '',
    customHeadScripts: '',
    customCss: '',
  };
}
