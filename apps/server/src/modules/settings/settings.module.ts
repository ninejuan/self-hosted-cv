import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { AppSetting } from './entities/app-setting.entity';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';

@Module({ imports: [SequelizeModule.forFeature([AppSetting])], controllers: [SettingsController], providers: [SettingsService], exports: [SettingsService] })
export class SettingsModule {}
