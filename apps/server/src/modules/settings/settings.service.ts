import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

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
  customHeadScripts: string;
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
  customHeadScripts: '',
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

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...(record.value as Partial<SiteSettings>),
    };
  }

  async updateSiteSettings(data: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = await this.getSiteSettings();
    const merged = { ...current, ...data };

    await this.settingModel.upsert({
      key: SITE_SETTINGS_KEY,
      value: merged,
    });

    return merged;
  }
}
