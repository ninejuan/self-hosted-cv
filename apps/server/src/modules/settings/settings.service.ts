import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { GOOGLE_ANALYTICS_ID_PATTERN } from './dto/update-site-settings.dto';
import type { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/app-setting.entity';

const SITE_SETTINGS_KEY = 'site_settings';

export interface SiteSettings {
  siteTitle: string;
  siteDescription: string;
  faviconUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  themeColor: string;
  googleAnalyticsId: string;
  customCss: string;
}

const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: '',
  siteDescription: '',
  faviconUrl: '',
  ogTitle: '',
  ogDescription: '',
  ogImageUrl: '',
  themeColor: '#A8E765',
  googleAnalyticsId: '',
  customCss: '',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(AppSetting) private readonly settingModel: typeof AppSetting,
  ) {}

  findAll(): Promise<AppSetting[]> {
    return this.settingModel.findAll({ order: [['key', 'ASC']] });
  }

  async update(dto: UpdateSettingsDto): Promise<AppSetting[]> {
    await Promise.all(
      Object.entries(dto.settings).map(([key, value]) =>
        this.settingModel.upsert({ key, value }),
      ),
    );

    return this.findAll();
  }

  async getSiteSettings(): Promise<SiteSettings> {
    const record = await this.settingModel.findOne({
      where: { key: SITE_SETTINGS_KEY },
    });

    if (!record?.value) return { ...DEFAULT_SITE_SETTINGS };

    const stored = record.value;

    return {
      siteTitle: readStringSetting(stored, 'siteTitle'),
      siteDescription: readStringSetting(stored, 'siteDescription'),
      faviconUrl: readStringSetting(stored, 'faviconUrl'),
      ogTitle: readStringSetting(stored, 'ogTitle'),
      ogDescription: readStringSetting(stored, 'ogDescription'),
      ogImageUrl: readStringSetting(stored, 'ogImageUrl'),
      themeColor: readStringSetting(
        stored,
        'themeColor',
        DEFAULT_SITE_SETTINGS.themeColor,
      ),
      googleAnalyticsId: readGoogleAnalyticsId(stored),
      customCss: readStringSetting(stored, 'customCss'),
    };
  }

  async updateSiteSettings(data: UpdateSiteSettingsDto): Promise<SiteSettings> {
    if (
      data.googleAnalyticsId !== undefined &&
      !GOOGLE_ANALYTICS_ID_PATTERN.test(data.googleAnalyticsId)
    ) {
      throw new BadRequestException(
        'googleAnalyticsId must be empty or a valid GA measurement ID',
      );
    }

    const current = await this.getSiteSettings();
    const merged = { ...current, ...data };

    await this.settingModel.upsert({
      key: SITE_SETTINGS_KEY,
      value: merged,
    });

    return merged;
  }
}

function readStringSetting(
  stored: Record<string, unknown>,
  key: string,
  fallback = '',
): string {
  const value = stored[key];
  return typeof value === 'string' ? value : fallback;
}

function readGoogleAnalyticsId(stored: Record<string, unknown>): string {
  const value = readStringSetting(stored, 'googleAnalyticsId');
  return GOOGLE_ANALYTICS_ID_PATTERN.test(value) ? value : '';
}
