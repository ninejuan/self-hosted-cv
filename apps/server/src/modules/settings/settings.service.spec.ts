/* eslint-disable @typescript-eslint/no-unsafe-assignment -- jest matchers (expect.not.objectContaining) infer as any */
import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';

import { createMockModel } from '@/test-utils/mock-model';
import type { MockModel } from '@/test-utils/mock-model';

import { AppSetting } from './entities/app-setting.entity';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let settingModel: MockModel<AppSetting>;

  beforeEach(async () => {
    settingModel = createMockModel<AppSetting>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SettingsService,
        { provide: getModelToken(AppSetting), useValue: settingModel },
      ],
    }).compile();

    service = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('updateSiteSettings', () => {
    it('rejects an invalid Google Analytics measurement ID', async () => {
      settingModel.findOne.mockResolvedValue(null);

      await expect(
        service.updateSiteSettings({
          googleAnalyticsId: '<script>alert(1)</script>',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(settingModel.upsert).not.toHaveBeenCalled();
    });

    it('accepts and persists a valid Google Analytics measurement ID', async () => {
      settingModel.findOne.mockResolvedValue(null);

      const settings = await service.updateSiteSettings({
        googleAnalyticsId: 'G-ABC12345',
      });

      expect(settings.googleAnalyticsId).toBe('G-ABC12345');
      expect(settingModel.upsert).toHaveBeenCalledWith({
        key: 'site_settings',
        value: settings,
      });
    });

    it('drops a legacy customHeadScripts key from returned and persisted settings', async () => {
      settingModel.findOne.mockResolvedValue({
        value: {
          siteTitle: 'Legacy CV',
          customHeadScripts: 'alert(document.cookie)',
        },
      } as unknown as AppSetting);

      const settings = await service.updateSiteSettings({
        siteTitle: 'Updated CV',
      });

      expect(settings).not.toHaveProperty('customHeadScripts');
      expect(settingModel.upsert).toHaveBeenCalledWith({
        key: 'site_settings',
        value: expect.not.objectContaining({
          customHeadScripts: expect.anything(),
        }),
      });
    });
  });
});
