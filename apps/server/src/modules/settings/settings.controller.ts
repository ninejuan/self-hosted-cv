import { Body, Controller, Get, Put } from '@nestjs/common';

import { Public } from '@/common/decorators/public.decorator';

import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { AppSetting } from './entities/app-setting.entity';
import { SettingsService, SiteSettings } from './settings.service';

@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll(): Promise<AppSetting[]> {
    return this.settingsService.findAll();
  }

  @Put()
  update(@Body() dto: UpdateSettingsDto): Promise<AppSetting[]> {
    return this.settingsService.update(dto);
  }

  @Get('site')
  getSiteSettings(): Promise<SiteSettings> {
    return this.settingsService.getSiteSettings();
  }

  @Put('site')
  updateSiteSettings(
    @Body() dto: UpdateSiteSettingsDto,
  ): Promise<SiteSettings> {
    return this.settingsService.updateSiteSettings(dto);
  }
}

@Public()
@Controller('site-settings')
export class PublicSiteSettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getSiteSettings(): Promise<SiteSettings> {
    return this.settingsService.getSiteSettings();
  }
}
