import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppSetting } from './entities/app-setting.entity';
import { SettingsController, PublicSiteSettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [SequelizeModule.forFeature([AppSetting])],
  controllers: [SettingsController, PublicSiteSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
